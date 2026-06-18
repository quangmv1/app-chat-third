import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcAddCircle24 = React.memo(
  (props: IconProps) => (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none" {...props}>
      <Path
        opacity={0.2}
        d="M29.3334 16C29.3334 23.3638 23.3639 29.3333 16.0001 29.3333C8.63629 29.3333 2.66675 23.3638 2.66675 16C2.66675 8.63619 8.63629 2.66666 16.0001 2.66666C23.3639 2.66666 29.3334 8.63619 29.3334 16Z"
        fill="#8A8A8A"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.0001 10.6667C17.0001 10.1144 16.5524 9.66669 16.0001 9.66669C15.4478 9.66669 15.0001 10.1144 15.0001 10.6667V15H10.6667C10.1145 15 9.66675 15.4477 9.66675 16C9.66675 16.5523 10.1145 17 10.6667 17H15.0001V21.3334C15.0001 21.8856 15.4478 22.3334 16.0001 22.3334C16.5524 22.3334 17.0001 21.8856 17.0001 21.3334V17H21.3334C21.8857 17 22.3334 16.5523 22.3334 16C22.3334 15.4477 21.8857 15 21.3334 15H17.0001V10.6667Z"
        fill="#8A8A8A"
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
