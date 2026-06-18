import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {Path, Circle} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcInformation24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 19.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15zm0 1.5a9 9 0 100-18 9 9 0 000 18z"
        {...props}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.981 16.164a.718.718 0 01-.718-.718v-4.255a.718.718 0 111.436 0v4.255a.718.718 0 01-.718.718z"
        {...props}
      />
      <Circle
        cx={12.003}
        cy={8.79792}
        r={0.797787}
        transform="rotate(-180 12.003 8.798)"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
