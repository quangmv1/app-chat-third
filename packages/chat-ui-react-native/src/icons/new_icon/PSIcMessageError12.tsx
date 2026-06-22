import * as React from 'react';
import isEqual from 'react-fast-compare';
import Svg, {Path, Rect, Circle} from 'react-native-svg';
import {IconProps} from '../utils/base';

export const PSIcMessageError12 = React.memo(
  (props: IconProps) => (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none" {...props}>
      <Rect
        x={0.1875}
        y={0.1875}
        width={11.625}
        height={11.625}
        rx={5.8125}
        fill="#CC2A1E"
        stroke="#CC2A1E"
        strokeWidth={0.375}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 2.25a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V3A.75.75 0 016 2.25z"
        fill="#fff"
      />
      <Circle cx={6.0498} cy={9.25} r={0.75} fill="#fff" />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
