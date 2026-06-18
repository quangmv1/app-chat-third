import React from 'react';
import {PSMessageChatBotMenuModel, PSMessageModel} from '../../../../types';
import isEqual from 'react-fast-compare';
import {PSMessageLayout} from '../PSMessageLayout';
import {PSMessageBubbleLayout} from '../PSMessageBubbleLayout';
import {PSMessageChatBotMenu} from '../chat-bot/menu';

export const PSMessageBotMenuWrapper = React.memo(
  ({message}: {message: PSMessageModel}) => {
    return message.body?.menu ? (
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
          withAwesomeBackground
          avatarVisibility={message.avatarVisibility}
          messagePrimaryKey={message.primaryKey}
          messageId={message.id}
          messageStatus={message.status}
          isMessageStatusVisible={!message.isHideStatus}
          messageSender={message.sender}
          messageDeleteLevel={message.deleteLevel}
          isStretchWidth>
          <PSMessageChatBotMenu
            menu={
              {
                label: message.body.text,
                chidren: message.body.menu,
              } as PSMessageChatBotMenuModel
            }
          />
        </PSMessageBubbleLayout>
      </PSMessageLayout>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);
