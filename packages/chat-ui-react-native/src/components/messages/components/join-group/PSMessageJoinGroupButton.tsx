import React from 'react';
import isEqual from 'react-fast-compare';
import {ActivityIndicator, StyleSheet, Text} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {useRenderCounter} from '../../../../hooks';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {
  usePSMessageCurrentThreadIdContext,
  usePSMessagePublicThreadContext,
} from '../../contexts';

export const PSMessageJoinGroupButton = React.memo(
  () => {
    useRenderCounter('PSMessageJoinGroupButton');
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const {isJoining, join} = usePSMessagePublicThreadContext();

    const threadId = usePSMessageCurrentThreadIdContext();

    const onJoinGroupPress = React.useCallback(() => {
      threadId && join(threadId);
    }, [join, threadId]);

    const containerStyles = React.useMemo(() => {
      return [styles.container, {backgroundColor: colors.Branding.b600}];
    }, [colors.Branding.b600]);

    const textStyles = React.useMemo(() => {
      return [{color: colors.Primary.white}, typography.bodyMediumS];
    }, [colors.Primary.white, typography.bodyMediumS]);

    return (
      <PSDebouncedPressable style={containerStyles} onPress={onJoinGroupPress}>
        {isJoining ? (
          <ActivityIndicator size="small" color={colors.Primary.mainText} />
        ) : (
          <Text style={textStyles}>{translator('ps_message_join_group')}</Text>
        )}
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: (14).px(),
    borderRadius: (12).px(),
    marginTop: (16).px(),
  },
});
