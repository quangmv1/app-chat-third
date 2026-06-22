import React from 'react';

import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';
import {Circle, Path, Svg} from 'react-native-svg';

export const PSIcPlayCircle40 = React.memo(
  (props: IconProps) => (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
      <Circle
        cx={20}
        cy={20}
        r={20}
        {...props}
        fillOpacity={0.5}
        fill="#010101"
      />
      <Path
        d="M29.013 18.288c1.333.77 1.33 2.695-.003 3.464l-12.007 6.917c-1.334.768-3-.195-2.998-1.735l.013-13.856c.001-1.54 1.669-2.5 3.001-1.73l11.994 6.94z"
        fill="#fff"
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
