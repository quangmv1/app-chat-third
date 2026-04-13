import React, {createContext, PropsWithChildren, useContext} from 'react';

type PSForwardMessageNavigationContextValue = {
  onBackPress?: null | (() => void);
};

const PSForwardMessageNavigationContext = createContext(
  {} as PSForwardMessageNavigationContextValue,
);

export const PSForwardMessageNavigationProvider = ({
  onBackPress,
  children,
}: PropsWithChildren<PSForwardMessageNavigationContextValue>) => {
  const navContextValue = React.useMemo<PSForwardMessageNavigationContextValue>(
    () => ({
      onBackPress: onBackPress,
    }),
    [onBackPress],
  );

  return (
    <PSForwardMessageNavigationContext.Provider value={navContextValue}>
      {children}
    </PSForwardMessageNavigationContext.Provider>
  );
};

export const usePSForwardMessageNavigationContext = () =>
  useContext(PSForwardMessageNavigationContext);
