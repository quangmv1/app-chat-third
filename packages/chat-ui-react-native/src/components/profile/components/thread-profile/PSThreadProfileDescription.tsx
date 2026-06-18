import React, {useEffect, useMemo, useRef, useState} from 'react';
import isEqual from 'react-fast-compare';
import {
  DeviceEventEmitter,
  Keyboard,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextLayoutEventData,
  View,
} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSIcEdit16, PSIcInformation24} from '../../../../icons';
import {PSMessageEntity} from '../../../../types';
import {setClipboardString} from '../../../../utils';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {PSRichText} from '../../../PSRichText';
import {PSFlashMessage} from '../../../flash-message';
import {
  usePSMessageCurrentThreadIdContext,
  usePSMessageSetSuggestionMentionQueryContext,
} from '../../../messages';
import {
  usePSThreadProfileNavigationContext,
  useThreadProfileActionContext,
  useThreadProfileInfoContext,
} from '../../contexts';
import {usePSDescriptionInputTextContext} from '../../contexts/PSThreadProfileDesInputContext';
import {PSDescriptionSuggestUser} from './PSDescriptionSuggestUser';
import {PSThreadProfileDesInput} from './PSThreadProfileDesInput';
import {
  PSRoleThreadType,
  PSThreadType,
} from '@communi/chat-api-client-typescript';
import {FETCH_DATA_THREAD_BY_ID_SAVE_TO_REALM} from '../../utils/Constants';
import {ScrollView} from 'react-native-gesture-handler';
import debounce from 'lodash.debounce';

const NUMBER_OF_LINES_MORE = 4;

export const LIMIT_CHARACTER = 255;

