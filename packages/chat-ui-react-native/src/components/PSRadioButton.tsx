/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  ColorValue,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {IcFillCheckMarkCircle} from '../icons';
import isEqual from 'react-fast-compare';

type RadioButtonProps = {
  value?: boolean;
  onValueChange?: null | ((event: GestureResponderEvent) => void);
  checkFillColor?: ColorValue;
  uncheckBorderColor?: ColorValue;
  size?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: null | boolean;
};

export const PSRadioButton = React.memo(
  ({
    value,
    onValueChange,
    checkFillColor,
    uncheckBorderColor,
    size,
    borderRadius,
    style,
    disabled,
  }: RadioButtonProps) => {
    return (
      <Pressable onPress={onValueChange} style={style} disabled={disabled}>
        {value ? (
          // <IcFillCheckMarkCircle
          //   width={size ?? 24}
          //   height={size ?? 24}
          //   fill={checkFillColor ?? 'green'}
          // />
          <View
            style={[
              styles.radio,
              {
                height: size ?? 24,
                width: size ?? 24,
                borderRadius: borderRadius ?? 24,
                borderColor: checkFillColor ?? 'green',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            <View
              style={{
                height: size ? size - 6 : 16,
                width: size ? size - 6 : 16,
                borderRadius: size ? size - 6 : 16,
                backgroundColor: checkFillColor ?? 'green',
              }}
            />
          </View>
        ) : (
          <View
            style={[
              styles.radio,
              {
                width: size ?? 24,
                height: size ?? 24,
                borderRadius: borderRadius ?? 24,
                borderColor: uncheckBorderColor ?? 'black',
              },
            ]}
          />
        )}
      </Pressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  radio: {
    borderWidth: 1,
  },
});
