import React from 'react';
import isEqual from 'react-fast-compare';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {
  PSMessageModel,
  PSVisibility,
  getPreviewSubThreadName,
} from '../../../../types';
import { PSDebouncedPressable } from '../../../PSDebouncedPressable';
import { PSImage } from '../../../PSImage';
import { springConfig, usePSThreadSwipeRowContext } from '../../../threads';
import {
  usePSMessageIsSubthreadContext,
  usePSReplyMessageSetIdContext,
} from '../../contexts';
import { PSMessageBubbleLayout } from '../PSMessageBubbleLayout';
import {
  MESSAGE_AVATAR_SENDER_SIZE,
  MESSAGE_BORDER_RADIUS,
  MESSAGE_BORDER_WIDTH,
  MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
  MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
  MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
  MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP,
  MESSAGE_CONTENT_MARGIN_AVATAR,
  MESSAGE_CONTENT_MARGIN_STATUS,
  usePSMessageItemContext,
} from '../PSMessageItem';
import { PSMessageLayout } from '../PSMessageLayout';
import { PSMessageComment } from '../comment';
import { PSMessageForwardHeader } from '../forward';
import { PSRepliedMessage } from '../reply';
import { PSMessageSenderName } from '../sender-name';
import { PSMessageItemSwipeRight } from './PSMessageItemSwipeRight';
import { PSMessageTrailingTime } from '../time/PSMessageTrailingTime';

