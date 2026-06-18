import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcDropDown24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M11.293 14.293l-3.586-3.586C7.077 10.077 7.523 9 8.414 9h7.172c.89 0 1.337 1.077.707 1.707l-3.586 3.586a1 1 0 01-1.414 0z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
