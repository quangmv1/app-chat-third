import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {processTextWithMentionFromBackEnd} from '../../PSRichText';
import {useDeepCompareMemoize, useRenderCounter} from '../../../hooks';
import {PSMessageModel, isDeletedMessage} from '../../../types';
import {PSMessagePinnedImage} from './PSMessagePinnedImage';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';

const MessagePinnedItem = ({
  item,
  onItemPress,
}: {
  item: PSMessageModel;
  onItemPress: (message: PSMessageModel) => void;
}) => {
  useRenderCounter('MessagePinnedItem');
  const {translator} = usePSTranslationContext();

  const content = React.useMemo(() => {
    const text = item?.body?.isRtf ? item?.body?.plainText : item?.body?.text;
    const sticker = item?.body?.sticker;
    const mentionIds = item?.body?.mentionIds;
    const firstFileName = item?.body?.files[0]?.name;
    const pollTitle = item?.body?.poll?.title;
    if (pollTitle) {
      return {
        text: translator(
          'ps_message_input_reply_description_poll',
          // @ts-ignore
          {
            name: pollTitle,
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
      } else if (sticker) {
        return {
          text: 'Sticker',
          ellipsizeMode: 'tail',
        };
      } else {
        return undefined;
      }
    }
  }, [
    item?.body?.text,
    item?.body?.sticker,
    item?.body?.mentionIds,
    item?.body?.files,
    useDeepCompareMemoize(item?.body?.files),
    item?.body?.poll?.title,
    item?.body?.isRtf,
    item?.body?.plainText,
    translator,
  ]);

  const isDeleted = React.useMemo(() => {
    return isDeletedMessage(item.isMyMessage, item.deleteLevel);
  }, [item.isMyMessage, item.deleteLevel]);

  return (
    <PSDebouncedPressable
      style={styles.container}
      onPress={() => {
        onItemPress(item);
      }}>
      <PSMessagePinnedImage
        isDeleted={isDeleted}
        media={item.body?.media[0]}
        file={item.body?.files[0]}
      />
      <View style={styles.containerContent}>
        <MemoizeName name={item.sender.name} />

        <MemoizeContentText
          text={content?.text}
          // @ts-ignore
          ellipsizeMode={content?.ellipsizeMode}
          isDeleted={isDeleted}
        />
      </View>
    </PSDebouncedPressable>
  );
};

const MemoizeName = React.memo(
  ({name}: {name: string}) => {
    const {colors, typography} = usePSDesignSystemContext();
    return (
      <Text
        style={[{color: colors.Primary.mainText}, typography.bodyMediumS]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {name.workAroundTextOneLineContainsNewLineIOS()}
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
    const {colors, typography} = usePSDesignSystemContext();

    const {translator} = usePSTranslationContext();

    useRenderCounter('PinnedMessageText.MemoizeTitleText');

    return isDeleted ? (
      <Text
        numberOfLines={1}
        style={[
          {color: colors.Primary.subText},
          typography.bodyMediumR,
          styles.deletedContentText,
        ]}>
        {translator('ps_message_deleted')}
      </Text>
    ) : text ? (
      <Text
        ellipsizeMode={ellipsizeMode}
        numberOfLines={1}
        style={[
          {color: colors.Primary.subText},
          typography.bodyMediumR,
          styles.contentText,
        ]}>
        {text.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessagePinnedItem = React.memo(
  MessagePinnedItem,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: (12).px(),
    paddingHorizontal: (12).px(),
  },
  containerContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginStart: (12).px(),
  },
  contentText: {},
  deletedContentText: {fontStyle: 'italic'},
});
