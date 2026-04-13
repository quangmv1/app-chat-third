import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcArrowRight24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M10.24 14.644a.778.778 0 000 1.123c.319.31.837.31 1.156 0l-1.157-1.123zm1.156-7.411a.835.835 0 00-1.157 0 .778.778 0 000 1.123l1.157-1.123zm0 8.534l3.045-2.957-1.156-1.123-3.046 2.957 1.157 1.123zm3.045-5.577l-3.045-2.957-1.157 1.123 3.046 2.957 1.156-1.123zm0 2.62a1.815 1.815 0 000-2.62l-1.156 1.123a.26.26 0 010 .374l1.156 1.123z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
