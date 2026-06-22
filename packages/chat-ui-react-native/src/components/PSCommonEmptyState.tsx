import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import {usePSTranslationContext} from '../context';
import {PSIcCommonEmptyState} from '../icons';

export const PSCommonEmptyState = React.memo(
  ({textStyle}: {textStyle: StyleProp<TextStyle>}) => {
    return (
      <View style={styles.containerEmpty}>
        <PSIcCommonEmptyState width={(139).px()} height={(88).px()} />
        <MemoizeText textStyle={textStyle} />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  ({textStyle}: {textStyle: StyleProp<TextStyle>}) => {
    const {translator} = usePSTranslationContext();
    return (
      <Text style={[styles.text, textStyle]}>
        {translator('ps_search_empty')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  containerEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: (16).px(),
  },
});
