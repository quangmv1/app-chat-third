import React, {PropsWithChildren, useState} from 'react';

type PSMessageMode = 'normal' | 'reply' | 'edit' | 'select';

const PSMessageModeContext = React.createContext<PSMessageMode>('normal');

const PSMessageSetModeContext = React.createContext<
  React.Dispatch<React.SetStateAction<PSMessageMode>>
>(() => undefined);

export const PSMessageModeProvider = ({children}: PropsWithChildren) => {
  const [messageMode, setMessageMode] = useState<PSMessageMode>('normal');

  return (
    <PSMessageModeContext.Provider value={messageMode}>
      <PSMessageSetModeContext.Provider value={setMessageMode}>
        {children}
      </PSMessageSetModeContext.Provider>
    </PSMessageModeContext.Provider>
  );
};

export const usePSMessageModeContext = () =>
  React.useContext(PSMessageModeContext);

export const usePSMessageSetModeContext = () =>
  React.useContext(PSMessageSetModeContext);
