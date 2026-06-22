import React, {PropsWithChildren} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import {PSTagCategoryModel, PSTagModel} from '../../../types';

type PSTagsPickerVisibleContextValue = {
  isTagsPickerShown: boolean;
  category?: PSTagCategoryModel | undefined;
  tag?: PSTagModel | undefined;
};

const PSTagsPickerVisibleContext = React.createContext(
  {} as PSTagsPickerVisibleContextValue,
);

type PSTagsPickerActionContextValue = {
  closeTagsPicker: () => void;
  openTagsPicker: (category: PSTagCategoryModel, tag: PSTagModel) => void;
};

const PSTagsPickerActionContext = React.createContext(
  {} as PSTagsPickerActionContextValue,
);

type PSTagsPickerContextValue = {
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSTagsPickerContext = React.createContext({} as PSTagsPickerContextValue);

export const PSTagsPickerProvider = (props: PropsWithChildren) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const [isTagsPickerShown, setTagsPickerShown] = React.useState(false);

  const isVisibleRef = React.useRef(false);

  const [currentCategory, setCurrentCategory] = React.useState<
    PSTagCategoryModel | undefined
  >(undefined);

  const [currentTag, setCurrentTag] = React.useState<PSTagModel | undefined>(
    undefined,
  );

  const openPicker = React.useCallback(
    (category: PSTagCategoryModel, tag: PSTagModel) => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setTagsPickerShown(true);
        setCurrentTag(tag);
        setCurrentCategory(category);
      } else {
        return;
      }
      setTimeout(() => {
        const bottomSheet = bottomSheetRef?.current;
        if (bottomSheet) {
          bottomSheet.snapToIndex(0);
        } else {
          isVisibleRef.current = false;
          setTagsPickerShown(false);
          setCurrentTag(undefined);
          setCurrentCategory(undefined);
        }
      }, 500); // trick đảm bảo bottomSheetRef != null
    },
    [],
  );

  const closePicker = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setTagsPickerShown(false);
      setCurrentTag(undefined);
      setCurrentCategory(undefined);
    }
    bottomSheetRef?.current?.close();
  }, []);

  const contextValue = React.useMemo<PSTagsPickerContextValue>(
    () => ({
      bottomSheetRef: bottomSheetRef,
    }),
    [],
  );

  const actionContextValue = React.useMemo<PSTagsPickerActionContextValue>(
    () => ({
      openTagsPicker: openPicker,
      closeTagsPicker: closePicker,
    }),
    [openPicker, closePicker],
  );

  const visibleContextValue = React.useMemo<PSTagsPickerVisibleContextValue>(
    () => ({
      isTagsPickerShown: isTagsPickerShown,
      tag: currentTag,
      category: currentCategory,
    }),
    [currentTag, isTagsPickerShown],
  );

  return (
    <PSTagsPickerVisibleContext.Provider value={visibleContextValue}>
      <PSTagsPickerActionContext.Provider value={actionContextValue}>
        <PSTagsPickerContext.Provider value={contextValue}>
          {props.children}
        </PSTagsPickerContext.Provider>
      </PSTagsPickerActionContext.Provider>
    </PSTagsPickerVisibleContext.Provider>
  );
};

export const usePSTagsPickerVisibleContext = () =>
  React.useContext(PSTagsPickerVisibleContext);

export const usePSTagsPickerActionContext = () =>
  React.useContext(PSTagsPickerActionContext);

export const usePSTagsPickerContext = () =>
  React.useContext(PSTagsPickerContext);