export const PSMessageStickerWrapper =
  // javascript-obfuscator:disable
  React.memo(
    ({
      message,
      isPSMessageSubThread,
    }: {
      message: PSMessageModel;
      isPSMessageSubThread?: boolean;
    }) => {
      const { colors } = usePSDesignSystemContext();

      const isSubThread = usePSMessageIsSubthreadContext();

      const { translator } = usePSTranslationContext();

      const { isOverlay, isMyMessage, onMessagePress, onMessageLongPress } =
        usePSMessageItemContext();

      const replyMessage = usePSReplyMessageSetIdContext();

      const { translateX } = usePSThreadSwipeRowContext();

      const handler = useAnimatedGestureHandler({
        onStart: (_evt: any, ctx: { x: any }) => {
          ctx.x = translateX.value;
        },

        onActive: (evt: { translationX: any }, ctx: { x: any }) => {
          if (message.status !== 'sent' || isOverlay || isPSMessageSubThread)
            return;
          const nextTranslate = evt.translationX + ctx.x;
          translateX.value = Math.min(0, Math.max(nextTranslate, -50));
        },

        onEnd: (evt: { velocityX: number }) => {
          translateX.value = withSpring(0, springConfig(evt.velocityX));
          if (translateX.value < -40) {
            runOnJS(replyMessage)(message.id);
          }
        },
      });

      const senderNameStyle = React.useMemo(() => {
        return {
          marginTop: message.isSenderNameVisible
            ? MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP
            : undefined,
          marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
          marginBottom: MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
        } as TextStyle;
      }, [message.isSenderNameVisible]);

      const stickerForwardContainerStyle = React.useMemo(() => {
        return {
          marginTop: message.isSenderNameVisible
            ? MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP
            : MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
          marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
        } as ViewStyle;
      }, [message.isSenderNameVisible]);
      const trailingTimeStyle = React.useMemo(() => {
        return {
          textAlign: 'right',
          alignSelf: 'flex-end',
        } as TextStyle;
      }, []);
      const stickerContainerStyle = React.useMemo(() => {
        return {
          alignItems: isMyMessage ? 'flex-end' : 'flex-start',
          marginStart: isMyMessage
            ? undefined
            : message.avatarVisibility != PSVisibility.GONE // || isOverlay
              ? MESSAGE_CONTENT_MARGIN_AVATAR
              : undefined,
          marginEnd: isMyMessage ? MESSAGE_CONTENT_MARGIN_STATUS : undefined,
        } as ViewStyle;
      }, [isMyMessage, isOverlay, message.avatarVisibility]);

      const stickerContainerSubThreadStyle = React.useMemo(() => {
        return message.subThreadId &&
          message.messageSubThreadCount &&
          message.messageSubThreadCount > 0
          ? ({
            backgroundColor: isMyMessage
              ? `${colors.Branding.b600}4f`
              : `${colors.Primary.linerBorder}4f`,
            borderRadius: MESSAGE_BORDER_RADIUS,
            borderWidth: MESSAGE_BORDER_WIDTH,
            borderColor: isMyMessage
              ? `${colors.Branding.b600}4f`
              : `${colors.Primary.linerBorder}4f`,
          } as ViewStyle)
          : ({} as ViewStyle);
      }, [isMyMessage, message.subThreadId, message.messageSubThreadCount]);

      const stickerRepliedContainerStyle = React.useMemo(() => {
        return {
          width: '100%',
          padding: (10).px(),
          borderRadius: MESSAGE_BORDER_RADIUS,
          borderWidth: MESSAGE_BORDER_WIDTH,
          borderColor: isMyMessage
            ? colors.Branding.b600
            : colors.Primary.linerBorder,
          backgroundColor: isMyMessage
            ? colors.Branding.b600
            : colors.Primary.linerBorder,
        } as ViewStyle;
      }, [colors.Primary.linerBorder, colors.Branding.b600, isMyMessage]);

      const stylesPanGestureHandler = useAnimatedStyle(() => {
        return {
          transform: [
            {
              translateX: translateX.value,
            },
          ],
        };
      });

      return message.body?.sticker ? (
        <PanGestureHandler
          hitSlop={{ left: -60 }}
          activeOffsetX={[-30, 30]}
          onGestureEvent={handler}>
          <Animated.View style={stylesPanGestureHandler}>
            <PSMessageLayout
              isHighlightEnabled
              isFirstUnreadVisible={message.isFirstUnread}
              isHeaderTimeVisible={message.isHeaderTimeVisible}
              isInterceptorDisabled={message.status !== 'sent'}
              messagePrimaryKey={message.primaryKey}
              messageId={message.id}
              messageCreatedAt={message.createdAt}
              messageStatus={message.status}
              messageReactions={message.reactions}
              messageSeenUsers={message.seenUsers}>
              <PSMessageBubbleLayout
                withAwesomeBackground={false}
                avatarVisibility={message.avatarVisibility}
                messagePrimaryKey={message.primaryKey}
                messageId={message.id}
                messageStatus={message.status}
                isMessageStatusVisible={!message.isHideStatus}
                messageSender={message.sender}
                messageDeleteLevel={message.deleteLevel}>
                <PSDebouncedPressable
                  style={[
                    stickerContainerStyle,
                    stickerContainerSubThreadStyle,
                  ]}
                  onPress={onMessagePress}
                  onLongPress={onMessageLongPress}>
                  {!isOverlay && (
                    <PSMessageSenderName
                      verified={!!message.sender.verified}
                      senderName={message.sender.name}
                      isSenderNameVisible={message.isSenderNameVisible}
                      senderAvatar={message.sender.avatar}
                      isAvatarVisible={message.isAvatarOriginVisible}
                      containerStyle={senderNameStyle}
                    />
                  )}
                  {message.body.forwardFrom && (
                    <PSMessageForwardHeader
                      forwarder={message.body.forwardFrom.sender}
                      containerStyle={stickerForwardContainerStyle}
                    />
                  )}
                  {message.body.repliedMessage && (
                    <PSRepliedMessage
                      repliedMessage={message.body.repliedMessage}
                      containerStyle={stickerRepliedContainerStyle}
                    />
                  )}
                  <PSImage
                    style={[styles.sticker]}
                    source={{
                      uri: message.body.sticker.srcUrl,
                    }}
                    resizeMode="cover"
                  />
                  <PSMessageTrailingTime
                    createdAt={message.createdAt}
                    containerStyle={trailingTimeStyle}
                  />
                  {isSubThread ? null : (
                    <PSMessageComment
                      messageId={message.id}
                      subThreadName={getPreviewSubThreadName(
                        message,
                        translator,
                      )}
                      subThreadId={message.subThreadId}
                      messageSubThreadCount={message.messageSubThreadCount}
                      containerStyle={{
                        // backgroundColor: isMyMessage
                        //   ? `${colors.Primary.linerBorder}4f`
                        //   : `${colors.Primary.linerBorder}4f`,
                        padding: MESSAGE_BORDER_RADIUS,
                        // borderTopWidth: 0,
                        // borderRadius: MESSAGE_BORDER_RADIUS,
                      }}
                    />
                  )}
                </PSDebouncedPressable>
              </PSMessageBubbleLayout>
            </PSMessageLayout>
            <PSMessageItemSwipeRight />
          </Animated.View>
        </PanGestureHandler>
      ) : null;
    },
    (prev, next) => isEqual(prev, next),
  );

const styles = StyleSheet.create({
  repliedMessageOfStickerContainer: {
    width: '100%',
    padding: (10).px(),
  },
  sticker: {
    width: (128).px(),
    height: (128).px(),
  },
});
