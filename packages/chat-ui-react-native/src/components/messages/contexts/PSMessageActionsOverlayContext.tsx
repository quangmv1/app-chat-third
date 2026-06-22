import React from 'react';
import {
  mapMessageEntityToModel,
  PSMessageEntity,
  PSMessageModel,
  PSMessagePosition,
  PSPinnedMessagesEntity,
  PSVisibility,
} from '../../../types';
import {usePSMessageCurrentThreadIdContext} from './PSMessageCurrentThreadContext';
import {psLogger} from '../../../utils';
import {usePSChatApiClientContext, useRealm} from '../../../context';

type PSMessageActionsOverlayActionContextValue = {
  show: (messagePrimaryKey: string) => void;
  hide: () => void;
};

const PSMessageActionsOverlayContext =
  React.createContext<PSMessageActionsOverlayActionContextValue>(
    {} as PSMessageActionsOverlayActionContextValue,
  );

type MessageActionMode = 'normal' | 'delete';

type PSMessageActionsOverlayModeContextValue = {
  mode: MessageActionMode;
  setMode: React.Dispatch<React.SetStateAction<MessageActionMode>>;
};

const PSMessageActionsOverlayModeContext =
  React.createContext<PSMessageActionsOverlayModeContextValue>(
    {} as PSMessageActionsOverlayModeContextValue,
  );

type PSMessageActionsOverlayMessageContextValue = {
  message?: PSMessageModel;
  isPinned: boolean;
};

const PSMessageActionsOverlayMessageContext =
  React.createContext<PSMessageActionsOverlayMessageContextValue>(
    {} as PSMessageActionsOverlayMessageContextValue,
  );

const PSMessageActionsOverlayVisibleContext =
  React.createContext<boolean>(false);

export const PSMessageActionsOverlayProvider = ({
  children,
}: React.PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const [mode, setMode] = React.useState<MessageActionMode>('normal');

  const [isVisible, setVisible] = React.useState(false);

  const isVisibleRef = React.useRef(false);

  const [primaryKey, setMessagePrimaryKey] = React.useState<
    string | undefined
  >();

  const isPinned = React.useMemo(() => {
    try {
      if (primaryKey) {
        return (
          PSPinnedMessagesEntity.getFirstByPrimaryKey(realm, primaryKey) !==
          undefined
        );
      } else {
        return false;
      }
    } catch (e) {
      psLogger.error('PSMessageActionsOverlayProvider: isPinned', e);
      return false;
    }
  }, [realm, primaryKey]);

  const show = React.useCallback((messagePrimaryKey: string) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setMode('normal');
      setMessagePrimaryKey(messagePrimaryKey);
      setVisible(true);
    }
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setMode('normal');
      setMessagePrimaryKey(undefined);
    }
  }, []);

  const message = React.useMemo(() => {
    try {
      if (chatApiClient && currentThreadId && primaryKey) {
        const result = PSMessageEntity.getFirstByThreadIdAndPrimaryKey(
          realm,
          currentThreadId,
          primaryKey,
        );
        if (result) {
          return mapMessageEntityToModel(
            chatApiClient.userId,
            result,
            [],
            PSMessagePosition.NORMAL,
            result.body?.originalSender ? true : false,
            result.body?.originalSender
              ? PSVisibility.INVISIBLE
              : PSVisibility.VISIBLE,
          );
        } else {
          hide();
          return undefined;
        }
      } else {
        hide();
        return undefined;
      }
    } catch (e) {
      psLogger.error('PSMessageActionsOverlayProvider: message', e);
      return undefined;
    }
  }, [chatApiClient, realm, currentThreadId, primaryKey, hide]);

  const actionContextValue = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSMessageActionsOverlayActionContextValue,
    [show, hide],
  );

  const modeContextValue = React.useMemo(
    () =>
      ({
        mode: mode,
        setMode: setMode,
      }) as PSMessageActionsOverlayModeContextValue,
    [mode],
  );

  const messageContextValue = React.useMemo(() => {
    return {
      message: message,
      isPinned: isPinned,
    };
  }, [message, isPinned]);

  return (
    <PSMessageActionsOverlayVisibleContext.Provider value={isVisible}>
      <PSMessageActionsOverlayContext.Provider value={actionContextValue}>
        <PSMessageActionsOverlayModeContext.Provider value={modeContextValue}>
          <PSMessageActionsOverlayMessageContext.Provider
            value={messageContextValue}>
            {children}
          </PSMessageActionsOverlayMessageContext.Provider>
        </PSMessageActionsOverlayModeContext.Provider>
      </PSMessageActionsOverlayContext.Provider>
    </PSMessageActionsOverlayVisibleContext.Provider>
  );
};

export const usePSMessageActionsOverlayContext = () =>
  React.useContext(PSMessageActionsOverlayContext);

export const usePSMessageActionsOverlayVisibleContext = () =>
  React.useContext(PSMessageActionsOverlayVisibleContext);

export const usePSMessageActionsOverlayModeContext = () =>
  React.useContext(PSMessageActionsOverlayModeContext);

export const usePSMessageActionsOverlayMessageContext = () =>
  React.useContext(PSMessageActionsOverlayMessageContext);
