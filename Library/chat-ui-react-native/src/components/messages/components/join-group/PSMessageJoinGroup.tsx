import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {PSMessageJoinGroupButton} from './PSMessageJoinGroupButton';
import {PSMessageJoinGroupTitle} from './PSMessageJoinGroupTitle';

export const PSMessageJoinGroup = React.memo(
  () => {
    return (
      <View style={styles.container}>
        <PSMessageJoinGroupTitle />
        <PSMessageJoinGroupButton />
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
