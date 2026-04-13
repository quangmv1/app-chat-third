import {PSResponseError} from '@communi/chat-api-client-typescript';
import BottomSheet from '@gorhom/bottom-sheet';
import React from 'react';
import {usePSChatApiClientContext, useRealm} from '../../../context';
import {PSMessageEntity} from '../../../types';
import {
  DONT_HAVE_PERMISSION_CALL_API,
  PSBusEvent,
  PSEventBus,
  psLogger,
} from '../../../utils';
import {
  usePSMessageCurrentThreadContext,
  usePSMessageCurrentThreadIdContext,
  usePSMessageIsSubthreadContext,
} from './PSMessageCurrentThreadContext';

type PSMessagePollContextValue = {
  vote: (messageId: number, pollId: string, optionId: string) => Promise<void>;
  unvote: (
    messageId: number,
    pollId: string,
    optionId: string,
  ) => Promise<void>;
};

const PSMessagePollContext = React.createContext<PSMessagePollContextValue>(
  {} as PSMessagePollContextValue,
);

type PSMessageCreatePollActionContextValue = {
  show: () => void;
  hide: () => void;
};

const PSMessageCreatePollActionContext =
  React.createContext<PSMessageCreatePollActionContextValue>(
    {} as PSMessageCreatePollActionContextValue,
  );

