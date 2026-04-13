import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcCopy24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_7_246394)">
        <Path
          d="M17 8V5.5V5.5C17 4.67157 16.3284 4 15.5 4H7C5.89543 4 5 4.89543 5 6V14C5 15.1046 5.89543 16 7 16H8"
          stroke="#393E40"
          strokeWidth={1.5}
        />
        <Rect
          x={8}
          y={8}
          width={12}
          height={12}
          rx={2}
          stroke="#393E40"
          strokeWidth={1.5}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_7_246394">
          <Rect width={24} height={24} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
