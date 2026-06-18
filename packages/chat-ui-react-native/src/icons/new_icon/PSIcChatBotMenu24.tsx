import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcChatBotMenu24 = React.memo(
  (props: IconProps) => (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 9C7 8.44772 7.44772 8 8 8H24C24.5523 8 25 8.44772 25 9C25 9.55229 24.5523 10 24 10H8C7.44772 10 7 9.55228 7 9Z"
        {...props}
      />
      <Path
        opacity={0.4}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 16C7 15.4477 7.44772 15 8 15H24C24.5523 15 25 15.4477 25 16C25 16.5523 24.5523 17 24 17H8C7.44772 17 7 16.5523 7 16Z"
        {...props}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 23C7 22.4477 7.44772 22 8 22H24C24.5523 22 25 22.4477 25 23C25 23.5523 24.5523 24 24 24H8C7.44772 24 7 23.5523 7 23Z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
