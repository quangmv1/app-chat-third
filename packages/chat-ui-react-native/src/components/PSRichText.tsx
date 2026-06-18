/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  Text,
  TextLayoutEventData,
  TextStyle,
} from 'react-native';
import {useMemo} from 'react';
import {RICH_TEXT, WEB_URL, psLogger} from '../utils';
import isEqual from 'react-fast-compare';

export const PSRichTextScreen = () => {
  return (
    <ScrollView
      style={{
        flex: 1,
        paddingHorizontal: 8,
        backgroundColor: 'white',
      }}>
      <PSRichText
        // enableLog
        text={RICH_TEXT}
        parentStyle={{color: 'black'}}
        mentionEnabled
        mentionStyle={{color: 'red'}}
        urlEnabled
        urlStyle={{color: 'blue'}}
        emailEnabled
        emailStyle={{color: 'brown'}}
        phoneNumberEnabled
        phoneNumberStyle={{color: 'violet'}}
        hashtagStyle={{color: 'orange'}}
        mentionIds={['69']}
        onMentionPress={mentionId => {
          psLogger.error(`onMentionPress: mentionId = ${mentionId}`);
        }}
        onMentionLongPress={mentionId => {
          psLogger.error(`onMentionLongPress: mentionId = ${mentionId}`);
        }}
        onEmailPress={email => {
          psLogger.error(`onEmailPress: email = ${email}`);
        }}
        onEmailLongPress={email => {
          psLogger.error(`onEmailLongPress: email = ${email}`);
        }}
        onHashtagPress={hashtag => {
          psLogger.error(`onHashtagPress: hashtag = ${hashtag}`);
        }}
        onHashtagLongPress={hashtag => {
          psLogger.error(`onHashtagLongPress: hashtag = ${hashtag}`);
        }}
        onPhoneNumberPress={phoneNumber => {
          psLogger.error(`onPhoneNumberPress: phoneNumber = ${phoneNumber}`);
        }}
        onPhoneNumberLongPress={phoneNumber => {
          psLogger.error(
            `onPhoneNumberLongPress: phoneNumber = ${phoneNumber}`,
          );
        }}
        onUrlPress={url => {
          psLogger.error(`onUrlPress: url = ${url}`);
        }}
        onUrlLongPress={url => {
          psLogger.error(`onUrlLongPress: url = ${url}`);
        }}
      />
    </ScrollView>
  );
};

type PSRichTextType =
  | 'normal'
  | 'mention'
  | 'url'
  | 'hashtag'
  | 'email'
  | 'phoneNumber';

type PSRichTextResult = {
  type: PSRichTextType;
  value: string;
  id: string;
  start: number;
  end: number;
};

export type PSRichTextProps = {
  text: string;
  parentStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  mentionEnabled?: boolean;
  mentionIds?: string[];
  mentionStyle?: StyleProp<TextStyle>;
  onMentionPress?: (mentionId: string) => void;
  onMentionLongPress?: (mentionId: string) => void;
  hashtagEnabled?: boolean;
  hashtagStyle?: StyleProp<TextStyle>;
  onHashtagPress?: (hashtag: string) => void;
  onHashtagLongPress?: (hashtag: string) => void;
  emailEnabled?: boolean;
  emailStyle?: StyleProp<TextStyle>;
  onEmailPress?: (email: string) => void;
  onEmailLongPress?: (email: string) => void;
  urlEnabled?: boolean;
  urlStyle?: StyleProp<TextStyle>;
  onUrlsParsed?: (urls: string[]) => void;
  onUrlPress?: (url: string) => void;
  onUrlLongPress?: (url: string) => void;
  phoneNumberEnabled?: boolean;
  phoneNumberStyle?: StyleProp<TextStyle>;
  onPhoneNumberPress?: (phoneNumber: string) => void;
  onPhoneNumberLongPress?: (phoneNumber: string) => void;
  enableLog?: boolean;
  onTextLayout?:
    | ((event: NativeSyntheticEvent<TextLayoutEventData>) => void)
    | undefined;
  numberOfLines?: number | undefined;
};

