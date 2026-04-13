import React, {PropsWithChildren} from 'react';

type PSThreadNavigationContextValue = {
  onPressThread?:
    | null
    | ((targetThreadId: string, targetMessageId: number) => void)
    | undefined;
};

const PSThreadNavigationContext =
  React.createContext<PSThreadNavigationContextValue>(
    {} as PSThreadNavigationContextValue,
  );

export const PSThreadNavigationProvider = ({
  onPressThread,
  children,
}: PropsWithChildren<PSThreadNavigationContextValue>) => {
  const value = React.useMemo(() => {
    return {
      onPressThread: onPressThread,
    } as PSThreadNavigationContextValue;
  }, [onPressThread]);

  return (
    <PSThreadNavigationContext.Provider value={value}>
      {children}
    </PSThreadNavigationContext.Provider>
  );
};

export const usePSThreadNavigationContext = () =>
  React.useContext(PSThreadNavigationContext);
