import React, {createContext, PropsWithChildren} from 'react';
import {PSFolderEntity} from '../../../types';

type PSSearchThreadFilterContextValue = {
  currentSearchThreadFilterAlias: string;
};

const PSSearchThreadFilterContext =
  createContext<PSSearchThreadFilterContextValue>(
    {} as PSSearchThreadFilterContextValue,
  );

const SetSearchThreadFilterFolderContext = createContext<
  React.Dispatch<React.SetStateAction<string>>
>(() => undefined);

export const PSSearchThreadFilterProvider = ({children}: PropsWithChildren) => {
  const [currentSearchThreadFilterAlias, setCurrentSearchThreadFilterAlias] =
    React.useState<string>(PSFolderEntity.ALL);

  const searchThreadFilterContext = React.useMemo(
    () =>
      ({
        currentSearchThreadFilterAlias: currentSearchThreadFilterAlias,
      }) as PSSearchThreadFilterContextValue,
    [currentSearchThreadFilterAlias],
  );

  return (
    <PSSearchThreadFilterContext.Provider value={searchThreadFilterContext}>
      <SetSearchThreadFilterFolderContext.Provider
        value={setCurrentSearchThreadFilterAlias}>
        {children}
      </SetSearchThreadFilterFolderContext.Provider>
    </PSSearchThreadFilterContext.Provider>
  );
};

export const usePSSearchThreadFilterContext = () =>
  React.useContext(PSSearchThreadFilterContext);

export const useSetSearchThreadFilterFolderContext = () =>
  React.useContext(SetSearchThreadFilterFolderContext);
