import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {G, Path, Defs, ClipPath} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcMenuInfo24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G
        clipPath="url(#clip0_1094_30943)"
        fillRule="evenodd"
        clipRule="evenodd"
        {...props}>
        <Path d="M7.669 6.85c0-.47.376-.85.84-.85h11.366c.464 0 .84.38.84.85s-.376.85-.84.85H8.509a.845.845 0 01-.84-.85zM3 6.85c0-.47.376-.85.84-.85h.988c.464 0 .84.38.84.85s-.376.85-.84.85H3.84A.845.845 0 013 6.85zM7.669 11.85c0-.47.376-.85.84-.85h11.366c.464 0 .84.38.84.85s-.376.85-.84.85H8.509a.845.845 0 01-.84-.85zM3 11.85c0-.47.376-.85.84-.85h.988c.464 0 .84.38.84.85s-.376.85-.84.85H3.84a.845.845 0 01-.84-.85zM7.669 16.85c0-.47.376-.85.84-.85h11.366c.464 0 .84.38.84.85s-.376.85-.84.85H8.509a.845.845 0 01-.84-.85zM3 16.85c0-.47.376-.85.84-.85h.988c.464 0 .84.38.84.85s-.376.85-.84.85H3.84a.845.845 0 01-.84-.85z" />
      </G>
      <Defs>
        <ClipPath id="clip0_1094_30943">
          <Path d="M0 0H24V24H0z" {...props} />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
