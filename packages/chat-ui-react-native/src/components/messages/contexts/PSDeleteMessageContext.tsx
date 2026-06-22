import React, {PropsWithChildren} from 'react';
import {usePSChatApiClientContext, useRealm} from '../../../context';
import {
  DONT_HAVE_PERMISSION_CALL_API,
  PSBusEvent,
  PSEventBus,
  psLogger,
} from '../../../utils';
import {
  PSDeleteMessageLevel,
  PSResponseError,
} from '@communi/chat-api-client-typescript';
import {PSMessageEntity, PSThreadEntity} from '../../../types';

const PSDeleteMessageContext = React.createContext<
  (
    threadId: string,
    messagePrimaryKey: string,
    level: PSDeleteMessageLevel,
  ) => void
>(() => undefined);

export const PSDeleteMessageProvider = ({children}: PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const deleteMessage = React.useCallback(
    async (
      threadId: string,
      messagePrimaryKey: string,
      level: PSDeleteMessageLevel,
    ) => {
      if (!chatApiClient) {
        return;
      }

      // nếu message có status === 'sent' thì xoá cache và call api delete
      // còn không thì chỉ cần xoá cache
      const message = PSMessageEntity.getFirstByThreadIdAndPrimaryKey(
        realm,
        threadId,
        messagePrimaryKey,
      );

      if (message) {
        if (message.status === 'sent') {
          try {
            await chatApiClient.messageApi.deleteMessage(
              threadId,
              message.id,
              level,
            );
            const thread = PSThreadEntity.getFirstById(realm, threadId);
            realm.write(() => {
              message.deleteLevel = level;
              message.body = undefined;
              if (thread) {
                thread.handleDeleteMessage(message);
              }
            });
          } catch (e) {
            if (
              e &&
              e instanceof PSResponseError &&
              e.http_code === 403 &&
              e.response?.data?.message_code === DONT_HAVE_PERMISSION_CALL_API
            ) {
              PSEventBus.getInstance().dispatch(
                PSBusEvent.LEAVE_THREAD,
                threadId,
              );
            }
            psLogger.error('PSDeleteMessageProvider: deleteMessage => ', e);
          }
        } else {
          psLogger.error('PSDeleteMessageProvider: hard delete');
          try {
            const thread = PSThreadEntity.getFirstById(realm, threadId);

            let lastMessageAfterDelete: PSMessageEntity | undefined;

            // nếu message bị delete là last message của thread thì update lại last message
            if (thread && thread.lastMessage?.id === message.id) {
              const messages = PSMessageEntity.getByThreadId(realm, threadId);

              lastMessageAfterDelete = messages[messages.length - 2];
            }

            realm.write(() => {
              realm.delete(message);

              if (thread && lastMessageAfterDelete) {
                thread.updateLastMessage(lastMessageAfterDelete);
              }
            });
          } catch (e) {
            psLogger.error(
              'PSDeleteMessageProvider: deleteMessage hard delete => ',
              e,
            );
          }
        }
      }
    },
    [chatApiClient, realm],
  );

  return (
    <PSDeleteMessageContext.Provider value={deleteMessage}>
      {children}
    </PSDeleteMessageContext.Provider>
  );
};

export const usePSDeleteMessageContext = () =>
  React.useContext(PSDeleteMessageContext);
