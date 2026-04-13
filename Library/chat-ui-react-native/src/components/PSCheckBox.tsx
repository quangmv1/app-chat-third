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
import {IcFillCheckMark} from '../icons';
import isEqual from 'react-fast-compare';

type CheckBoxProps = {
  value?: boolean;
  onValueChange?: null | ((event: GestureResponderEvent) => void);
  checkFillColor?: ColorValue;
  checkBorderColor?: ColorValue;
  uncheckBorderColor?: ColorValue;
  iconFillColor?: ColorValue;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export const PSCheckBox = React.memo(
  ({
    value,
    onValueChange,
    checkFillColor,
    checkBorderColor,
    uncheckBorderColor,
    iconFillColor,
    size,
    style,
  }: CheckBoxProps) => {
    return (
      <Pressable onPress={onValueChange} style={style}>
        <View
          style={[
            styles.square,
            {
              width: size ?? (24).px(),
              height: size ?? (24).px(),
              borderRadius: (4).px(),
              borderWidth: (2).px(),
              borderColor: value
                ? checkBorderColor
                : uncheckBorderColor ?? 'transparent',
              backgroundColor: value
                ? checkFillColor ?? 'transparent'
                : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          {value && (
            <IcFillCheckMark
              width={size ?? (24).px()}
              height={size ?? (24).px()}
              fill={iconFillColor ?? 'green'}
            />
          )}
        </View>
      </Pressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  square: {
    borderRadius: (2).px(),
  },
});
