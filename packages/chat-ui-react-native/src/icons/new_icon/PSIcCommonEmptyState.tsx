import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {G, Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcCommonEmptyState = React.memo(
  (props: IconProps) => (
    <Svg width={140} height={88} viewBox="0 0 140 88" fill="none" {...props}>
      <G
        style={{
          mixBlendMode: 'luminosity',
        }}>
        <Path
          d="M70.5 69C89.0015 69 104 54.0015 104 35.5C104 16.9985 89.0015 2 70.5 2C51.9985 2 37 16.9985 37 35.5C37 54.0015 51.9985 69 70.5 69Z"
          fill="white"
          stroke="#C2C5C7"
          strokeWidth={2.5}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M65.1321 61.4939C66.8908 61.8185 68.6801 61.9872 70.5 62C85.1355 62 97 50.1355 97 35.5C97 20.8645 85.1355 9 70.5 9C66.7404 9 63.1636 9.78293 59.9238 11.1946C54.2938 13.6479 49.6816 17.9999 46.896 23.4419C45.0445 27.0589 44 31.1575 44 35.5C44 39.44 44.8599 43.1792 46.4021 46.5401C47.5032 48.9396 48.9521 51.1463 50.6843 53.0956"
          fill="white"
        />
        <Path
          d="M65.1321 61.4939C66.8908 61.8185 68.6801 61.9872 70.5 62C85.1355 62 97 50.1355 97 35.5C97 20.8645 85.1355 9 70.5 9C66.7404 9 63.1636 9.78293 59.9238 11.1946C54.2938 13.6479 49.6816 17.9999 46.896 23.4419C45.0445 27.0589 44 31.1575 44 35.5C44 39.44 44.8599 43.1792 46.4021 46.5401C47.5032 48.9396 48.9521 51.1463 50.6843 53.0956"
          stroke="#C2C5C7"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Path
          d="M53.7969 56.0781C55.945 57.8241 58.3718 59.2404 61.0003 60.25"
          stroke="#C2C5C7"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Path d="M98 62L104 68" stroke="#C2C5C7" strokeWidth={2.5} />
        <Path
          opacity={0.5}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M103.029 67.0289C101.136 68.9216 101.136 71.9903 103.029 73.883L114.114 84.9683C116.007 86.861 119.076 86.861 120.968 84.9683C122.861 83.0756 122.861 80.0069 120.968 78.1142L109.883 67.0289C107.99 65.1362 104.922 65.1362 103.029 67.0289Z"
          fill="#C2C5C7"
          stroke="#C2C5C7"
          strokeWidth={2.5}
        />
        <Path
          d="M108 69L119 80"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Path
          opacity={0.5}
          d="M63.5005 24.0005C63.5005 35.8746 73.1264 45.5005 85.0005 45.5005C86.9527 45.5005 88.8448 45.2402 90.6437 44.7522C87.1386 52.3717 79.4367 57.6612 70.5005 57.6612C58.2615 57.6612 48.3398 47.7395 48.3398 35.5005C48.3398 24.7757 55.9588 15.8296 66.0793 13.7808C64.4345 16.8215 63.5005 20.3026 63.5005 24.0005Z"
          fill="#C2C5C7"
          stroke="#C2C5C7"
        />
        <Path
          d="M71 17C69.7266 17 68.4825 17.1253 67.2793 17.3642M63.6447 18.4761C56.8039 21.3508 52 28.1144 52 36"
          stroke="#C2C5C7"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Path
          d="M124.176 35.7773H116M130.5 28H113.324H130.5ZM137.5 28H135.279H137.5Z"
          stroke="#C2C5C7"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M34.1763 57.7773H26.0005M29.5005 49H12.3247H29.5005ZM6.50049 49H2.2793H6.50049Z"
          stroke="#C2C5C7"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
