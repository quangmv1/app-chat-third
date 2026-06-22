import {PSLabelDto, PSSessionDto} from '@communi/chat-api-client-typescript';
import React, {PropsWithChildren, useReducer} from 'react';
import {
  GetApiPagingAction,
  GetApiPagingState,
  initialState,
  setDataList,
  userReducers,
} from '../../../../hooks';

type ThreadDeskProfileContextValue = {
  state: GetApiPagingState;
};

const ThreadDeskProfileContext =
  React.createContext<ThreadDeskProfileContextValue>(
    {} as ThreadDeskProfileContextValue,
  );

type ThreadDeskProfileActionsContextValue = {
  dispatch: React.Dispatch<GetApiPagingAction>;
  changeSessionNote: (sessionId: string, note: string) => void;
  closeSession: (sessionId: string) => void;
  addSessionLabel: (sessionId: string, label: PSLabelDto) => void;
  removeSessionLabel: (sessionId: string, label: PSLabelDto) => void;
};

const ThreadDeskProfileActionsContext =
  React.createContext<ThreadDeskProfileActionsContextValue>(
    {} as ThreadDeskProfileActionsContextValue,
  );

export const PSThreadDeskProfileProvider = ({children}: PropsWithChildren) => {
  const [state, dispatch] = useReducer(userReducers, initialState);

  const changeSessionNote = React.useCallback(
    (sessionId: string, note: string) => {
      dispatch(
        setDataList(
          (state.data as PSSessionDto[]).map(item => {
            if (item.id === sessionId) {
              return {...item, note: note};
            } else {
              return item;
            }
          }),
        ),
      );
    },
    [state.data],
  );

  const closeSession = React.useCallback(
    (sessionId: string) => {
      dispatch(
        setDataList(
          (state.data as PSSessionDto[]).map(item => {
            if (item.id === sessionId) {
              return {
                ...item,
                finished_at: Date.now(),
              };
            } else {
              return item;
            }
          }),
        ),
      );
    },
    [state.data],
  );

  const addSessionLabel = React.useCallback(
    (sessionId: string, label: PSLabelDto) => {
      dispatch(
        setDataList(
          (state.data as PSSessionDto[]).map(item => {
            if (item.id === sessionId) {
              return {
                ...item,
                label: [...(item.label ?? []), label],
              };
            } else {
              return item;
            }
          }),
        ),
      );
    },
    [state.data],
  );

  const removeSessionLabel = React.useCallback(
    (sessionId: string, label: PSLabelDto) => {
      dispatch(
        setDataList(
          (state.data as PSSessionDto[]).map(item => {
            if (item.id === sessionId) {
              return {
                ...item,
                label: item.label?.filter(e => e.id !== label.id) ?? [],
              };
            } else {
              return item;
            }
          }),
        ),
      );
    },
    [state.data],
  );

  const threadDeskProfileActionsContextValue = React.useMemo(() => {
    return {
      dispatch: dispatch,
      changeSessionNote: changeSessionNote,
      closeSession: closeSession,
      addSessionLabel: addSessionLabel,
      removeSessionLabel: removeSessionLabel,
    } as ThreadDeskProfileActionsContextValue;
  }, [changeSessionNote, closeSession, addSessionLabel, removeSessionLabel]);

  const threadDeskProfileContextValue = React.useMemo(() => {
    return {
      state: state,
    } as ThreadDeskProfileContextValue;
  }, [state]);

  return (
    <ThreadDeskProfileActionsContext.Provider
      value={threadDeskProfileActionsContextValue}>
      <ThreadDeskProfileContext.Provider value={threadDeskProfileContextValue}>
        {children}
      </ThreadDeskProfileContext.Provider>
    </ThreadDeskProfileActionsContext.Provider>
  );
};

export const useThreadDeskProfileContext = () =>
  React.useContext(ThreadDeskProfileContext);

export const useThreadDeskProfileActionsContext = () =>
  React.useContext(ThreadDeskProfileActionsContext);
