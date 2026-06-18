import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {useRenderCounter} from '../../../../hooks';
import {
  IcFillPin as IcPin,
  IcFillUnPin as IcUnPin,
  PSIcPin24,
  PSIcUnPin24,
} from '../../../../icons';
import {
  useActionThreadsProviderContext,
  usePSThreadSwipeRowContext,
} from '../../contexts';
import {BUTTON_WIDTH, MARGIN_BUTTON_WIDTH} from '../thread-item';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

export const PSThreadSwipeActionPin = React.memo(
  ({threadId, pinnedAt}: {threadId: string; pinnedAt: number}) => {
    const {colors} = usePSDesignSystemContext();
    const {pinThread} = useActionThreadsProviderContext();

    const {close} = usePSThreadSwipeRowContext();

    const onPinPressed = () => {
      close?.();
      pinThread(threadId);
    };

    useRenderCounter('ThreadSwipeActionPin');

    return (
      <PSDebouncedPressable
        style={[
          styles.container,
          {margin: MARGIN_BUTTON_WIDTH},
          {backgroundColor: colors.Primary.background},
        ]}
        onPress={onPinPressed}>
        {pinnedAt !== 0 ? <MemoizeUnPin /> : <MemoizePin />}
        <MemoizeText pinnedAt={pinnedAt} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const MemoizeText = React.memo(
  ({pinnedAt}: {pinnedAt: number}) => {
    const {translator} = usePSTranslationContext();
    const {colors, typography} = usePSDesignSystemContext();

    return (
      <Text
        style={[
          styles.title,
          typography.bodySmallR,
          {color: colors.Primary.subText},
        ]}>
        {pinnedAt !== 0
          ? translator('ps_thread_un_pin')
          : translator('ps_thread_pin')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizePin = React.memo(() => {
  const {colors} = usePSDesignSystemContext();
  return (
    <PSIcPin24
      width={(24).px()}
      height={(24).px()}
      fill={colors.Primary.subText}
    />
  );
});

const MemoizeUnPin = React.memo(() => {
  const {colors} = usePSDesignSystemContext();
  return (
    <PSIcUnPin24
      width={(24).px()}
      height={(24).px()}
      fill={colors.Primary.subText}
    />
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
