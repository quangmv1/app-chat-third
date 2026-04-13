import React, {createContext, PropsWithChildren} from 'react';
import {PSFolderEntity} from '../../../types';
import {PSThreadListUserTypePCLProvider} from './PSThreadListUserTypePCLContext';

type FolderContextValue = {
  currentFolderAlias: string;
};

const FolderContext = createContext<FolderContextValue>(
  {} as FolderContextValue,
);

const SetFolderContext = createContext<
  React.Dispatch<React.SetStateAction<string>>
>(() => undefined);

export const FolderProvider = ({children}: PropsWithChildren) => {
  const [currentFolderAlias, setCurrentFolderAlias] = React.useState<string>(
    PSFolderEntity.ALL,
  );

  const folderContextValue = React.useMemo(
    () =>
      ({
        currentFolderAlias: currentFolderAlias,
      }) as FolderContextValue,
    [currentFolderAlias],
  );

  return (
    <FolderContext.Provider value={folderContextValue}>
      <SetFolderContext.Provider value={setCurrentFolderAlias}>
        <PSThreadListUserTypePCLProvider>
          {children}
        </PSThreadListUserTypePCLProvider>
      </SetFolderContext.Provider>
    </FolderContext.Provider>
  );
};

export const useFolderContext = () => React.useContext(FolderContext);

export const useSetFolderContext = () => React.useContext(SetFolderContext);
