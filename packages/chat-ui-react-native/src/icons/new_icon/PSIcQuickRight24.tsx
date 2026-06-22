import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcQuickRight24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.24 4.254a.9.9 0 000 1.225l6.076 6.413a.159.159 0 010 .216L8.24 18.521a.9.9 0 000 1.225.79.79 0 001.161 0l6.076-6.413a1.96 1.96 0 000-2.666L9.4 4.254a.79.79 0 00-1.16 0z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
