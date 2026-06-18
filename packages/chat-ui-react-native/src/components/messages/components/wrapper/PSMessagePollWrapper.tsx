import React from 'react';
import {PSMessageModel} from '../../../../types';
import isEqual from 'react-fast-compare';
import {StyleSheet} from 'react-native';
import {PSMessagePoll} from '../poll';
import {PSMessageLayout} from '../PSMessageLayout';

export const PSMessagePollWrapper = React.memo(
  ({message}: {message: PSMessageModel}) => {
    return (
      <PSMessageLayout
        isHighlightEnabled
        isFirstUnreadVisible={message.isFirstUnread}
        isHeaderTimeVisible={message.isHeaderTimeVisible}
        isInterceptorDisabled={true}
        messagePrimaryKey={message.primaryKey}
        messageId={message.id}
        messageCreatedAt={message.createdAt}
        messageStatus={message.status}
        messageReactions={message.reactions}
        messageSeenUsers={message.seenUsers}>
        <PSMessagePoll
          messageId={message.id}
          poll={message.body?.poll}
          sender={message.sender}
        />
      </PSMessageLayout>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({});
