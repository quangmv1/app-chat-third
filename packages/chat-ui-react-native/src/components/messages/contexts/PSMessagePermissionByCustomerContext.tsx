import React from 'react';
import {usePSMessageCurrentThreadContext} from './PSMessageCurrentThreadContext';
import {PSThreadType, PSUserType} from '@communi/chat-api-client-typescript';
import {usePSChatApiClientContext, useRealm} from '../../../context';
import {psLogger} from '../../../utils';
import {PSThreadPermissionByCustomerEntity} from '../../../types';

// type PSMessagePermissionByCustomerContextValue = {};

const PSMessagePermissionByCustomerContext = React.createContext<boolean>(true);

export const PSMessagePermissionByCustomerProvider = (
  props: React.PropsWithChildren,
) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const currentThread = usePSMessageCurrentThreadContext();

  const [canChat, setCanChat] = React.useState(true);

  const isFirstTimeRef = React.useRef(true);

  const fetchPermissionByCustomer = React.useCallback(
    async (userId: string) => {
      try {
        if (!chatApiClient) return;
        const dto =
          await chatApiClient.threadApi.fetchPermissionByCustomer(userId);
        isFirstTimeRef.current = false;
        if (!dto.data) return;
        realm.write(() => {
          PSThreadPermissionByCustomerEntity.createOrUpdate(realm, {
            threadId: currentThread?.id,
            canChat: dto.data?.can_chat,
          } as PSThreadPermissionByCustomerEntity);
        });
        setCanChat(dto.data.can_chat);
      } catch (error) {
        psLogger.error(
          `PSMessagePermissionByCustomerProvider: fetchPermissionByCustomer:`,
          error,
        );
      }
    },
    [chatApiClient, realm, currentThread?.id],
  );

  React.useEffect(() => {
    // if la 1-1 vs user va lan dau vao
    if (
      currentThread?.type === PSThreadType.DIRECT &&
      currentThread?.partner?.type === PSUserType.USER &&
      isFirstTimeRef.current
    ) {
      fetchPermissionByCustomer(currentThread?.partner?.extUserId);
    }
  }, [
    currentThread?.type,
    currentThread?.partner?.type,
    currentThread?.partner?.extUserId,
    fetchPermissionByCustomer,
  ]);

  React.useEffect(() => {
    if (!currentThread?.id) return;
    const canChat = PSThreadPermissionByCustomerEntity.getFirstById(
      realm,
      currentThread.id,
    )?.canChat;
    setCanChat(canChat ?? true);
  }, [realm, currentThread?.id]);

  return (
    <PSMessagePermissionByCustomerContext.Provider value={canChat}>
      {props.children}
    </PSMessagePermissionByCustomerContext.Provider>
  );
};

export const usePSMessagePermissionByCustomerContext = () =>
  React.useContext(PSMessagePermissionByCustomerContext);
