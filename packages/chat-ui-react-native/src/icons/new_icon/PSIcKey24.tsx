import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcKey24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.71 13.379c.491 0 .946.262 1.193.688a4.136 4.136 0 100-4.134 1.378 1.378 0 01-1.194.688H5.947L4.569 12l1.379 1.379h4.761zm0 1.378a5.514 5.514 0 100-5.514H5.755a.919.919 0 00-.65.27L3.27 11.35a.919.919 0 000 1.3l1.838 1.838a.92.92 0 00.65.27h4.952z"
        {...props}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 12.5a.5.5 0 100-1 .5.5 0 000 1zm2-.5a2 2 0 11-4 0 2 2 0 014 0z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
