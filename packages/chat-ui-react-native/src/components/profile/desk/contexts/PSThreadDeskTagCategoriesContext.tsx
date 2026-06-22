import BottomSheet from '@gorhom/bottom-sheet';
import React from 'react';
import {PropsWithChildren} from 'react';
import {PSTagCategoryModel, PSTagModel} from '../../../../types';
import {PSThreadDeskTagCategoriesOverlay} from '../components';

type PSThreadDeskTagCategoriesActionContextValue = {
  show: (category: PSTagCategoryModel, tags: PSTagModel[]) => void;
  hide: () => void;
};

const PSThreadDeskTagCategoriesActionContext =
  React.createContext<PSThreadDeskTagCategoriesActionContextValue>(
    {} as PSThreadDeskTagCategoriesActionContextValue,
  );

type PSThreadDeskTagCategoriesVisibleValue = {
  isVisible: boolean;
  category?: PSTagCategoryModel | undefined;
  tags?: PSTagModel[] | undefined;
};

const PSThreadDeskTagCategoriesVisibleContext =
  React.createContext<PSThreadDeskTagCategoriesVisibleValue>({
    isVisible: false,
  } as PSThreadDeskTagCategoriesVisibleValue);

type PSThreadDeskTagCategoriesContextValue = {
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSThreadDeskTagCategoriesContext = React.createContext(
  {} as PSThreadDeskTagCategoriesContextValue,
);

export const PSThreadDeskTagCategoriesProvider = ({
  children,
}: PropsWithChildren) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const isVisibleRef = React.useRef(false);

  const [isVisible, setVisible] = React.useState(false);

  const [currentCategory, setCurrentCategory] = React.useState<
    PSTagCategoryModel | undefined
  >(undefined);

  const [currentTags, setCurrentTags] = React.useState<
    PSTagModel[] | undefined
  >(undefined);

  const show = React.useCallback(
    (category: PSTagCategoryModel, tags: PSTagModel[]) => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setVisible(true);
        setCurrentTags(tags);
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
          setVisible(false);
          setCurrentTags(undefined);
          setCurrentCategory(undefined);
        }
      }, 500); // trick đảm bảo bottomSheetRef != null
    },
    [],
  );

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setCurrentTags(undefined);
      setCurrentCategory(undefined);
    }
    bottomSheetRef?.current?.close();
  }, []);

  const value = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSThreadDeskTagCategoriesActionContextValue,
    [show, hide],
  );

  const dialogValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      tags: currentTags,
      category: currentCategory,
    };
  }, [currentTags, currentCategory, isVisible]);

  const contextValue = React.useMemo<PSThreadDeskTagCategoriesContextValue>(
    () => ({
      bottomSheetRef: bottomSheetRef,
    }),
    [],
  );

  return (
    <PSThreadDeskTagCategoriesActionContext.Provider value={value}>
      <PSThreadDeskTagCategoriesVisibleContext.Provider value={dialogValue}>
        <PSThreadDeskTagCategoriesContext.Provider value={contextValue}>
          {children}
          <PSThreadDeskTagCategoriesOverlay />
        </PSThreadDeskTagCategoriesContext.Provider>
      </PSThreadDeskTagCategoriesVisibleContext.Provider>
    </PSThreadDeskTagCategoriesActionContext.Provider>
  );
};

export const usePSThreadDeskTagCategoriesActionContext = () =>
  React.useContext(PSThreadDeskTagCategoriesActionContext);

export const usePSThreadDeskTagCategoriesVisibleContext = () =>
  React.useContext(PSThreadDeskTagCategoriesVisibleContext);

export const usePSThreadDeskTagCategoriesContext = () =>
  React.useContext(PSThreadDeskTagCategoriesContext);
