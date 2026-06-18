import React from 'react';
import {PSIcRight24} from '../../../../icons';
import {StyleSheet} from 'react-native';
import {useRenderCounter} from '../../../../hooks';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../context';

export const PSPinnedMessageArrowRight = React.memo(
  ({onPress}: {onPress: () => void}) => {
    useRenderCounter('PinnedMessageArrowRight');
    const {colors} = usePSDesignSystemContext();

    return (
      <PSDebouncedPressable style={styles.arrowIconContainer} onPress={onPress}>
        <PSIcRight24
          width={(32).px()}
          height={(32).px()}
          fill={colors.Primary.branding}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return prev.onPress === next.onPress;
  },
);

const styles = StyleSheet.create({
  arrowIconContainer: {
    height: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
