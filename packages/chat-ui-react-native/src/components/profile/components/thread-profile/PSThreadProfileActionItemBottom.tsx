import React, {PropsWithChildren} from 'react';
import {StyleSheet, Text, TextStyle} from 'react-native';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

export const ActionItem = ({
  children,
  title,
  color,
  textStyle,
  onPress,
}: PropsWithChildren<{
  title: string;
  color?: string;
  textStyle?: TextStyle;
  onPress?: null | (() => void);
}>) => {
  return (
    <PSDebouncedPressable onPress={onPress} style={styles.container}>
      {children}
      <Text
        style={[{color: color ?? '#26282C', marginLeft: (12).px()}, textStyle]}>
        {title}
      </Text>
    </PSDebouncedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: (12).px(),
  },
});
