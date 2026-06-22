import React from 'react';
import {PSMessageModel} from '../../../../types';
import {StyleSheet} from 'react-native';
import {PSMessageChatBotCarousel} from '../chat-bot';
import isEqual from 'react-fast-compare';
import {MESSAGE_CONTENT_MARGIN_AVATAR} from '../PSMessageItem';
import {PSMessageLayout} from '../PSMessageLayout';
import {PSMessageBubbleLayout} from '../PSMessageBubbleLayout';

export const PSMessageBotCarouselWrapper = React.memo(
  ({message}: {message: PSMessageModel}) => {
    return message.body?.carousel ? (
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
          <PSMessageChatBotCarousel
            carousel={message.body.carousel}
            containerStyle={styles.chatBotCarousel}
          />
        </PSMessageBubbleLayout>
      </PSMessageLayout>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  chatBotCarouselContainer: {flex: 1},
  chatBotCarousel: {marginStart: MESSAGE_CONTENT_MARGIN_AVATAR},
});
