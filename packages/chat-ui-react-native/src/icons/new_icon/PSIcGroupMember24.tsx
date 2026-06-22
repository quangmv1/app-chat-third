import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcGroupMember24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 5.85a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8zm-4.1 2.4a4.1 4.1 0 118.2 0 4.1 4.1 0 01-8.2 0zM4.922 14.846A6.419 6.419 0 019 13.4c1.584 0 3.025.573 4.078 1.446 1.043.864 1.772 2.085 1.772 3.404a.85.85 0 11-1.7 0c0-.681-.39-1.46-1.157-2.096A4.719 4.719 0 009 15.1a4.72 4.72 0 00-2.993 1.054C5.24 16.79 4.85 17.57 4.85 18.25a.85.85 0 11-1.7 0c0-1.319.73-2.54 1.772-3.404zM16.429 9.85a1.257 1.257 0 100 2.514 1.257 1.257 0 000-2.514zm-2.958 1.257a2.957 2.957 0 115.915 0 2.957 2.957 0 01-5.915 0z"
        {...props}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.09 15.876c.811-.797 2.01-1.333 3.339-1.333 1.19 0 2.273.43 3.067 1.088.785.65 1.354 1.586 1.354 2.62a.85.85 0 11-1.7 0c0-.397-.23-.89-.738-1.31a3.128 3.128 0 00-1.983-.698c-.877 0-1.65.357-2.149.846a.85.85 0 01-1.19-1.213z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
