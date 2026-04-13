import React, {PropsWithChildren} from 'react';

type PSAreaInsetsContextValue = {
  topInset: number;
  bottomInset: number;
};

const PSAreaInsetsContext = React.createContext({} as PSAreaInsetsContextValue);

export type PSAreaInsetsContextProps = {
  topInset?: number;
  bottomInset?: number;
};

export const PSAreaInsetsProvider = (
  props: PropsWithChildren<PSAreaInsetsContextProps>,
) => {
  const {topInset, bottomInset, children} = props;
  const areaInsetsContextValue = React.useMemo<PSAreaInsetsContextValue>(
    () =>
      ({
        topInset: topInset ?? 0,
        bottomInset: bottomInset ?? 0,
      }) as PSAreaInsetsContextValue,
    [topInset, bottomInset],
  );
  return (
    <PSAreaInsetsContext.Provider value={areaInsetsContextValue}>
      {children}
    </PSAreaInsetsContext.Provider>
  );
};

export const usePSAreaInsetsContext = () =>
  React.useContext(PSAreaInsetsContext);
