import React from 'react';
import isEqual from 'react-fast-compare';
import {View, StyleSheet, Text, StyleProp, TextStyle} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {useThreadProfileActionContext} from '../../contexts';

const ThreadDeskContextScreen = () => {
  const {typography, colors} = usePSDesignSystemContext();

  const {translator} = usePSTranslationContext();

  const {screenContext} = useThreadProfileActionContext();

  return screenContext ? (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.Neutral.n50,
          backgroundColor: colors.Primary.background,
        },
      ]}>
      <MemoizeText
        text={translator('ps_current_screen')}
        style={[styles.title, typography.bodyMediumS, {color: colors.Neutral.n100}]}
      />

      <MemoizeText
        text={screenContext}
        style={[typography.bodyXLargeR, {color: colors.Primary.subText}]}
      />
    </View>
  ) : null;
};

const MemoizeText = React.memo(
  ({text, style}: {text: string; style?: StyleProp<TextStyle>}) => {
    return <Text style={style}>{text}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

export const PSThreadDeskContextScreen = React.memo(
  ThreadDeskContextScreen,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingVertical: (8).px(),
    paddingHorizontal: (12).px(),
    borderWidth: (1).px(),
    borderRadius: (12).px(),
  },
  title: {
    marginBottom: (4).px(),
  },
});
