import React from 'react';
import isEqual from 'react-fast-compare';
import {Text, StyleSheet} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../../context';

export const FormDescription = React.memo(
  ({description}: {description?: string}) => {
    const {colors, typography} = usePSDesignSystemContext();
    return description ? (
      <Text
        style={[
          styles.title,
          typography.bodyMediumR,
          {color: colors.Primary.subText},
        ]}>
        {description}
      </Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {},
  title: {
    marginBottom: (24).px(),
  },
});
