import React, {useCallback} from 'react';
import {LinkJoinGroupActionsOverlay} from '../components';
import {
  ActionModalWarningRemoveLink,
  ModalWarningRemoveLink,
} from '../components/ModalWarningRemoveLink';

type PSLinkJoinGroupOverlayContextValue = {
  show: (link: string) => void;
  hide: () => void;
  setLink?: (link?: string) => void;
  showConfirmRemoveLink?: () => void;
};

const PSLinkJoinGroupOverlayContext =
  React.createContext<PSLinkJoinGroupOverlayContextValue>(
    {} as PSLinkJoinGroupOverlayContextValue,
  );

type PSLinkJoinGroupOverlayVisibleContextValue = {
  isVisible: boolean;
  link?: string;
};

const PSLinkJoinGroupOverlayVisibleContext =
  React.createContext<PSLinkJoinGroupOverlayVisibleContextValue>({
    isVisible: false,
    link: undefined,
  } as PSLinkJoinGroupOverlayVisibleContextValue);

export const PSLinkJoinGroupOverlayProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [isVisible, setVisible] = React.useState(false);

  const [link, setLink] = React.useState<string | undefined>();

  const isVisibleRef = React.useRef(false);

  const refModalWarningRemoveLink =
    React.useRef<ActionModalWarningRemoveLink>(null);

  const showConfirmRemoveLink = useCallback(() => {
    refModalWarningRemoveLink.current?.show();
  }, []);

  const show = React.useCallback((link: string) => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setLink(link);
      setVisible(true);
    }
  }, []);

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
    }
  }, []);

  const actionContextValue = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
        setLink,
        showConfirmRemoveLink,
      }) as PSLinkJoinGroupOverlayContextValue,
    [show, hide],
  );

  const modalContextValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      link: link,
    };
  }, [isVisible, link, showConfirmRemoveLink]);

  return (
    <PSLinkJoinGroupOverlayContext.Provider value={actionContextValue}>
      <PSLinkJoinGroupOverlayVisibleContext.Provider value={modalContextValue}>
        {children}
        <LinkJoinGroupActionsOverlay />
        <ModalWarningRemoveLink ref={refModalWarningRemoveLink} />
      </PSLinkJoinGroupOverlayVisibleContext.Provider>
    </PSLinkJoinGroupOverlayContext.Provider>
  );
};

export const usePSLinkJoinGroupOverlayVisibleContext = () =>
  React.useContext(PSLinkJoinGroupOverlayVisibleContext);

export const usePSLinkJoinGroupOverlayContext = () =>
  React.useContext(PSLinkJoinGroupOverlayContext);
