import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {useRenderCounter} from '../../../../../hooks';

export const PSThreadItemUnreadBadge = React.memo(
  ({unreadCount, isMute}: {unreadCount: number; isMute?: boolean}) => {
    useRenderCounter('PSThreadItemUnreadBadge', unreadCount > 0);

    const {colors, typography} = usePSDesignSystemContext();

    return unreadCount ? (
      <View
        style={[
          styles.unreadCount,
          {backgroundColor: isMute ? colors.Primary.disable : colors.Primary.branding},
        ]}>
        <Text
          style={[
            styles.unreadCountText,
            typography.bodySmallR,
            {color: colors.Neutral.n0},
          ]}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </Text>
      </View>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  unreadCount: {
    minWidth: (20).px(),
    height: (20).px(),
    borderRadius: (20 / 2).px(),
    marginLeft: (4).px(),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  unreadCountText: {marginHorizontal: (4).px()},
});
