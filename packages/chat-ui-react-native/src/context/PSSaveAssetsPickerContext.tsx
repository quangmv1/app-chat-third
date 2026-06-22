import React from 'react';
import {MediaPickerAsset} from '../components';

type PSSaveAssetsPickerContextValue = {
  assets: MediaPickerAsset[];
  setAssets: React.Dispatch<React.SetStateAction<MediaPickerAsset[]>>;
};

const PSSaveAssetsPickerContext = React.createContext(
  {} as PSSaveAssetsPickerContextValue,
);

export const PSSaveAssetsPickerProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [assets, setAssets] = React.useState<MediaPickerAsset[]>([]);

  const value = React.useMemo(() => {
    return {
      assets: assets,
      setAssets: setAssets,
    } as PSSaveAssetsPickerContextValue;
  }, [assets]);

  return (
    <PSSaveAssetsPickerContext.Provider value={value}>
      {children}
    </PSSaveAssetsPickerContext.Provider>
  );
};

export const usePSSaveAssetsPickerContext = () =>
  React.useContext(PSSaveAssetsPickerContext);
