import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet} from 'react-native';
import {useRenderCounter} from '../../../../hooks';
import {PSIcForward24} from '../../../../icons';
import {
  usePSMessageCurrentThreadIdContext,
  usePSMessageNavigationContext,
  usePSSelectMessageActionContext,
  usePSSelectMessageContext,
  usePSSelectMessageIsEnabledContext,
} from '../../contexts';
import {Text} from 'react-native';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

export const PSMessageActionsSelector = React.memo(() => {
  useRenderCounter('PSMessageActionsSelector');
  const {colors} = usePSDesignSystemContext();
  const isSelectMessageEnabled = usePSSelectMessageIsEnabledContext();

  const currentThreadId = usePSMessageCurrentThreadIdContext();
  const {onForwardMessage} = usePSMessageNavigationContext();

  const selectMessageIds = usePSSelectMessageContext();

  const {cancelSelectMessage} = usePSSelectMessageActionContext();

  const handleForwardPress = React.useCallback(() => {
    if (!currentThreadId || !selectMessageIds) {
      return;
    }
    onForwardMessage?.(currentThreadId, selectMessageIds);
    cancelSelectMessage();
  }, [
    cancelSelectMessage,
    currentThreadId,
    onForwardMessage,
    selectMessageIds,
  ]);

  const isDisable = React.useMemo(() => {
    return !selectMessageIds || selectMessageIds.length === 0;
  }, [selectMessageIds]);

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.branding,
      },
    ];
  }, [colors.Primary.branding]);

  return isSelectMessageEnabled ? (
    <PSDebouncedPressable
      style={containerStyles}
      onPress={handleForwardPress}
      disabled={isDisable}>
      <PSIcForward24
        width={(32).px()}
        height={(32).px()}
        fill={colors.Primary.white}
      />
      <MemoizeForwardText />
    </PSDebouncedPressable>
  ) : null;
});

const MemoizeForwardText = React.memo(
  () => {
    const {typography, colors} = usePSDesignSystemContext();

    const {translator} = usePSTranslationContext();

    return (
      <Text
        style={[styles.text, typography.headingMediumM, {color: colors.Primary.white}]}>
        {translator('ps_forward_message_header')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: (8).px(),
    borderTopWidth: (0.5).px(),
    justifyContent: 'center',
    height: (56).px(),
  },
  text: {marginStart: (8).px()},
});
