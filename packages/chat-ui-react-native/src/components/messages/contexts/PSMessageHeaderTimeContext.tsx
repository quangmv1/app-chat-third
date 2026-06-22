import React, {PropsWithChildren} from 'react';

const PSMessageToShowHeaderTimeContext = React.createContext<
  string | undefined
>(undefined);

const PSMessageSetToShowHeaderTimeContext = React.createContext<
  React.Dispatch<React.SetStateAction<string | undefined>>
>(() => undefined);

export const PSMessageHeaderTimeProvider = ({children}: PropsWithChildren) => {
  const [
    messagePrimaryKeyToShowHeaderTime,
    setMessagePrimaryKeyToShowHeaderTime,
  ] = React.useState<string | undefined>();
  return (
    <PSMessageToShowHeaderTimeContext.Provider
      value={messagePrimaryKeyToShowHeaderTime}>
      <PSMessageSetToShowHeaderTimeContext.Provider
        value={setMessagePrimaryKeyToShowHeaderTime}>
        {children}
      </PSMessageSetToShowHeaderTimeContext.Provider>
    </PSMessageToShowHeaderTimeContext.Provider>
  );
};

export const usePSMessageToShowHeaderTimeContext = () =>
  React.useContext(PSMessageToShowHeaderTimeContext);

export const usePSMessageSetToShowHeaderTimeContext = () =>
  React.useContext(PSMessageSetToShowHeaderTimeContext);
