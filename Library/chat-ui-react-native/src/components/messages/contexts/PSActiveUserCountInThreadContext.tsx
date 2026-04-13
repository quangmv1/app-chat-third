import React, {PropsWithChildren} from 'react';
import {
  usePSChatApiClientContext,
  usePSScreenStylesContext,
} from '../../../context';
import {PSMessagesStyles} from '../PSMessagesStyles';
import {
  usePSMessageCurrentThreadContext,
  usePSMessageCurrentThreadIdContext,
  usePSMessageIsSubthreadContext,
} from './PSMessageCurrentThreadContext';
import {useIsMountedRef} from '../../../hooks';
import {psLogger} from '../../../utils';
import {PSThreadType} from '@communi/chat-api-client-typescript';

type PSActiveUserCountInThreadContextValue = {
  activeUserCount: number;
};

const PSActiveUserCountInThreadContext = React.createContext(
  {} as PSActiveUserCountInThreadContextValue,
);

const FETCH_ACTIVE_USERS_COUNT_IN_THREAD = 60 * 1000; // 60s

export const PSActiveUserCountInThreadProvider = ({
  children,
}: PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const isMounted = useIsMountedRef();

  const isSubThread = usePSMessageIsSubthreadContext();

  const isActiveUserCountVisible =
    usePSScreenStylesContext<PSMessagesStyles>().actionsBar
      ?.isActiveUserCountVisible === false
      ? false
      : true;

  const allowedActiveUserCountVisibleWithGroup =
    usePSScreenStylesContext<PSMessagesStyles>().actionsBar
      ?.allowedActiveUserCountVisibleWithGroup;

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const currentThread = usePSMessageCurrentThreadContext();

  const [activeUserCount, setActiveUserCount] = React.useState<number>(0);

  React.useEffect(() => {
    if (
      currentThread?.type === PSThreadType.GROUP &&
      !isSubThread &&
      isActiveUserCountVisible &&
      (allowedActiveUserCountVisibleWithGroup === undefined ||
        (currentThread?.groupLevel &&
          allowedActiveUserCountVisibleWithGroup.includes(
            currentThread.groupLevel,
          )))
    ) {
      if (!isActiveUserCountVisible || !chatApiClient || !currentThreadId) {
        return;
      }
      const fetchActiveUserCount = async () => {
        try {
          const response =
            await chatApiClient.threadApi.fetchActiveUserCount(currentThreadId);
          const data = response.data;
          if (isMounted.current && data) {
            setActiveUserCount(data);
          }
        } catch (error) {
          psLogger.error(
            'PSActiveUserCountInThreadProvider: fetchActiveUserCount => ',
            error,
          );
        }
      };
      fetchActiveUserCount();
      const intervalId = setInterval(() => {
        fetchActiveUserCount();
      }, FETCH_ACTIVE_USERS_COUNT_IN_THREAD);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [
    isActiveUserCountVisible,
    chatApiClient,
    currentThreadId,
    isMounted,
    currentThread?.type,
    currentThread?.partner?.type,
    isSubThread,
    allowedActiveUserCountVisibleWithGroup,
    currentThread?.groupLevel,
  ]);

  const contextValue = React.useMemo(() => {
    return {
      activeUserCount: activeUserCount,
    } as PSActiveUserCountInThreadContextValue;
  }, [activeUserCount]);

  return (
    <PSActiveUserCountInThreadContext.Provider value={contextValue}>
      {children}
    </PSActiveUserCountInThreadContext.Provider>
  );
};

export const usePSActiveUserCountInThreadContext = () =>
  React.useContext(PSActiveUserCountInThreadContext);
