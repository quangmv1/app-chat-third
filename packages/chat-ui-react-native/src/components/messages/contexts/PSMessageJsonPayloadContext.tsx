import React, {PropsWithChildren} from 'react';
import {usePSSendMessageContext} from '../../../context';
import {usePSMessageCurrentThreadIdContext} from './PSMessageCurrentThreadContext';
import {PSMessageModel} from '../../../types';
import {usePSDeleteMessageContext} from './PSDeleteMessageContext';
import {PSDeleteMessageLevel} from '@communi/chat-api-client-typescript';

type PSMessageJsonPayloadContextValue = {
  sendMessageJsonPayload: (payload: string) => Promise<void>;
  sendMessageJsonPayloadLocal: (payload: string) => Promise<void>;
  deleteMessageJsonPayload: (message: PSMessageModel) => Promise<void>;
};

export const PSMessageJsonPayloadContext =
  React.createContext<PSMessageJsonPayloadContextValue>(
    {} as PSMessageJsonPayloadContextValue,
  );

export const PSMessageJsonPayloadProvider = ({children}: PropsWithChildren) => {
  const sendMessage = usePSSendMessageContext().sendMessage;

  const sendMessageLocal = usePSSendMessageContext().sendMessageLocal;

  const deleteMessage = usePSDeleteMessageContext();

  const threadId = usePSMessageCurrentThreadIdContext();

  const sendMessageJsonPayload = React.useCallback(
    async (payload: string) => {
      if (!threadId) {
        return;
      }
      const request = {
        threadId: threadId,
        jsonPayload: payload,
      };
      sendMessage(request);
    },
    [sendMessage, threadId],
  );

  const sendMessageJsonPayloadLocal = React.useCallback(
    async (payload: string) => {
      if (!threadId) {
        return;
      }
      const request = {
        threadId: threadId,
        jsonPayload: payload,
      };
      sendMessageLocal(request);
    },
    [sendMessageLocal, threadId],
  );

  const deleteMessageJsonPayload = React.useCallback(
    async (message: PSMessageModel) => {
      if (!threadId) {
        return;
      }

      deleteMessage(threadId, message.primaryKey, PSDeleteMessageLevel.ME);
    },
    [deleteMessage, threadId],
  );

  const value = React.useMemo(
    () =>
      ({
        sendMessageJsonPayload: sendMessageJsonPayload,
        sendMessageJsonPayloadLocal: sendMessageJsonPayloadLocal,
        deleteMessageJsonPayload: deleteMessageJsonPayload,
      }) as PSMessageJsonPayloadContextValue,
    [
      sendMessageJsonPayload,
      sendMessageJsonPayloadLocal,
      deleteMessageJsonPayload,
    ],
  );

  return (
    <PSMessageJsonPayloadContext.Provider value={value}>
      {children}
    </PSMessageJsonPayloadContext.Provider>
  );
};

export const usePSMessageJsonPayloadContext = () =>
  React.useContext(PSMessageJsonPayloadContext);
