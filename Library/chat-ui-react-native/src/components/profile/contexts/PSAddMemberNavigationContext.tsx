import React, {createContext, PropsWithChildren, useContext} from 'react';

type PSAddMemberNavigationContextValue = {
  onBackPress?: null | (() => void);
  onAddParticipantsSuccess?: null | (() => void);
};

const PSAddMemberNavigationContext = createContext(
  {} as PSAddMemberNavigationContextValue,
);

export const PSAddMemberNavigationProvider = ({
  onBackPress,
  onAddParticipantsSuccess,
  children,
}: PropsWithChildren<PSAddMemberNavigationContextValue>) => {
  const navContextValue = React.useMemo<PSAddMemberNavigationContextValue>(
    () => ({
      onBackPress: onBackPress,
      onAddParticipantsSuccess: onAddParticipantsSuccess,
    }),
    [onAddParticipantsSuccess, onBackPress],
  );

  return (
    <PSAddMemberNavigationContext.Provider value={navContextValue}>
      {children}
    </PSAddMemberNavigationContext.Provider>
  );
};

export const usePSAddMemberNavigationContext = () =>
  useContext(PSAddMemberNavigationContext);
