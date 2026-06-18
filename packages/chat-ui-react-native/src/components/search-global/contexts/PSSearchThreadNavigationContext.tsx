import React, {createContext, PropsWithChildren, useContext} from 'react';
import {usePSSearchThreadRecentlyContext} from './PSSearchThreadRecentlyContext';
import { psLogger } from '../../../utils';

type PSSearchThreadNavigationContextValue = {
  onBackPress?: null | (() => void);
  onThreadPress?: (targetThreadId?: string, targetUserId?: string) => void;
  onViewMessage?: null | ((threadId: string, messageId: number) => void);
};

const PSSearchThreadNavigationContext = createContext(
  {} as PSSearchThreadNavigationContextValue,
);

export const PSSearchThreadNavigationProvider = ({
  onBackPress,
  onThreadPress,
  onViewMessage,
  children,
}: PropsWithChildren<PSSearchThreadNavigationContextValue>) => {
  const onSaveThreadSearchRecentlyPress =
    usePSSearchThreadRecentlyContext().onSaveThreadSearchRecentlyPress;

  const handleThreadPressAndSaveRecently = React.useCallback(
    (targetThreadId?: string, targetUserId?: string) => {
      onSaveThreadSearchRecentlyPress?.(targetThreadId, targetUserId);
      onThreadPress?.(targetThreadId, targetUserId);
    },
    [onThreadPress],
  );

  const navContextValue = React.useMemo<PSSearchThreadNavigationContextValue>(
    () => ({
      onBackPress: onBackPress,
      onThreadPress: handleThreadPressAndSaveRecently,
      onViewMessage: onViewMessage,
    }),
    [onBackPress, onThreadPress, onViewMessage],
  );

  return (
    <PSSearchThreadNavigationContext.Provider value={navContextValue}>
      {children}
    </PSSearchThreadNavigationContext.Provider>
  );
};

export const usePSSearchThreadNavigationContext = () =>
  useContext(PSSearchThreadNavigationContext);
