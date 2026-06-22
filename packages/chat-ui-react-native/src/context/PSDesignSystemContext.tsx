import React, {PropsWithChildren} from 'react';
import {
  PSColors,
  PSLightColorsDefault,
  PSTypography,
  PSTypographyDefault,
} from '../themes';

type PSDesignSystemContextValue = {
  typography: PSTypography;
  colors: PSColors;
};

const PSDesignSystemContext = React.createContext(
  {} as PSDesignSystemContextValue,
);

export type PSDesignSystemContextProps = {};

export const PSDesignSystemProvider = ({
  typography,
  colors,
  children,
}: PropsWithChildren<{typography?: PSTypography; colors?: PSColors}>) => {
  // const colorScheme = useColorScheme();

  const designSystemContextValue = React.useMemo<PSDesignSystemContextValue>(
    () =>
      ({
        typography: typography ?? PSTypographyDefault,
        colors: colors ?? PSLightColorsDefault,
        // colors ?? colorScheme === 'dark'
        //   ? PSDarkColorsDefault
        //   : PSLightColorsDefault,
      }) as PSDesignSystemContextValue,
    [typography, colors],
  );
  return (
    <PSDesignSystemContext.Provider value={designSystemContextValue}>
      {children}
    </PSDesignSystemContext.Provider>
  );
};

export const usePSDesignSystemContext = () =>
  React.useContext(PSDesignSystemContext);
