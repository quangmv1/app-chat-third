import React, {PropsWithChildren} from 'react';
import {useRealm} from './PSRealmContext';
import {PSThreadEntity} from '../types';
import {usePSChatApiClientContext} from './PSChatApiClientContext';
import {psLogger} from '../utils';
import {PSThreadType} from '@communi/chat-api-client-typescript';
import {usePSMqttClientConnectedContext} from './PSMqttClientContext';

export const PSCreateThreadDefaultProvider = ({
  userId,
  children,
}: PropsWithChildren<{userId?: string}>) => {
  const realm = useRealm();

  const isMqttConnected = usePSMqttClientConnectedContext();

  const chatApiClient = usePSChatApiClientContext();

  React.useEffect(() => {
    if (!userId) return;

    const cachedThread = PSThreadEntity.getFirstByPartnerId(realm, userId);

    if (!!cachedThread || !chatApiClient || !isMqttConnected) return;

    const createThread = async () => {
      try {
        await chatApiClient.threadApi.createThread({
          type: PSThreadType.DIRECT,
          member_ids: [userId],
          add_to_thread_list_immediately: true,
        });
      } catch (error) {
        psLogger.error(
          'PSCreateThreadDefaultProvider: createThread => ',
          error,
        );
      }
    };

    const timeout = setTimeout(() => {
      createThread();
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [realm, userId, chatApiClient, isMqttConnected]);

  return children;
};
