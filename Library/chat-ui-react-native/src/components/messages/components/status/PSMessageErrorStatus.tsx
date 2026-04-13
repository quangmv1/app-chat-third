import React from 'react';

import {StyleSheet} from 'react-native';
import {usePSMessageActionsOverlayContext} from '../../contexts';
import {IcFillXmarkCircle} from '../../../../icons';
import {usePSMessageItemContext} from '../PSMessageItem';
import {PSMessageStatus} from '../../../../types';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../hooks';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

export const PSMessageErrorStatus = React.memo(
  ({
    messagePrimaryKey,
    isDeleted,
    status,
  }: {
    messagePrimaryKey: string;
    isDeleted: boolean;
    status: PSMessageStatus;
  }) => {
    const {isOverlay} = usePSMessageItemContext();

    const {show} = usePSMessageActionsOverlayContext();

    const onPress = () => {
      if (!isDeleted && !isOverlay) {
        show(messagePrimaryKey);
      }
    };

    useRenderCounter('MessageErrorStatus', !isOverlay && status === 'error');

    return !isOverlay && status === 'error' ? (
      <PSDebouncedPressable style={styles.container} onPress={onPress}>
        <IcFillXmarkCircle width={(24).px()} height={(24).px()} fill={'red'} />
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    margin: (8).px(),
  },
});
