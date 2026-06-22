//#conditional

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {TextInput} from 'react-native';
import {psLogger} from '../utils';

const SHOW_RENDER_COUNTERS = false;

export const useRenderCounter = (
  name: string = '',
  condition: boolean = true,
) => {
  //#if DEBUG
  const renderCount = React.useRef(0);

  if (SHOW_RENDER_COUNTERS && condition) {
    renderCount.current = renderCount.current + 1;

    if (name) {
      psLogger.warn(`${name}: renderCount = ${renderCount.current}`);
    }

    return (
      <TextInput
        style={{
          backgroundColor: 'hsl(0, 100%, 50%)',
          borderRadius: 6,
          color: 'hsl(0, 0%, 100%)',
          fontSize: 10,
          fontWeight: 'bold',
          height: 35,
          margin: 2,
          textAlign: 'center',
          width: 35,
        }}
        value={String(renderCount.current)}
      />
    );
  }
  //#endif
  return null;
};
