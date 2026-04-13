import * as React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';
import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';
export const PSIcInformation40 = React.memo(
  (props: IconProps) => (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
      <Circle cx={20} cy={20} r={20} fill="#1B3FE4" />
      <Path
        d="M18 30C18 28.8954 18.8954 28 20 28C21.1046 28 22 28.8954 22 30C22 31.1046 21.1046 32 20 32C18.8954 32 18 31.1046 18 30Z"
        fill="white"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 26C18.8955 26 18 24.8771 18 24V10C18 9.12285 18.8955 8 20 8C21.1045 8 22 9.12285 22 10V24C22 24.8771 21.1045 26 20 26Z"
        fill="white"
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
