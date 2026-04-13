import React, {PropsWithChildren} from 'react';

type PSIsDeskModeContextValue = {
  isDeskMode: boolean;
};

const PSIsDeskModeContext = React.createContext({} as PSIsDeskModeContextValue);

export type PSIsDeskModeContextProps = {
  isDeskMode?: undefined | boolean;
};

export const PSIsDeskModeProvider = (
  props: PropsWithChildren<PSIsDeskModeContextProps>,
) => {
  const {isDeskMode, children} = props;
  const isDeskModeContextValue = React.useMemo<PSIsDeskModeContextValue>(
    () =>
      ({
        isDeskMode: isDeskMode ?? false,
      }) as PSIsDeskModeContextValue,
    [isDeskMode],
  );
  return (
    <PSIsDeskModeContext.Provider value={isDeskModeContextValue}>
      {children}
    </PSIsDeskModeContext.Provider>
  );
};

export const usePSIsDeskModeContext = () =>
  React.useContext(PSIsDeskModeContext);
