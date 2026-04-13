import React from 'react';
import {useRenderCounter} from '../../../../../hooks';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../../context';
import {StyleSheet, View, Text} from 'react-native';
import {PSIcInformation24} from '../../../../../icons';
import isEqual from 'react-fast-compare';

export const PSMessagePermissionByCustomer = React.memo(
  () => {
    useRenderCounter('PSMessagePermissionByCustomer');

    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [styles.text, {color: colors.Neutral.n400}, typography.bodyMediumR];
    }, [colors.Neutral.n400, typography.bodyMediumR]);

    return (
      <View style={styles.container}>
        <PSIcInformation24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
        <Text style={textStyles}>
          {translator('ps_thread_can_not_chat_with_user')}
        </Text>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: (16).px(),
    paddingVertical: (8).px(),
  },
  text: {
    marginHorizontal: (10).px(),
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: (12).px(),
    paddingVertical: (10).px(),
  },
});
