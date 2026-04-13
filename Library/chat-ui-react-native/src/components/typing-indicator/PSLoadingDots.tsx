import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {PSLoadingDot} from './PSLoadingDot';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../hooks';

type Props = {
  diameter?: number;
  duration?: number;
  numberOfDots?: number;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
};

export const PSLoadingDots = React.memo(
  (props: Props) => {
    const {
      diameter = 4,
      duration = 1200,
      numberOfDots = 3,
      spacing: spacingProp,
      style,
    } = props;

    const halfSpacing = spacingProp ? spacingProp / 2 : 0;
    const offsetLength = duration / numberOfDots;

    useRenderCounter('LoadingDots');

    return (
      <View style={[style, styles.container]}>
        {Array.from(Array(numberOfDots)).map((_item, index) => (
          <PSLoadingDot
            diameter={diameter}
            duration={duration}
            key={index}
            offset={duration - offsetLength * (index + 1)}
            style={
              index === 0
                ? {marginRight: halfSpacing}
                : index === numberOfDots - 1
                ? {marginLeft: halfSpacing}
                : {marginHorizontal: halfSpacing}
            }
          />
        ))}
      </View>
    );
  },
  (prev: Props, next: Props) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});
