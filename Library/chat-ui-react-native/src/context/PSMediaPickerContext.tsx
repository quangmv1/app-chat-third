import React, { PropsWithChildren } from 'react';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  MediaPickerAsset,
  usePSPSMessageKeyboardAreaContext,
} from '../components';
import { useWindowDimensions } from 'react-native';
import { usePSAreaInsetsContext } from './PSAreaInsetsContext';

type PSMediaPickerVisibleContextValue = {
  isMediaPickerShown: boolean;
};

const PSMediaPickerVisibleContext = React.createContext(
  {} as PSMediaPickerVisibleContextValue,
);

type PSMediaPickerActionContextValue = {
  closeMediaPicker: () => void;
  openMediaPicker: () => void;
};

const PSMediaPickerActionContext = React.createContext(
  {} as PSMediaPickerActionContextValue,
);

type PSMediaPickerContextValue = {
  maxNumberOfFiles: number;
  setMaxNumberOfFiles: React.Dispatch<React.SetStateAction<number>>;
  selectedMedia: MediaPickerAsset[];
  setSelectedMedia: React.Dispatch<React.SetStateAction<MediaPickerAsset[]>>;
  photoError: boolean;
  setPhotoError: React.Dispatch<React.SetStateAction<boolean>>;
  bottomSheetRef: React.RefObject<BottomSheet>;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  initSnapPoints: number[];
  groupName?: string;
  setGroupName: (groupName: string) => void;
};

const PSMediaPickerContext = React.createContext(
  {} as PSMediaPickerContextValue,
);

export const PSMediaPickerProvider = (
  props: PropsWithChildren<{
    maxNumberOfFiles?: number;
  }>,
) => {
  const { keyboardHeight } = usePSPSMessageKeyboardAreaContext();
  const windowSize = useWindowDimensions();
  const topInset = usePSAreaInsetsContext().topInset;

  const [groupName, setGroupName] = React.useState<string>();

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  const [isMediaPickerShown, setMediaPickerShown] = React.useState(false);
  const [maxNumberOfFiles, setMaxNumberOfFiles] = React.useState(
    props.maxNumberOfFiles ?? 50,
  );
  const [selectedMedia, setSelectedMedia] = React.useState<MediaPickerAsset[]>(
    [],
  );
  const [photoError, setPhotoError] = React.useState(false);

  const isVisibleRef = React.useRef(false);

  const initSnapPoints = React.useMemo(() => {
    return [
      Math.max(1, keyboardHeight),
      Math.min(windowSize.height, windowSize.height - topInset),
    ];
  }, [topInset, windowSize.height, keyboardHeight]);

  const openPicker = React.useCallback(() => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setMediaPickerShown(true);
    } else {
      return;
    }
    // setTimeout(() => {
    //   const bottomSheet = bottomSheetRef?.current;
    //   if (bottomSheet) {
    //     bottomSheet.snapToIndex(0);
    //   } else {
    //     isVisibleRef.current = false;
    //     setMediaPickerShown(false);
    //   }
    // }, 500); // trick đảm bảo bottomSheetRef != null
  }, []);

  const closePicker = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setMediaPickerShown(false);
    }
    bottomSheetRef?.current?.close();
    setGroupName(undefined);
  }, []);

  React.useEffect(() => {
    if (!isMediaPickerShown && isVisibleRef.current) {
      isVisibleRef.current = false;
    }
  }, [isMediaPickerShown]);

  const contextValue = React.useMemo<PSMediaPickerContextValue>(
    () => ({
      maxNumberOfFiles: maxNumberOfFiles,
      setMaxNumberOfFiles: setMaxNumberOfFiles,
      selectedMedia: selectedMedia,
      setSelectedMedia: setSelectedMedia,
      photoError: photoError,
      setPhotoError: setPhotoError,
      bottomSheetRef: bottomSheetRef,
      bottomSheetModalRef,
      initSnapPoints,
      groupName,
      setGroupName,
    }),
    [maxNumberOfFiles, selectedMedia, photoError, initSnapPoints, groupName],
  );

  const actionContextValue = React.useMemo<PSMediaPickerActionContextValue>(
    () => ({
      openMediaPicker: openPicker,
      closeMediaPicker: closePicker,
    }),
    [openPicker, closePicker],
  );

  const visibleContextValue = React.useMemo<PSMediaPickerVisibleContextValue>(
    () => ({
      isMediaPickerShown: isMediaPickerShown,
    }),
    [isMediaPickerShown],
  );

  return (
    <PSMediaPickerVisibleContext.Provider value={visibleContextValue}>
      <PSMediaPickerActionContext.Provider value={actionContextValue}>
        <PSMediaPickerContext.Provider value={contextValue}>
          {props.children}
        </PSMediaPickerContext.Provider>
      </PSMediaPickerActionContext.Provider>
    </PSMediaPickerVisibleContext.Provider>
  );
};

export const usePSMediaPickerVisibleContext = () =>
  React.useContext(PSMediaPickerVisibleContext);

export const usePSMediaPickerActionContext = () =>
  React.useContext(PSMediaPickerActionContext);

export const usePSMediaPickerContext = () =>
  React.useContext(PSMediaPickerContext);
