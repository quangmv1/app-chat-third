import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet} from 'react-native';
import {
  usePSMessageIsNotMemberOfPublicThreadContext,
  usePSSelectMessageActionContext,
  usePSSelectMessageIsEnabledContext,
} from '../contexts';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';

// Nếu mode select hoặc nếu ko phải là thành viên của public group thì ko press đc
export const PSMessageInterceptorView = React.memo(
  ({messageId, disabled}: {messageId: number; disabled: boolean}) => {
    const isNotMemberOfPublicThread =
      usePSMessageIsNotMemberOfPublicThreadContext();

    const isSelectMessageEnabled = usePSSelectMessageIsEnabledContext();

    const {selectMessage} = usePSSelectMessageActionContext();

    const onPress = () => {
      if (isSelectMessageEnabled) {
        selectMessage(messageId);
      }
    };

    return isNotMemberOfPublicThread || isSelectMessageEnabled ? (
      <PSDebouncedPressable
        style={styles.container}
        disabled={isNotMemberOfPublicThread || disabled}
        onPress={onPress}
      />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
});
