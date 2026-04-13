import React, {createContext, useContext, useCallback} from 'react';
import {
  usePSChatApiClientContext,
  usePSTranslationContext,
  useRealm,
} from '../../../context';
import {PSThreadEntity} from '../../../types';
import {psLogger, createFormData, PSEventBus, PSBusEvent} from '../../../utils';
import {PSUploadRequestDto} from '@communi/chat-api-client-typescript';
import {PSFlashMessage} from '../../flash-message';

type ActionThreadsContextValue = {
  pinThread: (threadId: string) => Promise<void> | undefined;
  muteThread: (threadId: string) => Promise<void> | undefined;
  deleteThread: (
    threadId: string,
    isBoth?: boolean,
  ) => Promise<void> | undefined;
  leaveThread: (
    threadId: string,
    callBack?: () => void,
  ) => Promise<void> | undefined;
  changeNameThread: (
    threadId: string,
    name: string,
  ) => Promise<void> | undefined;
  changeAvatarThread: (
    threadId: string,
    image: PSUploadRequestDto,
  ) => Promise<void> | undefined;
  disbandGroupThread: (threadId: string) => Promise<void> | undefined;
};

const ActionThreadsContext = createContext({} as ActionThreadsContextValue);

export const ActionThreadsProvider = (props: React.PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();
  const realm = useRealm();
  const {translator} = usePSTranslationContext();

  const pinThread = useCallback(
    async (threadId: string) => {
      const threadCached = PSThreadEntity.getFirstById(realm, threadId);
      if (threadCached && chatApiClient) {
        const pinnedAtBackUp = threadCached.pinnedAt;
        try {
          let pinnedAtUpdate = pinnedAtBackUp;
          if (pinnedAtBackUp === 0) {
            let now = new Date().getTime();
            pinnedAtUpdate = now;
          } else {
            pinnedAtUpdate = 0;
          }

          realm.write(() => {
            threadCached.updatePinnedAt(pinnedAtUpdate);
          });

          if (pinnedAtUpdate === 0) {
            await chatApiClient.threadApi.unpinThread(threadCached.id);
          } else {
            await chatApiClient.threadApi.pinThread(threadCached.id);
          }
        } catch (error) {
          realm.write(() => {
            threadCached.updatePinnedAt(pinnedAtBackUp);
          });
          psLogger.error('ActionsThreadsContext: pinThread', error);
          PSFlashMessage.show({
            type: 'error',
            position: 'bottom',
            text1: `${translator('ps_error_general')}`,
          });
        }
      }
    },
    [chatApiClient, realm, translator],
  );

  const muteThread = useCallback(
    async (threadId: string) => {
      const currentThread = PSThreadEntity.getFirstById(realm, threadId);
      if (currentThread && chatApiClient) {
        try {
          const enableNotify = !currentThread.isMute;
          realm.write(() => {
            currentThread.updateMute(enableNotify);
          });
          await chatApiClient.threadApi.notifyThread(
            currentThread.id,
            !enableNotify,
          );
        } catch (e) {
          realm.write(() => {
            currentThread.updateMute(!currentThread.isMute);
          });
          psLogger.error('ActionsThreadsContext: muteThread', e);
          PSFlashMessage.show({
            type: 'error',
            position: 'bottom',
            text1: `${translator('ps_error_general')}`,
          });
        }
      }
    },
    [chatApiClient, realm, translator],
  );

  const deleteThread = useCallback(
    async (threadId: string, isBoth?: boolean) => {
      if (!chatApiClient || !threadId) {
        return;
      }
      try {
        await chatApiClient.threadApi.deleteThread(threadId, isBoth);

        PSThreadEntity.deleteThread(realm, threadId);

        PSFlashMessage.show({
          type: 'success',
          position: 'bottom',
          text1: `${translator('ps_success_delete_conversation')}`,
        });
      } catch (error) {
        psLogger.error(
          `ActionsThreadsContext deleteThread : ${JSON.stringify(error)}`,
        );
        PSFlashMessage.show({
          type: 'error',
          position: 'bottom',
          text1: `${translator('ps_error_delete_conversation')}`,
        });
      }
    },
    [chatApiClient, realm, translator],
  );

  const leaveThread = React.useCallback(
    async (threadId: string, callBack?: () => void) => {
      if (!chatApiClient || !threadId) {
        return undefined;
      }
      try {
        await chatApiClient.threadApi.leaveThread(threadId);
        PSFlashMessage.show({
          type: 'success',
          position: 'bottom',
          text1: `${translator('ps_success_leave_thread')}`,
        });
        typeof callBack === 'function' && callBack();
        PSEventBus.getInstance().dispatch(PSBusEvent.LEAVE_THREAD, threadId);
      } catch (error: any) {
        psLogger.error(
          `PSThreadProfile leaveThread : ${JSON.stringify(error)}`,
        );
        PSFlashMessage.show({
          type: 'error',
          position: 'bottom',
          text1: `${translator('ps_error_leave_thread')}`,
          text2: error?.response?.data?.message ?? '',
        });
        return undefined;
      }
    },
    [chatApiClient, realm],
  );

  const disbandGroupThread = React.useCallback(
    async (threadId: string) => {
      if (!chatApiClient || !threadId) {
        return undefined;
      }
      try {
        await chatApiClient.threadApi.disbandGroup(threadId);
        PSFlashMessage.show({
          type: 'success',
          position: 'bottom',
          text1: `${translator('ps_success_disband_group')}`,
        });
        PSThreadEntity.deleteThread(realm, threadId);
      } catch (error: any) {
        psLogger.error(
          `PSThreadProfile disbandGroupThread : ${JSON.stringify(error)}`,
        );
        PSFlashMessage.show({
          type: 'error',
          position: 'bottom',
          text1: `${translator('ps_error_disband_group')}`,
          text2: error?.response?.data?.message ?? '',
        });
        return undefined;
      }
    },
    [chatApiClient, realm],
  );

  const changeNameThread = useCallback(
    async (threadId: string, name: string) => {
      const currentThread = PSThreadEntity.getFirstById(realm, threadId);
      if (currentThread && chatApiClient) {
        const infoBackup = {
          name: currentThread.name,
        };

        const infoUpdate = {
          name: name,
        };

        try {
          realm.write(() => {
            currentThread.changeInfoThread(infoUpdate);
          });

          await chatApiClient.threadApi.changeInfoThread(
            currentThread.id,
            name,
          );
        } catch (e) {
          realm.write(() => {
            currentThread.changeInfoThread(infoBackup);
          });
          psLogger.error('ActionsThreadsContext: changeNameThread', e);
          PSFlashMessage.show({
            type: 'error',
            position: 'bottom',
            text1: `${translator('ps_error_general')}`,
          });
        }
      }
    },
    [chatApiClient, realm, translator],
  );

  const changeAvatarThread = useCallback(
    async (threadId: string, image: PSUploadRequestDto) => {
      const currentThread = PSThreadEntity.getFirstById(realm, threadId);
      if (currentThread && chatApiClient) {
        const infoBackup = {
          avatar: currentThread.avatar,
        };

        const infoUpdate = {
          avatar: image.uri,
        };

        try {
          realm.write(() => {
            currentThread.changeInfoThread(infoUpdate);
          });

          const response = await chatApiClient.uploadApi.uploadImage(
            createFormData('image', [image]),
          );

          if (!response.data) {
            return;
          }

          await chatApiClient.threadApi.changeInfoThread(
            currentThread.id,
            undefined,
            {
              avatar_path: response.data.path,
              avatar_bucket: response.data.bucket,
            },
          );
        } catch (e) {
          realm.write(() => {
            currentThread.changeInfoThread(infoBackup);
          });
          psLogger.error('ActionsThreadsContext: changeAvatarThread', e);
          PSFlashMessage.show({
            type: 'error',
            position: 'bottom',
            text1: `${translator('ps_error_general')}`,
          });
        }
      }
    },
    [chatApiClient, realm, translator],
  );

  const actionThreadsContextValue = React.useMemo<ActionThreadsContextValue>(
    () => ({
      pinThread: pinThread,
      muteThread: muteThread,
      changeNameThread: changeNameThread,
      changeAvatarThread: changeAvatarThread,
      deleteThread: deleteThread,
      leaveThread,
      disbandGroupThread,
    }),
    [pinThread, muteThread, changeNameThread, changeAvatarThread, deleteThread],
  );

  return (
    <ActionThreadsContext.Provider value={actionThreadsContextValue}>
      {props.children}
    </ActionThreadsContext.Provider>
  );
};

export const useActionThreadsProviderContext = () =>
  useContext(ActionThreadsContext);
