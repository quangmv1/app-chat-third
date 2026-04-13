import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {useRenderCounter} from '../../../../hooks';

export const PSMessageJoinGroupTitle = React.memo(
  () => {
    useRenderCounter('PSMessageJoinGroupTitle');
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.container,
        {color: colors.Primary.subText},
        typography.bodyMediumR,
      ];
    }, [colors.Primary.subText, typography.bodyMediumR]);

    return (
      <Text style={textStyles}>
        {translator('ps_message_join_group_description')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    textAlign: 'center',
  },
});
