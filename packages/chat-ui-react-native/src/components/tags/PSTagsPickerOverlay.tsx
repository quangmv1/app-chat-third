import React from 'react';
import {PSTagsPicker} from './PSTagsPicker';

export const PSTagsPickerOverlay = React.memo(() => {
  return <PSTagsPicker snapPoints={['50%', '90%']} />;
});
