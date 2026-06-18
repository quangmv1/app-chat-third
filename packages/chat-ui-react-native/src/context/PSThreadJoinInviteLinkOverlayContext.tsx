import React from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import {PSThreadJoinInviteLinkProvider} from './PSThreadJoinInviteLinkContext';

type PSThreadJoinInviteLinkOverlayActionContextValue = {
  showThreadJoinInviteLinkOverlay: (linkId: string) => void;
  hideThreadJoinInviteLinkOverlay: () => void;
};

const PSThreadJoinInviteLinkOverlayActionContext =
  React.createContext<PSThreadJoinInviteLinkOverlayActionContextValue>(
    {} as PSThreadJoinInviteLinkOverlayActionContextValue,
  );

type PSThreadJoinInviteLinkOverlayContextValue = {
  isVisible: boolean;
  linkId?: string;
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSThreadJoinInviteLinkOverlayContext =
  React.createContext<PSThreadJoinInviteLinkOverlayContextValue>(
    {} as PSThreadJoinInviteLinkOverlayContextValue,
  );

export const PSThreadJoinInviteLinkOverlayProvider = ({
  children,
  onJoinGroupInviteLinkSuccess,
}: React.PropsWithChildren<{
  onJoinGroupInviteLinkSuccess?: ((threadId: string) => void) | null;
}>) => {
  const [isVisible, setVisible] = React.useState(false);

  const [linkId, setLinkId] = React.useState<string | undefined>(undefined);

  const isVisibleRef = React.useRef(false);

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const show = React.useCallback((linkId: string) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setVisible(true);
      setLinkId(linkId);
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
        setLinkId(undefined);
      }
    }, 500); // trick đảm bảo bottomSheetRef != null
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setLinkId(undefined);
    }
    bottomSheetRef?.current?.close();
  }, []);

  const actionContextValue = React.useMemo(
    () =>
      ({
        showThreadJoinInviteLinkOverlay: show,
        hideThreadJoinInviteLinkOverlay: hide,
      }) as PSThreadJoinInviteLinkOverlayActionContextValue,
    [show, hide],
  );

  const modalContextValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      linkId: linkId,
      bottomSheetRef: bottomSheetRef,
    };
  }, [isVisible, linkId]);

  return (
    <PSThreadJoinInviteLinkOverlayActionContext.Provider
      value={actionContextValue}>
      <PSThreadJoinInviteLinkOverlayContext.Provider value={modalContextValue}>
        <PSThreadJoinInviteLinkProvider
          onJoinGroupInviteLinkSuccess={onJoinGroupInviteLinkSuccess}>
          {children}
        </PSThreadJoinInviteLinkProvider>
      </PSThreadJoinInviteLinkOverlayContext.Provider>
    </PSThreadJoinInviteLinkOverlayActionContext.Provider>
  );
};

export const usePSThreadJoinInviteLinkOverlayContext = () =>
  React.useContext(PSThreadJoinInviteLinkOverlayContext);

export const usePSThreadJoinInviteLinkOverlayActionContext = () =>
  React.useContext(PSThreadJoinInviteLinkOverlayActionContext);
