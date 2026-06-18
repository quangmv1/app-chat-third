import React from 'react';
import {StyleSheet, StyleProp, ViewStyle, Keyboard} from 'react-native';
import {PSIcChatBotMenu24, PSIcClose24} from '../../../../icons';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {
  usePSDesignSystemContext,
  usePSMediaPickerActionContext,
  usePSStickerPickerActionContext,
} from '../../../../context';
import {
  usePSMessageChatBotCommandOverlayActionContext,
  usePSMessageChatBotCommandOverlayContext,
  usePSMessageCurrentThreadContext,
} from '../../contexts';
import {PSUserType} from '@communi/chat-api-client-typescript';

export const PSMessageInputChatBotCommandButton = React.memo(
  ({containerStyle}: {containerStyle?: StyleProp<ViewStyle>}) => {
    const {colors} = usePSDesignSystemContext();

    const {closeMediaPicker} = usePSMediaPickerActionContext();

    const {closeStickerPicker} = usePSStickerPickerActionContext();

    const {isVisible} = usePSMessageChatBotCommandOverlayContext();

    const {show, hide} = usePSMessageChatBotCommandOverlayActionContext();

    const currentThread = usePSMessageCurrentThreadContext();

    const onPress = () => {
      if (isVisible) {
        hide();
      } else {
        show();
        closeMediaPicker();
        closeStickerPicker();
        Keyboard.dismiss();
      }
    };

    return currentThread?.partner?.type === PSUserType.BOT ? (
      <PSDebouncedPressable
        onPress={onPress}
        style={[styles.button, containerStyle]}>
        {isVisible ? (
          <PSIcClose24
            width={(32).px()}
            height={(32).px()}
            fill={colors.Primary.subText}
          />
        ) : (
          <PSIcChatBotMenu24
            width={(32).px()}
            height={(32).px()}
            fill={colors.Primary.branding}
          />
        )}
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  button: {
    // marginStart: (4).px(),
    width: (32).px(),
    height: (32).px(),
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: (4).px(),
  },
});
