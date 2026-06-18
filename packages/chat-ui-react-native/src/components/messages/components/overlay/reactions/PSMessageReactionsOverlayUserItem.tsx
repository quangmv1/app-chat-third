import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {PSUserModel} from '../../../../../types';
import {PSAvatarImage} from '../../../../PSAvatarImage';
import {
  usePSMessageCurrentThreadPartnerIdContext,
  usePSMessageNavigationContext,
} from '../../../contexts';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../../context';

export const PSMessageReactionsOverlayUserItem = React.memo(
  ({user}: {user: PSUserModel}) => {
    const {onUserPress} = usePSMessageNavigationContext();

    const currentThreadPartnerId = usePSMessageCurrentThreadPartnerIdContext();

    const onPress = () => {
      onUserPress?.(user.extUserId, currentThreadPartnerId, user.userId);
    };

    return (
      <PSDebouncedPressable style={styles.row} onPress={onPress}>
        <PSAvatarImage
          size={(40).px()}
          displayName={user.name}
          url={user.avatar}
        />
        <MemoizeNameText name={user.name} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const MemoizeNameText = React.memo(
  ({name}: {name: string}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [styles.rowName, typography.bodyXLargeR, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.bodyXLargeR]);

    return <Text style={textStyles}>{name}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: (16).px(),
    paddingVertical: (8).px(),
    alignItems: 'center',
  },
  rowName: {
    marginStart: (16).px(),
  },
});
