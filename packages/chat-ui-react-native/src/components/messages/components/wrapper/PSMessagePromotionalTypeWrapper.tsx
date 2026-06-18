import React from 'react';
import isEqual from 'react-fast-compare';
import {PSMessageModel, PSVisibility} from '../../../../types';
import {PSMessageLayout} from '../PSMessageLayout';
import {PSMessagePromotion} from '../promotion';

export const PSMessagePromotionalTypeWrapper = React.memo(
  ({message}: {message: PSMessageModel}) => {
    return message.body?.promotion ? (
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
        avatarVisibility={PSVisibility.GONE}>
        <PSMessagePromotion message={message} />
      </PSMessageLayout>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);
