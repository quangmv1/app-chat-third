import {PSSessionDto} from '@communi/chat-api-client-typescript';
import React from 'react';
import {PropsWithChildren} from 'react';
import {PSSessionNoteOverlay} from '../components';

type PSSessionNoteContextValue = {
  show: (session: PSSessionDto) => void;
  hide: () => void;
};

const PSSessionNoteContext = React.createContext<PSSessionNoteContextValue>(
  {} as PSSessionNoteContextValue,
);

type PSSessionNoteVisibleValue = {
  isVisible: boolean;
  session?: PSSessionDto | undefined;
};

const PSSessionNoteVisibleContext =
  React.createContext<PSSessionNoteVisibleValue>({
    isVisible: false,
    session: undefined,
  } as PSSessionNoteVisibleValue);

export const PSSessionNoteProvider = ({children}: PropsWithChildren) => {
  const isVisibleRef = React.useRef(false);

  const [isVisible, setVisible] = React.useState(false);

  const [session, setSession] = React.useState<PSSessionDto | undefined>(
    undefined,
  );

  const show = React.useCallback((session: PSSessionDto) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setVisible(true);
      setSession(session);
    }
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setSession(undefined);
    }
  }, []);

  const value = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSSessionNoteContextValue,
    [show, hide],
  );

  const dialogValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      session: session,
    };
  }, [isVisible, session]);

  return (
    <PSSessionNoteContext.Provider value={value}>
      <PSSessionNoteVisibleContext.Provider value={dialogValue}>
        {children}
        <PSSessionNoteOverlay />
      </PSSessionNoteVisibleContext.Provider>
    </PSSessionNoteContext.Provider>
  );
};

export const usePSSessionNoteContext = () =>
  React.useContext(PSSessionNoteContext);

export const usePSSessionNoteVisibleContext = () =>
  React.useContext(PSSessionNoteVisibleContext);