type PSMessageCreatePollContextValue = {
  isVisible: boolean;
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSMessageCreatePollContext =
  React.createContext<PSMessageCreatePollContextValue>(
    {} as PSMessageCreatePollContextValue,
  );

type PSMessageAddOptionPollActionContextValue = {
  show: (messageId: number, pollId: string) => void;
  hide: () => void;
};

const PSMessageAddOptionPollActionContext =
  React.createContext<PSMessageAddOptionPollActionContextValue>(
    {} as PSMessageAddOptionPollActionContextValue,
  );

type PSMessageAddOptionPollContextValue = {
  isVisible: boolean;
  addOptionPoll: (textOption: string) => Promise<void>;
};

const PSMessageAddOptionPollContext =
  React.createContext<PSMessageAddOptionPollContextValue>(
    {} as PSMessageAddOptionPollContextValue,
  );

export const PSMessagePollProvider = (props: React.PropsWithChildren) => {
  const realm = useRealm();

  const chatApiClient = usePSChatApiClientContext();

  const isSubThread = usePSMessageIsSubthreadContext();

  const currentThreadIdParent = usePSMessageCurrentThreadIdContext();

  const currentThread = usePSMessageCurrentThreadContext();

  const currentThreadId = React.useMemo(() => {
    if (isSubThread) return currentThread?.parentId;
    return currentThreadIdParent;
  }, [isSubThread, currentThread?.parentId, currentThreadIdParent]);

  const [isVisibleCreatePoll, setVisibleCreatePoll] = React.useState(false);

  const isVisibleCreatePollRef = React.useRef(false);

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const [isVisibleAddOptionPoll, setVisibleAddOptionPoll] =
    React.useState(false);

  const isVisibleAddOptionPollRef = React.useRef(false);

  const showCreatePoll = React.useCallback(() => {
    if (!isVisibleCreatePollRef.current) {
      isVisibleCreatePollRef.current = true;
      setVisibleCreatePoll(true);
    } else {
      return;
    }
    setTimeout(() => {
      const bottomSheet = bottomSheetRef?.current;
      if (bottomSheet) {
        bottomSheet.snapToIndex(0);
      } else {
        isVisibleCreatePollRef.current = false;
        setVisibleCreatePoll(false);
      }
    }, 500); // trick đảm bảo bottomSheetRef != null
  }, []);

  const hideCreatePoll = React.useCallback(() => {
    if (isVisibleCreatePollRef.current) {
      isVisibleCreatePollRef.current = false;
      setVisibleCreatePoll(false);
    }
    bottomSheetRef?.current?.close();
  }, []);

  React.useEffect(() => {
    if (!isVisibleCreatePoll && isVisibleCreatePollRef.current) {
      isVisibleCreatePollRef.current = false;
    }
  }, [isVisibleCreatePoll]);

  const createPollActionContextValue = React.useMemo(
    () =>
      ({
        show: showCreatePoll,
        hide: hideCreatePoll,
      }) as PSMessageCreatePollActionContextValue,
    [showCreatePoll, hideCreatePoll],
  );

  const createPollContextValue = React.useMemo(() => {
    return {
      isVisible: isVisibleCreatePoll,
      bottomSheetRef: bottomSheetRef,
    } as PSMessageCreatePollContextValue;
  }, [isVisibleCreatePoll]);

  const voteLocal = React.useCallback(
    (messageId: number, optionId: string) => {
      if (chatApiClient && currentThreadId) {
        try {
          const message =
            PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
              realm,
              currentThreadId,
              messageId,
            );
          if (message) {
            realm.write(() => {
              message.vote(chatApiClient.userId, optionId, true);
            });
          }
        } catch (error) {
          psLogger.error(
            `PSMessagePollProvider.voteLocal: threadId = ${currentThreadId}, messageId = ${messageId}`,
            error,
          );
        }
      }
    },
    [chatApiClient, currentThreadId, realm],
  );

  const unvoteLocal = React.useCallback(
    (messageId: number, optionId: string) => {
      if (chatApiClient && currentThreadId) {
        try {
          const message =
            PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
              realm,
              currentThreadId,
              messageId,
            );
          if (message) {
            realm.write(() => {
              message.unvote(chatApiClient.userId, optionId, true);
            });
          }
        } catch (error) {
          psLogger.error(
            `PSMessagePollProvider.unvoteLocal: threadId = ${currentThreadId}, messageId = ${messageId}`,
            error,
          );
        }
      }
    },
    [chatApiClient, currentThreadId, realm],
  );

  const vote = React.useCallback(
    async (messageId: number, pollId: string, optionId: string) => {
      if (chatApiClient && currentThreadId) {
        try {
          voteLocal(messageId, optionId);
          await chatApiClient.messageApi.vote(
            currentThreadId,
            messageId,
            pollId,
            optionId,
          );
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
          } else {
            unvoteLocal(messageId, optionId);
          }
          psLogger.error(
            `PSMessagePollProvider.vote: threadId = ${currentThreadId}, messageId = ${messageId}`,
            error,
          );
        }
      }
    },
    [chatApiClient, currentThreadId, unvoteLocal, voteLocal],
  );

  const unvote = React.useCallback(
    async (messageId: number, pollId: string, optionId: string) => {
      if (chatApiClient && currentThreadId) {
        try {
          unvoteLocal(messageId, optionId);
          await chatApiClient.messageApi.unvote(
            currentThreadId,
            messageId,
            pollId,
            optionId,
          );
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
          } else {
            voteLocal(messageId, optionId);
          }

          psLogger.error(
            `PSMessagePollProvider.vote: threadId = ${currentThreadId}, messageId = ${messageId}`,
            error,
          );
        }
      }
    },
    [chatApiClient, currentThreadId, unvoteLocal, voteLocal],
  );

  const [messageId, setMessageId] = React.useState<number | undefined>();
  const [pollId, setPollId] = React.useState<string | undefined>();

  const addOptionPoll = React.useCallback(
    async (textOption: string) => {
      if (chatApiClient && currentThreadId && messageId && pollId) {
        try {
          const response = await chatApiClient.messageApi.addOptionPoll(
            currentThreadId,
            messageId,
            pollId,
            textOption,
          );
          const optionDto = response.data;

          if (optionDto) {
            const message =
              PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
                realm,
                currentThreadId,
                messageId,
              );
            if (message) {
              realm.write(() => {
                message.addOptionPoll(
                  optionDto.id,
                  optionDto.text,
                  optionDto.vote_count,
                  optionDto.partial_voter_list,
                );
              });
            }
          }
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
            `PSMessagePollProvider.vote: threadId = ${currentThreadId}, messageId = ${messageId}`,
            error,
          );
        }
      }
    },
    [chatApiClient, realm, currentThreadId, messageId, pollId],
  );

  const showAddOptionPoll = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (messageId: number, pollId: string) => {
      if (!isVisibleAddOptionPollRef.current) {
        isVisibleAddOptionPollRef.current = true;
        setVisibleAddOptionPoll(true);
        setMessageId(messageId);
        setPollId(pollId);
      }
    },
    [],
  );

  const hideAddOptionPoll = React.useCallback(() => {
    if (isVisibleAddOptionPollRef.current) {
      isVisibleAddOptionPollRef.current = false;
      setVisibleAddOptionPoll(false);
      setMessageId(undefined);
      setPollId(undefined);
    }
  }, []);

  const addOptionPollActionContextValue = React.useMemo(
    () =>
      ({
        show: showAddOptionPoll,
        hide: hideAddOptionPoll,
      }) as PSMessageAddOptionPollActionContextValue,
    [showAddOptionPoll, hideAddOptionPoll],
  );

  const addOptionPollContextValue = React.useMemo(() => {
    return {
      isVisible: isVisibleAddOptionPoll,
      addOptionPoll: addOptionPoll,
    } as PSMessageAddOptionPollContextValue;
  }, [addOptionPoll, isVisibleAddOptionPoll]);

  const messagePollContextValue = React.useMemo(
    () =>
      ({
        vote: vote,
        unvote: unvote,
      }) as PSMessagePollContextValue,
    [vote, unvote],
  );

  return (
    <PSMessagePollContext.Provider value={messagePollContextValue}>
      <PSMessageCreatePollActionContext.Provider
        value={createPollActionContextValue}>
        <PSMessageCreatePollContext.Provider value={createPollContextValue}>
          <PSMessageAddOptionPollActionContext.Provider
            value={addOptionPollActionContextValue}>
            <PSMessageAddOptionPollContext.Provider
              value={addOptionPollContextValue}>
              {props.children}
            </PSMessageAddOptionPollContext.Provider>
          </PSMessageAddOptionPollActionContext.Provider>
        </PSMessageCreatePollContext.Provider>
      </PSMessageCreatePollActionContext.Provider>
    </PSMessagePollContext.Provider>
  );
};

export const usePSMessagePollContext = () =>
  React.useContext(PSMessagePollContext);

export const usePSMessageCreatePollContext = () =>
  React.useContext(PSMessageCreatePollContext);

export const usePSMessageCreatePollActionContext = () =>
  React.useContext(PSMessageCreatePollActionContext);

export const usePSMessageAddOptionPollContext = () =>
  React.useContext(PSMessageAddOptionPollContext);

export const usePSMessageAddOptionPollActionContext = () =>
  React.useContext(PSMessageAddOptionPollActionContext);
