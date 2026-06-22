import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {PSMessageInputWarnTitle} from './PSMessageInputWarnTitle';

export const PSMessageInputWarn = React.memo(
  ({text}: {text: string}) => {
    return (
      <View style={styles.container}>
        <PSMessageInputWarnTitle text={text} />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: (16).px(),
    paddingVertical: (8).px(),
  },
});
