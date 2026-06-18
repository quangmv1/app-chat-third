import React from 'react';
import {PropsWithChildren} from 'react';
import {ChangeThreadNameDialog} from '../components/ChangeThreadNameDialog';
import { BlockUserComfirmDialog } from '../components';

type PSThreadProfileBlockUserContextValue = {
  show: () => void;
  hide: () => void;
};

const PSThreadProfileBlockUserContext =
  React.createContext<PSThreadProfileBlockUserContextValue>(
    {} as PSThreadProfileBlockUserContextValue,
  );

type PSThreadProfileBlockUserVisibleValue = {
  isVisible: boolean;
};

const PSThreadProfileBlockUserVisibleContext =
  React.createContext<PSThreadProfileBlockUserVisibleValue>({
    isVisible: false,
  } as PSThreadProfileBlockUserVisibleValue);

export const PSThreadProfileBlockUserProvider = ({
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
      }) as PSThreadProfileBlockUserContextValue,
    [show, hide],
  );

  const dialogValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
    };
  }, [isVisible]);

  return (
    <PSThreadProfileBlockUserContext.Provider value={value}>
      <PSThreadProfileBlockUserVisibleContext.Provider value={dialogValue}>
        {children}
        <BlockUserComfirmDialog />
      </PSThreadProfileBlockUserVisibleContext.Provider>
    </PSThreadProfileBlockUserContext.Provider>
  );
};

export const usePSThreadProfileBlockUserContext = () =>
  React.useContext(PSThreadProfileBlockUserContext);

export const usePSThreadProfileBlockUserVisibleContext = () =>
  React.useContext(PSThreadProfileBlockUserVisibleContext);
