import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {useRenderCounter} from '../../../../hooks';
import {IcFill3DotVertical as IcMore} from '../../../../icons/IcFill3DotVertical';
import {
  usePSThreadSwipeRowContext,
  useThreadActionsOverlay,
} from '../../contexts';
import {BUTTON_WIDTH, MARGIN_BUTTON_WIDTH} from '../thread-item';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

export const PSThreadSwipeActionMore = React.memo(
  ({threadId}: {threadId: string}) => {
    const {colors} = usePSDesignSystemContext();

    const showThreadActions = useThreadActionsOverlay();

    const {close} = usePSThreadSwipeRowContext();

    const onMorePressed = () => {
      close?.();
      showThreadActions(threadId);
    };

    useRenderCounter('ThreadSwipeActionMore');

    return (
      <PSDebouncedPressable
        style={[
          styles.container,
          {margin: MARGIN_BUTTON_WIDTH},
          {backgroundColor: colors.Primary.white},
        ]}
        onPress={onMorePressed}>
        <MemoizeMore />
        <MemoizeText />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const MemoizeText = React.memo(() => {
  const {translator} = usePSTranslationContext();
  const {colors, typography} = usePSDesignSystemContext();

  return (
    <Text style={[styles.title, typography.bodyMediumR, {color: colors.Primary.subText}]}>
      {translator('ps_thread_more')}
    </Text>
  );
});

const MemoizeMore = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  return (
    <IcMore width={(24).px()} height={(24).px()} fill={colors.Branding.b600} />
  );
});

const styles = StyleSheet.create({
  container: {
    width: BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: (12).px(),
  },
  title: {
    marginTop: (4).px(),
  },
});