const ThreadProfileDescription = ({
  refScrollView,
}: {
  refScrollView?: React.RefObject<ScrollView>;
}) => {
  const description = useThreadProfileInfoContext().description ?? '';
  const {translator} = usePSTranslationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const {
    onUrlPress: openLink,
    onEmailPress: openEmail,
    onPhoneNumberPress: openPhoneCaller,
    onUserPress,
  } = usePSThreadProfileNavigationContext();

  const text = usePSDescriptionInputTextContext().text ?? '';

  const textInputValue =
    usePSDescriptionInputTextContext().textInputValue ?? '';

  const chatApiClient = usePSChatApiClientContext();

  const threadId = usePSMessageCurrentThreadIdContext() ?? '';

  const role = useThreadProfileActionContext()?.role ?? PSRoleThreadType.MEMBER;

  const threadType = useThreadProfileActionContext()?.type;

  const setMentionQuery = usePSMessageSetSuggestionMentionQueryContext();

  const styles = useStyleThreadProfileDes();

  const [isEdit, setEdit] = useState(false);

  const refLayoutY = useRef(0);

  useEffect(() => {
    const subscriptionKeyboardDidShow = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        debounce(() => {
          try {
            refScrollView?.current?.scrollTo({y: refLayoutY.current});
          } catch (error) {}
        }, 200)();
      },
    );
    return subscriptionKeyboardDidShow.remove;
  }, []);

  const richTextContainer = React.useMemo(() => {
    return [styles.text, typography.bodyXLargeR, {color: colors.Primary.subText}];
  }, [colors.Primary.subText, typography.bodyXLargeR]);

  const richTextStyle = React.useMemo(() => {
    return {
      ...typography.headingMediumM,
      color: colors.Branding.b600,
    };
  }, [colors.Branding.b600, typography.headingMediumM]);

  const onMentionPress = React.useCallback(
    (mentionId: string) => {
      if (mentionId !== PSMessageEntity.MENTION_ALL_ID) {
        onUserPress?.(mentionId, chatApiClient?.userId);
      }
    },
    [onUserPress, chatApiClient?.userId],
  );

  const onPhoneNumberPress = React.useCallback(
    (phoneNumber: string) => {
      openPhoneCaller?.(phoneNumber);
    },
    [openPhoneCaller],
  );

  const onUrlPress = React.useCallback(
    (url: string) => {
      openLink?.(url);
    },
    [openLink],
  );

  const onEmailPress = React.useCallback(
    (email: string) => {
      openEmail?.(email);
    },
    [openEmail],
  );

  const onEmailLongPress = React.useCallback((email: string) => {
    setClipboardString(email);
    PSFlashMessage.show({
      type: 'success',
      text1: `${email} copied`,
      position: 'bottom',
      visibilityTime: 2000,
    });
  }, []);

  const onPhoneNumberLongPress = React.useCallback((phoneNumber: string) => {
    setClipboardString(phoneNumber);
    PSFlashMessage.show({
      type: 'success',
      text1: `${phoneNumber} copied`,
      position: 'bottom',
      visibilityTime: 2000,
    });
  }, []);

  const onUrlLongPress = React.useCallback((url: string) => {
    setClipboardString(url);
    PSFlashMessage.show({
      type: 'success',
      text1: `${url} copied`,
      position: 'bottom',
      visibilityTime: 2000,
    });
  }, []);

  const [textShown, setTextShown] = React.useState(false);
  const [lengthMore, setLengthMore] = React.useState(false);
  const toggleNumberOfLines = () => {
    setTextShown(!textShown);
  };

  const onTextLayout = React.useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      setLengthMore(e.nativeEvent.lines.length >= NUMBER_OF_LINES_MORE);
    },
    [],
  );

  const isCanSave = useMemo(() => {
    // Kiểm tra giới hạn ký tự
    if (textInputValue.length > LIMIT_CHARACTER) return false;
    // kiểm tra text có thay đổi để hiện thị button lưu không
    return !isEqual(text.trim(), description.trim());
  }, [text, description]);

  const handleEditDescription = React.useCallback(async () => {
    setMentionQuery('');
    if (isEdit) {
      // disable edit
      setEdit(false);
      // lưu mô tả
      isCanSave &&
        (await chatApiClient?.threadApi.updateDescription(
          threadId,
          text || ' ',
        ));
      DeviceEventEmitter.emit(FETCH_DATA_THREAD_BY_ID_SAVE_TO_REALM);
      return;
    }
    // sửa mô tả
    setEdit(true);
  }, [isEdit, threadId, text]);

  return threadType === PSThreadType.GROUP ? (
    <View
      onLayout={e => (refLayoutY.current = e.nativeEvent.layout.y)}
      style={[
        styles.container,
        {
          backgroundColor: colors.Primary.white,
        },
      ]}>
      <View style={styles.titleContainer}>
        <PSIcInformation24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />

        <Text
          style={[
            {marginStart: (8).px(), flex: 1, color: colors.Primary.subText},
            typography.headingMediumS,
          ]}>
          {translator('ps_description')}
        </Text>
        {[PSRoleThreadType.OWNER, PSRoleThreadType.ADMIN].includes(role) && (
          <PSDebouncedPressable onPress={handleEditDescription}>
            {isEdit ? (
              <Text
                style={[
                  styles.styTxtButtonSave,
                  {
                    color: isCanSave
                      ? colors.Branding.b400
                      : colors.Neutral.n600,
                  },
                ]}>
                {isCanSave ? translator('ps_save') : translator('ps_cancel')}
              </Text>
            ) : (
              <PSIcEdit16
                width={(24).px()}
                height={(24).px()}
                fill={colors.Primary.subText}
              />
            )}
          </PSDebouncedPressable>
        )}
      </View>
      {isEdit ? (
        <PSThreadProfileDesInput
          value={description}
          styleTextInput={styles.styTextInput}
        />
      ) : (
        <>
          <PSRichText
            text={
              text.trim() ||
              description.trim() ||
              translator('ps_description_empty')
            }
            mentionEnabled
            emailEnabled
            phoneNumberEnabled
            urlEnabled
            mentionIds={['@']}
            parentStyle={richTextContainer}
            mentionStyle={richTextStyle}
            emailStyle={richTextStyle}
            phoneNumberStyle={richTextStyle}
            urlStyle={richTextStyle}
            onTextLayout={onTextLayout}
            numberOfLines={textShown ? undefined : NUMBER_OF_LINES_MORE}
            onMentionPress={onMentionPress}
            onEmailPress={onEmailPress}
            onEmailLongPress={onEmailLongPress}
            onPhoneNumberPress={onPhoneNumberPress}
            onPhoneNumberLongPress={onPhoneNumberLongPress}
            onUrlPress={onUrlPress}
            onUrlLongPress={onUrlLongPress}
          />
          {lengthMore ? (
            <Text
              onPress={toggleNumberOfLines}
              style={[
                {marginTop: (8).px()},
                {color: colors.Primary.branding},
                typography.bodyXLargeR,
              ]}>
              {textShown
                ? `${translator('ps_view_less')}`
                : `${translator('ps_view_more')}...`}
            </Text>
          ) : null}
        </>
      )}
      <PSDescriptionSuggestUser />
    </View>
  ) : null;
};

export const PSThreadProfileDescription = React.memo(
  ThreadProfileDescription,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const useStyleThreadProfileDes = () => {
  const {colors, typography} = usePSDesignSystemContext();

  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          // flexShrink: 1,
          // flexWrap: 'wrap',
          flexDirection: 'column',
          padding: (12).px(),
          borderRadius: (12).px(),
          marginBottom: (16).px(),
          zIndex: 99,
          position: 'relative',
          // shadowOffset: {width: 0, height: 2},
          // shadowRadius: 6,
          // shadowOpacity: 0.26,
          // elevation: 8,
        },
        titleContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: (8).px(),
        },
        text: {
          flexShrink: 1,
          flexWrap: 'wrap',
          alignSelf: 'flex-start',
        },
        styTextInput: {
          backgroundColor: colors.Primary.background,
          borderRadius: (8).px(),
          padding: (8).px(),
          minHeight: (150).px(),
          maxHeight: (150).px(),
        },
        styTxtButtonSave: {
          ...typography.headingMediumM,
          color: colors.Branding.b400,
        },
      }),
    [colors, typography],
  );
};
