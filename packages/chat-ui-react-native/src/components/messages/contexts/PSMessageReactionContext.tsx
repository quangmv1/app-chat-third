import React, {PropsWithChildren} from 'react';
import {
  DONT_HAVE_PERMISSION_CALL_API,
  PSBusEvent,
  PSEventBus,
  getEmojiByEmojiCode,
  psLogger,
} from '../../../utils';
import {usePSChatApiClientContext, useRealm} from '../../../context';
import {PSMessageEntity} from '../../../types';
import {usePSMessageCurrentThreadIdContext} from './PSMessageCurrentThreadContext';
import {PSResponseError} from '@communi/chat-api-client-typescript';

type PSMessageReactionContextValue = {
  isOpenned: boolean;
  openEmojiPicker: (messageId: number) => void;
  closeEmojiPicker: () => void;
  onEmojiSelected: (emojiName: String, emoji: string) => Promise<void>;
  onEmojiUnselected: (messageId: number, emojiName: string) => Promise<void>;
  fastReactMessage: (messageId: number, emojiName: string) => Promise<void>;
};

const PSMessageReactionContext =
  React.createContext<PSMessageReactionContextValue>(
    {} as PSMessageReactionContextValue,
  );

export const PSMessageReactionProvider = ({children}: PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const [isOpenned, setIsOpen] = React.useState<boolean>(false);

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const messageIdRef = React.useRef<number | undefined>();

  const openEmojiPicker = React.useCallback((messageId: number) => {
    messageIdRef.current = messageId;
    setIsOpen(true);
  }, []);

  const closeEmojiPicker = React.useCallback(() => {
    messageIdRef.current = undefined;
    setIsOpen(false);
  }, []);

  const onEmojiSelected = React.useCallback(
    async (emojiName: string, emoji: string) => {
      const messageId = messageIdRef.current;
      if (chatApiClient && currentThreadId && messageId) {
        try {
          const message =
            PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
              realm,
              currentThreadId,
              messageId,
            );
          if (!message) {
            return;
          }
          const existed = message.reactions.find(
            e =>
              e.emoji === emoji &&
              e.userIds.includes(chatApiClient.userId),
          );
          if (existed) {
            return;
          }
          await chatApiClient.messageApi.react(
            currentThreadId,
            messageId,
            emoji,
          );
          realm.write(() => {
            message.react(chatApiClient.userId, emoji, emoji);
          });
        } catch (error) {
          if (
            error &&
            error instanceof PSResponseError &&
            error.http_code === 403 &&
            error.response?.data?.message_code === DONT_HAVE_PERMISSION_CALL_API
          ) {
            PSEventBus.getInstance().dispatch(
              PSBusEvent.LEAVE_THREAD,
              currentThreadId,
            );
          }
          psLogger.error(
            `PSMessageReactionProvider.react: threadId = ${currentThreadId}, messageId = ${messageId}`,
            error,
          );
        }
      }
    },
    [chatApiClient, realm, currentThreadId],
  );

  const onEmojiUnselected = React.useCallback(
    async (messageId: number, emojiName: string) => {
      if (chatApiClient && currentThreadId) {
        try {
          const message =
            PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
              realm,
              currentThreadId,
              messageId,
            );
          if (!message) {
            return;
          }
          const lowerCaseName = emojiName;
          const existed = message.reactions.find(
            e =>
              e.name === lowerCaseName &&
              e.userIds.includes(chatApiClient.userId),
          );
          if (!existed) {
            return;
          }
          await chatApiClient.messageApi.unreact(
            currentThreadId,
            messageId,
            lowerCaseName,
          );
          realm.write(() => {
            message.unreact(chatApiClient.userId, lowerCaseName);
          });
        } catch (error) {
          if (
            error &&
            error instanceof PSResponseError &&
            error.http_code === 403 &&
            error.response?.data?.message_code === DONT_HAVE_PERMISSION_CALL_API
          ) {
            PSEventBus.getInstance().dispatch(
              PSBusEvent.LEAVE_THREAD,
              currentThreadId,
            );
          }
          psLogger.error(
            `PSMessageReactionProvider.unreact: threadId = ${currentThreadId}, messageId = ${messageId}`,
            error,
          );
        }
      }
    },
    [chatApiClient, realm, currentThreadId],
  );

  const fastReactMessage = React.useCallback(
    async (messageId: number, emojiName: string) => {
      messageIdRef.current = messageId;
      const emoji = getEmojiByEmojiCode(emojiName);
      if (emoji) {
        await onEmojiSelected(emoji.name, emoji.emoji);
      }
      messageIdRef.current = undefined;
    },
    [onEmojiSelected],
  );

  const contextValue = React.useMemo(
    () =>
      ({
        isOpenned: isOpenned,
        openEmojiPicker: openEmojiPicker,
        closeEmojiPicker: closeEmojiPicker,
        onEmojiSelected: onEmojiSelected,
        onEmojiUnselected: onEmojiUnselected,
        fastReactMessage: fastReactMessage,
      }) as PSMessageReactionContextValue,
    [
      isOpenned,
      openEmojiPicker,
      closeEmojiPicker,
      onEmojiSelected,
      onEmojiUnselected,
      fastReactMessage,
    ],
  );

  return (
    <PSMessageReactionContext.Provider value={contextValue}>
      {children}
    </PSMessageReactionContext.Provider>
  );
};

export const usePSMessageReaction = () =>
  React.useContext(PSMessageReactionContext);
