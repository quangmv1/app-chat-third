import React from 'react';

import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';
import Svg, {Path} from 'react-native-svg';

export const PSIcTick24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M19.707 7.541a1 1 0 00-1.414-1.414l-8.625 8.625-3.961-3.96a1 1 0 00-1.414 1.415l4.668 4.666a1 1 0 001.414 0l9.332-9.332z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
