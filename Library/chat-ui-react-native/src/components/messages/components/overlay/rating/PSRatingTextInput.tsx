import React from 'react';
import isEqual from 'react-fast-compare';
import {View, StyleSheet, Platform} from 'react-native';
import {PSIcEmail24} from '../../../../../icons';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../../context';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';

export const PSRatingTextInput = React.memo(
  ({
    text,
    onChangeText,
  }: {
    text: string;
    onChangeText: (newText: string) => void;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();

    const {translator} = usePSTranslationContext();

    return (
      <View style={[styles.containerInput, {borderTopColor: colors.Neutral.n50}]}>
        <PSIcEmail24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
        <BottomSheetTextInput
          placeholder={translator('ps_rating_share_your_feedback_optional')}
          // value={text}
          onChangeText={onChangeText}
          multiline={true}
          numberOfLines={4}
          // keyboardType={
          //   Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'
          // }
          scrollEnabled
          placeholderTextColor={colors.Primary.placeHolder}
          style={[styles.inputText, typography.bodyMediumR, {lineHeight: 0}]}
        />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  containerInput: {
    flexDirection: 'row',
    marginHorizontal: (16).px(),
    paddingHorizontal: (12).px(),
    paddingVertical: (8).px(),
    borderTopWidth: (1).px(),
  },
  inputText: {
    alignItems: 'center',
    minHeight: (40).px(),
    maxHeight: (80).px(),
    flex: 1,
    textAlignVertical: 'top',
    marginStart: (8).px(),
    padding: (0).px(),
  },
});
