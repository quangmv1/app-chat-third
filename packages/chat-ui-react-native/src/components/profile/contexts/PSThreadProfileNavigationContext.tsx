import {
  PSMessageMetadataType,
  PSRoleThreadType,
} from '@communi/chat-api-client-typescript';
import React, {createContext, PropsWithChildren, useContext} from 'react';

export type PSThreadProfileNavigationContextValue = {
  onBackPress?: null | (() => void);
  onAddMemberPress?: null | (() => void);
  onPressAddMember?: null | (() => void);
  onSearchMessagePress?: null | (() => void);
  onMembersInThreadPress?: null | (() => void);
  onCompleteLeaveThread?: null | (() => void);
  onMediaCollectionPress?: null | ((type: PSMessageMetadataType) => void);

  onUrlPress?: null | ((url: string) => void);
  onEmailPress?: null | ((email: string) => void);
  onPhoneNumberPress?: null | ((phoneNumber: string) => void);
  onUserPress?:
    | null
    | ((psUserId: string, currentThreadPartnerId?: string) => void);
  onPressLinkJoinThread?: null | (() => void);
  onViewMessage?: null | ((messageId: number) => void);
  onSettingPermissionGroup?: null | ((userRole: PSRoleThreadType) => void);
};

const PSThreadProfileNavigationContext = createContext(
  {} as PSThreadProfileNavigationContextValue,
);

export const PSThreadProfileNavigationProvider = ({
  onBackPress,
  onAddMemberPress,
  onSearchMessagePress,
  onMembersInThreadPress,
  onCompleteLeaveThread,
  onMediaCollectionPress,
  onEmailPress,
  onPhoneNumberPress,
  onUrlPress,
  onUserPress,
  onViewMessage,
  onPressLinkJoinThread,
  onSettingPermissionGroup,
  children,
}: PropsWithChildren<PSThreadProfileNavigationContextValue>) => {
  const navContextValue = React.useMemo<PSThreadProfileNavigationContextValue>(
    () => ({
      onBackPress: onBackPress,
      onAddMemberPress: onAddMemberPress,
      onSearchMessagePress: onSearchMessagePress,
      onMembersInThreadPress: onMembersInThreadPress,
      onCompleteLeaveThread: onCompleteLeaveThread,
      onMediaCollectionPress: onMediaCollectionPress,
      onEmailPress: onEmailPress,
      onPhoneNumberPress: onPhoneNumberPress,
      onUrlPress: onUrlPress,
      onUserPress: onUserPress,
      onViewMessage: onViewMessage,
      onPressLinkJoinThread: onPressLinkJoinThread,
      onSettingPermissionGroup,
    }),
    [
      onAddMemberPress,
      onBackPress,
      onCompleteLeaveThread,
      onEmailPress,
      onMediaCollectionPress,
      onMembersInThreadPress,
      onPhoneNumberPress,
      onSearchMessagePress,
      onUrlPress,
      onUserPress,
      onViewMessage,
      onPressLinkJoinThread,
      onSettingPermissionGroup,
    ],
  );

  return (
    <PSThreadProfileNavigationContext.Provider value={navContextValue}>
      {children}
    </PSThreadProfileNavigationContext.Provider>
  );
};

export const usePSThreadProfileNavigationContext = () =>
  useContext(PSThreadProfileNavigationContext);