export type PSRichTextMentionProp = {
  value: string;
  name: string;
  mentionId: string;
  start: number;
  end: number;
};

// https://github.com/taskrabbit/react-native-parsed-text
// https://github.com/DrKLO/Telegram/blob/master/TMessagesProj/src/main/java/org/telegram/messenger/LinkifyPort.java
// mention range offset-length: /(?<=^.{0}).{4}/
const RichText = (props: PSRichTextProps) => {
  const richTextResults = useMemo(() => {
    const result = processTextWithMentionFromBackEnd(
      props.text,
      props.mentionIds ?? [],
    );
    return mapToRichTextResult(
      result.text,
      result.mentions,
      props.mentionEnabled,
      props.hashtagEnabled,
      props.emailEnabled,
      props.urlEnabled,
      props.phoneNumberEnabled,
    );
  }, [props]);

  const texts = useMemo(() => {
    return richTextResults.map((element, i) => {
      let childrenStyle: StyleProp<TextStyle> | undefined;
      let onPress: ((value: string) => void) | undefined;
      let onLongPress: ((value: string) => void) | undefined;
      switch (element.type) {
        case 'url':
          childrenStyle = props.urlStyle;
          onPress = props.onUrlPress;
          onLongPress = props.onUrlLongPress;
          break;
        case 'email':
          childrenStyle = props.emailStyle;
          onPress = props.onEmailPress;
          onLongPress = props.onEmailLongPress;
          break;
        case 'phoneNumber':
          childrenStyle = props.phoneNumberStyle;
          onPress = props.onPhoneNumberPress;
          onLongPress = props.onPhoneNumberLongPress;
          break;
        case 'hashtag':
          childrenStyle = props.hashtagStyle;
          onPress = props.onHashtagPress;
          onLongPress = props.onHashtagLongPress;
          break;
        case 'mention':
          childrenStyle = props.mentionStyle;
          onPress = props.onMentionPress;
          onLongPress = props.onMentionLongPress;
          break;
        default:
          childrenStyle = props.parentStyle;
          onPress = props.onPress;
          onLongPress = props.onLongPress;
          break;
      }
      const _onPress = () => {
        onPress?.(element.id);
      };

      const _onLongPress = () => {
        onLongPress?.(element.id);
      };
      return (
        <Text
          key={`PSRichText-${i}`}
          suppressHighlighting={element.type === 'normal'}
          onPress={_onPress}
          onLongPress={_onLongPress}
          style={[props.parentStyle, childrenStyle]}>
          {element.value}
        </Text>
      );
    });
  }, [richTextResults]);

  React.useLayoutEffect(() => {
    if (props.onUrlsParsed) {
      const urls = richTextResults
        .filter(item => item.type === 'url')
        .map(item => item.value);
      props.onUrlsParsed?.(urls);
    }
  }, [richTextResults]);

  if (props.enableLog) {
    psLogger.error(`results = ${JSON.stringify(richTextResults)}`);
  }

  return texts.length ? (
    <Text
      style={[props.parentStyle]}
      onTextLayout={props.onTextLayout}
      numberOfLines={props.numberOfLines}>
      {texts}
    </Text>
  ) : null;
};

export const PSRichText = React.memo(
  RichText,
  (prev: PSRichTextProps, next: PSRichTextProps) => {
    return isEqual(prev, next);
  },
);

