import React from 'react';
import {PSUserModel, PSVisibility} from '../../../../types';
import {StyleSheet, View} from 'react-native';
import isEqual from 'react-fast-compare';
import {PSAvatarImage} from '../../../PSAvatarImage';
import {
  usePSMessageCurrentThreadPartnerIdContext,
  usePSMessageNavigationContext,
} from '../../contexts';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

export const PSMessageSenderAvatar = React.memo(
  ({
    sender,
    size,
    visibility,
  }: {
    sender: PSUserModel;
    size: number;
    visibility?: PSVisibility;
  }) => {
    const currentThreadPartnerId = usePSMessageCurrentThreadPartnerIdContext();

    const {onUserPress} = usePSMessageNavigationContext();

    const onPress = () => {
      onUserPress?.(sender.extUserId, currentThreadPartnerId, sender.userId);
    };

    return visibility === PSVisibility.VISIBLE ? (
      <PSDebouncedPressable style={styles.avatar} onPress={onPress}>
        <PSAvatarImage
          size={size}
          url={sender.avatar}
          displayName={sender.name}
        />
      </PSDebouncedPressable>
    ) : visibility === PSVisibility.INVISIBLE ? (
      <View style={{width: size, height: size}} />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'flex-end',
  },
});
