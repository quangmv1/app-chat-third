import React from 'react';
import {Image, ImageProps} from 'react-native';

type PSImageComponentContextValue = {
  ImageComponent: React.ComponentType<ImageProps>;
};

const PSImageComponentContext =
  React.createContext<PSImageComponentContextValue>(
    {} as PSImageComponentContextValue,
  );

export const PSImageComponentProvider = ({
  ImageComponent,
  children,
}: React.PropsWithChildren<{
  ImageComponent?: React.ComponentType<ImageProps>;
}>) => {
  const contextValue = React.useMemo(() => {
    return {
      ImageComponent: ImageComponent ?? Image,
    } as PSImageComponentContextValue;
  }, []);

  return (
    <PSImageComponentContext.Provider value={contextValue}>
      {children}
    </PSImageComponentContext.Provider>
  );
};

export const usePSImageComponentContext = () =>
  React.useContext(PSImageComponentContext);