const mapToRichTextResult = (
  text: string,
  mentions: PSRichTextMentionProp[],
  mentionEnabled?: boolean,
  hashtagEnabled?: boolean,
  emailEnabled?: boolean,
  urlEnabled?: boolean,
  phoneNumberEnabled?: boolean,
) => {
  // nếu text.empty hoặc mention.empty thì return normal type
  if (!text && !mentions.length) {
    return [
      {
        type: 'normal',
        value: '',
        id: 'normal',
        start: 0,
        end: 0,
      },
    ];
  }

  // nếu mentions.empty thì add fake mention để trigger
  mentions =
    mentionEnabled && mentions.length
      ? mentions
      : ([
          {value: '', name: '', mentionId: '', start: -1, end: -1},
        ] as PSRichTextMentionProp[]);

  const data = mentions
    .sort((a, b) => a.start - b.start)
    .mapWithNext((item, currentIndex, next) => {
      if (item.start === -1 && item.end === -1) {
        // nếu không có mention thì lấy text để trigger operator tiếp theo
        return [
          {
            type: 'normal',
            value: text,
            id: 'normal',
            start: 0,
            end: text.length,
          },
        ];
      } else {
        const array = [];
        if (currentIndex === 0 && item.start > 0) {
          array.push({
            type: 'normal',
            value: text.substring(0, item.start),
            id: 'normal',
            start: 0,
            end: item.end,
          });
        }

        // add mention theo [start-end]
        array.push({
          type: 'mention',
          value: text.substring(item.start, item.end),
          id: item.mentionId,
          start: item.start,
          end: item.end,
        });

        // nếu có next thì cắt đoạn text giữa [current.end-next.start] với type = normal
        // find rich text theo từng đoạn normal text sẽ tốt hơn là text
        const normal = text.substring(item.end, next ? next.start : undefined);
        if (normal) {
          array.push({
            type: 'normal',
            value: normal,
            id: normal,
            start: item.end,
            end: next ? next.start : text.length,
          });
        }
        return array;
      }
    })
    .flat()
    .reduce((results, item, currentIndex, source) => {
      // array là mảng các mention text và normal text
      // cần parse các normal text để lấy được rich text
      // các rich text cần check range collision
      if (item.type === 'mention') {
        if (mentionEnabled) {
          results.push(item as PSRichTextResult);
        }
      } else {
        // nếu type = normal thì parse để lấy tiếp các rich text
        if (emailEnabled) {
          parseText(results, item.value, item.start, 'email', /\S+@\S+\.\S+/g);
        }
        // https://regex101.com/r/zhdjq1/1
        if (urlEnabled) {
          parseText(
            results,
            item.value,
            item.start,
            'url',
            // new RegExp(WEB_URL, 'gim'),
            /(((http|Http)(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,7}\b([-a-zA-Z0-9@:%_\+.~#?&\/()*="'`]*))/g,
          );
        }
        if (hashtagEnabled) {
          parseText(
            results,
            item.value,
            item.start,
            'hashtag',
            /(#[^\s!@#$%^&*()=+./,[{\]};:'"?><]+)/g,
          );
        }
        if (phoneNumberEnabled) {
          parseText(
            results,
            item.value,
            item.start,
            'phoneNumber',
            /[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,7}/g,
          );
        }
      }
      // nếu array có 1 phần tử và không có rich text
      // thì => props.text chỉ là normal text
      // thì return array để trigger operator tiếp theo
      if (currentIndex === source.length - 1 && results.length === 0) {
        return source as PSRichTextResult[];
      } else {
        return results;
      }
    }, [] as PSRichTextResult[])
    .sort((a, b) => a.start - b.start)
    .reduce((normalTexts, item, currentIndex, source) => {
      // array là mảng các rich text theo range
      // push thêm các normal text để có đc full text

      // case: [normal text -> rich text]
      if (currentIndex === 0 && item.start > 0) {
        normalTexts.push({
          type: 'normal',
          value: text.substring(0, item.start),
          id: 'normal',
          start: 0,
          end: item.start,
        } as PSRichTextResult);
      }

      // case: [rich text -> normal text -> rich text]
      const next = source[currentIndex + 1];
      if (next) {
        normalTexts.push({
          type: 'normal',
          value: text.substring(item.end, next.start),
          id: 'normal',
          start: item.end,
          end: next.start,
        } as PSRichTextResult);
      }

      // case: [rich text -> normal text]
      if (!next && item.end < text.length) {
        normalTexts.push({
          type: 'normal',
          value: text.substring(item.end),
          id: 'normal',
          start: item.end,
          end: text.length,
        } as PSRichTextResult);
      }

      if (currentIndex === source.length - 1) {
        normalTexts.push(...source);
      }

      return normalTexts;
    }, [] as PSRichTextResult[])
    .sort((a, b) => a.start - b.start);
  return data;
};

const checkOverlapText = (
  results: PSRichTextResult[],
  start: number,
  end: number,
) => {
  const result = results.find(
    item =>
      (start >= item.start && start <= item.end) ||
      (end >= item.start && end <= item.end) ||
      (item.start >= start && item.start <= end) ||
      (item.end > start && item.end <= end),
  );

  return result === undefined;
};

const parseText = (
  results: PSRichTextResult[],
  text: string,
  startIndex: number,
  type: PSRichTextType,
  regex: RegExp,
) => {
  for (const result of text.matchAll(regex)) {
    let value = result[0];
    const index = result.index;
    if (value && index !== undefined && index >= 0) {
      if (type === 'email' && value.startsWith('http')) {
        continue;
      }
      if (type === 'url') {
        if (value === 'http://' || value === 'https://') {
          continue;
        }
        const hostname = getHostnameFromRegex(value);
        if (hostname) {
          const array = hostname.split('.');
          // case: https:// hoặc https://google hoặc https://h.u hoặc https://m.facebook.com
          if (array.length < 2 || array[array.length - 1]!.length < 2) {
            continue;
          }
        }

        if (value.endsWith('.') || value.endsWith(')')) {
          value = value.substring(0, value.length - 1);
        }
      }
      const start = startIndex + index;
      const end = start + value.length;
      if (checkOverlapText(results, start, end)) {
        results.push({
          type: type,
          value: value,
          id: value,
          start: start,
          end: end,
        });
      }
    }
  }
};

const getHostnameFromRegex = (url: string) => {
  // run against regex
  const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
  // extract hostname (will be null if no match is found)
  return matches && matches[1];
};

export const processTextWithMentionFromBackEnd = (
  text: string,
  mentionIds: string[],
) => {
  if (!text || !mentionIds.length) {
    return {
      text: text,
      mentions: [],
    };
  }

  const regex = /\[(@[^:]+):([^\]]+)\]/gi;

  const mentionsFromBE: PSRichTextMentionProp[] = [];
  for (const result of text.matchAll(regex)) {
    const value = result[0];
    const name = result[1];
    const mentionId = result[2];
    const startIndex = result.index;
    if (
      value &&
      name &&
      mentionId &&
      startIndex !== undefined &&
      startIndex >= 0
    ) {
      const endIndex = startIndex + value.length;
      mentionsFromBE.push({
        value: value,
        name: name,
        mentionId: mentionId,
        start: startIndex,
        end: endIndex,
      });
    }
  }

  if (!mentionsFromBE.length) {
    return {
      text: text,
      mentions: [],
    };
  }

  const mentions: PSRichTextMentionProp[] = [];

  let processedTextFromBE = '';

  for (let index = 0; index < mentionsFromBE.length; index++) {
    const current = mentionsFromBE[index]!;
    const prev = mentionsFromBE[index - 1];
    if (prev) {
      processedTextFromBE += text.substring(prev.end, current.start);
    } else {
      processedTextFromBE += text.substring(0, current.start);
    }
    processedTextFromBE += current.name;

    mentions.push({
      value: current.value,
      name: current.name,
      mentionId: current.mentionId,
      start: processedTextFromBE.length - current.name.length,
      end: processedTextFromBE.length,
    });

    if (index === mentionsFromBE.length - 1) {
      processedTextFromBE += text.substring(current.end, text.length);
    }
  }

  return {
    text: processedTextFromBE,
    mentions: mentions,
  };
};

export const processTextWithMentionToBackend = (
  text: string,
  mentions: PSRichTextMentionProp[],
) => {
  if (!text || !mentions.length || !mentions.length) {
    return {
      text: text,
      mentionIds: [],
    };
  }
  let processedTextToBE = '';

  for (let index = 0; index < mentions.length; index++) {
    const value = mentions[index]!;
    const prev = mentions[index - 1];
    if (prev) {
      processedTextToBE += text.substring(prev.end, value.start);
    } else {
      processedTextToBE += text.substring(0, value.start);
    }
    processedTextToBE += value.value;

    if (index === mentions.length - 1) {
      processedTextToBE += text.substring(value.end, text.length);
    }
  }
  return {
    text: processedTextToBE,
    mentionIds: mentions.map(item => item.mentionId),
  };
};
