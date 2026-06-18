import React from 'react';
import {PSMediaCollectionModel} from '../../../types';
import {MediaCollectionActionsOverlay} from '../components';

type PSMediaCollectionActionsOverlayContextValue = {
  show: (item: PSMediaCollectionModel) => void;
  hide: () => void;
};

const PSMediaCollectionActionsOverlayContext =
  React.createContext<PSMediaCollectionActionsOverlayContextValue>(
    {} as PSMediaCollectionActionsOverlayContextValue,
  );

type PSMediaCollectionActionsOverlayVisibleContextValue = {
  isVisible: boolean;
  media?: PSMediaCollectionModel;
};

const PSMediaCollectionActionsOverlayVisibleContext =
  React.createContext<PSMediaCollectionActionsOverlayVisibleContextValue>({
    isVisible: false,
    media: undefined,
  } as PSMediaCollectionActionsOverlayVisibleContextValue);

export const PSMediaCollectionActionsOverlayProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [isVisible, setVisible] = React.useState(false);

  const [media, setMedia] = React.useState<
    PSMediaCollectionModel | undefined
  >();

  const isVisibleRef = React.useRef(false);

  const show = React.useCallback((item: PSMediaCollectionModel) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setMedia(item);
      setVisible(true);
    }
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setMedia(undefined);
    }
  }, []);

  const actionContextValue = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSMediaCollectionActionsOverlayContextValue,
    [show, hide],
  );

  const modalContextValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      media: media,
    };
  }, [isVisible, media]);

  return (
    <PSMediaCollectionActionsOverlayContext.Provider value={actionContextValue}>
      <PSMediaCollectionActionsOverlayVisibleContext.Provider
        value={modalContextValue}>
        {children}
        <MediaCollectionActionsOverlay />
      </PSMediaCollectionActionsOverlayVisibleContext.Provider>
    </PSMediaCollectionActionsOverlayContext.Provider>
  );
};

export const usePSMediaCollectionActionsOverlayVisibleContext = () =>
  React.useContext(PSMediaCollectionActionsOverlayVisibleContext);

export const usePSMediaCollectionActionsOverlayContext = () =>
  React.useContext(PSMediaCollectionActionsOverlayContext);
