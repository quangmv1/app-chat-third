import React from 'react';
import {StyleSheet, StyleProp, ViewStyle, View} from 'react-native';
import {usePSScrollToMessageContext} from '../../contexts';
import {PSMessageModel, isDeletedMessage} from '../../../../types';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../hooks';
import {PSRepliedMessageMedia} from './PSRepliedMessageMedia';
import {PSRepliedMessageText} from './PSRepliedMessageText';
import {PSRepliedMessageHeader} from './PSRepliedMessageHeader';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../context';
import {usePSMessageItemContext} from '../PSMessageItem';
import {PSImage} from '../../../PSImage';

export const PSRepliedMessage = React.memo(
  ({
    repliedMessage,
    containerStyle,
  }: {
    repliedMessage?: PSMessageModel;
    containerStyle?: StyleProp<ViewStyle>;
  }) => {
    const {colors} = usePSDesignSystemContext();

    const {isOverlay} = usePSMessageItemContext();

    const {scrollToMessage} = usePSScrollToMessageContext();

    const onPress = () => {
      if (!isOverlay && repliedMessage?.id) {
        scrollToMessage(repliedMessage.id, true);
      }
    };

    const text = React.useMemo(() => {
      if (repliedMessage?.body?.poll?.title) {
        return repliedMessage?.body?.poll?.title;
      }
      if (repliedMessage?.body?.isRtf) {
        return repliedMessage?.body?.plainText;
      } else {
        return repliedMessage?.body?.text;
      }
    }, [
      repliedMessage?.body?.text,
      repliedMessage?.body?.poll?.title,
      repliedMessage?.body?.isRtf,
      repliedMessage?.body?.plainText,
    ]);

    useRenderCounter('RepliedMessageContent', repliedMessage !== undefined);

    const isDeleted = React.useMemo(() => {
      return isDeletedMessage(
        repliedMessage?.isMyMessage ?? false,
        repliedMessage?.deleteLevel,
      );
    }, [repliedMessage?.isMyMessage, repliedMessage?.deleteLevel]);

    const lineStyles = React.useMemo(() => {
      return [
        styles.line,
        {
          backgroundColor: colors.Primary.branding,
        },
      ];
    }, [colors.Primary.branding]);

    return repliedMessage ? (
      <PSDebouncedPressable
        onPress={onPress}
        style={[styles.container, containerStyle]}>
        <View style={lineStyles} />
        {!isDeleted && repliedMessage.body?.sticker && (
          <PSImage
            style={styles.sticker}
            source={{
              uri: repliedMessage.body.sticker.srcUrl,
            }}
            resizeMode="cover"
          />
        )}
        <PSRepliedMessageMedia
          media={repliedMessage?.body?.media[0]}
          isDeleted={isDeleted}
          imageStyle={styles.media}
        />
        <View style={styles.textContainer}>
          <PSRepliedMessageHeader
            senderId={repliedMessage.sender.extUserId}
            senderName={repliedMessage.sender.name}
          />
          <PSRepliedMessageText
            text={text}
            mentionIds={repliedMessage?.body?.mentionIds}
            hasMedia={repliedMessage?.body?.media[0] !== undefined}
            hasFile={repliedMessage?.body?.files[0] !== undefined}
            hasPoll={repliedMessage?.body?.poll !== undefined}
            isDeleted={isDeleted}
            textStyle={styles.textContent}
          />
        </View>
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: (232).px(),
  },
  line: {
    width: (4).px(),
    height: '100%',
    borderRadius: (33).px(),
  },
  media: {
    marginStart: (8).px(),
  },
  sticker: {
    width: (48).px(),
    height: (48).px(),
    marginStart: (8).px(),
  },
  textContainer: {
    flexDirection: 'column',
    marginStart: (8).px(),
    paddingVertical: (2).px(),
    flexShrink: 1,
  },
  textContent: {marginTop: (4).px()},
});
