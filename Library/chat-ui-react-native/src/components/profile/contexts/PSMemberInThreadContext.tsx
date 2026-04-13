import {PSRoleThreadType} from '@communi/chat-api-client-typescript';
import React, {PropsWithChildren, useReducer} from 'react';
import {usePSChatApiClientContext, useRealm} from '../../../context';
import {
  GetApiPagingAction,
  GetApiPagingState,
  initialState,
  setDataList,
  userReducers,
} from '../../../hooks';
import {PSMemberInThreadModel, PSThreadEntity} from '../../../types';
import {psLogger} from '../../../utils';

type PSMemberInThreadActionsContextValue = {
  dispatch: React.Dispatch<GetApiPagingAction>;
  removeMemberLocal: (extUserId: string) => void;
  changeRoleMemberLocal: (extUserId: string, role: PSRoleThreadType) => void;
};

const PSMemberInThreadActionsContext =
  React.createContext<PSMemberInThreadActionsContextValue>(
    {} as PSMemberInThreadActionsContextValue,
  );

type PSMemberInThreadContextValue = {
  state: GetApiPagingState;
};

const PSMemberInThreadContext =
  React.createContext<PSMemberInThreadContextValue>(
    {} as PSMemberInThreadContextValue,
  );

export const PSMemberInThreadProvider = ({
  threadId,
  children,
}: PropsWithChildren<{
  threadId: string;
}>) => {
  const realm = useRealm();
  const chatApiClient = usePSChatApiClientContext();
  const [state, dispatch] = useReducer(userReducers, initialState);

  const updateMemberCountThread = React.useCallback(() => {
    const currentThread = PSThreadEntity.getFirstById(realm, threadId);
    if (currentThread) {
      try {
        const memberCount = currentThread.memberCount;
        if (memberCount > 0) {
          realm.write(() => {
            currentThread.updateMemberCount(memberCount - 1);
          });
        }
      } catch (e) {
        psLogger.error('PSMemberInThreadProvider: updateMemberCountThread', e);
      }
    }
  }, [realm, threadId]);

  const updateRoleThread = React.useCallback(
    (role: PSRoleThreadType) => {
      const currentThread = PSThreadEntity.getFirstById(realm, threadId);
      if (currentThread) {
        try {
          realm.write(() => {
            currentThread.updateRole(role);
          });
        } catch (e) {
          psLogger.error('PSMemberInThreadProvider: updateRoleThread', e);
        }
      }
    },
    [realm, threadId],
  );

  const removeMemberLocal = React.useCallback(
    (extUserId: string) => {
      dispatch(
        setDataList(
          (state.data as PSMemberInThreadModel[]).filter(
            item => item.extUserId !== extUserId,
          ),
        ),
      );
      updateMemberCountThread();
    },
    [state.data, updateMemberCountThread],
  );

  const changeRoleMemberLocal = React.useCallback(
    (extUserId: string, role: PSRoleThreadType) => {
      dispatch(
        setDataList(
          (state.data as PSMemberInThreadModel[]).map(item => {
            if (
              role === PSRoleThreadType.OWNER &&
              item.extUserId === chatApiClient?.userId
            ) {
              return {...item, role: PSRoleThreadType.ADMIN};
            } else if (item.extUserId === extUserId) {
              return {...item, role: role};
            } else {
              return item;
            }
          }),
        ),
      );
      if (role === PSRoleThreadType.OWNER) {
        updateRoleThread(PSRoleThreadType.ADMIN);
      }
    },
    [chatApiClient?.userId, state.data, updateRoleThread],
  );

  const actionsValue = React.useMemo(() => {
    return {
      dispatch: dispatch,
      removeMemberLocal: removeMemberLocal,
      changeRoleMemberLocal: changeRoleMemberLocal,
    } as PSMemberInThreadActionsContextValue;
  }, [removeMemberLocal, changeRoleMemberLocal]);

  const value = React.useMemo(() => {
    return {state: state} as PSMemberInThreadContextValue;
  }, [state]);

  return (
    <PSMemberInThreadActionsContext.Provider value={actionsValue}>
      <PSMemberInThreadContext.Provider value={value}>
        {children}
      </PSMemberInThreadContext.Provider>
    </PSMemberInThreadActionsContext.Provider>
  );
};

export const usePSMemberInThreadActionsContext = () =>
  React.useContext(PSMemberInThreadActionsContext);

export const usePSMemberInThreadContext = () =>
  React.useContext(PSMemberInThreadContext);
