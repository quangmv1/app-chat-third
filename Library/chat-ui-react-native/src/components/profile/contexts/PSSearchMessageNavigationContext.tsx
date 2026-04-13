import React, {createContext, PropsWithChildren, useContext} from 'react';

type PSSearchMessageNavigationContextValue = {
  onBackPress?: null | (() => void);
  onViewMessage?: null | ((messageId: number) => void);
};

const PSSearchMessageNavigationContext = createContext(
  {} as PSSearchMessageNavigationContextValue,
);

export const PSSearchMessageNavigationProvider = ({
  onBackPress,
  onViewMessage,
  children,
}: PropsWithChildren<PSSearchMessageNavigationContextValue>) => {
  const navContextValue = React.useMemo<PSSearchMessageNavigationContextValue>(
    () => ({
      onBackPress: onBackPress,
      onViewMessage: onViewMessage,
    }),
    [onViewMessage, onBackPress],
  );

  return (
    <PSSearchMessageNavigationContext.Provider value={navContextValue}>
      {children}
    </PSSearchMessageNavigationContext.Provider>
  );
};

export const usePSSearchMessageNavigationContext = () =>
  useContext(PSSearchMessageNavigationContext);
