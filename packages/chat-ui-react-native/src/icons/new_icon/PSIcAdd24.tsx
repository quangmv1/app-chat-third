import React from 'react';

import {IconProps, RootPath, RootSvg} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcAdd24 = React.memo(
  (props: IconProps) => (
    <RootSvg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <RootPath
        d="M5.00001 12.0122H19.0244"
        stroke="#393E40"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      />
      <RootPath
        d="M12.0122 5.06738V19.0918"
        stroke="#393E40"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      />
    </RootSvg>
  ),
  (prev, next) => isEqual(prev, next),
);
