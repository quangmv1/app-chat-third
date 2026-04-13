import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {useRenderCounter} from '../../../../../hooks';

export const PSThreadItemUnreadMentionedBadge = React.memo(
  ({unreadCount}: {unreadCount: number}) => {
    useRenderCounter('PSThreadItemUnreadMentionedBadge', unreadCount > 0);

    const {colors, typography} = usePSDesignSystemContext();

    return unreadCount ? (
      <View
        style={[
          styles.unreadCount,
          {backgroundColor: colors.Primary.bgBranding},
        ]}>
        <Text
          style={[
            styles.unreadCountText,
            typography.bodySmallS,
            {color: colors.Primary.branding},
          ]}>
          @
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
    marginLeft: (8).px(),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  unreadCountText: {marginHorizontal: (4).px()},
});
