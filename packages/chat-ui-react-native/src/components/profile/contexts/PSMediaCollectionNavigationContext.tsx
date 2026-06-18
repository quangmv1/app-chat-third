import React, {createContext, PropsWithChildren, useContext} from 'react';

type PSMediaCollectionNavigationContextValue = {
  onBackPress?: null | (() => void);
  onViewMessage?: null | ((messageId: number) => void);
  onUrlPress?: null | ((url: string) => void);
  onViewFilePress?: null | ((filePath: string) => void);
  onViewFileUrlPress?: null | ((fileUrl: string) => void);
};

const PSMediaCollectionNavigationContext = createContext(
  {} as PSMediaCollectionNavigationContextValue,
);

export const PSMediaCollectionNavigationProvider = ({
  onBackPress,
  onViewMessage,
  onUrlPress,
  onViewFilePress,
  onViewFileUrlPress,
  children,
}: PropsWithChildren<PSMediaCollectionNavigationContextValue>) => {
  const navContextValue =
    React.useMemo<PSMediaCollectionNavigationContextValue>(
      () => ({
        onBackPress: onBackPress,
        onViewMessage: onViewMessage,
        onUrlPress: onUrlPress,
        onViewFilePress: onViewFilePress,
        onViewFileUrlPress: onViewFileUrlPress,
      }),
      [
        onBackPress,
        onViewMessage,
        onUrlPress,
        onViewFilePress,
        onViewFileUrlPress,
      ],
    );

  return (
    <PSMediaCollectionNavigationContext.Provider value={navContextValue}>
      {children}
    </PSMediaCollectionNavigationContext.Provider>
  );
};

export const usePSMediaCollectionNavigationContext = () =>
  useContext(PSMediaCollectionNavigationContext);
