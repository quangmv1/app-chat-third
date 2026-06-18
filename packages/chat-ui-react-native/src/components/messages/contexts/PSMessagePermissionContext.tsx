import {PSRoleThreadType} from '@communi/chat-api-client-typescript';
import React, {PropsWithChildren} from 'react';
import {useQuery} from '../../../context';
import {useDeepCompareMemoize} from '../../../hooks';
import {PSThreadEntity} from '../../../types';
import {
  usePSMessageCurrentThreadContext,
  usePSMessageIsSubthreadContext,
} from './PSMessageCurrentThreadContext';

const PSMessagePermissionSendMessageContext =
  React.createContext<boolean>(true);
const PSMessagePermissionSendCommentContext =
  React.createContext<boolean>(true);

export const PSMessagePermissionProvider = ({children}: PropsWithChildren) => {
  const allThreads = useQuery(PSThreadEntity);

  const currentThread = usePSMessageCurrentThreadContext();

  const isSubThread = usePSMessageIsSubthreadContext();

  const threadParent = React.useMemo(() => {
    if (!currentThread || !currentThread.isValid()) {
      return undefined;
    }

    const parentId = currentThread.parentId;
    const parentThread = parentId
      ? allThreads.filtered(PSThreadEntity.filteredById(parentId))[0]
      : undefined;

    return parentThread;
  }, [
    allThreads,
    currentThread,
    currentThread?.isValid(),
    currentThread?.parentId,
  ]);

  const permissionSendMessageValue = React.useMemo(() => {
    if (!currentThread || !currentThread.isValid()) return true;
    const isUserMute = currentThread.isUserMute();
    return (
      (currentThread.getPermissionByRole()?.sendMessage && !isUserMute) ?? true
    );
  }, [currentThread]);

  const permissionSendCommentValue = React.useMemo(() => {
    if (!isSubThread || !threadParent || !threadParent.isValid()) return true;

    const threadParentPermissions = threadParent?.setting?.permissions;
    const threadParentRole = threadParent?.role;

    try {
      const setting = threadParentPermissions?.find(
        ite => ite.userRole === threadParentRole,
      );

      return (
        !!setting?.permission?.sendComment ||
        threadParentRole === PSRoleThreadType.OWNER
      );
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }, [
    isSubThread,
    threadParent?.isValid(),
    threadParent?.setting?.permissions,
    threadParent?.role,
  ]);

  return (
    <PSMessagePermissionSendMessageContext.Provider
      value={permissionSendMessageValue}>
      <PSMessagePermissionSendCommentContext.Provider
        value={permissionSendCommentValue}>
        {children}
      </PSMessagePermissionSendCommentContext.Provider>
    </PSMessagePermissionSendMessageContext.Provider>
  );
};

export const usePSMessagePermissionSendMessageContext = () =>
  React.useContext(PSMessagePermissionSendMessageContext);

export const usePSMessagePermissionSendCommentContext = () =>
  React.useContext(PSMessagePermissionSendCommentContext);
