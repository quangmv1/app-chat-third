import React from 'react';
import isEqual from 'react-fast-compare';
import { TextStyle, View, ViewStyle } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { usePSTranslationContext } from '../../../../context';
import {
  PSFormStatus,
  PSMessageModel,
  getPreviewSubThreadName,
} from '../../../../types';
import { hapticHeavy } from '../../../../utils';
import { springConfig, usePSThreadSwipeRowContext } from '../../../threads';
import {
  usePSMessageInputRefContext,
  usePSMessageIsNotMemberOfPublicThreadContext,
  usePSMessageIsSubthreadContext,
  usePSReplyMessageSetIdContext,
} from '../../contexts';
import { PSMessageBubbleLayout } from '../PSMessageBubbleLayout';
import {
  MESSAGE_BORDER_WIDTH,
  MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
  MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
  MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
  MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP,
  MESSAGE_MARGIN_HORIZONTAL,
  MESSAGE_MAX_WIDTH,
  usePSMessageItemContext,
} from '../PSMessageItem';
import { PSMessageLayout } from '../PSMessageLayout';
import { PSMessageComment } from '../comment';
import { PSMessageFiles } from '../file';
import { PSMessageForwardHeader } from '../forward';
import { PSMessageMedia } from '../media';
import { PSMessagePreviewLink } from '../preview-link';
import { PSRepliedMessage } from '../reply';
import { PSMessageSenderName } from '../sender-name';
import { PSMessageSession } from '../session';
import { PSMessageEditedStatus } from '../status';
import { PSMessageText } from '../text';
import { PSMessageUnsupported } from '../unsupported';
import { PSMessageItemSwipeRight } from './PSMessageItemSwipeRight';
import { PSFormMessage } from '../form';
import { PSMessageTrailingTime } from '../time/PSMessageTrailingTime';

