import React, {createContext, PropsWithChildren, useContext} from 'react';

type PSLinkJoinGroupNavigationContextValue = {
  onBackPress?: null | (() => void);
  onShareLinkPress?: null | ((link: string) => void);
};

const PSLinkJoinGroupNavigationContext = createContext(
  {} as PSLinkJoinGroupNavigationContextValue,
);

export const PSLinkJoinGroupNavigationProvider = ({
  onBackPress,
  onShareLinkPress,
  children,
}: PropsWithChildren<PSLinkJoinGroupNavigationContextValue>) => {
  const navContextValue = React.useMemo<PSLinkJoinGroupNavigationContextValue>(
    () => ({
      onBackPress: onBackPress,
      onShareLinkPress: onShareLinkPress,
    }),
    [onBackPress, onShareLinkPress],
  );

  return (
    <PSLinkJoinGroupNavigationContext.Provider value={navContextValue}>
      {children}
    </PSLinkJoinGroupNavigationContext.Provider>
  );
};

export const usePSLinkJoinGroupNavigationContext = () =>
  useContext(PSLinkJoinGroupNavigationContext);
