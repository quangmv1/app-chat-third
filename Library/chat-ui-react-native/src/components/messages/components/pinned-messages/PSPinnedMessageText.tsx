import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {PSMessageModel, isDeletedMessage} from '../../../../types';
import {useDeepCompareMemoize, useRenderCounter} from '../../../../hooks';
import {processTextWithMentionFromBackEnd} from '../../../PSRichText';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

const MemoizeTitleText = React.memo(
  ({length}: {length: number}) => {
    useRenderCounter('PinnedMessageText.MemoizeTitleText');

    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [typography.bodyMediumS, {color: colors.Primary.mainText}];
    }, [colors.Primary.mainText, typography.bodyMediumS]);

    return (
      <Text numberOfLines={1} style={textStyles}>
        {`${translator('ps_message_pinned_message_title')}${
          length > 1 ? ` (${length})` : ''
        }`}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeContentText = React.memo(
  ({
    text,
    ellipsizeMode,
    isDeleted,
  }: {
    text?: string;
    ellipsizeMode?: 'middle' | 'tail' | undefined;
    isDeleted: boolean;
  }) => {
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    useRenderCounter('PinnedMessageText.MemoizeTitleText');

    const textStyles = React.useMemo(() => {
      return [typography.bodyMediumR, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.bodyMediumR]);

    return isDeleted ? (
      <Text numberOfLines={1} style={textStyles}>
        {translator('ps_message_pinned_message_deleted')}
      </Text>
    ) : text ? (
      <Text ellipsizeMode={ellipsizeMode} numberOfLines={1} style={textStyles}>
        {text.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

export const PSPinnedMessageText = React.memo(
  ({
    pinnedMessagesLength,
    pinnedMessage,
  }: {
    pinnedMessagesLength: number;
    pinnedMessage: PSMessageModel;
  }) => {
    useRenderCounter('PinnedMessageText');

    const {translator} = usePSTranslationContext();

    const content = React.useMemo(() => {
      const text = pinnedMessage?.body?.isRtf
        ? pinnedMessage?.body?.plainText
        : pinnedMessage?.body?.text;
      const mentionIds = pinnedMessage?.body?.mentionIds;
      const firstFileName = pinnedMessage?.body?.files[0]?.name;
      const pollTitle = pinnedMessage?.body?.poll?.title;
      if (pinnedMessage?.body?.sticker) {
        return {
          text: 'Sticker',
          ellipsizeMode: 'middle',
        };
      } else if (pollTitle) {
        return {
          text: translator(
            'ps_message_pinned_message_poll',
            // @ts-ignore
            {
              content: pollTitle,
            },
          ),
          ellipsizeMode: 'tail',
        };
      } else if (text && mentionIds) {
        const result = processTextWithMentionFromBackEnd(text, mentionIds);
        if (result.text) {
          return {
            text: result.text,
            ellipsizeMode: 'tail',
          };
        } else if (firstFileName) {
          return {
            text: firstFileName,
            ellipsizeMode: 'middle',
          };
        } else {
          return undefined;
        }
      } else {
        if (firstFileName) {
          return {
            text: firstFileName,
            ellipsizeMode: 'middle',
          };
        } else {
          return undefined;
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      translator,
      pinnedMessage?.body?.text,
      pinnedMessage?.body?.mentionIds,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useDeepCompareMemoize(pinnedMessage?.body?.files),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useDeepCompareMemoize(pinnedMessage?.body?.sticker),
      pinnedMessage?.body?.poll?.title,
      pinnedMessage?.body?.isRtf,
      pinnedMessage?.body?.plainText,
    ]);

    const isDeleted = React.useMemo(() => {
      return isDeletedMessage(
        pinnedMessage.isMyMessage,
        pinnedMessage.deleteLevel,
      );
    }, [pinnedMessage.isMyMessage, pinnedMessage.deleteLevel]);

    return (
      <View style={styles.contentContainer}>
        <MemoizeTitleText length={pinnedMessagesLength} />
        <MemoizeContentText
          text={content?.text}
          // @ts-ignore
          ellipsizeMode={content?.ellipsizeMode}
          isDeleted={isDeleted}
        />
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginStart: (12).px(),
  },
});
