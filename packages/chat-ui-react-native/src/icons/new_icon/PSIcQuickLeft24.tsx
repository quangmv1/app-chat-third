import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcQuickLeft24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.76 4.254a.9.9 0 010 1.225l-6.076 6.413a.159.159 0 000 .216l6.076 6.413a.9.9 0 010 1.225.79.79 0 01-1.161 0l-6.076-6.413a1.96 1.96 0 010-2.666L14.6 4.254a.79.79 0 011.16 0z"
        {...props}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.49 4.15a.94.94 0 011.378 0 1.05 1.05 0 010 1.432l-6.076 6.413-.001.005.001.005 6.076 6.413a1.05 1.05 0 010 1.431.94.94 0 01-1.378 0l-6.076-6.413a2.11 2.11 0 010-2.873L14.49 4.15zm1.16.206a.64.64 0 00-.943 0L8.633 10.77a1.81 1.81 0 000 2.46l6.075 6.413a.64.64 0 00.943 0 .75.75 0 000-1.019l-6.075-6.413a.309.309 0 010-.423l6.075-6.413a.75.75 0 000-1.019z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
