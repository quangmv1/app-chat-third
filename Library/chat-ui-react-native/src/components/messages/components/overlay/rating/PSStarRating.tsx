import React from 'react';
import isEqual from 'react-fast-compare';
import {View, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {PSIcStartFill24, PSIcStartLine24} from '../../../../../icons';
import {usePSDesignSystemContext} from '../../../../../context';

export const PSStartRating = React.memo(
  ({
    rating,
    onChange,
    sizeStart,
    styleStart,
    starContainer,
    disabled,
  }: {
    rating: number;
    onChange?: (rating: number) => void;
    sizeStart?: number;
    styleStart?: StyleProp<ViewStyle>;
    starContainer?: StyleProp<ViewStyle>;
    disabled?: null | boolean;
  }) => {
    const {colors} = usePSDesignSystemContext();

    const maxRating = 5;

    const handlePress = (newRating: number) => {
      onChange?.(newRating);
    };

    return (
      <View style={[styles.starContainer, starContainer]}>
        {[...Array(maxRating)].map((_, index) => {
          const starIndex = index + 1;
          return (
            <PSDebouncedPressable
              key={starIndex}
              onPress={() => handlePress(starIndex)}
              style={[styles.starButton, styleStart]}
              disabled={disabled}>
              {starIndex <= rating ? (
                <PSIcStartFill24
                  width={sizeStart ?? (32).px()}
                  height={sizeStart ?? (32).px()}
                  fill={colors.Primary.branding}
                />
              ) : (
                <PSIcStartLine24
                  width={sizeStart ?? (25).px()}
                  height={sizeStart ?? (25).px()}
                />
              )}
            </PSDebouncedPressable>
          );
        })}
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: (28).px(),
    marginBottom: (32).px(),
  },
  starButton: {
    paddingHorizontal: (9).px(),
  },
});
