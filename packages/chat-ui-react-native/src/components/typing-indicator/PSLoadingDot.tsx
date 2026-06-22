import React, {useEffect} from 'react';
import isEqual from 'react-fast-compare';
import {StyleProp, ViewStyle} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  diameter?: number;
  duration?: number;
  offset?: number;
  style?: StyleProp<ViewStyle>;
};

export const PSLoadingDot = React.memo(
  (props: Props) => {
    const {diameter = 4, duration = 1500, offset = 0, style} = props;
    const halfDuration = duration / 2;
    const startingOffset = halfDuration - offset;

    const opacity = useSharedValue(startingOffset / halfDuration);

    useEffect(() => {
      opacity.value = withSequence(
        withTiming(0, {duration: startingOffset, easing: Easing.linear}),
        withRepeat(
          withSequence(
            withTiming(1, {duration: halfDuration, easing: Easing.linear}),
            withTiming(0, {duration: halfDuration, easing: Easing.linear}),
          ),
          -1,
        ),
      );
    }, []);

    const dotStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
      };
    }, []);

    return (
      <Animated.View
        style={[
          {
            backgroundColor: 'black',
            borderRadius: diameter / 2,
            height: diameter,
            width: diameter,
          },
          style,
          dotStyle,
        ]}
      />
    );
  },
  (prev, next) => isEqual(prev, next),
);
