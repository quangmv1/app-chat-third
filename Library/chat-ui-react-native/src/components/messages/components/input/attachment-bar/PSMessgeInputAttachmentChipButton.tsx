import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { PSDebouncedPressable } from '../../../../PSDebouncedPressable';
import isEqual from 'react-fast-compare';
import { IconProps } from '../../../../../icons';
import { usePSDesignSystemContext } from '../../../../../context';

export const PSMessgeInputAttachmentChipButton = React.memo(
  ({
    text,
    Icon,
    isActivated,
    containerStyle,
    onPress,
  }: {
    text: string;
    Icon: React.FC<IconProps>;
    isActivated?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    onPress?: () => void;
  }) => {
    const { colors, typography } = usePSDesignSystemContext();

    const containerStyles = React.useMemo(() => {
      return [
        styles.container,
        {
          borderColor: isActivated ? colors.Primary.branding : colors.Neutral.n50,
          backgroundColor: isActivated
            ? colors.Primary.bgBranding
            : colors.Neutral.n50,
        },
        containerStyle,
      ];
    }, [
      colors.Primary.bgBranding,
      colors.Neutral.n50,
      colors.Primary.branding,
      containerStyle,
      isActivated,
    ]);

    const textStyles = React.useMemo(() => {
      return [
        styles.text,
        typography.bodyMediumR,
        { color: isActivated ? colors.Primary.branding : colors.Primary.subText },
      ];
    }, [
      colors.Primary.subText,
      colors.Primary.branding,
      isActivated,
      typography.bodyMediumR,
    ]);

    return (
      <PSDebouncedPressable onPress={onPress} style={styles.column}>
        <View
          style={containerStyles}>
          <Icon
            width={(24).px()}
            height={(24).px()}
            fill={isActivated ? colors.Primary.branding : colors.Primary.subText}
          />
        </View>
        <Text numberOfLines={2} style={textStyles}>{text}</Text>
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: (1).px(),
    borderRadius: (8).px(),
    paddingVertical: (4).px(),
    paddingHorizontal: (4).px(),
  },
  text: {
    marginTop: (4).px(),
    marginStart: (4).px(),
    textAlign: 'center',
  },
  column: {
    width: (95).px(),
    alignItems: 'center',
    flexDirection: 'column',
    marginBottom: (24).px(),
  }
});
