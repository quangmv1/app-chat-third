import React from 'react';

export const PSScreenStylesContext = React.createContext({} || undefined);

export const PSScreenStylesProvider = <T extends unknown>({
  styles,
  children,
}: React.PropsWithChildren<{styles?: T}>) => {
  return (
    <PSScreenStylesContext.Provider value={styles ?? {}}>
      {children}
    </PSScreenStylesContext.Provider>
  );
};

export const usePSScreenStylesContext = <T extends unknown>() =>
  React.useContext(PSScreenStylesContext) as T;
