import {PSUserType} from '@communi/chat-api-client-typescript';
import React, {PropsWithChildren} from 'react';
import {
  usePSChatApiClientContext,
  usePSTranslationContext,
  useQuery,
  useRealm,
} from '../../../context';
import {PSThreadEntity, PSThreadScreenContextEntity} from '../../../types';
import {psLogger} from '../../../utils';
import {PSFlashMessage} from '../../flash-message';

const PSMessageIsSubthreadContext = React.createContext<boolean | undefined>(
  undefined,
);

const PSMessageCurrentThreadContext = React.createContext<
  PSThreadEntity | undefined
>(undefined);

const PSMessageCurrentThreadIdContext = React.createContext<string | undefined>(
  undefined,
);

const PSMessageCurrentThreadPartnerIdContext = React.createContext<
  string | undefined
>(undefined);

const PSMessageCurrentThreadUnreadMetionedMessagesContext = React.createContext<
  number[]
>([]);

const PSMessageCurrentThreadUnreadCountContext = React.createContext<number>(0);

type PSMessagePublicThreadContextValue = {
  isJoining: boolean;
  join: (id: string) => Promise<void> | undefined;
};

const PSMessagePublicThreadContext =
  React.createContext<PSMessagePublicThreadContextValue>(
    {} as PSMessagePublicThreadContextValue,
  );

const PSMessageIsNotMemberOfPublicThreadContext =
  React.createContext<boolean>(false);

const PSMessageGetStartedChatBotContext = React.createContext<boolean>(false);

const PSMessageAgainStartedChatBotContext = React.createContext<boolean>(false);

