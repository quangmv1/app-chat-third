import React, {PropsWithChildren} from 'react';
import {Keyboard, LayoutAnimation, Platform} from 'react-native';
import {usePSAreaInsetsContext} from '../../../context';
import {
  addKeyboardListener,
  psLogger,
  removeKeyboardListener,
} from '../../../utils';

export type PSPSMessageKeyboardAreaContext = {
  keyboardShown: boolean;
  keyboardHeight: number;
};

const PSPSMessageKeyboardAreaContext = React.createContext(
  {} as PSPSMessageKeyboardAreaContext,
);

export const PSMessageKeyboardAreaProvider = ({
  children,
}: PropsWithChildren) => {
  const [keyboardShown, setKeyboardShown] = React.useState(false);

  const [keyboardHeight, setKeyboardHeight] = React.useState(250);

  const isAndroid10orBelow = React.useMemo(() => {
    if (Platform.OS === 'android') {
      const androidVersion = Platform.Version;
      return androidVersion <= 29; // Android 10 tương ứng với API level 29
    }
    return false;
  }, []);

  const {bottomInset} = usePSAreaInsetsContext();

  React.useEffect(() => {
    if (isAndroid10orBelow) {
      const keyboardAreaHeightChanged = (height: number) => {
        psLogger.error(`PSKeyboardAreaProvider: height = ${height}`);
        setKeyboardHeight(prevHeight => {
          if (height > 0 && height !== prevHeight) {
            return Platform.select({
              ios: height - 37 + bottomInset,
              default: height,
            });
          } else {
            return prevHeight;
          }
        });
        setKeyboardShown(height > 0);
      };
      addKeyboardListener(keyboardAreaHeightChanged);
      return () => {
        removeKeyboardListener(keyboardAreaHeightChanged);
      };
    }
  }, [bottomInset, isAndroid10orBelow]);

  React.useEffect(() => {
    if (!isAndroid10orBelow) {
      const susbcriptionKeyboardWillChangeFrame = Keyboard.addListener(
        Platform.select({
          android: 'keyboardDidChangeFrame',
          default: 'keyboardWillChangeFrame',
        }),
        e => {
          const height = e.endCoordinates.height;
          const {duration, easing} = e;
          if (duration && easing) {
            LayoutAnimation.configureNext({
              duration: duration > 200 ? duration : 200,
              update: {
                duration: duration > 200 ? duration : 200,
                type: LayoutAnimation.Types[easing] || 'keyboard',
              },
            });
          }
          setKeyboardHeight(prevHeight => {
            if (height > 0 && height !== prevHeight) {
              return height;
            } else {
              return prevHeight;
            }
          });
          setKeyboardShown(height > 0);
        },
      );

      // chỗ này chủ yếu phục vụ cho android
      const susbcriptionKeyboardWillShow = Keyboard.addListener(
        Platform.select({
          android: 'keyboardDidShow',
          default: 'keyboardWillShow',
        }),
        e => {
          const height = e.endCoordinates.height;
          const {duration, easing} = e;
          if (duration && easing) {
            LayoutAnimation.configureNext({
              duration: duration > 200 ? duration : 200,
              update: {
                duration: duration > 200 ? duration : 200,
                type: LayoutAnimation.Types[easing] || 'keyboard',
              },
            });
          }
          setKeyboardHeight(prevHeight => {
            if (height > 0 && height !== prevHeight) {
              return height;
            } else {
              return prevHeight;
            }
          });
          setKeyboardShown(height > 0);
        },
      );

      const susbcriptionKeyboardWillHide = Keyboard.addListener(
        Platform.select({
          android: 'keyboardDidHide',
          default: 'keyboardWillHide',
        }),
        e => {
          const {duration, easing} = e;
          if (duration && easing) {
            LayoutAnimation.configureNext({
              duration: duration > 10 ? duration : 10,
              update: {
                duration: duration > 10 ? duration : 10,
                type: LayoutAnimation.Types[easing] || 'keyboard',
              },
            });
          }
          setKeyboardShown(false);
        },
      );
      return () => {
        susbcriptionKeyboardWillChangeFrame.remove();
        susbcriptionKeyboardWillShow.remove();
        susbcriptionKeyboardWillHide.remove();
      };
    }
  }, [isAndroid10orBelow]);

  const contextValue = React.useMemo<PSPSMessageKeyboardAreaContext>(
    () => ({
      keyboardShown: keyboardShown,
      keyboardHeight: keyboardHeight,
    }),
    [keyboardShown, keyboardHeight],
  );

  return (
    <PSPSMessageKeyboardAreaContext.Provider value={contextValue}>
      {children}
    </PSPSMessageKeyboardAreaContext.Provider>
  );
};

export const usePSPSMessageKeyboardAreaContext = () =>
  React.useContext(PSPSMessageKeyboardAreaContext);
