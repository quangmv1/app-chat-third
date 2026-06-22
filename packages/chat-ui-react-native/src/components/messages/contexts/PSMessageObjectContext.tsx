import React, {PropsWithChildren} from 'react';
import {usePSScreenStylesContext} from '../../../context';
import {PSMessagesStyles} from '../PSMessagesStyles';
import {usePSMessageJsonPayloadContext} from './PSMessageJsonPayloadContext';
import {usePSMessageCurrentThreadContext} from './PSMessageCurrentThreadContext';
import {psLogger} from '../../../utils';

type PSMessageObjectContextValue = {
  isVisibleContextObjectView: boolean;
};

const PSMessageObjectContext = React.createContext<PSMessageObjectContextValue>(
  {} as PSMessageObjectContextValue,
);

export const PSMessageObjectProvider = ({children}: PropsWithChildren) => {
  // const chatApiClient = usePSChatApiClientContext();

  const currentThread = usePSMessageCurrentThreadContext();

  // const deleteMessage = usePSDeleteMessageContext();

  const renderContextObjectThreadViewBottom =
    usePSScreenStylesContext<PSMessagesStyles>()
      .renderContextObjectThreadViewBottom;

  const contextObject =
    usePSScreenStylesContext<PSMessagesStyles>().contextObject;

  // const sendMessageJsonPayloadLocal =
  //   usePSMessageJsonPayloadContext().sendMessageJsonPayloadLocal;

  const sendMessageJsonPayload =
    usePSMessageJsonPayloadContext().sendMessageJsonPayload;

  // const retrySendMessage = usePSSendMessageContext().retrySendMessage;

  const [isInitialized, setIsInitialized] = React.useState(false);

  // const primaryKeyMessageObjectRef = React.useRef<string | undefined>(
  //   undefined,
  // );
  const idMessageObjectRef = React.useRef<number | undefined>(undefined);

  const [isVisibleContextObjectView, setVisibleContextObjectView] =
    React.useState(false);

  React.useEffect(() => {
    const lastMessageId = currentThread?.lastMessage?.id;
    if (
      contextObject &&
      lastMessageId &&
      isVisibleContextObjectView &&
      idMessageObjectRef.current != undefined &&
      lastMessageId > idMessageObjectRef.current
    ) {
      setVisibleContextObjectView(false);
      idMessageObjectRef.current = undefined;
      setTimeout(() => {
        sendMessageJsonPayload(contextObject);
      }, 500); // trick đảm bảo The Realm is already in a write transaction
    }
  }, [
    currentThread?.lastMessage?.id,
    sendMessageJsonPayload,
    contextObject,
    isVisibleContextObjectView,
  ]);

  React.useEffect(() => {
    if (!isInitialized && currentThread) {
      idMessageObjectRef.current = currentThread?.lastMessage?.id ?? 0;
      setIsInitialized(true);
    }
  }, [isInitialized, currentThread]);

  React.useEffect(() => {
    if (contextObject && renderContextObjectThreadViewBottom) {
      setVisibleContextObjectView(true);
    } else {
      setVisibleContextObjectView(false);
    }
  }, [contextObject, renderContextObjectThreadViewBottom]);

  // React.useEffect(() => {
  //   const lastMessageId = currentThread?.lastMessage?.id;
  //   if (
  //     lastMessageId &&
  //     primaryKeyMessageObjectRef.current &&
  //     idMessageObjectRef.current &&
  //     lastMessageId > idMessageObjectRef.current
  //   ) {
  //     retrySendMessage(currentThread.id, primaryKeyMessageObjectRef.current);

  //     primaryKeyMessageObjectRef.current = undefined;
  //     idMessageObjectRef.current = undefined;
  //   }
  // }, [currentThread?.lastMessage?.id, retrySendMessage]);

  // React.useEffect(() => {
  //   if (!chatApiClient?.userId) {
  //     return;
  //   }

  //   const sendMessageObject = async () => {
  //     if (currentThread && contextObject && !isInitialized) {
  //       await sendMessageJsonPayloadLocal(contextObject);
  //       primaryKeyMessageObjectRef.current =
  //         currentThread?.lastMessage?.primaryKey;
  //       idMessageObjectRef.current = currentThread?.lastMessage?.id;
  //       setIsInitialized(true);
  //     }
  //   };

  //   sendMessageObject();
  // }, [isInitialized, currentThread, chatApiClient?.userId]);

  // React.useEffect(() => {
  //   return () => {
  //     if (!currentThread?.id) {
  //       return;
  //     }

  //     if (primaryKeyMessageObjectRef.current && idMessageObjectRef.current) {
  //       deleteMessage(
  //         currentThread.id,
  //         primaryKeyMessageObjectRef.current,
  //         PSDeleteMessageLevel.ME,
  //       );
  //     }
  //   };
  // }, [deleteMessage, currentThread?.id]);

  const contextValue = React.useMemo(() => {
    return {
      isVisibleContextObjectView: isVisibleContextObjectView,
    } as PSMessageObjectContextValue;
  }, [isVisibleContextObjectView]);

  return (
    <PSMessageObjectContext.Provider value={contextValue}>
      {children}
    </PSMessageObjectContext.Provider>
  );
};

export const usePSMessageObjectContext = () =>
  React.useContext(PSMessageObjectContext);
