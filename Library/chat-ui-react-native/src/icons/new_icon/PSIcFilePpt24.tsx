import React from 'react';

import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcFilePpt24 = React.memo(
  (props: IconProps) => {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
          d="M6.115 3.5h7.852l6.532 5.027v9.392c0 1.221-.982 2.581-2.615 2.581H6.115c-1.633 0-2.615-1.36-2.615-2.581v-11.9c0-1.222.982-2.519 2.615-2.519z"
          fill="#FFA52E"
        />
        <Path
          opacity={0.302}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.963 3.5v5.037H20.5L13.963 3.5z"
          fill="#fff"
        />
        <Path
          d="M6.5 16v-4h1.828c.45 0 .811.116 1.083.352.266.231.403.54.403.93 0 .385-.137.699-.403.93-.272.23-.633.346-1.083.346h-.733V16H6.5zm1.095-2.31h.61c.165 0 .29-.034.384-.105a.37.37 0 00.13-.303c0-.132-.041-.231-.13-.303a.616.616 0 00-.385-.11h-.61v.82zm2.68 2.31v-4h1.829c.45 0 .81.116 1.082.352.273.231.403.54.403.93 0 .385-.13.699-.403.93-.272.23-.633.346-1.082.346h-.728V16h-1.1zm1.1-2.31h.604c.166 0 .296-.034.385-.105a.374.374 0 00.136-.303.366.366 0 00-.136-.303c-.089-.071-.219-.11-.385-.11h-.603v.82zM15.17 16v-3.13h-1.225V12H17.5v.87h-1.23V16h-1.101z"
          fill="#fff"
        />
      </Svg>
    );
  },
  (prev, next) => isEqual(prev, next),
);
