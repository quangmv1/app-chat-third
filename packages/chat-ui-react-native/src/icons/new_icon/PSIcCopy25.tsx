import * as React from 'react';
import isEqual from 'react-fast-compare';
import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../utils/base';

export const PSIcCopy25 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M7 6C7 3.79086 8.79086 2 11 2H18C20.2091 2 22 3.79086 22 6V13C22 15.2091 20.2091 17 18 17H11C8.79086 17 7 15.2091 7 13V6Z"
        fill="#686F72"
      />
      <Path
        d="M2 11C2 8.79086 3.79086 7 6 7V13.5C6 15.9853 8.01472 18 10.5 18H17C17 20.2091 15.2091 22 13 22H6C3.79086 22 2 20.2091 2 18V11Z"
        fill="#686F72"
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
