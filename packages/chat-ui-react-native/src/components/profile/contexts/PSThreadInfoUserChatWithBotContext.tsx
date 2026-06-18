import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {usePSChatApiClientContext, useRealm} from '../../../context';
import {useDeepCompareMemoize, useIsMountedRef} from '../../../hooks';
import {PSUserEntity} from '../../../types';
import {psLogger} from '../../../utils';
import {usePSMessageCurrentThreadContext} from '../../messages';
import {Alert} from 'react-native';

type ThreadInfoUserChatWithBotContextValue = {
  alias?: string;
  userId?: string;
  psUserId?: string;
};

export const ThreadInfoUserChatWithBotContext =
  React.createContext<ThreadInfoUserChatWithBotContextValue>(
    {} as ThreadInfoUserChatWithBotContextValue,
  );

export const ThreadInfoUserChatWithBotProvider = ({
  children,
}: PropsWithChildren) => {
  const currentThread = usePSMessageCurrentThreadContext();
  const [isFetchUserId, setIsFetchUserId] = useState<boolean>(false);

  const realm = useRealm();
  const chatApiClient = usePSChatApiClientContext();
  const isMounted = useIsMountedRef();

  const fetchUserByIds = useCallback(
    async (userIds: string[]) => {
      if (!userIds.length || !chatApiClient) {
        return;
      }

      try {
        const users = await chatApiClient.userApi.fetchUserByIds(userIds);
        if (users?.data?.length && users.data?.[0]) {
          realm.write(() => {
            PSUserEntity.createOrUpdate(
              realm,
              PSUserEntity.mapFromDto(users.data?.[0])!,
            );
          });
          setIsFetchUserId(true);
        }
      } catch (error) {
        psLogger.error(
          'ThreadInfoUserChatWithBotProvider: fetchUserByIds',
          error,
        );
        await new Promise(resolver =>
          setTimeout(() => {
            resolver('');
          }, 1000),
        );
        if (isMounted.current) {
          fetchUserByIds(userIds);
        }
      }
    },
    [chatApiClient, realm],
  );

  const userInfo: PSUserEntity = useMemo(() => {
    if (currentThread?.extUserIdChatWithBot)
      return (
        PSUserEntity.getFirstByExtUserId(
          realm,
          currentThread?.extUserIdChatWithBot,
        ) ?? ({} as PSUserEntity)
      );
    return {} as PSUserEntity;
  }, [currentThread?.extUserIdChatWithBot, isFetchUserId, realm]);

  useEffect(() => {
    if (!currentThread?.extUserIdChatWithBot) return;
    // thiếu data cần call api phía KH
    fetchUserByIds([currentThread?.extUserIdChatWithBot]);
  }, [fetchUserByIds, currentThread?.extUserIdChatWithBot]);

  const threadInfoUserContextValue = useMemo(() => {
    if (!currentThread?.extUserIdChatWithBot)
      return {
        psUserId: '',
        alias: '',
        userId: '',
      };

    return {
      psUserId: currentThread?.extUserIdChatWithBot,
      alias: userInfo?.alias,
      userId: userInfo?.userId,
    } as ThreadInfoUserChatWithBotContextValue;
  }, [currentThread?.extUserIdChatWithBot, userInfo?.alias, userInfo?.userId]);

  return (
    <ThreadInfoUserChatWithBotContext.Provider
      value={threadInfoUserContextValue}>
      {children}
    </ThreadInfoUserChatWithBotContext.Provider>
  );
};

export const useThreadInfoUserWithChatBotContext = () =>
  React.useContext(ThreadInfoUserChatWithBotContext);
