import React, {PropsWithChildren} from 'react';
import {PSBusEvent, PSEventBus, psLogger} from '../utils';
import {useDeepCompareMemoize, useIsMountedRef} from '../hooks';
import {usePSChatApiClientContext} from './PSChatApiClientContext';
import {useQuery} from './PSRealmContext';
import {PSThreadEntity} from '../types';
import cloneDeep from 'lodash.clonedeep';
import {usePSMqttClientConnectedContext} from './PSMqttClientContext';

export const DETERMINE_RECENT_OFFLINE_TIME = 10 * 60; // 10m
export const DETERMINE_OFFLINE_TIME_ONE_HOUR = 60 * 60; // 1h
export const DETERMINE_OFFLINE_TIME_ONE_DAY = 60 * 60 * 24; // 24h
export const DETERMINE_OFFLINE_TIME_ONE_WEEK = 60 * 60 * 24 * 7; // 1w

const FETCH_USERS_ONLINE_INTERVAL_TIME = 60 * 1000; // 60s

export type PSThreadPartnerOnlineTime = {
  threadId: string;
  userId: string;
  lastOnlineTime?: number;
};

type PSLastOnlineTimeContextValue = {
  onlineTimePartners: PSThreadPartnerOnlineTime[];
};

const PSLastOnlineTimeContext = React.createContext(
  {} as PSLastOnlineTimeContextValue,
);

export const PSLastOnlineTimeProvider = ({children}: PropsWithChildren) => {
  const isMqttConnected = usePSMqttClientConnectedContext();

  const chatApiClient = usePSChatApiClientContext();

  const isMounted = useIsMountedRef();

  const [onlineTimePartners, setOnlineTimePartners] = React.useState<
    PSThreadPartnerOnlineTime[]
  >([]);

  const onlineTimePartnersRef = React.useRef<PSThreadPartnerOnlineTime[]>([]);

  const directThreads = useQuery(
    PSThreadEntity,
    results => {
      return results.filtered(PSThreadEntity.filteredDirectThread());
    },
    [],
  );

  const directThreadsWithUserId = React.useMemo(() => {
    return directThreads.map(item => {
      return {
        threadId: item.id,
        userId: item.partner!.extUserId,
        lastOnlineTime: onlineTimePartnersRef.current.find(
          i => i.threadId === item.id,
        )?.lastOnlineTime,
      } as PSThreadPartnerOnlineTime;
    });
  }, [directThreads]);

  React.useEffect(() => {
    onlineTimePartnersRef.current = onlineTimePartners;
  }, [onlineTimePartners]);

  React.useEffect(() => {
    if (!isMqttConnected || !chatApiClient || !directThreadsWithUserId.length) {
      setOnlineTimePartners([]);
      return;
    }
    setOnlineTimePartners(directThreadsWithUserId);
    const fetchUsersOnline = async () => {
      try {
        const respone = await chatApiClient.userApi.fetchUsersOnline(
          directThreadsWithUserId
            .map(item => item.userId)
            .slice(0, Math.min(directThreadsWithUserId.length, 99)),
        );
        const data = respone.data;
        if (isMounted.current && data) {
          setOnlineTimePartners(prev => {
            if (data.length) {
              const next = cloneDeep(prev);
              next.forEach(item => {
                const result = data.find(
                  user => user.ext_user_id === item.userId,
                );
                if (result) {
                  if (
                    !item.lastOnlineTime ||
                    result.last_online > item.lastOnlineTime
                  ) {
                    item.lastOnlineTime = result.last_online;
                  }
                }
              });
              return next;
            } else {
              return prev;
            }
          });
        }
      } catch (error) {
        psLogger.error(
          'PSMessageLastOnlineTimeProvider: fetchUsersOnline => ',
          error,
        );
      }
    };
    fetchUsersOnline();
    const intervalId = setInterval(() => {
      fetchUsersOnline();
    }, FETCH_USERS_ONLINE_INTERVAL_TIME);
    return () => {
      clearInterval(intervalId);
    };
  }, [
    isMqttConnected,
    chatApiClient,
    useDeepCompareMemoize(directThreadsWithUserId),
  ]);

  const updateUserOnlineByMQTTEvent = (userId: string) => {
    setOnlineTimePartners(prev => {
      const next = cloneDeep(prev);
      const result = next.find(item => item.userId === userId);
      if (result) {
        result.lastOnlineTime = new Date().getTime() / 1000;
        return next;
      } else {
        return prev;
      }
    });
  };

  React.useEffect(() => {
    const callback = (userId: string) => {
      updateUserOnlineByMQTTEvent(userId);
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.USER_TYPING,
      callback,
    );

    return () => listener.unsubscribe();
  }, []);

  React.useEffect(() => {
    const callback = (userId: string) => {
      updateUserOnlineByMQTTEvent(userId);
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.USER_SEEN,
      callback,
    );

    return () => listener.unsubscribe();
  }, []);

  React.useEffect(() => {
    const callback = (userId: string) => {
      updateUserOnlineByMQTTEvent(userId);
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.USER_REACT,
      callback,
    );

    return () => listener.unsubscribe();
  }, []);

  React.useEffect(() => {
    const callback = (userId: string) => {
      updateUserOnlineByMQTTEvent(userId);
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.USER_UNREACT,
      callback,
    );

    return () => listener.unsubscribe();
  }, []);

  React.useEffect(() => {
    const callback = (userId: string) => {
      updateUserOnlineByMQTTEvent(userId);
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.USER_VOTE,
      callback,
    );

    return () => listener.unsubscribe();
  }, []);

  React.useEffect(() => {
    const callback = (userId: string) => {
      updateUserOnlineByMQTTEvent(userId);
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.USER_UNVOTE,
      callback,
    );

    return () => listener.unsubscribe();
  }, []);

  React.useEffect(() => {
    const callback = (userId: string) => {
      updateUserOnlineByMQTTEvent(userId);
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.USER_ADD_OPTION_VOTE,
      callback,
    );

    return () => listener.unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!chatApiClient || !isMqttConnected) {
      return;
    }
    const ping = async () => {
      try {
        await chatApiClient.userApi.ping();
      } catch (error) {
        psLogger.error('PSApiClientProvider: ping => ', error);
      }
    };
    ping();
    const intervalId = setInterval(() => {
      ping();
    }, 60 * 1000); // 60s
    return () => {
      clearInterval(intervalId);
    };
  }, [chatApiClient, isMqttConnected]);

  const contextValue = React.useMemo(() => {
    return {
      onlineTimePartners: onlineTimePartners,
    } as PSLastOnlineTimeContextValue;
  }, [onlineTimePartners]);

  return (
    <PSLastOnlineTimeContext.Provider value={contextValue}>
      {children}
    </PSLastOnlineTimeContext.Provider>
  );
};

export const usePSLastOnlineTimeContext = () =>
  React.useContext(PSLastOnlineTimeContext);
