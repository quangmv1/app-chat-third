import React from 'react';
import {PSUserModel} from '../../../types';
import BottomSheet from '@gorhom/bottom-sheet';
import {useDeepCompareMemoize} from '../../../hooks';

type PSMessageSeenUserOverlayActionContextValue = {
  show: (seenUsers: PSUserModel[]) => void;
  hide: () => void;
};

const PSMessageSeenUserOverlayActionContext =
  React.createContext<PSMessageSeenUserOverlayActionContextValue>(
    {} as PSMessageSeenUserOverlayActionContextValue,
  );

type PSMessageSeenUserOverlayContextValue = {
  isVisible: boolean;
  seenUsers: PSUserModel[];
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSMessageSeenUserOverlayContext =
  React.createContext<PSMessageSeenUserOverlayContextValue>(
    {} as PSMessageSeenUserOverlayContextValue,
  );

export const PSMessageSeenUserOverlayProvider = (
  props: React.PropsWithChildren,
) => {
  const [isVisible, setVisible] = React.useState(false);

  const [seenUsers, setSeenUsers] = React.useState<PSUserModel[] | undefined>(
    undefined,
  );

  const isVisibleRef = React.useRef(false);

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const show = React.useCallback((users: PSUserModel[]) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setVisible(true);
      setSeenUsers(users);
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
        setSeenUsers(undefined);
      }
    }, 500); // trick đảm bảo bottomSheetRef != null
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setSeenUsers(undefined);
    }
    bottomSheetRef?.current?.close();
  }, []);

  const actionContextValue = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSMessageSeenUserOverlayActionContextValue,
    [show, hide],
  );

  const modalContextValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      seenUsers: seenUsers ?? [],
      bottomSheetRef: bottomSheetRef,
    };
  }, [isVisible, useDeepCompareMemoize(seenUsers)]);

  return (
    <PSMessageSeenUserOverlayActionContext.Provider value={actionContextValue}>
      <PSMessageSeenUserOverlayContext.Provider value={modalContextValue}>
        {props.children}
      </PSMessageSeenUserOverlayContext.Provider>
    </PSMessageSeenUserOverlayActionContext.Provider>
  );
};

export const usePSMessageSeenUserOverlayContext = () =>
  React.useContext(PSMessageSeenUserOverlayContext);

export const usePSMessageSeenUserOverlayActionContext = () =>
  React.useContext(PSMessageSeenUserOverlayActionContext);
