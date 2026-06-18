import React, {PropsWithChildren} from 'react';
import {
  usePSChatApiClientContext,
  usePSMqttClientConnectedContext,
  usePSTranslationContext,
  useQuery,
  useRealm,
} from '../../../context';
import {
  PSDeviceEntity,
  PSMessageEntity,
  PSMessageModel,
  PSPinnedMessagesEntity,
  PSThreadEntity,
  PSUserEntity,
  mapMessageEntityToModel,
} from '../../../types';
import {
  DONT_HAVE_PERMISSION_CALL_API,
  DONT_HAVE_PERMISSION_PIN_MESSAGE,
  DONT_HAVE_PERMISSION_UNPIN_MESSAGE,
  PSBusEvent,
  PSEventBus,
  psLogger,
} from '../../../utils';
import {usePSMessageCurrentThreadIdContext} from './PSMessageCurrentThreadContext';
import {
  PSMessageActionNoteType,
  PSMessageDto,
  PSResponseError,
} from '@communi/chat-api-client-typescript';
import {PSFlashMessage} from '../../flash-message';

type PSPinMessageActionContextValue = {
  pinMessage: (messageId: number) => void;
  unpinMessage: (messageId: number) => void;
};

const PSPinMessageActionContext = React.createContext(
  {} as PSPinMessageActionContextValue,
);

type PSPinnedMessagesContextValue = {
  pinnedMessages?: PSMessageModel[];
  currentPinnedMessage?: PSMessageModel;
  scrollToPinnedMessage: () => number | undefined;
};

const PSPinnedMessagesContext = React.createContext(
  {} as PSPinnedMessagesContextValue,
);

const PSCurrentThreadHasPinnedMessagesContext =
  React.createContext<boolean>(false);

