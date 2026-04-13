import React, {Fragment} from 'react';
import isEqual from 'react-fast-compare';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ActivityIndicator,
} from 'react-native';
import {usePSDesignSystemContext, usePSTranslationContext} from '../context';
import {PSIcMessageEmptyState} from '../icons';
import {usePSMessageIsSubthreadContext} from './messages';
import {PSSkeleton} from './PSSkeleton';

export const PSMessageEmptyState = React.memo(
  ({
    isLoadingVisible,
    textStyle,
  }: {
    isLoadingVisible: boolean;
    textStyle: StyleProp<TextStyle>;
  }) => {
    const {colors} = usePSDesignSystemContext();
    return (
      <View style={styles.containerEmpty}>
        {isLoadingVisible ? (
          <ActivityIndicator size={(32).px()} color={colors.Branding.b800} />
        ) : (
          <Fragment>
            <PSIcMessageEmptyState width={(130).px()} height={(130).px()} />
            <MemoizeText textStyle={textStyle} />
          </Fragment>
        )}
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  ({textStyle}: {textStyle: StyleProp<TextStyle>}) => {
    const {translator} = usePSTranslationContext();
    const isSubThread = usePSMessageIsSubthreadContext();
    return (
      <Text style={[styles.text, textStyle]}>
        {isSubThread
          ? translator('ps_comment_empty')
          : translator('ps_message_empty')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const FullScreenSkeletonLoader = React.memo(
  () => {
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        {Array(15)
          .fill(null)
          .map((_, index) => (
            <PSSkeleton key={index} />
          ))}
      </View>
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