export const PSMessageAwesomeMessageWrapper =
  // javascript-obfuscator:disable
  React.memo(
    ({
      message,
      isPSMessageSubThread,
    }: {
      message: PSMessageModel;
      isPSMessageSubThread?: boolean;
    }) => {
      const isMyMessage = usePSMessageItemContext()?.isMyMessage;
      const isOverlay = usePSMessageItemContext()?.isOverlay;
      const isSubThread = usePSMessageIsSubthreadContext();
      const isNotMemberOfPublicThread =
        usePSMessageIsNotMemberOfPublicThreadContext();
      const { translator } = usePSTranslationContext();

      const hasSenderName = message.isSenderNameVisible;
      const hasForwardFrom = message.body?.forwardFrom != null;
      const hasRepliedMessage = message.body?.repliedMessage != null;
      const hasMedia = message.body?.media != null && message.body.media.length;
      const hasFiles = message.body?.files != null && message.body.files.length;
      const hasText = message.body?.text != null && message.body?.text.length;
      const hasPreviewLink = message.body?.previewLink != null;
      const isEdited = message.editedAt > 0;
      const hasSession = message.body?.session != null;

      const senderNameStyle = React.useMemo(() => {
        return {
          marginTop: message.isSenderNameVisible
            ? MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP
            : undefined,
          marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
        } as TextStyle;
      }, [message.isSenderNameVisible]);

      const forwardHeaderStyle = React.useMemo(() => {
        return {
          marginTop: hasSenderName
            ? MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP
            : MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
          marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
        } as ViewStyle;
      }, [hasSenderName]);

      const repliedMessageStyle = React.useMemo(() => {
        return {
          marginTop:
            hasSenderName || hasForwardFrom
              ? MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP
              : MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
          marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
        } as ViewStyle;
      }, [hasForwardFrom, hasSenderName]);

      const mediaStyle = React.useMemo(() => {
        return {
          marginTop:
            hasSenderName || hasForwardFrom || hasRepliedMessage
              ? MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP
              : undefined,
        } as ViewStyle;
      }, [hasForwardFrom, hasRepliedMessage, hasSenderName]);

      const filesStyle = React.useMemo(() => {
        return {
          marginTop:
            hasSenderName || hasForwardFrom || hasRepliedMessage || hasMedia
              ? MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP
              : MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
          marginBottom:
            hasText || isEdited || hasPreviewLink
              ? undefined
              : MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
          marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
        } as ViewStyle;
      }, [
        hasForwardFrom,
        hasMedia,
        hasPreviewLink,
        hasRepliedMessage,
        hasSenderName,
        hasText,
        isEdited,
      ]);

      const textContainerStyle = React.useMemo(() => {
        return {
          marginTop:
            hasSenderName ||
              hasForwardFrom ||
              hasRepliedMessage ||
              hasMedia ||
              hasFiles
              ? MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP
              : MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
          marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
        } as ViewStyle;
      }, [
        hasFiles,
        hasForwardFrom,
        hasMedia,
        hasPreviewLink,
        hasRepliedMessage,
        hasSenderName,
        isEdited,
      ]);

      const sessionContainerStyle = React.useMemo(() => {
        return {
          marginTop: MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
          marginBottom: MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
          marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
        } as ViewStyle;
      }, []);

      const editedTextStyle = React.useMemo(() => {
        return {
          textAlign: 'right',
          marginRight: (8).px(),
        } as TextStyle;
      }, []);

      const trailingTimeStyle = React.useMemo(() => {
        return {
          textAlign: 'right',
        } as TextStyle;
      }, []);

      const previewLinkStyle = React.useMemo(() => {
        return {
          marginTop: MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP,
        } as ViewStyle;
      }, []);

      const formStyle = React.useMemo(() => {
        return {
          margin: MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP,
        } as ViewStyle;
      }, []);

      const rowStyles = React.useMemo(
        () =>
          ({
            flexDirection: 'row',
            alignSelf: 'flex-end',
            marginBottom: MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
            marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL
          }) as ViewStyle,
        [],
      );

      const unsupportedTextStyle = React.useMemo(() => {
        return {
          marginTop:
            hasSenderName ||
              hasForwardFrom ||
              hasRepliedMessage ||
              hasMedia ||
              hasFiles ||
              hasText ||
              hasPreviewLink
              ? MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP
              : MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
          marginBottom: MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
          marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
        } as TextStyle;
      }, [
        hasFiles,
        hasForwardFrom,
        hasMedia,
        hasPreviewLink,
        hasRepliedMessage,
        hasSenderName,
        hasText,
      ]);

      const replyMessage = usePSReplyMessageSetIdContext();

      const textInputRef = usePSMessageInputRefContext();

      const { translateX } = usePSThreadSwipeRowContext();

      const [isReplyQuick, setIsReplyQuick] = React.useState(false);

      const handler = useAnimatedGestureHandler({
        onStart: (_evt: any, ctx: { x: any }) => {
          ctx.x = translateX.value;
          runOnJS(setIsReplyQuick)(false);
        },

        onActive: (evt: { translationX: any }, ctx: { x: any }) => {
          if (message.status !== 'sent' || isOverlay || isPSMessageSubThread)
            return;
          const nextTranslate = evt.translationX + ctx.x;
          translateX.value = Math.min(
            0,
            Math.max(nextTranslate, MAX_TRANSLATE),
          );
        },

        onEnd: (evt: { velocityX: number }) => {
          translateX.value = withSpring(0, springConfig(evt.velocityX));
          if (translateX.value < -40) {
            runOnJS(replyMessage)(message.id);
            runOnJS(setIsReplyQuick)(true);
            runOnJS(hapticHeavy)();
          }
        },
      });

      React.useEffect(() => {
        if (isReplyQuick && typeof textInputRef.current?.focus === 'function')
          setTimeout(() => textInputRef.current?.focus(), 500);
      }, [isReplyQuick, textInputRef]);

      const styles = useAnimatedStyle(() => {
        return {
          transform: [
            {
              translateX: translateX.value,
            },
          ],
        };
      });

      const commentContainerStyle = React.useMemo(() => {
        return {
          padding: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
        } as ViewStyle;
      }, []);

      return (
        <PanGestureHandler
          hitSlop={{ left: -60 }}
          activeOffsetX={[-30, 30]}
          onGestureEvent={handler}>
          <Animated.View style={styles}>
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
              messageSeenUsers={message.seenUsers}
              isPSMessageSubThread={isPSMessageSubThread}
              avatarVisibility={message.avatarVisibility}>
              <PSMessageBubbleLayout
                avatarVisibility={message.avatarVisibility}
                messagePrimaryKey={message.primaryKey}
                messageId={message.id}
                messageStatus={message.status}
                isMessageStatusVisible={!message.isHideStatus}
                messageSender={message.sender}
                messageDeleteLevel={message.deleteLevel}
                withAwesomeBackground
                isPSMessageSubThread={isPSMessageSubThread}>
                <PSMessageSenderName
                  verified={!!message.sender.verified}
                  senderName={message.sender.name}
                  isSenderNameVisible={message.isSenderNameVisible}
                  senderAvatar={message.sender.avatar}
                  isAvatarVisible={message.isAvatarOriginVisible}
                  role={message.sender.role}
                  containerStyle={senderNameStyle}
                />
                <PSMessageForwardHeader
                  forwarder={message.body?.forwardFrom?.sender}
                  containerStyle={forwardHeaderStyle}
                />
                <PSRepliedMessage
                  repliedMessage={message.body?.repliedMessage}
                  containerStyle={repliedMessageStyle}
                />
                <PSMessageMedia
                  media={message.body?.media}
                  maxWidth={MESSAGE_MAX_WIDTH - MESSAGE_BORDER_WIDTH * 2}
                  containerStyle={mediaStyle}
                />
                <PSMessageFiles
                  files={message.body?.files}
                  containerStyle={filesStyle}
                />
                <PSFormMessage
                  messageId={message.id}
                  form={message.body?.form}
                  formStatus={message.formStatus}
                  containerStyle={formStyle}
                />
                {hasSession ? (
                  <PSMessageSession
                    text={message.body?.text}
                    time={message.createdAt}
                    containerStyle={sessionContainerStyle}
                  />
                ) : (
                  <PSMessageText
                    text={message.body?.text}
                    mentionIds={message.body?.mentionIds}
                    isRtf={
                      (message.body?.isRtf ?? false) &&
                      message.body?.text !== message.body?.plainText
                    }
                    containerStyle={textContainerStyle}
                  />
                )}
                <PSMessagePreviewLink
                  previewLink={message.body?.previewLink}
                  containerStyle={previewLinkStyle}
                />
                <PSMessageUnsupported
                  isUnsuporrted={message.body?.hasUnsupportedMetadata ?? false}
                  containerStyle={unsupportedTextStyle}
                />
                <View style={rowStyles}>
                  <PSMessageEditedStatus
                    editedAt={message.editedAt}
                    isVisible={!message.body?.form}
                    containerStyle={editedTextStyle}
                  />
                  <PSMessageTrailingTime
                    createdAt={message.createdAt}
                    containerStyle={trailingTimeStyle}
                  />
                </View>
                {isSubThread || isNotMemberOfPublicThread ? null : (
                  <PSMessageComment
                    messageId={message.id}
                    subThreadName={getPreviewSubThreadName(message, translator)}
                    subThreadId={message.subThreadId}
                    messageSubThreadCount={message.messageSubThreadCount}
                    containerStyle={commentContainerStyle}
                  />
                )}
              </PSMessageBubbleLayout>
            </PSMessageLayout>
            <PSMessageItemSwipeRight />
          </Animated.View>
        </PanGestureHandler>
      );
    },
    (prev, next) => isEqual(prev, next),
  );

const MAX_TRANSLATE = -50;
