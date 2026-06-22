import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {useRenderCounter} from '../../../../hooks';
import {PSMessagePollModel, PSUserModel} from '../../../../types';
import {PSMessagePollContent} from './PSMessagePollContent';
import {PSMessagePollHeader} from './PSMessagePollHeader';
import {usePSMessageItemContext} from '../PSMessageItem';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

export const PSMessagePoll = React.memo(
  ({
    messageId,
    poll,
    sender,
    containerStyle,
  }: {
    messageId: number;
    poll?: PSMessagePollModel;
    sender: PSUserModel;
    containerStyle?: StyleProp<ViewStyle>;
  }) => {
    useRenderCounter('MessagePoll', poll !== undefined);

    const {onMessagePress, onMessageLongPress} = usePSMessageItemContext();

    return poll ? (
      <PSDebouncedPressable
        style={[styles.container, containerStyle]}
        onPress={onMessagePress}
        onLongPress={onMessageLongPress}>
        <PSMessagePollHeader name={sender.name} />
        <PSMessagePollContent messageId={messageId} poll={poll} />
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
  },
});
