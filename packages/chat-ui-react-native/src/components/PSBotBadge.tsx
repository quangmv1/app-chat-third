import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleProp, StyleSheet, Text, View} from 'react-native';
import {TextStyle} from 'react-native';
import {PSIcHashTag24} from '../icons';
import {usePSDesignSystemContext} from '../context';

export const PSBotBadge = React.memo(
  ({textStyle}: {textStyle: StyleProp<TextStyle>}) => {
    return <Text style={[styles.badge, textStyle]}>Bot</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

export const PSAgentBadge = React.memo(
  ({textStyle}: {textStyle: StyleProp<TextStyle>}) => {
    return <Text style={[styles.badge, textStyle]}>Agent</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

export const PSPublicGroupBadge = React.memo(
  () => {
    const {colors} = usePSDesignSystemContext();
    return (
      <View
        style={[
          styles.threadPublic,
          {
            backgroundColor: colors.Primary.decorative,
            borderColor: colors.Primary.white,
          },
        ]}>
        <PSIcHashTag24 width={(12).px()} height={(12).px()} fill={'#FFFFFF'} />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    borderRadius: (4).px(),
    // borderWidth: (1).px(),
    paddingHorizontal: (4).px(),
    overflow: 'hidden',
  },
  threadPublic: {
    width: (20).px(),
    height: (20).px(),
    borderRadius: (10).px(),
    backgroundColor: '#9B76FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
