import React, {PropsWithChildren} from 'react';
import {
  usePSMessageModeContext,
  usePSMessageSetModeContext,
} from './PSMessageModeContext';
import cloneDeep from 'lodash.clonedeep';

const PSSelectMessageContext = React.createContext<number[]>([]);

const PSSelectMessageIsEnabledContext = React.createContext<boolean>(false);

type SelectMessageActionContextValue = {
  selectMessage: (messageId: number) => void;
  cancelSelectMessage: () => void;
};

const PSSelectMessageActionContext =
  React.createContext<SelectMessageActionContextValue>(
    {} as SelectMessageActionContextValue,
  );

export const PSSelectMessageProvider = ({children}: PropsWithChildren) => {
  const messageMode = usePSMessageModeContext();

  const setMessageMode = usePSMessageSetModeContext();

  const [selectMessageIds, setSelectMessageIds] = React.useState<number[]>([]);

  const selectMessage = React.useCallback((messageId: number) => {
    setMessageMode(prev => {
      if (prev !== 'select') {
        return 'select';
      }
      return prev;
    });
    setSelectMessageIds(prev => {
      const newValue = cloneDeep(prev);
      if (prev.includes(messageId)) {
        return newValue.filter(item => item !== messageId);
      } else {
        return cloneDeep([...prev, messageId]);
      }
    });
  }, []);

  const cancelSelectMessage = React.useCallback(() => {
    setMessageMode('normal');
    setSelectMessageIds([]);
  }, []);

  const actionContextValue = React.useMemo(() => {
    return {
      selectMessage: selectMessage,
      cancelSelectMessage: cancelSelectMessage,
    } as SelectMessageActionContextValue;
  }, [selectMessage, cancelSelectMessage]);

  return (
    <PSSelectMessageContext.Provider value={selectMessageIds}>
      <PSSelectMessageActionContext.Provider value={actionContextValue}>
        <PSSelectMessageIsEnabledContext.Provider
          value={messageMode === 'select'}>
          {children}
        </PSSelectMessageIsEnabledContext.Provider>
      </PSSelectMessageActionContext.Provider>
    </PSSelectMessageContext.Provider>
  );
};

export const usePSSelectMessageContext = () =>
  React.useContext(PSSelectMessageContext);

export const usePSSelectMessageActionContext = () =>
  React.useContext(PSSelectMessageActionContext);

export const usePSSelectMessageIsEnabledContext = () =>
  React.useContext(PSSelectMessageIsEnabledContext);
