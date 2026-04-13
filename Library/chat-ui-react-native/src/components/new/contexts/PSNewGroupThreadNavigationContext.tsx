import React, {createContext, PropsWithChildren, useContext} from 'react';
import {PSUserModel} from '../../../types';

type PSNewGroupThreadNavigationContextValue = {
  onBackPress?: null | (() => void);
  onNewNameGroupThreadPress?: (selectedUsers: PSUserModel[]) => void;
};

const PSNewGroupThreadNavigationContext = createContext(
  {} as PSNewGroupThreadNavigationContextValue,
);

export const PSNewGroupThreadNavigationProvider = ({
  onBackPress,
  onNewNameGroupThreadPress,
  children,
}: PropsWithChildren<PSNewGroupThreadNavigationContextValue>) => {
  const navContextValue = React.useMemo<PSNewGroupThreadNavigationContextValue>(
    () => ({
      onBackPress: onBackPress,
      onNewNameGroupThreadPress: onNewNameGroupThreadPress,
    }),
    [onBackPress, onNewNameGroupThreadPress],
  );

  return (
    <PSNewGroupThreadNavigationContext.Provider value={navContextValue}>
      {children}
    </PSNewGroupThreadNavigationContext.Provider>
  );
};

export const usePSNewGroupThreadNavigationContext = () =>
  useContext(PSNewGroupThreadNavigationContext);
