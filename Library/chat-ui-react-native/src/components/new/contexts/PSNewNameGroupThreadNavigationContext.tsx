import React, {createContext, PropsWithChildren, useContext} from 'react';

type PSNewNameGroupThreadNavigationContextValue = {
  onBackPress?: null | (() => void);
  onComplete?: null | ((threadId: string) => void);
};

const PSNewNameGroupThreadNavigationContext = createContext(
  {} as PSNewNameGroupThreadNavigationContextValue,
);

export const PSNewNameGroupThreadNavigationProvider = ({
  onBackPress,
  onComplete,
  children,
}: PropsWithChildren<PSNewNameGroupThreadNavigationContextValue>) => {
  const navContextValue =
    React.useMemo<PSNewNameGroupThreadNavigationContextValue>(
      () => ({
        onBackPress: onBackPress,
        onComplete: onComplete,
      }),
      [onBackPress, onComplete],
    );

  return (
    <PSNewNameGroupThreadNavigationContext.Provider value={navContextValue}>
      {children}
    </PSNewNameGroupThreadNavigationContext.Provider>
  );
};

export const usePSNewNameGroupThreadNavigationContext = () =>
  useContext(PSNewNameGroupThreadNavigationContext);
