import React from 'react';
import {createContext, useCallback, useContext, useState} from 'react';
import {ThreadActionsOverlay} from '../components/actions';
import {mapThreadEntityToModel, PSThreadEntity} from '../../../types';
import {
  usePSChatApiClientContext,
  usePSTranslationContext,
  useRealm,
} from '../../../context';
import {psLogger} from '../../../utils';
import {ThreadActionsDeleteOverlayProvider} from './PSThreadActionsDeteleOverlayContext';

const ThreadActionsOverlayContext = createContext<(threadId: string) => void>(
  () => undefined,
);

export const ThreadActionsOverlayProvider = (
  props: React.PropsWithChildren,
) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [threadId, setThreadId] = React.useState<string | undefined>();

  const chatApiClient = usePSChatApiClientContext();
  const realm = useRealm();

  const {translator} = usePSTranslationContext();

  const thread = React.useMemo(() => {
    try {
      if (chatApiClient && threadId) {
        const result = PSThreadEntity.getFirstById(realm, threadId);

        if (result?.isValid()) {
          return mapThreadEntityToModel(
            translator,
            chatApiClient.userId,
            result,
          );
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    } catch (e) {
      psLogger.error('PSThreadActionsOverlayContext: thread', e);
      return undefined;
    }
  }, [translator, chatApiClient, realm, threadId]);

  const toggleModal = useCallback(() => {
    if (isModalVisible) {
      setThreadId(undefined);
    }
    setModalVisible(!isModalVisible);
  }, [isModalVisible]);

  const show = useCallback((id: string) => {
    setModalVisible(true);
    setThreadId(id);
  }, []);

  return (
    <ThreadActionsOverlayContext.Provider value={show}>
      <ThreadActionsDeleteOverlayProvider>
        {props.children}
        {isModalVisible && thread && (
          <ThreadActionsOverlay
            isVisible={isModalVisible}
            toggleModal={toggleModal}
            thread={thread}
          />
        )}
      </ThreadActionsDeleteOverlayProvider>
    </ThreadActionsOverlayContext.Provider>
  );
};

export const useThreadActionsOverlay = () =>
  useContext(ThreadActionsOverlayContext);