export const PSPinnedMessagesProvider = ({children}: PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const {translator} = usePSTranslationContext();

  const isMqttConnected = usePSMqttClientConnectedContext();

  const realm = useRealm();

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const pinnedMessagesByThreadId = useQuery(
    PSPinnedMessagesEntity,
    results => {
      return results
        .filtered(
          PSPinnedMessagesEntity.filteredByThreadId(
            currentThreadId ?? PSThreadEntity.THREAD_ID_NOT_FOUND,
          ),
        )
        .sorted(PSPinnedMessagesEntity.sortedByPinnedAt);
    },
    [currentThreadId],
  );

  const [currentPinnedMessageIndex, setCurrentPinnedMessageIndex] =
    React.useState<number | undefined>();

  const currentPinnedMessage = React.useMemo(() => {
    if (pinnedMessagesByThreadId && pinnedMessagesByThreadId.length) {
      if (currentPinnedMessageIndex !== undefined) {
        return (
          pinnedMessagesByThreadId[currentPinnedMessageIndex + 1] ??
          pinnedMessagesByThreadId[0]
        );
      } else {
        return pinnedMessagesByThreadId[0];
      }
    } else {
      return undefined;
    }
  }, [pinnedMessagesByThreadId, currentPinnedMessageIndex]);

  const fetchPinnedMessages = React.useCallback(async () => {
    if (!chatApiClient || !currentThreadId) {
      return;
    }
    let remotePinnedMessages: PSMessageDto[] | undefined;

    try {
      const response =
        await chatApiClient.messageApi.fetchPinnedMessages(currentThreadId);
      remotePinnedMessages = response.data;
    } catch (e) {
      if (
        e &&
        e instanceof PSResponseError &&
        e.http_code === 403 &&
        e.response?.data?.message_code === DONT_HAVE_PERMISSION_CALL_API
      ) {
        PSEventBus.getInstance().dispatch(
          PSBusEvent.LEAVE_THREAD,
          currentThreadId,
        );
      }
      psLogger.error('PSPinMessageProvider: fetch ', e);
    }

    try {
      const localPinnedMessages = PSPinnedMessagesEntity.getByThreadId(
        realm,
        currentThreadId,
      );

      if (!remotePinnedMessages) {
        realm.write(() => {
          // xoá tất cả pinned messages ở local
          realm.delete(localPinnedMessages);
        });
        return;
      }

      const remoteMessageIds = remotePinnedMessages.map(item => item.id);
      const needDelete = localPinnedMessages.filter(
        item => !remoteMessageIds.includes(item.message.id),
      );

      const deviceId = PSDeviceEntity.get(realm);
      realm.write(() => {
        if (remotePinnedMessages!.length) {
          // xoá các pinned message ở local mà không có ở remote
          if (needDelete.length) {
            realm.delete(needDelete);
          }
          // createOrUpdate pinned message
          remotePinnedMessages!
            .filter(item => item.pinned_at)
            .forEach(item =>
              PSPinnedMessagesEntity.createOrUpdate(
                realm,
                PSMessageEntity.mapFromDto(
                  deviceId,
                  chatApiClient.userId,
                  currentThreadId,
                  item,
                )!,
                item.pinned_at!,
              ),
            );
        } else {
          // xoá tất cả pinned messages ở local
          realm.delete(localPinnedMessages);
        }
      });
    } catch (error) {
      psLogger.error('PSPinMessageProvider: delete all', error);
    }
  }, [chatApiClient, realm, currentThreadId]);

  const pinMessage = React.useCallback(
    async (messageId: number) => {
      try {
        if (!chatApiClient || !currentThreadId) {
          return;
        }

        const deviceId = PSDeviceEntity.get(realm);

        const requestId = PSMessageEntity.createRequestId(deviceId);

        await chatApiClient.messageApi.pinMessage(
          currentThreadId,
          messageId,
          requestId,
        );

        const thread = PSThreadEntity.getFirstById(realm, currentThreadId);

        if (!thread) {
          return;
        }

        const message =
          PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
            realm,
            currentThreadId,
            messageId,
          );

        if (!message) {
          return;
        }

        const me = PSUserEntity.getFirstByExtUserId(
          realm,
          chatApiClient.userId,
        );

        if (!me) {
          return;
        }

        const result = realm.write(() => {
          const tempNextMessageId = thread.lastMessage
            ? thread.lastMessage.id
            : PSMessageEntity.FIRST_MESSAGE_ID;
          const newMessage = PSMessageEntity.createOrUpdate(realm, {
            primaryKey: PSMessageEntity.generatePrimaryKey(
              deviceId,
              chatApiClient.userId,
              currentThreadId,
              tempNextMessageId,
              chatApiClient.userId,
              requestId,
            ),
            id: tempNextMessageId,
            requestId: requestId,
            threadId: currentThreadId,
            sender: me,
            body: {
              pinOrUnpinMessage: message,
              actionNote: {
                type: PSMessageActionNoteType.PIN,
              },
            },
            createdAt: new Date().getTime(),
            status: 'sending', // đợi mqtt về để update message.id
          } as unknown as PSMessageEntity);

          PSPinnedMessagesEntity.pinMessage(realm, newMessage);

          PSEventBus.getInstance().dispatch(PSBusEvent.NEW_MESSAGE, newMessage);
          return newMessage;
        });

        // trick tách 2 transaction để listener lần lượt đc update
        realm.write(() => {
          thread.updateLastMessage(result);
        });
      } catch (e) {
        if (e && e instanceof PSResponseError && e.http_code === 403) {
          if (
            e.response?.data?.message_code === DONT_HAVE_PERMISSION_CALL_API
          ) {
            PSEventBus.getInstance().dispatch(
              PSBusEvent.LEAVE_THREAD,
              currentThreadId,
            );
          } else if (
            e.response?.data?.message_code === DONT_HAVE_PERMISSION_PIN_MESSAGE
          ) {
            PSFlashMessage.show({
              type: 'error',
              position: 'bottom',
              text1: `${translator('ps_error_permission_pin_message')}`,
            });
          } else {
            PSFlashMessage.show({
              type: 'error',
              position: 'bottom',
              text1: `${translator('ps_error_pin_message')}`,
            });
          }
        } else {
          PSFlashMessage.show({
            type: 'error',
            position: 'bottom',
            text1: `${translator('ps_error_pin_message')}`,
          });
        }
        psLogger.error('PSPinnedMessagesProvider: pinMessage', e);
      }
    },
    [chatApiClient, currentThreadId, realm, translator],
  );

  const unpinMessage = React.useCallback(
    async (messageId: number) => {
      try {
        if (!chatApiClient || !currentThreadId) {
          return;
        }

        const deviceId = PSDeviceEntity.get(realm);

        const requestId = PSMessageEntity.createRequestId(deviceId);

        await chatApiClient.messageApi.unpinMessage(
          currentThreadId,
          messageId,
          requestId,
        );

        const thread = PSThreadEntity.getFirstById(realm, currentThreadId);

        if (!thread) {
          return;
        }

        const message =
          PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
            realm,
            currentThreadId,
            messageId,
          );

        if (!message) {
          return;
        }

        const me = PSUserEntity.getFirstByExtUserId(
          realm,
          chatApiClient.userId,
        );

        if (!me) {
          return;
        }

        const result = realm.write(() => {
          const tempNextMessageId = thread.lastMessage
            ? thread.lastMessage.id
            : PSMessageEntity.FIRST_MESSAGE_ID;
          const newMessage = PSMessageEntity.createOrUpdate(realm, {
            primaryKey: PSMessageEntity.generatePrimaryKey(
              deviceId,
              chatApiClient.userId,
              currentThreadId,
              tempNextMessageId,
              chatApiClient.userId,
              requestId,
            ),
            id: tempNextMessageId,
            requestId: requestId,
            threadId: currentThreadId,
            sender: me,
            body: {
              pinOrUnpinMessage: message,
              actionNote: {
                type: PSMessageActionNoteType.UNPIN,
              },
            },
            createdAt: new Date().getTime(),
            status: 'sending', // đợi mqtt về để update message.id
          } as unknown as PSMessageEntity);

          PSPinnedMessagesEntity.unpinMessage(realm, newMessage);

          PSEventBus.getInstance().dispatch(PSBusEvent.NEW_MESSAGE, newMessage);

          return newMessage;
        });

        // trick tách 2 transaction để listener lần lượt đc update
        realm.write(() => {
          thread.updateLastMessage(result);
        });
      } catch (e) {
        if (e && e instanceof PSResponseError && e.http_code === 403) {
          if (
            e.response?.data?.message_code === DONT_HAVE_PERMISSION_CALL_API
          ) {
            PSEventBus.getInstance().dispatch(
              PSBusEvent.LEAVE_THREAD,
              currentThreadId,
            );
          } else if (
            e.response?.data?.message_code ===
            DONT_HAVE_PERMISSION_UNPIN_MESSAGE
          ) {
            PSFlashMessage.show({
              type: 'error',
              position: 'bottom',
              text1: `${translator('ps_error_permission_unpin_message')}`,
            });
          } else {
            PSFlashMessage.show({
              type: 'error',
              position: 'bottom',
              text1: `${translator('ps_error_unpin_message')}`,
            });
          }
        } else {
          PSFlashMessage.show({
            type: 'error',
            position: 'bottom',
            text1: `${translator('ps_error_unpin_message')}`,
          });
        }
        psLogger.error('PSPinnedMessagesProvider: unpinMessagee', e);
      }
    },
    [chatApiClient, currentThreadId, realm, translator],
  );

  const scrollToPinnedMessage = React.useCallback(() => {
    if (!pinnedMessagesByThreadId || !pinnedMessagesByThreadId.length) {
      return;
    }

    const newIndex =
      currentPinnedMessageIndex === undefined
        ? 0
        : currentPinnedMessageIndex < pinnedMessagesByThreadId.length - 1
          ? currentPinnedMessageIndex + 1
          : 0;

    setCurrentPinnedMessageIndex(newIndex);
    return pinnedMessagesByThreadId[newIndex]?.message?.id;
  }, [currentPinnedMessageIndex, pinnedMessagesByThreadId]);

  React.useEffect(() => {
    if (isMqttConnected && currentThreadId) {
      fetchPinnedMessages();
    }
  }, [isMqttConnected, currentThreadId]);

  React.useEffect(() => {
    const callback = () => {
      setCurrentPinnedMessageIndex(prev => (prev === undefined ? prev : 0));
    };
    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.NEW_PIN_MESSAGE,
      callback,
    );

    return () => listener.unsubscribe();
  }, []);

  React.useEffect(() => {
    const callback = () => {
      setCurrentPinnedMessageIndex(prev =>
        prev !== undefined ? Math.max(prev - 1, 0) : prev,
      );
    };
    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.NEW_UNPIN_MESSAGE,
      callback,
    );

    return () => listener.unsubscribe();
  }, []);

  const pinActionContextValue = React.useMemo<PSPinMessageActionContextValue>(
    () => ({pinMessage: pinMessage, unpinMessage: unpinMessage}),
    [pinMessage, unpinMessage],
  );

  const pinnedContextValue = React.useMemo<PSPinnedMessagesContextValue>(() => {
    return {
      pinnedMessages:
        chatApiClient && pinnedMessagesByThreadId
          ? pinnedMessagesByThreadId.map(item =>
              mapMessageEntityToModel(chatApiClient.userId, item.message),
            )
          : undefined,
      currentPinnedMessage:
        chatApiClient && currentPinnedMessage
          ? mapMessageEntityToModel(
              chatApiClient.userId,
              currentPinnedMessage.message,
            )
          : undefined,
      scrollToPinnedMessage: scrollToPinnedMessage,
    } as PSPinnedMessagesContextValue;
  }, [
    chatApiClient,
    pinnedMessagesByThreadId,
    currentPinnedMessage,
    scrollToPinnedMessage,
  ]);

  const hasPinnedMessagesContextValue = React.useMemo<boolean>(() => {
    return pinnedMessagesByThreadId && pinnedMessagesByThreadId.length > 0;
  }, [pinnedMessagesByThreadId]);

  return (
    <PSPinMessageActionContext.Provider value={pinActionContextValue}>
      <PSPinnedMessagesContext.Provider value={pinnedContextValue}>
        <PSCurrentThreadHasPinnedMessagesContext.Provider
          value={hasPinnedMessagesContextValue}>
          {children}
        </PSCurrentThreadHasPinnedMessagesContext.Provider>
      </PSPinnedMessagesContext.Provider>
    </PSPinMessageActionContext.Provider>
  );
};

export const usePSPinMessageActionContext = () =>
  React.useContext(PSPinMessageActionContext);

export const usePSPinnedMessagesContext = () =>
  React.useContext(PSPinnedMessagesContext);

export const usePSCurrentThreadHasPinnedMessagesContext = () =>
  React.useContext(PSCurrentThreadHasPinnedMessagesContext);
