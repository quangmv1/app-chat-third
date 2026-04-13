import React, {PropsWithChildren} from 'react';
import {
  useSharedValue,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

const timingConfig = {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

type PSThreadSwipeRowContextValue = {
  close?: () => void;
  translateX: SharedValue<number>;
};

const PSThreadSwipeRowContext =
  React.createContext<PSThreadSwipeRowContextValue>(
    {} as PSThreadSwipeRowContextValue,
  );

export const PSThreadSwipeRowProvider = ({children}: PropsWithChildren) => {
  const translateX = useSharedValue(0);

  const close = React.useCallback(
    () => (translateX.value = withTiming(0, timingConfig)),
    [translateX],
  );

  const value = React.useMemo(() => {
    return {
      close: close,
      translateX: translateX,
    } as PSThreadSwipeRowContextValue;
  }, [close, translateX]);

  return (
    <PSThreadSwipeRowContext.Provider value={value}>
      {children}
    </PSThreadSwipeRowContext.Provider>
  );
};

export const usePSThreadSwipeRowContext = () =>
  React.useContext(PSThreadSwipeRowContext);
