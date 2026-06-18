import React from 'react';
import {
  usePSMessageCurrentThreadIdContext,
  usePSMessageNavigationContext,
  usePSPinnedMessagesContext,
  usePSScrollToMessageContext,
  usePSSelectMessageIsEnabledContext,
} from '../../contexts';
import {StyleSheet} from 'react-native';
import {PSPinnedMessageContent} from './PSPinnedMessageContent';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../context';

export const PSPinnedMessages = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const {onMessagesPinnedPress} = usePSMessageNavigationContext();
  const currentThreadId = usePSMessageCurrentThreadIdContext();
  const {scrollToMessage} = usePSScrollToMessageContext();
  const {pinnedMessages, currentPinnedMessage, scrollToPinnedMessage} =
    usePSPinnedMessagesContext();
  const isSelectMessageEnabled = usePSSelectMessageIsEnabledContext();

  const onPress = () => {
    const messageId = scrollToPinnedMessage();
    if (messageId) {
      scrollToMessage(messageId, true);
    }
  };

  const allPinnedMessagesPress = React.useCallback(() => {
    if (currentThreadId) {
      onMessagesPinnedPress?.(currentThreadId);
    }
  }, [onMessagesPinnedPress, currentThreadId]);

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.bgBranding,
      },
    ];
  }, [colors.Primary.bgBranding]);

  return pinnedMessages?.length &&
    currentPinnedMessage &&
    !isSelectMessageEnabled ? (
    <PSDebouncedPressable onPress={onPress} style={containerStyles}>
      <PSPinnedMessageContent
        pinnedMessage={currentPinnedMessage}
        pinnedMessagesLength={pinnedMessages.length}
        allPinnedMessagesPress={allPinnedMessagesPress}
      />
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
    height: (54).px(),
    margin: (6).px(),
    borderRadius: (12).px(),
  },
});
