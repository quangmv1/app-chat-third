import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {useRenderCounter} from '../../../../hooks';

import {IcFillBell as IcMute} from '../../../../icons/IcFillBell';
import {IcFillBellSlash as IcUnMute} from '../../../../icons/IcFillBellSlash';
import {
  useActionThreadsProviderContext,
  usePSThreadSwipeRowContext,
} from '../../contexts';
import {BUTTON_WIDTH, MARGIN_BUTTON_WIDTH} from '../thread-item';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {PSIcMute24, PSIcMuted24} from '../../../../icons';

export const PSThreadSwipeActionMute = React.memo(
  ({threadId, isMute}: {threadId: string; isMute: boolean}) => {
    const {colors} = usePSDesignSystemContext();
    const {muteThread} = useActionThreadsProviderContext();

    const {close} = usePSThreadSwipeRowContext();

    const onMutePressed = () => {
      close?.();
      muteThread(threadId);
    };

    useRenderCounter('ThreadSwipeActionMute');

    return (
      <PSDebouncedPressable
        style={[
          styles.container,
          {margin: MARGIN_BUTTON_WIDTH},
          {backgroundColor: colors.Primary.background},
        ]}
        onPress={onMutePressed}>
        {isMute ? <MemoizeMute /> : <MemoizeUnMute />}
        <MemoizeText isMute={isMute} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const MemoizeText = React.memo(
  ({isMute}: {isMute: boolean}) => {
    const {translator} = usePSTranslationContext();
    const {colors, typography} = usePSDesignSystemContext();

    return (
      <Text
        style={[
          styles.title,
          typography.bodySmallR,
          {color: colors.Primary.subText},
        ]}>
        {isMute
          ? translator('ps_thread_un_mute')
          : translator('ps_thread_mute')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeMute = React.memo(() => {
  const {colors} = usePSDesignSystemContext();
  return (
    <PSIcMute24
      width={(24).px()}
      height={(24).px()}
      fill={colors.Primary.subText}
    />
  );
});

const MemoizeUnMute = React.memo(() => {
  const {colors} = usePSDesignSystemContext();
  return (
    <PSIcMuted24
      width={(24).px()}
      height={(24).px()}
      fill={colors.Primary.subText}
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
