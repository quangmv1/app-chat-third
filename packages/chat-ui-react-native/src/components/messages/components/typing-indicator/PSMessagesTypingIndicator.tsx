import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePSMessageCurrentThreadIdContext } from '../../contexts';
import { useRenderCounter } from '../../../../hooks';
import {
  usePSDesignSystemContext,
  usePSMqttTypingUsersContext,
} from '../../../../context';
import { PSUsersTypingText } from '../../../typing-indicator';

export const PSMessagesTypingIndicator = React.memo(() => {
  const { typography, colors } = usePSDesignSystemContext();

  const currentThreadId = usePSMessageCurrentThreadIdContext();
  const typingUsers = usePSMqttTypingUsersContext();

  const users = React.useMemo(() => {
    return currentThreadId && typingUsers[currentThreadId]
      ? typingUsers[currentThreadId]
      : undefined;
  }, [currentThreadId, typingUsers]);

  const containerStyles = React.useMemo(() => {
    return [styles.container, { backgroundColor: colors.Primary.bgBranding }];
  }, [colors.Primary.bgBranding]);

  const textStyles = React.useMemo(() => {
    return {
      ...typography.bodyMediumR,
      color: colors.Primary.subText,
    };
  }, [colors.Primary.subText, typography.bodyMediumR]);

  useRenderCounter(
    'PSMessagesTypingIndicator',
    users !== undefined && users.length > 0,
  );

  return users && users.length > 0 ? (
    <View style={containerStyles}>
      {/* <PSLoadingDots numberOfDots={3} spacing={2} /> */}
      <PSUsersTypingText users={users} textStyle={textStyles} />
    </View>
  ) : null;
});

const styles = StyleSheet.create({
  container: {
    // borderTopEndRadius: (4).px(),
    borderTopRightRadius: (8).px(),
    flexDirection: 'row',
    paddingHorizontal: (8).px(),
    paddingVertical: (4).px(),
    position: 'absolute',
    bottom: 0,
    // alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
