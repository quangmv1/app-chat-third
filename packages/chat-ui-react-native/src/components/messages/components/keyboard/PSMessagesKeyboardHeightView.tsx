import { useBackHandler } from '@react-native-community/hooks';
import React from 'react';
import isEqual from 'react-fast-compare';
import { Animated, Easing, Keyboard } from 'react-native';
import {
  usePSAreaInsetsContext,
  usePSMediaPickerActionContext,
  usePSMediaPickerVisibleContext,
  usePSStickerPickerActionContext,
  usePSStickerPickerVisibleContext,
} from '../../../../context';
import { useRenderCounter } from '../../../../hooks';
import { usePSPSMessageKeyboardAreaContext } from '../../contexts';

enum State {
  KEYBOARD,
  MEDIA_PICKER,
  STICKER,
  NONE,
}

export const PSMessagesKeyboardHeightView = React.memo(() => {
  const { bottomInset } = usePSAreaInsetsContext();

  const { keyboardHeight, keyboardShown } = usePSPSMessageKeyboardAreaContext();

  // const {isMediaPickerShown} = usePSMediaPickerVisibleContext();

  const { closeMediaPicker } = usePSMediaPickerActionContext();

  const { isStickerPickerShown } = usePSStickerPickerVisibleContext();

  const { closeStickerPicker } = usePSStickerPickerActionContext();

  const [height, setHeight] = React.useState(0);

  const openKeyboardArea = React.useCallback(() => {
    setHeight(prev => {
      const result = keyboardHeight - bottomInset;
      if (prev !== result) {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      return result;
    });
  }, [keyboardHeight, bottomInset]);

  const closeKeyboardArea = React.useCallback(() => {
    setHeight(prev => {
      if (prev > 0) {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      return 0;
    });
  }, []);

  const stateRef = React.useRef(State.NONE);

  React.useEffect(() => {
    if (!keyboardShown && !isStickerPickerShown) {
      stateRef.current = State.NONE;
      closeKeyboardArea();
    } else {
      openKeyboardArea();

      const trueLength = [
        keyboardShown,
        // isMediaPickerShown,
        isStickerPickerShown,
      ].filter(value => value).length;

      if (trueLength === 1) {
        if (keyboardShown) {
          stateRef.current = State.KEYBOARD;
        }
        // else if (isMediaPickerShown) {
        //   stateRef.current = State.MEDIA_PICKER;
        // } 
        else if (isStickerPickerShown) {
          stateRef.current = State.STICKER;
        }
      } else {
        const state = stateRef.current;

        switch (state) {
          case State.KEYBOARD:
            Keyboard.dismiss();
            break;
          case State.MEDIA_PICKER:
            closeMediaPicker();
            break;
          case State.STICKER:
            closeStickerPicker();
            break;
        }
      }
    }
  }, [
    keyboardShown,
    // isMediaPickerShown,
    isStickerPickerShown,
    keyboardHeight,
    openKeyboardArea,
    closeKeyboardArea,
    closeMediaPicker,
    closeStickerPicker,
  ]);

  // useBackHandler(() => {
  //   if (isMediaPickerShown) {
  //     closeMediaPicker();
  //     return true;
  //   }
  //   return false;
  // });

  useRenderCounter('PSMessagesKeyboardHeightView');

  return <MemoizeHeightView height={height} />;
});

const MemoizeHeightView = React.memo(
  ({ height }: { height: number }) => {
    const heightAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.timing(heightAnim, {
        duration: 250,
        toValue: height > 100 ? height : 0,
        useNativeDriver: false,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
      }).start();
    }, [height]);

    return (
      <Animated.View
        style={{
          paddingBottom: heightAnim,
        }}
      />
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);
