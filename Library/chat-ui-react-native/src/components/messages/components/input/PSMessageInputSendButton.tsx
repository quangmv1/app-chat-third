import React from 'react';
import {usePSMessageInputSendContext} from '../../contexts';
import {StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {PSIcSend24, PSIcSent24} from '../../../../icons';
import {useRenderCounter} from '../../../../hooks';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../context';

export const PSMessageInputSendButton = React.memo(
  ({containerStyle}: {containerStyle?: StyleProp<ViewStyle>}) => {
    const {isButtonSendEnabled, onSendMessagePress} =
      usePSMessageInputSendContext();

    useRenderCounter('PSMessageInputSendButton', isButtonSendEnabled);
    const {colors} = usePSDesignSystemContext();

    const onPress = () => {
      if (isButtonSendEnabled) {
        onSendMessagePress();
      }
    };

    return (
      <PSDebouncedPressable
        onPress={onPress}
        style={[styles.button, containerStyle]}>
        <PSIcSend24
          width={(32).px()}
          height={(32).px()}
          fill={
            isButtonSendEnabled
              ? colors.Primary.branding
              : colors.Primary.placeHolder
          }
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  button: {
    width: (32).px(),
    height: (32).px(),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
