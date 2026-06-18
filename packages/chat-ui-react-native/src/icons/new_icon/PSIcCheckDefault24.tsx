import React from 'react';

import {IconProps, RootPath, RootSvg} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcCheckDefault24 = React.memo(
  (props: IconProps) => (
    <RootSvg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <RootPath
        d="M20 7L10.1415 16.8585C9.69514 17.3048 8.97152 17.3048 8.52521 16.8585L4 12.3333"
        stroke="#393E40"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      />
    </RootSvg>
  ),
  (prev, next) => isEqual(prev, next),
);
