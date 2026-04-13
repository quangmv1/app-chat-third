import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

export const PSMessageUnreadHeader = React.memo(
  ({isVisible}: {isVisible?: boolean}) => {
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const leftStyles = React.useMemo(() => {
      return [styles.leftLine, {backgroundColor: colors.Primary.subText}];
    }, [colors.Primary.subText]);

    const textStyles = React.useMemo(() => {
      return [
        styles.text,
        typography.bodyMediumR,
        {color: colors.Primary.subText},
      ];
    }, [colors.Primary.subText, typography.bodyMediumR]);

    const rightStyles = React.useMemo(() => {
      return [styles.rightLine, {backgroundColor: colors.Primary.subText}];
    }, [colors.Primary.subText]);

    return isVisible ? (
      <View style={styles.container}>
        <View style={leftStyles} />
        <Text style={textStyles}>{translator('ps_message_unread')}</Text>
        <View style={rightStyles} />
      </View>
    ) : null;
  },
  (prev, next) => prev.isVisible === next.isVisible,
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: (12).px(),
  },
  leftLine: {
    height: (0.5).px(),
    width: '20%',
  },
  rightLine: {
    height: (0.5).px(),
    width: '20%',
  },
  text: {textAlign: 'center', marginHorizontal: (24).px()},
});
