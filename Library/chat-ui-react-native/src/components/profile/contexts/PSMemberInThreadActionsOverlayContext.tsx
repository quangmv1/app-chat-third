import React from 'react';
import {
  PSMemberInThreadModel,
  PSThreadEntity,
  PSThreadPermissionsEntity,
} from '../../../types';
import {MemberInThreadActionsOverlay} from '../components';
import {useQuery} from '../../../context';
import {psLogger} from '../../../utils';
import {PSRoleThreadType} from '@communi/chat-api-client-typescript';
import {ActionThreadsProvider} from '../../threads';

type PSMemberInThreadActionsOverlayContextValue = {
  show: (item: PSMemberInThreadModel) => void;
  hide: () => void;
};

const PSMemberInThreadActionsOverlayContext =
  React.createContext<PSMemberInThreadActionsOverlayContextValue>(
    {} as PSMemberInThreadActionsOverlayContextValue,
  );

type PSMemberInThreadActionsOverlayVisibleContextValue = {
  isVisible: boolean;
  user?: PSMemberInThreadModel;
  permission?: PSThreadPermissionsEntity;
};

const PSMemberInThreadActionsOverlayVisibleContext =
  React.createContext<PSMemberInThreadActionsOverlayVisibleContextValue>({
    isVisible: false,
    user: undefined,
  } as PSMemberInThreadActionsOverlayVisibleContextValue);

export const PSMemberInThreadActionsOverlayProvider = ({
  threadId,
  allowChatWithUserOption,
  onPressChatWithUser,
  onRemoveParticipantsSuccess,
  onCompleteLeaveThread,
  children,
}: React.PropsWithChildren<{
  threadId: string;
  allowChatWithUserOption?: boolean;
  onPressChatWithUser?: null | ((userId: string) => void);
  onRemoveParticipantsSuccess?: null | (() => void);
  onBackPress?: null | (() => void);
  onCompleteLeaveThread?: null | (() => void);
}>) => {
  const [isVisible, setVisible] = React.useState(false);

  const [user, setUser] = React.useState<PSMemberInThreadModel | undefined>();

  const threadQuery = useQuery(PSThreadEntity);

  const currentThread = React.useMemo(() => {
    try {
      if (!threadId) {
        return undefined;
      }
      let query: string;
      if (threadId) {
        query = PSThreadEntity.filteredById(threadId);
      } else {
        return undefined;
      }
      return threadQuery.filtered(query)[0];
    } catch (error) {
      psLogger.error('PSLinkJoinGroupProvider: currentThread', error);
      return undefined;
    }
  }, [threadQuery, threadId]);

  const isVisibleRef = React.useRef(false);

  const show = React.useCallback((item: PSMemberInThreadModel) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setUser(item);
      setVisible(true);
    }
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setUser(undefined);
    }
  }, []);

  const actionContextValue = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSMemberInThreadActionsOverlayContextValue,
    [show, hide],
  );

  const modalContextValue = React.useMemo(() => {
    const permission = currentThread?.setting?.permissions.filter(
      ite => ite.userRole === PSRoleThreadType.ADMIN,
    )?.[0];
    return {
      isVisible: isVisible,
      user: user,
      permission,
    };
  }, [isVisible, user, currentThread]);

  return (
    <PSMemberInThreadActionsOverlayContext.Provider value={actionContextValue}>
      <PSMemberInThreadActionsOverlayVisibleContext.Provider
        value={modalContextValue}>
        <ActionThreadsProvider>
          {children}
          <MemberInThreadActionsOverlay
            threadId={threadId}
            allowChatWithUserOption={allowChatWithUserOption}
            onPressChatWithUser={onPressChatWithUser}
            onRemoveParticipantsSuccess={onRemoveParticipantsSuccess}
            onCompleteLeaveThread={onCompleteLeaveThread}
          />
        </ActionThreadsProvider>
      </PSMemberInThreadActionsOverlayVisibleContext.Provider>
    </PSMemberInThreadActionsOverlayContext.Provider>
  );
};

export const usePSMemberInThreadActionsOverlayVisibleContext = () =>
  React.useContext(PSMemberInThreadActionsOverlayVisibleContext);

export const usePSMemberInThreadActionsOverlayContext = () =>
  React.useContext(PSMemberInThreadActionsOverlayContext);
