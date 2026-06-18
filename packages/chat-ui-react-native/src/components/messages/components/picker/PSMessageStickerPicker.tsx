import React from 'react';
import {usePSPSMessageKeyboardAreaContext} from '../../contexts';
import {PSStickerPicker} from '../../../sticker-picker';

export const PSMessageStickerPicker = React.memo(() => {
  const {keyboardHeight} = usePSPSMessageKeyboardAreaContext();

  return <PSStickerPicker snapPoints={[Math.max(1, keyboardHeight)]} />;
});
