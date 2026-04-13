import * as React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcCamera24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9997 15.25C13.2423 15.25 14.2497 14.2426 14.2497 13C14.2497 11.7574 13.2423 10.75 11.9997 10.75C10.757 10.75 9.74966 11.7574 9.74966 13C9.74966 14.2426 10.757 15.25 11.9997 15.25ZM15.5997 13C15.5997 14.9882 13.9878 16.6 11.9997 16.6C10.0114 16.6 8.39966 14.9882 8.39966 13C8.39966 11.0118 10.0114 9.39999 11.9997 9.39999C13.9878 9.39999 15.5997 11.0118 15.5997 13Z"
        {...props}
      />
      <Path
        d="M3.5 17.5V8.5C3.5 7.39543 4.39543 6.5 5.5 6.5H7.38197C7.76074 6.5 8.107 6.286 8.27639 5.94721L8.44721 5.60557C8.786 4.928 9.47852 4.5 10.2361 4.5H13.2639C14.0215 4.5 14.714 4.928 15.0528 5.60557L15.2236 5.94721C15.393 6.286 15.7393 6.5 16.118 6.5H18.5C19.6046 6.5 20.5 7.39543 20.5 8.5V17.5C20.5 18.6046 19.6046 19.5 18.5 19.5H5.5C4.39543 19.5 3.5 18.6046 3.5 17.5Z"
        stroke="#393E40"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={13} r={3} stroke="#393E40" strokeWidth={1.5} />
      <Circle cx={17} cy={9} r={1} {...props} />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
