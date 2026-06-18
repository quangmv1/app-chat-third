import React, {PropsWithChildren} from 'react';
import {
  PSMessageEntity,
  PSMessageModel,
  mapMessageEntityToModel,
} from '../../../types';
import {
  usePSMessageModeContext,
  usePSMessageSetModeContext,
} from './PSMessageModeContext';
import {usePSMessageCurrentThreadIdContext} from './PSMessageCurrentThreadContext';
import {psLogger} from '../../../utils';
import {usePSChatApiClientContext, useRealm} from '../../../context';

const PSEditMessageContext = React.createContext<PSMessageModel | undefined>(
  undefined,
);

const PSEditMessageSetIdContext = React.createContext<
  (messageId: number | undefined) => void
>(() => undefined);

export const PSEditMessageProvider = ({children}: PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const messageMode = usePSMessageModeContext();

  const setMessageMode = usePSMessageSetModeContext();

  const [messageIdToEdit, setMessageIdToEdit] = React.useState<
    number | undefined
  >();

  const messageToEdit = React.useMemo(() => {
    try {
      if (
        !chatApiClient ||
        !currentThreadId ||
        !messageIdToEdit ||
        messageMode !== 'edit'
      ) {
        return undefined;
      }
      const cachedMessage =
        PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
          realm,
          currentThreadId,
          messageIdToEdit,
        );
      if (cachedMessage) {
        return mapMessageEntityToModel(chatApiClient.userId, cachedMessage);
      } else {
        return undefined;
      }
    } catch (e) {
      psLogger.error('PSEditMessageProvider: messageToEdit', e);
      return undefined;
    }
  }, [chatApiClient, realm, currentThreadId, messageIdToEdit, messageMode]);

  const editMessage = React.useCallback(
    (id: number | undefined) => {
      if (messageMode === 'normal' && id) {
        setMessageMode('edit');
        setMessageIdToEdit(id);
      } else if (messageMode === 'edit') {
        setMessageMode(id ? 'edit' : 'normal');
        setMessageIdToEdit(id);
      }
    },
    [messageMode],
  );

  return (
    <PSEditMessageContext.Provider value={messageToEdit}>
      <PSEditMessageSetIdContext.Provider value={editMessage}>
        {children}
      </PSEditMessageSetIdContext.Provider>
    </PSEditMessageContext.Provider>
  );
};

export const usePSEditMessageContext = () =>
  React.useContext(PSEditMessageContext);

export const usePSEditMessageSetIdContext = () =>
  React.useContext(PSEditMessageSetIdContext);
