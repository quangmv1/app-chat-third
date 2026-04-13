import React from 'react';
import {PSMessageModel} from '../../../../types';
import {StyleSheet} from 'react-native';
import {PSMessageChatBotQuickReply} from '../chat-bot';
import isEqual from 'react-fast-compare';
import {usePSMessageCurrentThreadContext} from '../../contexts';
import {PSMessageLayout} from '../PSMessageLayout';
import {PSMessageBubbleLayout} from '../PSMessageBubbleLayout';
import {
  MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
  MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
  MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
  MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP,
  usePSMessageItemContext,
} from '../PSMessageItem';
import {PSMessageSenderName} from '../sender-name';
import {PSMessageText} from '../text';

export const PSMessageBotQuickReplyWrapper = React.memo(
  ({message}: {message: PSMessageModel}) => {
    const currentThreadLastMessageId =
      usePSMessageCurrentThreadContext()?.lastMessage?.id;

    const {isOverlay} = usePSMessageItemContext();

    const hasReplied = React.useMemo(() => {
      const lastMessageId = currentThreadLastMessageId;
      if (lastMessageId) {
        return lastMessageId > message.id;
      } else {
        return true;
      }
    }, [message.id, currentThreadLastMessageId]);

    return message.body?.quickReply ? (
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
        avatarVisibility={message.avatarVisibility}>
        {message?.body?.text ? (
          <PSMessageBubbleLayout
            withAwesomeBackground
            avatarVisibility={message.avatarVisibility}
            messagePrimaryKey={message.primaryKey}
            messageId={message.id}
            messageStatus={message.status}
            isMessageStatusVisible={!message.isHideStatus}
            messageSender={message.sender}
            messageDeleteLevel={message.deleteLevel}>
            <PSMessageSenderName
              senderName={message.sender.name}
              verified={message.sender.verified}
              isSenderNameVisible={false}
              containerStyle={styles.nameText}
            />
            <PSMessageText
              text={message.body.text}
              isRtf={
                message.body.isRtf &&
                message.body.text !== message.body.plainText
              }
              containerStyle={styles.messageText}
            />
          </PSMessageBubbleLayout>
        ) : null}
        {!isOverlay && (
          <PSMessageChatBotQuickReply
            buttons={message.body.quickReply.buttons}
            hasReplied={hasReplied}
          />
        )}
      </PSMessageLayout>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  nameText: {
    marginTop: MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
    marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
  },
  messageText: {
    marginTop: MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP,
    marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
    marginBottom: MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
  },
});
