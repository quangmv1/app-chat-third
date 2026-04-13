import React, {createContext, PropsWithChildren, useContext} from 'react';
import {PSMessageModel} from '../../../types';

export type PSMessageNavigationContextValue = {
  onBackPress?: null | (() => void);
  onCompleteLeaveThread?: null | (() => void);
  onThreadProfilePress?: null | ((threadId: string) => void);
  onThreadDeskProfilePress?: null | ((threadId: string) => void);
  onUrlPress?: null | ((url: string) => void);
  onEmailPress?: null | ((email: string) => void);
  onPhoneNumberPress?: null | ((phoneNumber: string) => void);
  onForwardMessage?: null | ((threadId: string, messageIds: number[]) => void);
  onMessagesPinnedPress?: null | ((threadId: string) => void);
  onViewFilePress?: null | ((filePath: string) => void);
  onUserPress?:
    | null
    | ((
        psUserId: string,
        currentThreadPartnerId?: string,
        userId?: string,
      ) => void);
  onShareMessagePress?: null | ((message: PSMessageModel) => void);
  onChatBotActionPress?:
    | null
    | ((uri?: string, label?: string, payload?: string) => void);
  onCommentPress?: null | ((threadId: string) => void);
  onParentThreadPress?: null | ((threadId: string) => void);
  onSearchMessagePress?: null | ((threadId: string) => void);
  onViewFileUrlPress?: null | ((fileUrl: string) => void);
};

const PSMessageNavigationContext = createContext(
  {} as PSMessageNavigationContextValue,
);

export const PSMessageNavigationProvider = ({
  onBackPress,
  onCompleteLeaveThread,
  onThreadProfilePress,
  onThreadDeskProfilePress,
  onUrlPress,
  onEmailPress,
  onPhoneNumberPress,
  onForwardMessage,
  onMessagesPinnedPress,
  onViewFilePress,
  onUserPress,
  onShareMessagePress,
  onChatBotActionPress,
  onCommentPress,
  onSearchMessagePress,
  onParentThreadPress,
  onViewFileUrlPress,
  children,
}: PropsWithChildren<PSMessageNavigationContextValue>) => {
  const navContextValue = React.useMemo<PSMessageNavigationContextValue>(
    () => ({
      onBackPress,
      onCompleteLeaveThread,
      onThreadProfilePress,
      onThreadDeskProfilePress,
      onUrlPress,
      onEmailPress,
      onPhoneNumberPress,
      onForwardMessage,
      onMessagesPinnedPress,
      onViewFilePress,
      onUserPress,
      onShareMessagePress,
      onChatBotActionPress,
      onCommentPress,
      onSearchMessagePress,
      onParentThreadPress,
      onViewFileUrlPress,
    }),
    [
      onBackPress,
      onCompleteLeaveThread,
      onForwardMessage,
      onThreadProfilePress,
      onThreadDeskProfilePress,
      onUrlPress,
      onEmailPress,
      onPhoneNumberPress,
      onMessagesPinnedPress,
      onViewFilePress,
      onUserPress,
      onShareMessagePress,
      onChatBotActionPress,
      onCommentPress,
      onSearchMessagePress,
      onParentThreadPress,
      onViewFileUrlPress,
    ],
  );

  return (
    <PSMessageNavigationContext.Provider value={navContextValue}>
      {children}
    </PSMessageNavigationContext.Provider>
  );
};

export const usePSMessageNavigationContext = () =>
  useContext(PSMessageNavigationContext);
