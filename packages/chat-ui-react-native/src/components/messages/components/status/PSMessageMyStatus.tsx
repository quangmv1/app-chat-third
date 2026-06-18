import React from 'react';
import {usePSMessageItemContext} from '../PSMessageItem';
import {
  PSIcMessageError12,
  PSIcMessageSending12,
  PSIcMessageSent12,
} from '../../../../icons';
import {PSMessageStatus} from '../../../../types';
import {StyleSheet} from 'react-native';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../hooks';
import {usePSDesignSystemContext} from '../../../../context';

export const PSMessageMyStatus = React.memo(
  ({
    status,
    size,
    isMessageStatusVisible,
  }: {
    status: PSMessageStatus;
    size: number;
    isMessageStatusVisible: boolean;
  }) => {
    const colors = usePSDesignSystemContext().colors;

    const {isOverlay, isMyMessage} = usePSMessageItemContext();

    useRenderCounter('PSMessageSwipeable', !isOverlay && isMyMessage);

    return !isOverlay && isMyMessage && isMessageStatusVisible ? (
      status === 'sending' ? (
        <PSIcMessageSending12 width={size} height={size} style={styles.icon} />
      ) : status === 'sent' ? (
        <PSIcMessageSent12
          width={size}
          height={size}
          fill={colors.Primary.branding}
          style={styles.icon}
        />
      ) : (
        <PSIcMessageError12 width={size} height={size} style={styles.icon} />
      )
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'flex-end',
  },
});
