import React, {PropsWithChildren} from 'react';
import {PSMessageFormModel} from '../../../types';
import {PSFormOverlay} from '../components';
import BottomSheet from '@gorhom/bottom-sheet';

type PSFormContextValue = {
  show: (form: PSMessageFormModel, messageId: number) => void;
  hide: () => void;
};

const PSFormContext = React.createContext<PSFormContextValue>(
  {} as PSFormContextValue,
);

type PSFormVisibleValue = {
  isVisible: boolean;
  form?: PSMessageFormModel | undefined;
  messageId?: number;
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSFormVisibleContext = React.createContext<PSFormVisibleValue>(
  {} as PSFormVisibleValue,
);

export const PSFormProvider = ({children}: PropsWithChildren) => {
  const isVisibleRef = React.useRef(false);

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const [isVisible, setVisible] = React.useState(false);

  const [form, setForm] = React.useState<PSMessageFormModel | undefined>(
    undefined,
  );

  const [messageId, setMessageId] = React.useState<number | undefined>(
    undefined,
  );

  const show = React.useCallback(
    (form: PSMessageFormModel, messageId: number) => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setVisible(true);
        setForm(form);
        setMessageId(messageId);
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
          setForm(undefined);
          setMessageId(undefined);
        }
      }, 500); // trick đảm bảo bottomSheetRef != null
    },
    [],
  );

  const hide = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setVisible(false);
      setForm(undefined);
      setMessageId(undefined);
    }
    bottomSheetRef?.current?.close();
  }, []);

  const value = React.useMemo(
    () =>
      ({
        show: show,
        hide: hide,
      }) as PSFormContextValue,
    [show, hide],
  );

  const dialogValue = React.useMemo(() => {
    return {
      isVisible: isVisible,
      form: form,
      messageId: messageId,
      bottomSheetRef: bottomSheetRef,
    };
  }, [isVisible, form]);

  return (
    <PSFormContext.Provider value={value}>
      <PSFormVisibleContext.Provider value={dialogValue}>
        {children}
        <PSFormOverlay />
      </PSFormVisibleContext.Provider>
    </PSFormContext.Provider>
  );
};

export const usePSFormContext = () => React.useContext(PSFormContext);

export const usePSFormVisibleContext = () =>
  React.useContext(PSFormVisibleContext);
