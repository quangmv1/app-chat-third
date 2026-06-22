import React from 'react';
import {PSModalPopup} from '../components';

export type PSPopupShowT = {
  title?: string;
  description: string;

  leftText?: string;
  colorLeftText?: string;
  backgroundLeftText?: string;
  onPressLeft?: () => void;

  rightText?: string;
  colorRightText?: string;
  backgroundRightText?: string;
  onPressRight?: () => void;
};

export type PSModalPopupT = {
  show: (param: PSPopupShowT) => void;
  close: () => void;
};

const PSPopupContext = React.createContext<PSModalPopupT>({} as PSModalPopupT);

export const PSPopupProvider = React.memo(
  ({children}: React.PropsWithChildren) => {
    const refPSModalPopup = React.useRef<PSModalPopupT>(null);

    const show = React.useCallback((param: PSPopupShowT) => {
      refPSModalPopup.current?.show(param);
    }, []);
    const close = React.useCallback(() => {
      refPSModalPopup.current?.close();
    }, []);

    const valueContext = React.useMemo(
      () => ({
        show,
        close,
      }),
      [show, close],
    );

    return (
      <PSPopupContext.Provider value={valueContext}>
        {children}
        <PSModalPopup ref={refPSModalPopup} />
      </PSPopupContext.Provider>
    );
  },
);

export const usePSPopupContext = () => React.useContext(PSPopupContext);
