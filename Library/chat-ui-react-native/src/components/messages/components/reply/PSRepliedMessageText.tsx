import React from 'react';
import {Text, TextStyle} from 'react-native';
import {useRenderCounter} from '../../../../hooks';
import isEqual from 'react-fast-compare';
import {StyleProp} from 'react-native';
import {usePSMessageItemContext} from '../PSMessageItem';
import {processTextWithMentionFromBackEnd} from '../../../PSRichText';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

export const PSRepliedMessageText = React.memo(
  ({
    text,
    mentionIds,
    hasMedia,
    hasFile,
    hasPoll,
    isDeleted,
    textStyle,
  }: {
    text?: string;
    mentionIds?: string[];
    hasMedia: boolean;
    hasFile: boolean;
    hasPoll: boolean;
    isDeleted: boolean;
    textStyle?: StyleProp<TextStyle>;
  }) => {
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const {isMyMessage} = usePSMessageItemContext();

    const textStyles = React.useMemo(() => {
      return [
        textStyle,
        typography.bodyLargeR,
        {
          color: isMyMessage ? colors.Primary.subText : colors.Primary.subText,
        } as TextStyle,
      ];
    }, [
      isMyMessage,
      colors.Primary.subText,
      colors.Primary.subText,
      typography.bodyLargeR,
      textStyle,
    ]);

    const textMentionValue = React.useMemo(
      () =>
        text && mentionIds && !isDeleted
          ? processTextWithMentionFromBackEnd(text, mentionIds)
          : undefined,
      [text, mentionIds, isDeleted],
    );

    const content = React.useMemo(() => {
      return textMentionValue?.text
        ? textMentionValue.text
        : hasMedia
          ? translator('ps_message_replied_media')
          : hasFile
            ? translator('ps_message_replied_file')
            : hasPoll
              ? translator('ps_message_replied_poll')
              : isDeleted
                ? translator('ps_message_replied_deleted')
                : undefined;
    }, [
      translator,
      textMentionValue?.text,
      hasMedia,
      hasFile,
      hasPoll,
      isDeleted,
    ]);

    useRenderCounter('RepliedMessageText', content !== undefined);

    return content ? (
      <Text numberOfLines={1} style={textStyles}>
        {content}
      </Text>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);
