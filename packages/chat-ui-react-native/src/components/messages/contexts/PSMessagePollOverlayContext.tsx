import React from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import {PSMessagePollVotedUsersOverlayProps} from '../components';

type PSMessagePollOverlayActionContextValue = {
  show: (
    messageId: number,
    pollId: string,
    optionId: string,
    voteCount: number,
  ) => void;
  hide: () => void;
};

const PSMessagePollOverlayActionContext =
  React.createContext<PSMessagePollOverlayActionContextValue>(
    {} as PSMessagePollOverlayActionContextValue,
  );

type PSMessagePollOverlayContextValue = {
  isVisible: boolean;
  bottomSheetRef: React.RefObject<BottomSheet>;
  usersVotedOverlayProps?: PSMessagePollVotedUsersOverlayProps;
};

const PSMessagePollOverlayContext =
  React.createContext<PSMessagePollOverlayContextValue>(
    {} as PSMessagePollOverlayContextValue,
  );

export const PSMessagePollOverlayProvider = (
  props: React.PropsWithChildren,
) => {
  //   const chatApiClient = usePSChatApiClientContext();

  //   const realm = useRealm();

  //   const currentThreadId = usePSMessageCurrentThreadIdContext();

  const [isVisible, setVisible] = React.useState(false);

  const isVisibleRef = React.useRef(false);

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const [usersVotedOverlayProps, setUsersVotedOverlayProps] = React.useState<
    PSMessagePollVotedUsersOverlayProps | undefined
  >(undefined);

  //   const [selectedIndex, setSelectedIndex] = React.useState(0);

  const show = React.useCallback(
    (
      messageId: number,
      pollId: string,
      optionId: string,
      voteCount: number,
    ) => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setVisible(true);
        setUsersVotedOverlayProps({
          messageId: messageId,
          pollId: pollId,
          optionId: optionId,
          voteCount: voteCount,
        } as PSMessagePollVotedUsersOverlayProps);
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
          setUsersVotedOverlayProps(undefined);
        }
      }, 500); // trick đảm bảo bottomSheetRef != null
    },
    [],
  );

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setUsersVotedOverlayProps(undefined);
    }
    bottomSheetRef?.current?.close();
  }, []);

  React.useEffect(() => {
    if (!isVisible && isVisibleRef.current) {
      isVisibleRef.current = false;
    }
  }, [isVisible]);

  //   const message = React.useMemo(() => {
  //     try {
  //       if (chatApiClient && currentThreadId && messageId) {
  //         const result =
  //           PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
  //             realm,
  //             currentThreadId,
  //             messageId,
  //           );

  //         if (result) {
  //           return mapMessageEntityToModel(
  //             chatApiClient.userId,
  //             result,
  //             [],
  //             PSMessagePosition.NORMAL,
  //             true,
  //           );
  //         } else {
  //           hide();
  //           return undefined;
  //         }
  //       } else {
  //         hide();
  //         return undefined;
  //       }
  //     } catch (e) {
  //       psLogger.error('PSMessagePollOverlayProvider: message', e);
  //       return undefined;
  //     }
  //   }, [chatApiClient, realm, currentThreadId, messageId, hide]);

  const actionContextValue = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSMessagePollOverlayActionContextValue,
    [show, hide],
  );

  const modalContextValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      bottomSheetRef: bottomSheetRef,
      usersVotedOverlayProps: usersVotedOverlayProps,
    } as PSMessagePollOverlayContextValue;
  }, [isVisible, usersVotedOverlayProps]);

  return (
    <PSMessagePollOverlayActionContext.Provider value={actionContextValue}>
      <PSMessagePollOverlayContext.Provider value={modalContextValue}>
        {props.children}
      </PSMessagePollOverlayContext.Provider>
    </PSMessagePollOverlayActionContext.Provider>
  );
};

export const usePSMessagePollOverlayContext = () =>
  React.useContext(PSMessagePollOverlayContext);

export const usePSMessagePollOverlayActionContext = () =>
  React.useContext(PSMessagePollOverlayActionContext);
