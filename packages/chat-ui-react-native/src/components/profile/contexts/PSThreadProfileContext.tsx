import {
  PSRoleThreadType,
  PSThreadGroupLevelType,
  PSThreadType,
} from '@communi/chat-api-client-typescript';
import React, {PropsWithChildren} from 'react';
import {
  mapTagCategoryEntityToModel,
  PSTagCategoryModel,
  PSTagEntity,
  PSThreadSettingEntity,
} from '../../../types';
import {usePSMessageCurrentThreadContext} from '../../messages';

type ThreadProfileInfoContextValue = {
  avatar?: string;
  name?: string;
  description?: string;
  verified?: boolean;
};

const ThreadProfileInfoContext =
  React.createContext<ThreadProfileInfoContextValue>(
    {} as ThreadProfileInfoContextValue,
  );

type ThreadProfileActionContextValue = {
  type?: PSThreadType;
  role?: PSRoleThreadType;
  isMute?: boolean;
  memberCount?: number;
  isHasAddMemberPermission?: boolean;
  groupLevel?: PSThreadGroupLevelType;
  isJoin?: boolean;
  tags?: PSTagEntity[];
  tagCategories?: PSTagCategoryModel[];
  screenContext?: string;
  setting?: PSThreadSettingEntity;
};

const ThreadProfileActionContext =
  React.createContext<ThreadProfileActionContextValue>(
    {} as ThreadProfileActionContextValue,
  );

export const PSThreadProfileProvider = ({children}: PropsWithChildren) => {
  const currentThread = usePSMessageCurrentThreadContext();

  const threadProfileInfoContextValue = React.useMemo(() => {
    return {
      avatar: currentThread?.avatar,
      name: currentThread?.name,
      description: currentThread?.description,
      verified: currentThread?.partner?.verified,
    } as ThreadProfileInfoContextValue;
  }, [currentThread?.avatar, currentThread?.description, currentThread?.name]);

  const threadProfileActionContextValue = React.useMemo(() => {
    return {
      type: currentThread?.type,
      role: currentThread?.role,
      isMute: currentThread?.isMute,
      memberCount: currentThread?.memberCount,
      isHasAddMemberPermission: currentThread?.getPermissionByRole()?.addMember,
      groupLevel: currentThread?.groupLevel,
      isJoin: currentThread?.isJoined,
      tags: currentThread?.tags,
      tagCategories: currentThread?.tagCategories.map(e =>
        mapTagCategoryEntityToModel(e),
      ),
      screenContext: currentThread?.screenContext?.screenContext,
      setting: currentThread?.setting,
    } as ThreadProfileActionContextValue;
  }, [
    currentThread?.isMute,
    currentThread?.memberCount,
    currentThread?.role,
    currentThread?.type,
    currentThread?.groupLevel,
    currentThread?.isJoined,
    currentThread?.tags,
    currentThread?.tagCategories,
    currentThread?.screenContext?.screenContext,
    currentThread?.setting,
  ]);

  return (
    <ThreadProfileInfoContext.Provider value={threadProfileInfoContextValue}>
      <ThreadProfileActionContext.Provider
        value={threadProfileActionContextValue}>
        {children}
      </ThreadProfileActionContext.Provider>
    </ThreadProfileInfoContext.Provider>
  );
};

export const useThreadProfileInfoContext = () =>
  React.useContext(ThreadProfileInfoContext);

export const useThreadProfileActionContext = () =>
  React.useContext(ThreadProfileActionContext);
