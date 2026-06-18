import React from 'react';

import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcFileVideo24 = React.memo(
  (props: IconProps) => {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
          d="M6.115 3.5h7.852l6.532 5.027v9.392c0 1.221-.982 2.581-2.615 2.581H6.115c-1.633 0-2.615-1.36-2.615-2.581v-11.9c0-1.222.982-2.519 2.615-2.519z"
          fill="#8358FE"
        />
        <Path
          d="M16.155 12.347c-.081-.06-.203-.06-.295-.02l-2.019 1.015v-.73a.914.914 0 00-.923-.924H8.615a.92.92 0 00-.924.923v3.684a.92.92 0 00.924.923h4.303a.914.914 0 00.923-.923v-.73l2.02 1.014a.32.32 0 00.416-.142c.02-.04.03-.091.03-.142V12.61a.303.303 0 00-.152-.264zm-5.389 3.339c-.68 0-1.228-.558-1.228-1.238 0-.68.548-1.228 1.228-1.228.68 0 1.228.548 1.228 1.228 0 .68-.548 1.238-1.228 1.238z"
          fill="#fff"
        />
        <Path
          opacity={0.302}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.963 3.5v5.037H20.5L13.963 3.5z"
          fill="#fff"
        />
      </Svg>
    );
  },
  (prev, next) => isEqual(prev, next),
);
