import React from 'react';
import {PropsWithChildren} from 'react';
import {ChangeThreadNameDialog} from '../components/ChangeThreadNameDialog';

type PSChangeThreadNameDialogContextValue = {
  show: () => void;
  hide: () => void;
};

const PSChangeThreadNameDialogContext =
  React.createContext<PSChangeThreadNameDialogContextValue>(
    {} as PSChangeThreadNameDialogContextValue,
  );

type PSChangeThreadNameDialogVisibleValue = {
  isVisible: boolean;
};

const PSChangeThreadNameDialogVisibleContext =
  React.createContext<PSChangeThreadNameDialogVisibleValue>({
    isVisible: false,
  } as PSChangeThreadNameDialogVisibleValue);

export const PSChangeThreadNameDialogProvider = ({
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
      } as PSChangeThreadNameDialogContextValue),
    [show, hide],
  );

  const dialogValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
    };
  }, [isVisible]);

  return (
    <PSChangeThreadNameDialogContext.Provider value={value}>
      <PSChangeThreadNameDialogVisibleContext.Provider value={dialogValue}>
        {children}
        <ChangeThreadNameDialog />
      </PSChangeThreadNameDialogVisibleContext.Provider>
    </PSChangeThreadNameDialogContext.Provider>
  );
};

export const usePSChangeThreadNameDialogContext = () =>
  React.useContext(PSChangeThreadNameDialogContext);

export const usePSChangeThreadNameDialogVisibleContext = () =>
  React.useContext(PSChangeThreadNameDialogVisibleContext);
