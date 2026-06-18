import React, {PropsWithChildren} from 'react';
import {ChangeThreadProfileOverlay} from '../components';
import {PSChangeThreadAvatarOverlayProvider} from './PSChangeThreadAvatarOverlayContext';
import {PSChangeThreadNameDialogProvider} from './PSChangeThreadNameDialogContext';

export enum PSChangeThreadProfileType {
  AVATAR = 'AVATAR',
  NAME_DESCRIPTION = 'NAME_DESCRIPTION',
}

type PSChangeThreadProfileContextValue = {
  show: (type: PSChangeThreadProfileType) => void;
  hide: () => void;
};

const PSChangeThreadProfileContext =
  React.createContext<PSChangeThreadProfileContextValue>(
    {} as PSChangeThreadProfileContextValue,
  );

type PSChangeThreadProfileVisibleContextValue = {
  isVisible: boolean;
  type: PSChangeThreadProfileType | undefined;
};

const PSChangeThreadProfileVisibleContext =
  React.createContext<PSChangeThreadProfileVisibleContextValue>({
    isVisible: false,
    type: undefined,
  } as PSChangeThreadProfileVisibleContextValue);

export const PSChangeThreadProfileProvider = ({
  children,
}: PropsWithChildren) => {
  const [isVisible, setVisible] = React.useState(false);

  const [type, setType] = React.useState<
    PSChangeThreadProfileType | undefined
  >();

  const isVisibleRef = React.useRef(false);

  const show = React.useCallback((typeChange: PSChangeThreadProfileType) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setVisible(true);
      setType(typeChange);
    }
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setType(undefined);
    }
  }, []);

  const value = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      } as PSChangeThreadProfileContextValue),
    [show, hide],
  );

  const modalValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      type: type,
    };
  }, [isVisible, type]);

  return (
    <PSChangeThreadProfileContext.Provider value={value}>
      <PSChangeThreadProfileVisibleContext.Provider value={modalValue}>
        <PSChangeThreadAvatarOverlayProvider>
          <PSChangeThreadNameDialogProvider>
            {children}
            <ChangeThreadProfileOverlay />
          </PSChangeThreadNameDialogProvider>
        </PSChangeThreadAvatarOverlayProvider>
      </PSChangeThreadProfileVisibleContext.Provider>
    </PSChangeThreadProfileContext.Provider>
  );
};

export const usePSChangeThreadProfileContext = () =>
  React.useContext(PSChangeThreadProfileContext);

export const usePSChangeThreadProfileVisibleContext = () =>
  React.useContext(PSChangeThreadProfileVisibleContext);
