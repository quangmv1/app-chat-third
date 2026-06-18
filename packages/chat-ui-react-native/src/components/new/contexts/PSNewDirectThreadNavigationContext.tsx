import React, {createContext, PropsWithChildren, useContext} from 'react';
import {PSUserModel} from '../../../types';

type PSNewDirectThreadNavigationContextValue = {
  onBackPress?: null | (() => void);
  onPressNewGroupThread?: null | (() => void);
  onPressUserSelected?: (user: PSUserModel) => void;
};

const PSNewDirectThreadNavigationContext = createContext(
  {} as PSNewDirectThreadNavigationContextValue,
);

export const PSNewDirectThreadNavigationProvider = ({
  onBackPress,
  onPressNewGroupThread,
  onPressUserSelected,
  children,
}: PropsWithChildren<PSNewDirectThreadNavigationContextValue>) => {
  const navContextValue =
    React.useMemo<PSNewDirectThreadNavigationContextValue>(
      () => ({
        onBackPress: onBackPress,
        onPressNewGroupThread: onPressNewGroupThread,
        onPressUserSelected: onPressUserSelected,
      }),
      [onBackPress, onPressNewGroupThread, onPressUserSelected],
    );

  return (
    <PSNewDirectThreadNavigationContext.Provider value={navContextValue}>
      {children}
    </PSNewDirectThreadNavigationContext.Provider>
  );
};

export const usePSNewDirectThreadNavigationContext = () =>
  useContext(PSNewDirectThreadNavigationContext);
