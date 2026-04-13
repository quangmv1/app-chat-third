import React from 'react';
import {PSIcSticker24} from '../../../../icons';
import {StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {useRenderCounter} from '../../../../hooks';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {
  usePSDesignSystemContext,
  usePSStickerPickerActionContext,
} from '../../../../context';
import {usePSMessageInputSendContext} from '../../contexts';

export const PSMessageInputStickerButton = React.memo(
  ({containerStyle}: {containerStyle?: StyleProp<ViewStyle>}) => {
    useRenderCounter('PSMessageInputStickerButton');

    const {colors} = usePSDesignSystemContext();

    const {openStickerPicker} = usePSStickerPickerActionContext();

    const {isButtonSendEnabled} = usePSMessageInputSendContext();

    const onPress = () => {
      openStickerPicker();
    };

    return !isButtonSendEnabled ? (
      <PSDebouncedPressable
        onPress={onPress}
        style={[styles.container, containerStyle]}>
        <PSIcSticker24
          width={(32).px()}
          height={(32).px()}
          fill={colors.Primary.subText}
        />
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    width: (32).px(),
    height: (32).px(),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
