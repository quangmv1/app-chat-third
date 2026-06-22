import React, {PropsWithChildren} from 'react';
import {
  Pressable,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';

type PSDebouncedPressableProps = {
  style?: StyleProp<ViewStyle>;
  disabled?: null | boolean;
  onPress?: null | ((event: GestureResponderEvent) => void);
  onLongPress?: null | ((event: GestureResponderEvent) => void);
};

export const PSDebouncedPressable = ({
  children,
  disabled,
  onPress,
  onLongPress,
  style,
}: PropsWithChildren<PSDebouncedPressableProps>) => {
  const pressedLastTimeRef = React.useRef<number | undefined>();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      const now = new Date().getTime();
      if (
        !pressedLastTimeRef.current ||
        now - pressedLastTimeRef.current > 500
      ) {
        pressedLastTimeRef.current = now;
        onPress?.(event);
      }
    },
    [onPress],
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={style}
      onLongPress={onLongPress}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      {children}
    </Pressable>
  );
};
