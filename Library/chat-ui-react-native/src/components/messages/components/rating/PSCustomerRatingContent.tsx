import React from 'react';
import isEqual from 'react-fast-compare';
import {View, StyleSheet, Text} from 'react-native';
import {PSIcRight24, PSIcStartFill24} from '../../../../icons';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

export const PSCustomerRatingContent = React.memo(
  () => {
    const {translator} = usePSTranslationContext();
    const {colors, typography} = usePSDesignSystemContext();
    return (
      <View style={styles.container}>
        <PSIcStartFill24
          width={(20).px()}
          height={(20).px()}
          fill={colors.Branding.b600}
        />
        <Text
          style={[
            {flex: 1, marginStart: (10).px()},
            typography.bodyXLargeR,
            {color: colors.Primary.subText},
            {lineHeight: undefined},
          ]}>
          {translator('ps_rating_customer_support_rating')}
        </Text>
        <PSIcRight24
          width={(20).px()}
          height={(20).px()}
          fill={colors.Primary.subText}
        />
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: (12).px(),
    paddingVertical: (6).px(),
    alignItems: 'center',
  },
});
