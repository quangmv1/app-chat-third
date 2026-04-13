import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {useRenderCounter} from '../../../../hooks';

import {PSIcDelete24} from '../../../../icons';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {
  usePSThreadSwipeRowContext,
  useThreadActionsDeleteOverlay,
} from '../../contexts';
import {BUTTON_WIDTH, MARGIN_BUTTON_WIDTH} from '../thread-item';

export const PSThreadSwipeActionDelete = React.memo(
  ({threadId}: {threadId: string}) => {
    const {colors} = usePSDesignSystemContext();
    const showThreadActions = useThreadActionsDeleteOverlay();

    const {close} = usePSThreadSwipeRowContext();

    const onMorePressed = () => {
      close?.();
      showThreadActions(threadId);
    };

    useRenderCounter('ThreadSwipeActionDelete');

    return (
      <PSDebouncedPressable
        style={[
          styles.container,
          {margin: MARGIN_BUTTON_WIDTH},
          {backgroundColor: colors.Negative.light},
        ]}
        onPress={onMorePressed}>
        <MemoizeDelete />
        <MemoizeText />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const MemoizeText = React.memo(
  () => {
    const {translator} = usePSTranslationContext();
    const {colors, typography} = usePSDesignSystemContext();

    return (
      <Text
        style={[
          styles.title,
          typography.bodySmallR,
          {color: colors.Negative.normal},
        ]}>
        {translator('ps_message_action_delete')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeDelete = React.memo(() => {
  const {colors} = usePSDesignSystemContext();
  return (
    <PSIcDelete24
      width={(24).px()}
      height={(24).px()}
      fill={colors.Negative.normal}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'orange',
    width: BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: (12).px(),
  },
  title: {
    marginTop: (4).px(),
  },
});
