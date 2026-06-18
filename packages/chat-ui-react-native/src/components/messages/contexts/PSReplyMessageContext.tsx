import React, {PropsWithChildren, useEffect} from 'react';
import {usePSChatApiClientContext, useRealm} from '../../../context';
import {
  PSMessageEntity,
  PSMessageModel,
  PSUserModel,
  mapMessageEntityToModel,
} from '../../../types';
import {psLogger} from '../../../utils';
import {usePSMessageCurrentThreadIdContext} from './PSMessageCurrentThreadContext';
import {
  usePSMessageModeContext,
  usePSMessageSetModeContext,
} from './PSMessageModeContext';

const PSReplyMessageContext = React.createContext<PSMessageModel | undefined>(
  undefined,
);

const PSReplyUserContext = React.createContext<
  | {
      userToReply?: PSUserModel;
      setUserToReply?: (userToReply?: PSUserModel | undefined) => void;
    }
  | undefined
>(undefined);

const PSReplyMessageSetIdContext = React.createContext<
  (messageId: number | undefined) => void
>(() => undefined);

export const PSReplyMessageProvider = ({children}: PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const messageMode = usePSMessageModeContext();

  const setMessageMode = usePSMessageSetModeContext();

  const [messageIdToReply, setMessageIdToReply] = React.useState<
    number | undefined
  >();

  const [userToReply, setUserToReply] = React.useState<PSUserModel>();

  const messageToReply = React.useMemo(() => {
    try {
      if (
        !chatApiClient ||
        !currentThreadId ||
        !messageIdToReply ||
        messageMode !== 'reply'
      ) {
        return undefined;
      }
      const cachedMessage =
        PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
          realm,
          currentThreadId,
          messageIdToReply,
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
  }, [chatApiClient, realm, currentThreadId, messageIdToReply, messageMode]);

  const userToReplyMemo = React.useMemo(() => {
    try {
      if (messageToReply?.sender && !messageToReply?.isMyMessage) {
        return messageToReply?.sender;
      } else {
        return undefined;
      }
    } catch (error) {
      psLogger.error('PSEditMessageProvider: userToReply', error);
      return undefined;
    }
  }, [messageToReply?.sender, messageToReply?.isMyMessage]);

  const replyMessage = React.useCallback(
    (messageId: number | undefined) => {
      if (messageMode === 'normal' && messageId) {
        setMessageMode('reply');
        setMessageIdToReply(messageId);
      } else if (messageMode === 'reply') {
        setMessageMode(messageId ? 'reply' : 'normal');
        setMessageIdToReply(messageId);
      }
      // Xử lý cho trường hợp người dùng đã chọn trả lời tin nhắn mà xoá tag name.
      // kéo trả lời lại sẽ thêm tag name lại
      if (userToReplyMemo?.extUserId !== userToReply?.extUserId && messageId) {
        setUserToReply(userToReplyMemo);
      }
    },
    [messageMode, userToReplyMemo?.extUserId, userToReply?.extUserId],
  );

  useEffect(() => {
    if (userToReplyMemo?.extUserId) setUserToReply(userToReplyMemo);
  }, [userToReplyMemo?.extUserId]);

  const valuePSReplyUserContext = React.useMemo(
    () => ({
      userToReply,
      setUserToReply,
    }),
    [userToReply],
  );

  return (
    <PSReplyMessageContext.Provider value={messageToReply}>
      <PSReplyUserContext.Provider value={valuePSReplyUserContext}>
        <PSReplyMessageSetIdContext.Provider value={replyMessage}>
          {children}
        </PSReplyMessageSetIdContext.Provider>
      </PSReplyUserContext.Provider>
    </PSReplyMessageContext.Provider>
  );
};

export const usePSReplyMessageContext = () =>
  React.useContext(PSReplyMessageContext);

export const usePSReplyUserContext = () => React.useContext(PSReplyUserContext);

export const usePSReplyMessageSetIdContext = () =>
  React.useContext(PSReplyMessageSetIdContext);
