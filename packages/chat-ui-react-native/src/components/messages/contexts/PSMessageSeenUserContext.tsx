import React, {PropsWithChildren} from 'react';
import {
  usePSMessageCurrentThreadIdContext,
  usePSMessageIsNotMemberOfPublicThreadContext,
} from './PSMessageCurrentThreadContext';
import {usePSChatApiClientContext, useQuery, useRealm} from '../../../context';
import {
  PSMessageSeenUsersEntity,
  PSThreadEntity,
  PSUserModel,
  mapUserEntityToModel,
} from '../../../types';
import {psLogger} from '../../../utils';
import debounce from 'lodash/debounce';
import {useDeepCompareMemoize} from '../../../hooks';

type PSMessageSeenUserContextValue = {
  messageSeenUsers: Record<number, PSUserModel[]>;
  markSeen: (threadId: string, messageId: number) => void;
};

const PSMessageSeenUserContext =
  React.createContext<PSMessageSeenUserContextValue>(
    {} as PSMessageSeenUserContextValue,
  );

export const PSMessageSeenUserProvider = ({children}: PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const isNotMemberOfPublicThread =
    usePSMessageIsNotMemberOfPublicThreadContext();

  const messageSeenUsersByThreadId = useQuery(
    PSMessageSeenUsersEntity,
    results =>
      results.filtered(
        PSMessageSeenUsersEntity.filteredByThreadId(
          currentThreadId ?? PSThreadEntity.THREAD_ID_NOT_FOUND,
        ),
      ),
    [currentThreadId],
  );

  const messageSeenUsers = React.useMemo(() => {
    if (!chatApiClient || !messageSeenUsersByThreadId.length) {
      return [];
    } else {
      const getKey = (item: PSMessageSeenUsersEntity) => item.messageId;
      const getValue = (item: PSMessageSeenUsersEntity) =>
        mapUserEntityToModel(item.user)!;
      return [...messageSeenUsersByThreadId]
        .filter(item => item.user.extUserId !== chatApiClient.userId)
        .groupBy<PSMessageSeenUsersEntity, number, PSUserModel>(
          getKey,
          getValue,
        );
    }
  }, [chatApiClient, messageSeenUsersByThreadId]);

  const markSeen = React.useCallback(
    debounce(
      async (threadId: string, messageId: number) => {
        if (!chatApiClient || isNotMemberOfPublicThread) {
          return;
        }

        const messageSeenUser = PSMessageSeenUsersEntity.getFirstByPrimaryKey(
          realm,
          threadId,
          chatApiClient.userId,
        );

        if (!messageSeenUser || messageId > messageSeenUser.messageId) {
          try {
            const thread = PSThreadEntity.getFirstById(realm, threadId);

            if (thread) {
              realm.write(() => {
                thread.markSeen(messageId);
              });
            }

            if (thread && messageId >= thread.messageViewedCount) {
              await chatApiClient.messageApi.markSeenMessage(
                threadId,
                messageId,
              );
            }
          } catch (e) {
            psLogger.error('PSMessageMarkSeenProvider: markSeen', e);
          }
        }
      },
      500,
      {
        leading: false,
        trailing: true,
      },
    ),
    [chatApiClient, realm, isNotMemberOfPublicThread],
  );

  const contextValue = React.useMemo(() => {
    return {
      messageSeenUsers: messageSeenUsers,
      markSeen: markSeen,
    } as PSMessageSeenUserContextValue;
  }, [useDeepCompareMemoize(messageSeenUsers), markSeen]);

  return (
    <PSMessageSeenUserContext.Provider value={contextValue}>
      {children}
    </PSMessageSeenUserContext.Provider>
  );
};

export const usePSMessageSeenUserContext = () =>
  React.useContext(PSMessageSeenUserContext);
