import React, {PropsWithChildren} from 'react';
import {usePSMessageCurrentThreadContext} from './PSMessageCurrentThreadContext';

const PSMessageUserDeActivatedContext = React.createContext<boolean>(true);

export const PSMessageUserDeActivatedProvider = ({
  children,
}: PropsWithChildren) => {
  const currentThread = usePSMessageCurrentThreadContext();

  const isUserDeActivatedValue = React.useMemo(() => {
    return currentThread?.isUserDeActivated() ?? false;
  }, [currentThread]);

  return (
    <PSMessageUserDeActivatedContext.Provider value={isUserDeActivatedValue}>
      {children}
    </PSMessageUserDeActivatedContext.Provider>
  );
};

export const usePSMessageUserDeActivatedContext = () =>
  React.useContext(PSMessageUserDeActivatedContext);
