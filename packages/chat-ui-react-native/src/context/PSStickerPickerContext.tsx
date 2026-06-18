import React, {PropsWithChildren} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';

type PSStickerPickerVisibleContextValue = {
  isStickerPickerShown: boolean;
};

const PSStickerPickerVisibleContext = React.createContext(
  {} as PSStickerPickerVisibleContextValue,
);

type PSStickerPickerActionContextValue = {
  closeStickerPicker: () => void;
  openStickerPicker: () => void;
};

const PSStickerPickerActionContext = React.createContext(
  {} as PSStickerPickerActionContextValue,
);

type PSStickerPickerContextValue = {
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSStickerPickerContext = React.createContext(
  {} as PSStickerPickerContextValue,
);

export const PSStickerPickerProvider = (
  props: PropsWithChildren<{
    maxNumberOfFiles?: number;
  }>,
) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const [isStickerPickerShown, setStickerPickerShown] = React.useState(false);

  const isVisibleRef = React.useRef(false);

  const openPicker = React.useCallback(() => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setStickerPickerShown(true);
    } else {
      return;
    }
    setTimeout(() => {
      const bottomSheet = bottomSheetRef?.current;
      if (bottomSheet) {
        bottomSheet.snapToIndex(0);
      } else {
        isVisibleRef.current = false;
        setStickerPickerShown(false);
      }
    }, 50); // trick đảm bảo bottomSheetRef != null
  }, []);

  const closePicker = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setStickerPickerShown(false);
    }
    bottomSheetRef?.current?.close();
  }, []);

  const contextValue = React.useMemo<PSStickerPickerContextValue>(
    () => ({
      bottomSheetRef: bottomSheetRef,
    }),
    [],
  );

  const actionContextValue = React.useMemo<PSStickerPickerActionContextValue>(
    () => ({
      openStickerPicker: openPicker,
      closeStickerPicker: closePicker,
    }),
    [openPicker, closePicker],
  );

  const visibleContextValue = React.useMemo<PSStickerPickerVisibleContextValue>(
    () => ({
      isStickerPickerShown: isStickerPickerShown,
    }),
    [isStickerPickerShown],
  );

  return (
    <PSStickerPickerVisibleContext.Provider value={visibleContextValue}>
      <PSStickerPickerActionContext.Provider value={actionContextValue}>
        <PSStickerPickerContext.Provider value={contextValue}>
          {props.children}
        </PSStickerPickerContext.Provider>
      </PSStickerPickerActionContext.Provider>
    </PSStickerPickerVisibleContext.Provider>
  );
};

export const usePSStickerPickerVisibleContext = () =>
  React.useContext(PSStickerPickerVisibleContext);

export const usePSStickerPickerActionContext = () =>
  React.useContext(PSStickerPickerActionContext);

export const usePSStickerPickerContext = () =>
  React.useContext(PSStickerPickerContext);
