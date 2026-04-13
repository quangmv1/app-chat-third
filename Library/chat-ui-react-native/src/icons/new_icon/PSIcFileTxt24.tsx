import React from 'react';

import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcFileTxt24 = React.memo(
  (props: IconProps) => {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
          d="M6.115 3.5h7.854l6.53 5.035v9.384c0 1.221-.982 2.581-2.615 2.581H6.115c-1.633 0-2.615-1.36-2.615-2.581v-11.9c0-1.222.982-2.519 2.615-2.519z"
          fill="#0CA2FF"
        />
        <Path
          opacity={0.302}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.963 3.5v5.037H20.5L13.963 3.5z"
          fill="#fff"
        />
        <Path
          d="M7.706 15.5v-3.13H6.5v-.87h3.485v.87h-1.2v3.13H7.706zm6.199 0h-1.13l-.772-1.227-.771 1.227h-1.137l1.34-2.135-1.172-1.865h1.131l.609.968.603-.968h1.136l-1.17 1.87 1.333 2.13zm1.31 0v-3.13h-1.2v-.87H17.5v.87h-1.206v3.13h-1.079z"
          fill="#fff"
        />
      </Svg>
    );
  },
  (prev, next) => isEqual(prev, next),
);
