import React from 'react';
import isEqual from 'react-fast-compare';
import {Dimensions, StyleSheet, View} from 'react-native';
import {usePSDesignSystemContext} from '../../../../context';
import {PSIcReply24} from '../../../../icons';

export const PSMessageItemSwipeRight = React.memo(
  () => {
    const colors = usePSDesignSystemContext().colors;
    return (
      <View style={s.buttonsContainer}>
        <PSIcReply24
          width={(32).px()}
          height={(32).px()}
          fill={colors.Branding.b200}
        />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const windowDimensions = Dimensions.get('window');

const s = StyleSheet.create({
  buttonsContainer: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: windowDimensions.width,
    width: windowDimensions.width,
  },
});
