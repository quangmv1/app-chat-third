import {PSResponseError} from '@communi/chat-api-client-typescript';
import React from 'react';
import {Keyboard} from 'react-native';
import {usePSChatApiClientContext, useRealm} from '../../../context';
import {PSThreadEntity} from '../../../types';
import {
  DONT_HAVE_PERMISSION_CALL_API,
  MEMBERS_INVALID,
  psLogger,
} from '../../../utils';
import {PSFlashMessage} from '../../flash-message';
import {
  usePSMessageCurrentThreadContext,
  usePSMessageCurrentThreadIdContext,
} from './PSMessageCurrentThreadContext';
import {usePSMessageNavigationContext} from './PSMessageNavigationContext';

type PSMessageCreateSubThreadContextValue = {
  createSubThread: (messageId: number) => Promise<void>;
};

const PSMessageCreateSubThreadContext =
  React.createContext<PSMessageCreateSubThreadContextValue>(
    {} as PSMessageCreateSubThreadContextValue,
  );

export const PSMessageCreateSubThreadProvider = (
  props: React.PropsWithChildren,
) => {
  const realm = useRealm();

  const chatApiClient = usePSChatApiClientContext();

  const currentThreadId = usePSMessageCurrentThreadIdContext();
  const currentThread = usePSMessageCurrentThreadContext();

  const {onCommentPress} = usePSMessageNavigationContext();

  const createSubThread = React.useCallback(
    async (messageId: number) => {
      if (!chatApiClient || !currentThreadId) {
        return;
      }
      Keyboard.dismiss();
      // setLoading(true);
      try {
        //   var threadName = '';
        //   if (nameGroup.trim() === '') {
        //     threadName = selectedUsers
        //       .slice(0, MAX_LENGTH)
        //       .map(user => user.name)
        //       .join(', ');
        //     if (selectedUsers.length > MAX_LENGTH) {
        //       threadName =
        //         threadName +
        //         ` ${translator(
        //           'ps_message_seen_users_with_other_count',
        //           // @ts-ignore
        //           {
        //             count: selectedUsers.length - MAX_LENGTH,
        //           },
        //         )}`;
        //     }
        //   } else {
        //     threadName = nameGroup.trim();
        //   }

        // const targetSubThreadName =
        //   subThreadName.length > 100
        //     ? `${subThreadName.substring(0, 96)}...`
        //     : subThreadName;

        const apiResponse = await chatApiClient.threadApi.createSubThread({
          parent_id: currentThreadId,
          message_id: messageId,
          // name: targetSubThreadName,
          avatar_url: currentThread?.avatar,
        });

        const threadId = apiResponse?.data?.thread_id;

        if (!threadId) {
          return;
        }

        onCommentPress?.(threadId);
        // if (threadId) {
        //   realm.write(() => {
        //     PSThreadEntity.createGroupSubThread(
        //       realm,
        //       threadId,
        //       targetSubThreadName,
        //       currentThreadId,
        //       messageId,
        //     );
        //   });

        //   setTimeout(() => {
        //     onCommentPress?.(threadId);
        //   }, 350);
        // }
      } catch (e) {
        //   //   setLoading(false);
        if (e && e instanceof PSResponseError) {
          if (
            (e.http_code === 400 &&
              e.response?.data?.message_code === MEMBERS_INVALID) ||
            (e.http_code === 403 &&
              e.response?.data?.message_code === DONT_HAVE_PERMISSION_CALL_API)
          ) {
            PSFlashMessage.show({
              type: 'error',
              text1: `${e.response?.data?.message}`,
              position: 'bottom',
              visibilityTime: 2000,
            });
          }
        }
        psLogger.error(
          `PSMessageCreateSubThreadContext createSubThread : ${e}`,
        );
      }
    },
    [chatApiClient, realm, currentThreadId, onCommentPress],
  );

  const createSubThreadContextValue = React.useMemo(() => {
    return {
      createSubThread: createSubThread,
    } as PSMessageCreateSubThreadContextValue;
  }, [createSubThread]);

  return (
    <PSMessageCreateSubThreadContext.Provider
      value={createSubThreadContextValue}>
      {props.children}
    </PSMessageCreateSubThreadContext.Provider>
  );
};

export const usePSMessageCreateSubThreadContext = () =>
  React.useContext(PSMessageCreateSubThreadContext);
