import BottomSheet from '@gorhom/bottom-sheet';
import {PSSessionDto} from '@communi/chat-api-client-typescript';
import React from 'react';
import {PropsWithChildren} from 'react';
import {PSSessionLabelOverlay} from '../components';

type PSSessionLabelActionContextValue = {
  show: (session: PSSessionDto) => void;
  hide: () => void;
};

const PSSessionLabelActionContext =
  React.createContext<PSSessionLabelActionContextValue>(
    {} as PSSessionLabelActionContextValue,
  );

type PSSessionLabelVisibleValue = {
  isVisible: boolean;
  session?: PSSessionDto | undefined;
};

const PSSessionLabelVisibleContext =
  React.createContext<PSSessionLabelVisibleValue>({
    isVisible: false,
  } as PSSessionLabelVisibleValue);

type PSSessionLabelContextValue = {
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSSessionLabelContext = React.createContext(
  {} as PSSessionLabelContextValue,
);

export const PSSessionLabelProvider = ({children}: PropsWithChildren) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const isVisibleRef = React.useRef(false);

  const [isVisible, setVisible] = React.useState(false);

  const [currentSession, setCurrentSession] = React.useState<
    PSSessionDto | undefined
  >(undefined);

  const show = React.useCallback((session: PSSessionDto) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setVisible(true);
      setCurrentSession(session);
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
        setCurrentSession(undefined);
      }
    }, 500); // trick đảm bảo bottomSheetRef != null
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setCurrentSession(undefined);
    }
    bottomSheetRef?.current?.close();
  }, []);

  const value = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSSessionLabelActionContextValue,
    [show, hide],
  );

  const dialogValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      session: currentSession,
    };
  }, [currentSession, isVisible]);

  const contextValue = React.useMemo<PSSessionLabelContextValue>(
    () => ({
      bottomSheetRef: bottomSheetRef,
    }),
    [],
  );

  return (
    <PSSessionLabelActionContext.Provider value={value}>
      <PSSessionLabelVisibleContext.Provider value={dialogValue}>
        <PSSessionLabelContext.Provider value={contextValue}>
          {children}
          <PSSessionLabelOverlay />
        </PSSessionLabelContext.Provider>
      </PSSessionLabelVisibleContext.Provider>
    </PSSessionLabelActionContext.Provider>
  );
};

export const usePSSessionLabelActionContext = () =>
  React.useContext(PSSessionLabelActionContext);

export const usePSSessionLabelVisibleContext = () =>
  React.useContext(PSSessionLabelVisibleContext);

export const usePSSessionLabelContext = () =>
  React.useContext(PSSessionLabelContext);
