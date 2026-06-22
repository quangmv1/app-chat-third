import React from 'react';
import {usePSChatApiClientContext, useRealm} from '../../../context';
import {
  mapMessageEntityToModel,
  PSMessageEntity,
  PSMessagePosition,
  PSMessageReactionModel,
} from '../../../types';
import {usePSMessageCurrentThreadIdContext} from './PSMessageCurrentThreadContext';
import {psLogger} from '../../../utils';
import BottomSheet from '@gorhom/bottom-sheet';
import {useDeepCompareMemoize} from '../../../hooks';

type PSMessageReactionsOverlayActionContextValue = {
  show: (messageId: number, index: number) => void;
  hide: () => void;
};

const PSMessageReactionsOverlayActionContext =
  React.createContext<PSMessageReactionsOverlayActionContextValue>(
    {} as PSMessageReactionsOverlayActionContextValue,
  );

type PSMessageReactionsOverlayContextValue = {
  isVisible: boolean;
  reactions: PSMessageReactionModel[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSMessageReactionsOverlayContext =
  React.createContext<PSMessageReactionsOverlayContextValue>(
    {} as PSMessageReactionsOverlayContextValue,
  );

export const PSMessageReactionsOverlayProvider = (
  props: React.PropsWithChildren,
) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const [isVisible, setVisible] = React.useState(false);

  const isVisibleRef = React.useRef(false);

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const [messageId, setMessageId] = React.useState<number | undefined>();

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const show = React.useCallback((id: number, index: number) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setSelectedIndex(index);
      setMessageId(id);
      setVisible(true);
    } else {
      return;
    }
    setTimeout(() => {
      const bottomSheet = bottomSheetRef?.current;
      if (bottomSheet) {
        bottomSheet.snapToIndex(0);
      } else {
        isVisibleRef.current = false;
        setVisible(false);
        setMessageId(undefined);
        setSelectedIndex(0);
      }
    }, 500); // trick đảm bảo bottomSheetRef != null
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setMessageId(undefined);
      setSelectedIndex(0);
    }
    bottomSheetRef?.current?.close();
  }, []);

  React.useEffect(() => {
    if (!isVisible && isVisibleRef.current) {
      isVisibleRef.current = false;
    }
  }, [isVisible]);

  const message = React.useMemo(() => {
    try {
      if (chatApiClient && currentThreadId && messageId) {
        const result =
          PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
            realm,
            currentThreadId,
            messageId,
          );

        if (result) {
          return mapMessageEntityToModel(
            chatApiClient.userId,
            result,
            [],
            PSMessagePosition.NORMAL,
            true,
          );
        } else {
          hide();
          return undefined;
        }
      } else {
        hide();
        return undefined;
      }
    } catch (e) {
      psLogger.error('PSMessageReactionsOverlayProvider: message', e);
      return undefined;
    }
  }, [chatApiClient, realm, currentThreadId, messageId, hide]);

  const actionContextValue = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSMessageReactionsOverlayActionContextValue,
    [show, hide],
  );

  const modalContextValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      reactions: message?.reactions ?? [],
      selectedIndex: selectedIndex,
      setSelectedIndex: setSelectedIndex,
      bottomSheetRef: bottomSheetRef,
    };
  }, [isVisible, selectedIndex, useDeepCompareMemoize(message?.reactions)]);

  return (
    <PSMessageReactionsOverlayActionContext.Provider value={actionContextValue}>
      <PSMessageReactionsOverlayContext.Provider value={modalContextValue}>
        {props.children}
      </PSMessageReactionsOverlayContext.Provider>
    </PSMessageReactionsOverlayActionContext.Provider>
  );
};

export const usePSMessageReactionsOverlayContext = () =>
  React.useContext(PSMessageReactionsOverlayContext);

export const usePSMessageReactionsOverlayActionContext = () =>
  React.useContext(PSMessageReactionsOverlayActionContext);
