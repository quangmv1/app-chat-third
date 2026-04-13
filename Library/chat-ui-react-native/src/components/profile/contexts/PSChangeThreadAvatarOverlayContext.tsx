import React from 'react';
import {PropsWithChildren} from 'react';
import {ChangeThreadAvatarOverlay} from '../components';

type PSChangeThreadAvatarOverlayContextValue = {
  show: () => void;
  hide: () => void;
};

const PSChangeThreadAvatarOverlayContext =
  React.createContext<PSChangeThreadAvatarOverlayContextValue>(
    {} as PSChangeThreadAvatarOverlayContextValue,
  );

type PSChangeThreadAvatarOverlayVisibleValue = {
  isVisible: boolean;
};

const PSChangeThreadAvatarOverlayVisibleContext =
  React.createContext<PSChangeThreadAvatarOverlayVisibleValue>({
    isVisible: false,
  } as PSChangeThreadAvatarOverlayVisibleValue);

export const PSChangeThreadAvatarOverlayProvider = ({
  children,
}: PropsWithChildren) => {
  const isVisibleRef = React.useRef(false);

  const [isVisible, setVisible] = React.useState(false);

  const show = React.useCallback(() => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setVisible(true);
    }
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
    }
  }, []);

  const value = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      } as PSChangeThreadAvatarOverlayContextValue),
    [show, hide],
  );

  const dialogValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
    };
  }, [isVisible]);

  return (
    <PSChangeThreadAvatarOverlayContext.Provider value={value}>
      <PSChangeThreadAvatarOverlayVisibleContext.Provider value={dialogValue}>
        {children}
        <ChangeThreadAvatarOverlay />
      </PSChangeThreadAvatarOverlayVisibleContext.Provider>
    </PSChangeThreadAvatarOverlayContext.Provider>
  );
};

export const usePSChangeThreadAvatarOverlayContext = () =>
  React.useContext(PSChangeThreadAvatarOverlayContext);

export const usePSChangeThreadAvatarOverlayVisibleContext = () =>
  React.useContext(PSChangeThreadAvatarOverlayVisibleContext);
