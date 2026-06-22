import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {G, Path, Defs, ClipPath} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcDownload24 = React.memo(
  (props: IconProps) => (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <G
        clipPath="url(#clip0_1139_3660)"
        fillRule="evenodd"
        clipRule="evenodd"
        {...props}>
        <Path d="M5.833 15.166c.583 0 1.167.502 1.167 1.12v3.293c0 .837.3 1.42 1.055 1.42h11.89C20.7 21 21 20.417 21 19.58v-3.293c0-.618.583-1.12 1.166-1.12.584 0 1.167.502 1.167 1.12v3.293c0 2.073-1.517 3.754-3.389 3.754H8.054c-1.87 0-3.388-1.68-3.388-3.754v-3.293c0-.618.584-1.12 1.167-1.12z" />
        <Path d="M14 4.666c.561 0 1.016.462 1.016 1.031v10.921c0 .57-.455 1.031-1.017 1.031a1.024 1.024 0 01-1.017-1.031V5.698c0-.57.456-1.032 1.017-1.032z" />
        <Path d="M7.297 11.342a1.007 1.007 0 011.439 0l5.137 5.209c.07.07.183.07.253 0l5.137-5.21a1.007 1.007 0 011.439 0 1.042 1.042 0 010 1.46l-5.137 5.208a2.192 2.192 0 01-3.13 0L7.296 12.8a1.042 1.042 0 010-1.458z" />
      </G>
      <Defs>
        <ClipPath id="clip0_1139_3660">
          <Path d="M0 0H28V28H0z" {...props} />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
