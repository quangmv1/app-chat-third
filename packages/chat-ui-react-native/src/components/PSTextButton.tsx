import React from 'react';
import isEqual from 'react-fast-compare';
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {PSDebouncedPressable} from './PSDebouncedPressable';

type Props = {
  text: string;
  disabled?: boolean;
  textStyle: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  leftIcon?: () => React.ReactElement | null;
  rightIcon?: () => React.ReactElement | null;
  onPress?: null | ((event: GestureResponderEvent) => void);
};

const BORDER_RADIUS_DEFAULT = 8;

export const PSTextButton = React.memo(
  (props: Props) => {
    return (
      <PSDebouncedPressable
        onPress={props.onPress}
        disabled={props.disabled ?? false}
        style={[
          styles.container,
          {
            borderRadius: BORDER_RADIUS_DEFAULT,
          },
          props.style,
        ]}>
        {props.leftIcon?.()}
        <Text style={[styles.text, props.textStyle]}>{props.text}</Text>
        {props.rightIcon?.()}
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    marginHorizontal: 8,
  },
});
