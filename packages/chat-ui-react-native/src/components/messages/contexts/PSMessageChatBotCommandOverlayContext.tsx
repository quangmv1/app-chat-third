import React from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import {useDeepCompareMemoize, useIsMountedRef} from '../../../hooks';
import {usePSMessageCurrentThreadContext} from './PSMessageCurrentThreadContext';
import {usePSChatApiClientContext} from '../../../context';
import {PSUserType} from '@communi/chat-api-client-typescript';
import {psLogger} from '../../../utils';
import {usePSMessageInputReplyChatBotContext} from './PSMessageInputContext';

type PSMessageChatBotCommandOverlayActionContextValue = {
  show: () => void;
  hide: () => void;
};

const PSMessageChatBotCommandOverlayActionContext =
  React.createContext<PSMessageChatBotCommandOverlayActionContextValue>(
    {} as PSMessageChatBotCommandOverlayActionContextValue,
  );

type PSMessageChatBotCommandOverlayContextValue = {
  isVisible: boolean;
  commands: PSMessageChatBotCommandModel[];
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSMessageChatBotCommandOverlayContext =
  React.createContext<PSMessageChatBotCommandOverlayContextValue>(
    {} as PSMessageChatBotCommandOverlayContextValue,
  );

export type PSMessageChatBotCommandModel = {
  command: string;
  name: string;
};

export const PSMessageChatBotCommandOverlayProvider = (
  props: React.PropsWithChildren<{startCommand?: string}>,
) => {
  const chatApiClient = usePSChatApiClientContext();

  const currentThread = usePSMessageCurrentThreadContext();

  const replyChatBot = usePSMessageInputReplyChatBotContext();

  const isSendStartCommand = React.useRef(false);

  const isMounted = useIsMountedRef();

  const isFetched = React.useRef(false);

  const [isVisible, setVisible] = React.useState(false);

  const [commands, setCommands] = React.useState<
    PSMessageChatBotCommandModel[]
  >([]);

  const isVisibleRef = React.useRef(false);

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const onSendStartCommand = React.useCallback((command: PSMessageChatBotCommandModel) => {
    isSendStartCommand.current = true;
    replyChatBot(command.name, command.command);
  }, []);

  const fetchCommands = React.useCallback(async () => {
    if (
      chatApiClient &&
      currentThread?.partner?.type === PSUserType.BOT &&
      currentThread?.partner?.extUserId
    ) {
      isFetched.current = true;
      try {
        const botId = currentThread.partner.extUserId;
        const response = await chatApiClient.messageApi.fetchBotCommands(botId);
        if (response.data && isMounted.current) {
          setCommands(
            response.data.map(item => ({
              name: item.name,
              command: item.command,
            })),
          );
        }
      } catch (error) {
        isFetched.current = false;
        psLogger.error(
          'PSMessageChatBotCommandOverlayProvider: fetchCommands error',
          error,
        );
      }
    }
  }, [
    chatApiClient,
    currentThread?.partner?.extUserId,
    currentThread?.partner?.type,
  ]);

  const show = React.useCallback(() => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setVisible(true);
      fetchCommands();
    } else {
      return;
    }
    setTimeout(() => {
      const bottomSheet = bottomSheetRef?.current;
      if (bottomSheet) {
        bottomSheet.snapToIndex(0);
      } else {
        isVisibleRef.current = false;
        setVisible(false);
      }
    }, 500); // trick đảm bảo bottomSheetRef != null
  }, [fetchCommands]);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
    }
    bottomSheetRef?.current?.close();
  }, []);

  React.useEffect(() => {
    if (!isVisible && isVisibleRef.current) {
      isVisibleRef.current = false;
    }
  }, [isVisible]);

  React.useEffect(() => {
    const command = commands.find(item => item.command === props.startCommand);
    if (!isSendStartCommand.current && command) {
      onSendStartCommand(command);
    }
  }, [onSendStartCommand, commands]);

  React.useEffect(() => {
    if (!isFetched.current) {
      fetchCommands();
    }
  }, [fetchCommands]);

  const actionContextValue = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSMessageChatBotCommandOverlayActionContextValue,
    [show, hide],
  );

  const modalContextValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      commands: commands,
      bottomSheetRef: bottomSheetRef,
    } as PSMessageChatBotCommandOverlayContextValue;
  }, [isVisible, useDeepCompareMemoize(commands)]);

  return (
    <PSMessageChatBotCommandOverlayActionContext.Provider
      value={actionContextValue}>
      <PSMessageChatBotCommandOverlayContext.Provider value={modalContextValue}>
        {props.children}
      </PSMessageChatBotCommandOverlayContext.Provider>
    </PSMessageChatBotCommandOverlayActionContext.Provider>
  );
};

export const usePSMessageChatBotCommandOverlayContext = () =>
  React.useContext(PSMessageChatBotCommandOverlayContext);

export const usePSMessageChatBotCommandOverlayActionContext = () =>
  React.useContext(PSMessageChatBotCommandOverlayActionContext);