export const PSMessageCurrentThreadProvider = ({
  targetThreadId,
  targetUserId,
  screenContext,
  startCommand,
  children,
}: PropsWithChildren<{
  targetThreadId?: string;
  targetUserId?: string;
  screenContext?: string;
  startCommand?: string;
}>) => {
  const chatApiClient = usePSChatApiClientContext();

  const {translator} = usePSTranslationContext();

  const realm = useRealm();

  const [isJoining, setJoining] = React.useState(false);

  const threadQuery = useQuery(PSThreadEntity);

  const currentThread = React.useMemo(() => {
    try {
      if (!targetThreadId && !targetUserId) {
        return undefined;
      }
      let query: string;
      if (targetThreadId) {
        query = PSThreadEntity.filteredById(targetThreadId);
      } else if (targetUserId) {
        query = PSThreadEntity.filteredByPartnerId(targetUserId);
      } else {
        return undefined;
      }
      return threadQuery.filtered(query)[0];
    } catch (error) {
      psLogger.error('PSMessagesCurrentThreadProvider: currentThread', error);
      return undefined;
    }
  }, [threadQuery, targetThreadId, targetUserId]);

  const isSubThread = React.useMemo(() => {
    return !!(
      currentThread?.parentId &&
      currentThread?.parentId !== '0' &&
      currentThread?.originalMessageId !== 0
    );
  }, [currentThread?.parentId, currentThread?.originalMessageId]);

  const currentThreadId = React.useMemo(() => {
    return currentThread?.id;
  }, [currentThread?.id]);

  const currentThreadPartnerId = React.useMemo(() => {
    return currentThread?.partner?.extUserId;
  }, [currentThread?.partner?.extUserId]);

  const unreadMentionedMessages = React.useMemo(() => {
    if (currentThread) {
      return [...currentThread.mentionedMessageIds];
    }
    return [];
  }, [currentThread]);

  const unreadCount = React.useMemo(() => {
    if (currentThread?.isPublic() && currentThread?.isJoined !== true) {
      return 0;
    }
    return currentThread?.getUnreadCount() ?? 0;
  }, [currentThread]);

  const joinPublicThread = React.useCallback(
    async (id: string) => {
      if (!chatApiClient) {
        return;
      }

      try {
        setJoining(true);
        await chatApiClient.threadApi.joinGroupPublic(id);
        const thread = PSThreadEntity.getFirstById(realm, id);
        realm.write(() => {
          if (thread) {
            thread.updateIsJoined(true);
          }
        });
      } catch (e) {
        psLogger.error(
          'PSMessageCurrentThreadProvider: joinGroupPublic => ',
          e,
        );
        setJoining(false);
        PSFlashMessage.show({
          type: 'error',
          position: 'bottom',
          text1: `${translator('ps_error_join_group')}`,
        });
      }
    },
    [chatApiClient, realm, translator],
  );

  const joinPublicThreadContextValue = React.useMemo(() => {
    return {
      isJoining: isJoining,
      join: joinPublicThread,
    } as PSMessagePublicThreadContextValue;
  }, [isJoining, joinPublicThread]);

  const isNotMemberOfPublicThread = React.useMemo(() => {
    return (
      currentThread?.isPublic() === true && currentThread?.isJoined !== true
    );
  }, [currentThread?.groupLevel, currentThread?.isJoined]);

  const isGetStartedChatBotContextValue = React.useMemo(() => {
    if (startCommand) {
      return false;
    }
    const partnerType = currentThread?.partner?.type;
    if (!partnerType) {
      return false;
    }
    const createdAt = currentThread?.lastMessage?.createdAt;
    return partnerType === PSUserType.BOT && !createdAt;
  }, [currentThread?.partner?.type, currentThread?.lastMessage?.createdAt]);

  const isAgainStartedChatBotContextValue = React.useMemo(() => {
    if (startCommand) {
      return false;
    }
    const partnerType = currentThread?.partner?.type;
    if (!partnerType) {
      return false;
    }
    const createdAt = currentThread?.lastMessage?.createdAt;
    const now = new Date().getTime();
    return (
      partnerType === PSUserType.BOT &&
      createdAt !== undefined &&
      now - createdAt >= 30 * 60 * 1000
    ); // 30 phút
  }, [currentThread?.partner?.type, currentThread?.lastMessage?.createdAt]);

  React.useEffect(() => {
    const saveContext = async (threadId: string, context: string) => {
      if (chatApiClient) {
        try {
          await chatApiClient.threadApi.saveContext(threadId, context);
          realm.write(() => {
            PSThreadScreenContextEntity.createOrUpdate(realm, {
              threadId: threadId,
              screenContext: context,
            } as PSThreadScreenContextEntity);
          });
        } catch (e) {
          psLogger.error('PSMessageCurrentThreadProvider: saveContext => ', e);
        }
      }
    };
    const threadId = currentThread?.id;
    if (screenContext && threadId) {
      saveContext(threadId, screenContext);
    }
  }, [chatApiClient, realm, screenContext, currentThread?.id]);

  return (
    <PSMessageCurrentThreadContext.Provider value={currentThread}>
      <PSMessageCurrentThreadIdContext.Provider value={currentThreadId}>
        <PSMessageCurrentThreadPartnerIdContext.Provider
          value={currentThreadPartnerId}>
          <PSMessageCurrentThreadUnreadMetionedMessagesContext.Provider
            value={unreadMentionedMessages}>
            <PSMessageCurrentThreadUnreadCountContext.Provider
              value={unreadCount}>
              <PSMessagePublicThreadContext.Provider
                value={joinPublicThreadContextValue}>
                <PSMessageIsNotMemberOfPublicThreadContext.Provider
                  value={isNotMemberOfPublicThread}>
                  <PSMessageGetStartedChatBotContext.Provider
                    value={isGetStartedChatBotContextValue}>
                    <PSMessageAgainStartedChatBotContext.Provider
                      value={isAgainStartedChatBotContextValue}>
                      <PSMessageIsSubthreadContext.Provider value={isSubThread}>
                        {children}
                      </PSMessageIsSubthreadContext.Provider>
                    </PSMessageAgainStartedChatBotContext.Provider>
                  </PSMessageGetStartedChatBotContext.Provider>
                </PSMessageIsNotMemberOfPublicThreadContext.Provider>
              </PSMessagePublicThreadContext.Provider>
            </PSMessageCurrentThreadUnreadCountContext.Provider>
          </PSMessageCurrentThreadUnreadMetionedMessagesContext.Provider>
        </PSMessageCurrentThreadPartnerIdContext.Provider>
      </PSMessageCurrentThreadIdContext.Provider>
    </PSMessageCurrentThreadContext.Provider>
  );
};

export const usePSMessageCurrentThreadContext = () =>
  React.useContext(PSMessageCurrentThreadContext);

export const usePSMessageIsSubthreadContext = () =>
  React.useContext(PSMessageIsSubthreadContext);

export const usePSMessageCurrentThreadIdContext = () =>
  React.useContext(PSMessageCurrentThreadIdContext);

export const usePSMessageCurrentThreadPartnerIdContext = () =>
  React.useContext(PSMessageCurrentThreadPartnerIdContext);

export const usePSMessageCurrentThreadUnreadMetionedMessagesContext = () =>
  React.useContext(PSMessageCurrentThreadUnreadMetionedMessagesContext);

export const usePSMessageCurrentThreadUnreadCountContext = () =>
  React.useContext(PSMessageCurrentThreadUnreadCountContext);

export const usePSMessagePublicThreadContext = () =>
  React.useContext(PSMessagePublicThreadContext);

export const usePSMessageIsNotMemberOfPublicThreadContext = () =>
  React.useContext(PSMessageIsNotMemberOfPublicThreadContext);

export const usePSMessageGetStartedChatBotContext = () =>
  React.useContext(PSMessageGetStartedChatBotContext);

export const usePSMessageAgainStartedChatBotContext = () =>
  React.useContext(PSMessageAgainStartedChatBotContext);
