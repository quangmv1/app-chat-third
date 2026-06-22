import React from 'react';
import {Keyboard, StyleSheet} from 'react-native';
import {
  usePSMessageCurrentThreadContext,
  usePSMessageCurrentThreadIdContext,
  usePSPinnedMessagesContext,
  usePSRatingContext,
  usePSSelectMessageIsEnabledContext,
} from '../../contexts';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../context';
import {PSCustomerRatingContent} from './PSCustomerRatingContent';

export const PSCustomerRating = React.memo(() => {
  const {colors} = usePSDesignSystemContext();
  const {pinnedMessages, currentPinnedMessage} = usePSPinnedMessagesContext();
  const isSelectMessageEnabled = usePSSelectMessageIsEnabledContext();

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const isRatingAnytime = usePSMessageCurrentThreadContext()?.isRatingAnytime;

  const supportThreadId = usePSMessageCurrentThreadContext()?.supportThreadId;
  const sessionId = usePSMessageCurrentThreadContext()?.sessionId;

  const show = usePSRatingContext().show;

  const isPinnedMessagesVisible = React.useMemo(() => {
    return (
      pinnedMessages?.length && currentPinnedMessage && !isSelectMessageEnabled
    );
  }, [pinnedMessages?.length, currentPinnedMessage, isSelectMessageEnabled]);

  const onPress = React.useCallback(() => {
    Keyboard.dismiss();
    if (!supportThreadId || !sessionId || !currentThreadId) return;
    show({
      supportThreadId: supportThreadId,
      sessionId: sessionId,
      threadId: currentThreadId,
      lockComment: false,
    });
  }, [show, supportThreadId, sessionId, currentThreadId]);

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.bgBranding,
      },
      {
        top: isPinnedMessagesVisible ? (62).px() : 0,
      },
    ];
  }, [colors.Primary.bgBranding, isPinnedMessagesVisible]);

  return isRatingAnytime ? (
    <PSDebouncedPressable onPress={onPress} style={containerStyles}>
      <PSCustomerRatingContent />
    </PSDebouncedPressable>
  ) : null;
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 12,
    shadowOpacity: 0.4,
    elevation: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // height: (36).px(),
    margin: (6).px(),
    borderRadius: (8).px(),
  },
});
