import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import {psLogger} from '../utils';

const PSIsOnlineContext = React.createContext<boolean>(true);

export const PSIsOnlineProvider = ({children}: React.PropsWithChildren) => {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      psLogger.error(
        `PSIsOnlineProvider: ConnectionType = ${state.type}, isConnected = ${state.isConnected}`,
      );
      setIsOnline(state.isConnected ?? false);
    });

    const setInitialOnlineState = async () => {
      try {
        const status = await NetInfo.fetch();
        psLogger.error(
          `PSIsOnlineProvider: setInitialOnlineState = ${JSON.stringify(
            status,
          )}`,
        );
        setIsOnline(status.isConnected ?? false);
      } catch (error) {
        psLogger.error(
          `PSIsOnlineProvider: setInitialOnlineState = ${JSON.stringify(
            error,
          )}`,
        );
        setIsOnline(false);
      }
    };
    setInitialOnlineState();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <PSIsOnlineContext.Provider value={isOnline}>
      {children}
    </PSIsOnlineContext.Provider>
  );
};

export const usePSIsOnlineContext = () => React.useContext(PSIsOnlineContext);
