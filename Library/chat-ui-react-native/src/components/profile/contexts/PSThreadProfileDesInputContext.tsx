import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import React, {
  createContext,
  PropsWithChildren,
  RefObject,
  useContext,
} from 'react';
import isEqual from 'react-fast-compare';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
} from 'react-native';
import {useDeepCompareMemoize} from '../../../hooks';
import {PSUserModel} from '../../../types';
import {
  processTextWithMentionFromBackEnd,
  processTextWithMentionToBackend,
  PSRichTextMentionProp,
} from '../../PSRichText';
import {usePSMessageSetSuggestionMentionQueryContext} from '../../messages';

type PSDescriptionInputTextContextValue = {
  text: string;
  textInputValue: string;
  mentionIds: string[];
  onChangeText: (newText: string) => void;
  handleSelectionChange: (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => void;
  setInitTextInputValue: (text: string) => void;
};

const PSDescriptionInputTextContext = createContext(
  {} as PSDescriptionInputTextContextValue,
);

const PSDescriptionInputRefContext = createContext<RefObject<TextInput>>(
  React.createRef(),
);

const PSDescriptionInputMentionUserPressContext = createContext<
  (user: PSUserModel) => void
>(() => undefined);

export const PSThreadProfileDesInputProvider = ({
  children,
}: PropsWithChildren) => {
  const setMentionQuery = usePSMessageSetSuggestionMentionQueryContext();

  const textInputRef = React.useRef<TextInput>(null);

  const [textInputValue, setTextInputValue] = React.useState('');
  const [initTextInputValue, setInitTextInputValue] = React.useState('');

  const oldTextInputValueRef = React.useRef('');
  const textInputValueRef = React.useRef('');

  const selectionEnd = React.useRef(0);

  const [mentions, setMentions] = React.useState<
    PSRichTextMentionProp[] | undefined
  >(undefined);

  const handleSelectionChange = React.useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      selectionEnd.current = e.nativeEvent.selection.end;
      // khi thay đổi vị trí cursor thì cần invoke lại
      if (selectionEnd.current < textInputValueRef.current.length - 1) {
        handleSuggestionsDebounced.current(textInputValueRef.current);
      }
    },
    [],
  );

  const handleSuggestions = async (text: string) => {
    if (!text) {
      setMentionQuery('');
      return;
    }

    const textByCursor = text.substring(0, selectionEnd.current);
    const lastIndexOfA = textByCursor.lastIndexOf('@');
    const mention = textByCursor.substring(lastIndexOfA, selectionEnd.current);

    if (mention.length) {
      if (mention === '@') {
        setMentionQuery('@');
      } else {
        const mentionTokenMatch = mention.match(
          /(?:\s|^)@([\S]{0,1}[^!\s@=#$%^&*(),.?":{}|<>]+)(\b|\r)$/g,
        );
        if (mentionTokenMatch && mentionTokenMatch.length) {
          const lastToken = mentionTokenMatch[mentionTokenMatch.length - 1];
          if (!lastToken || lastToken.length <= 0) {
            setMentionQuery('');
            return;
          }
          const actualToken = lastToken.slice(1);
          setMentionQuery(actualToken);
        } else {
          setMentionQuery('');
        }
      }
    } else {
      setMentionQuery('');
    }
  };

  const updateMentionsAfterTextChanged = (newText: string) => {
    if (!newText) {
      setMentions(undefined);
      return;
    }

    setMentions(prev => {
      if (!prev || !prev.length || selectionEnd.current === newText.length) {
        return prev;
      }
      let newMentions = cloneDeep<PSRichTextMentionProp[]>(prev);

      const lengthChanged =
        newText.length - oldTextInputValueRef.current.length;

      newMentions.forEach((item, index) => {
        // case thêm/bớt ký tự trước khoảng start-end mention
        if (
          selectionEnd.current - 1 <= item.start &&
          selectionEnd.current < newText.length - 1
        ) {
          item.start += lengthChanged;
          item.end += lengthChanged;
        }
      });
      newMentions = newMentions.filter(item => {
        // case thêm/bớt ký tự vào khoảng start-end mention
        const subText = newText.substring(item.start, item.end);
        return subText === item.name;
      });
      return isEqual(prev, newMentions) ? prev : newMentions;
    });
  };

  const handleSuggestionsDebounced = React.useRef(
    debounce(
      newText => {
        handleSuggestions(newText);
      },
      200,
      {
        leading: false,
        trailing: true,
      },
    ),
  );

  const onChangeText = React.useCallback((newText: string) => {
    setTextInputValue(prev => {
      oldTextInputValueRef.current = prev;
      textInputValueRef.current = newText;
      return newText;
    });
    updateMentionsAfterTextChanged(newText);
    handleSuggestionsDebounced.current(newText);
  }, []);

  const onSuggestedMentionUserPress = React.useCallback((user: PSUserModel) => {
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMentionQuery('');

    const name = '@' + user.name;

    setTextInputValue(prevText => {
      const index = prevText.lastIndexOf('@', selectionEnd.current);

      if (index < 0) {
        return prevText;
      } else {
        const nextText =
          prevText.substring(0, index) +
          name +
          ' ' +
          prevText.substring(selectionEnd.current);

        setMentions(prev => {
          const prevMention = cloneDeep(prev ?? []);
          if (
            prevMention &&
            prevMention.length &&
            selectionEnd.current < prevText.length - 1
          ) {
            const lengthChanged = nextText.length - prevText.length;

            prevMention.forEach(item => {
              // case thêm mention trước khoảng start-end mention
              if (selectionEnd.current < item.start) {
                item.start += lengthChanged;
                item.end += lengthChanged;
              }
            });
          }
          return [
            ...prevMention.filter(
              item =>
                // case thêm mention trong khoảng start-end mention
                !(
                  selectionEnd.current > item.start &&
                  selectionEnd.current <= item.end
                ),
            ),
            {
              value: `[${name}:${user.extUserId}]`,
              name: name,
              mentionId: user.extUserId,
              start: index,
              end: index + name.length,
            },
          ].sort((a, b) => a.start - b.start);
        });
        return nextText;
      }
    });
  }, []);

  const handleTextMentionToValue = (value: string = '') => {
    // case thêm mention mới khi chỉnh sửa description
    let processedTextToValue = '';
    const mentions: {
      value: string;
      name: string;
      mentionId: string;
      start: number;
      end: number;
    }[] = [];

    const matches = value.match(/\[@([^:]+):(\d+)\]/g);

    matches?.map(ite => {
      const name = ite.slice(1, ite.length - 1).split(':')[0] ?? '';
      const extUserId = ite.slice(1, ite.length - 1).split(':')[1] ?? '';
      const index = value.lastIndexOf(ite);
      processedTextToValue += ` ${name} `;
      mentions.push({
        value: ite,
        name: name,
        mentionId: extUserId,
        start: index,
        end: index + name.length,
      });
    });

    const mentionId = mentions.map(ite => ite.mentionId);

    const data = processTextWithMentionFromBackEnd(value, [...mentionId]);

    return {
      text: data.text,
      mentions: data.mentions,
    };
  };

  React.useEffect(() => {
    if (initTextInputValue) {
      const value = initTextInputValue
        ? handleTextMentionToValue(initTextInputValue)
        : undefined;
      if (value) {
        // thêm space tránh case mention ở cuối text
        setTextInputValue(value.text + ' ');
        setMentions(value.mentions);
      }
    } else {
      onChangeText('');
    }
  }, [initTextInputValue]);

  const textContextValue =
    React.useMemo<PSDescriptionInputTextContextValue>(() => {
      const result = processTextWithMentionToBackend(
        textInputValue,
        mentions ?? [],
      );

      return {
        text: result.text,
        mentionIds: result.mentionIds,
        textInputValue,
        onChangeText: onChangeText,
        setInitTextInputValue,
        handleSelectionChange: handleSelectionChange,
      } as PSDescriptionInputTextContextValue;
    }, [
      textInputValue,
      useDeepCompareMemoize(mentions),
      onChangeText,
      handleSelectionChange,
    ]);

  return (
    <PSDescriptionInputRefContext.Provider value={textInputRef}>
      <PSDescriptionInputTextContext.Provider value={textContextValue}>
        <PSDescriptionInputMentionUserPressContext.Provider
          value={onSuggestedMentionUserPress}>
          {children}
        </PSDescriptionInputMentionUserPressContext.Provider>
      </PSDescriptionInputTextContext.Provider>
    </PSDescriptionInputRefContext.Provider>
  );
};

export const usePSDescriptionInputRefContext = () =>
  useContext(PSDescriptionInputRefContext);

export const usePSDescriptionInputTextContext = () =>
  useContext(PSDescriptionInputTextContext);

export const usePSDescriptionInputMentionUserPressContext = () =>
  useContext(PSDescriptionInputMentionUserPressContext);
