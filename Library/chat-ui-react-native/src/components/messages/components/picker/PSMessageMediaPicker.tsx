import React from 'react';
import {PSMediaPicker} from '../../../media-picker';
import {usePSPSMessageKeyboardAreaContext} from '../../contexts';

export const PSMessageMediaPicker = React.memo(() => {
  const keyboardHeight = usePSPSMessageKeyboardAreaContext()?.keyboardHeight;

  return <PSMediaPicker errorHeight={Math.max(1, keyboardHeight)} />;
});
