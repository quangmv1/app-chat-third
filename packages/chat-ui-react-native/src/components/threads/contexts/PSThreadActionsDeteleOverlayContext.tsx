import React, {createContext, useCallback, useContext, useState} from 'react';
import {
  usePSChatApiClientContext,
  usePSTranslationContext,
  useRealm,
} from '../../../context';
import {PSThreadEntity, mapThreadEntityToModel} from '../../../types';
import {psLogger} from '../../../utils';
import {ThreadActionsDeleteOverlay} from '../components/actions';

const PSThreadActionsDeteleOverlayContext = createContext<
  (threadId: string) => void
>(() => undefined);

export const ThreadActionsDeleteOverlayProvider = (
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
      psLogger.error('PSThreadActionsDeteleOverlayContext: thread', e);
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
    <PSThreadActionsDeteleOverlayContext.Provider value={show}>
      {props.children}
      {isModalVisible && thread && (
        <ThreadActionsDeleteOverlay
          isVisible={isModalVisible}
          toggleModal={toggleModal}
          thread={thread}
        />
      )}
    </PSThreadActionsDeteleOverlayContext.Provider>
  );
};

export const useThreadActionsDeleteOverlay = () =>
  useContext(PSThreadActionsDeteleOverlayContext);
