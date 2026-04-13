import React from 'react';
import {PSMessageModel} from '../../../types';

type PSCustomizedMessageItemFactoryContextValue = {
  customizedFactory?:
    | null
    | ((message: PSMessageModel) => React.JSX.Element | null);
};

const PSCustomizedMessageItemFactoryContext = React.createContext(
  {} as PSCustomizedMessageItemFactoryContextValue,
);

export const PSCustomizedMessageItemFactoryProvider = ({
  customizedMessageItemFactory,
  children,
}: React.PropsWithChildren<{
  customizedMessageItemFactory?:
    | null
    | ((message: PSMessageModel) => React.JSX.Element | null);
}>) => {
  const contextValue = React.useMemo(() => {
    return {
      customizedFactory: customizedMessageItemFactory,
    } as PSCustomizedMessageItemFactoryContextValue;
  }, [customizedMessageItemFactory]);
  return (
    <PSCustomizedMessageItemFactoryContext.Provider value={contextValue}>
      {children}
    </PSCustomizedMessageItemFactoryContext.Provider>
  );
};

export const usePSCustomizedMessageItemFactoryContext = () =>
  React.useContext(PSCustomizedMessageItemFactoryContext);
