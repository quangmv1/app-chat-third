import React, {PropsWithChildren} from 'react';
import {usePSMessageCurrentThreadContext} from './PSMessageCurrentThreadContext';
import {PSUserBlockStatus} from '@communi/chat-api-client-typescript';

type PSMessageUserBlockContextValue = {
  isBlockedByMe: boolean;
  isBlockedByPartner: boolean;
};

const PSMessageUserBlockContext =
  React.createContext<PSMessageUserBlockContextValue>(
    {} as PSMessageUserBlockContextValue,
  );

export const PSMessageUserBlockProvider = ({children}: PropsWithChildren) => {
  const blockStatus = usePSMessageCurrentThreadContext()?.blockStatus;

  const value = React.useMemo(() => {
    return {
      isBlockedByMe: blockStatus === PSUserBlockStatus.BLOCKED_BY_ME,
      isBlockedByPartner: blockStatus === PSUserBlockStatus.BLOCKED_BY_PARTNER,
    } as PSMessageUserBlockContextValue;
  }, [blockStatus]);

  return (
    <PSMessageUserBlockContext.Provider value={value}>
      {children}
    </PSMessageUserBlockContext.Provider>
  );
};

export const usePSMessageUserBlockContext = () =>
  React.useContext(PSMessageUserBlockContext);
