import React, {PropsWithChildren} from 'react';
import {PSRatingOverlay} from '../components';
import BottomSheet from '@gorhom/bottom-sheet';

type PSRatingContextModel = {
  supportThreadId: string;
  sessionId: string;
  threadId: string;
  lockComment: boolean;
  ratingValue?: number;
  ratingComment?: string;
  messageId?: number;
};

type PSRatingContextValue = {
  show: (rating: PSRatingContextModel) => void;
  hide: () => void;
};

const PSRatingContext = React.createContext<PSRatingContextValue>(
  {} as PSRatingContextValue,
);

type PSRatingVisibleValue = {
  isVisible: boolean;
  rating?: PSRatingContextModel | undefined;
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSRatingVisibleContext = React.createContext<PSRatingVisibleValue>(
  {} as PSRatingVisibleValue,
);

export const PSRatingProvider = ({children}: PropsWithChildren) => {
  const isVisibleRef = React.useRef(false);

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const [isVisible, setVisible] = React.useState(false);

  const [rating, setRating] = React.useState<PSRatingContextModel | undefined>(
    undefined,
  );

  const show = React.useCallback((rating: PSRatingContextModel) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setVisible(true);
      setRating(rating);
    }else {
      return;
    }
    setTimeout(() => {
      const bottomSheet = bottomSheetRef?.current;
      if (bottomSheet) {
        bottomSheet.snapToIndex(0);
      } else {
        isVisibleRef.current = false;
        setVisible(false);
        setRating(undefined);
      }
    }, 500); // trick đảm bảo bottomSheetRef != null
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setRating(undefined);
    }
    bottomSheetRef?.current?.close();
  }, []);

  React.useEffect(() => {
    if (!isVisible && isVisibleRef.current) {
      isVisibleRef.current = false;
    }
  }, [isVisible]);

  const value = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSRatingContextValue,
    [show, hide],
  );

  const dialogValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      rating: rating,
      bottomSheetRef: bottomSheetRef,
    };
  }, [isVisible, rating]);

  return (
    <PSRatingContext.Provider value={value}>
      <PSRatingVisibleContext.Provider value={dialogValue}>
        {children}
        <PSRatingOverlay />
      </PSRatingVisibleContext.Provider>
    </PSRatingContext.Provider>
  );
};

export const usePSRatingContext = () => React.useContext(PSRatingContext);

export const usePSRatingVisibleContext = () =>
  React.useContext(PSRatingVisibleContext);
