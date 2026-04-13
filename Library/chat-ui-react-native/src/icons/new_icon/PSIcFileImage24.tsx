import React from 'react';

import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcFileImage24 = React.memo(
  (props: IconProps) => {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
          d="M6.115 4h7.851l6.532 5.027v9.392c0 1.221-.982 2.581-2.615 2.581H6.115C4.482 21 3.5 19.64 3.5 18.419v-11.9C3.5 5.297 4.482 4 6.115 4z"
          fill="#FFA52E"
        />
        <Path
          opacity={0.302}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.962 4v5.037H20.5L13.962 4z"
          fill="#fff"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.545 11h-7.08c-.53 0-.965.474-.965 1.051v4.898c0 .577.436 1.051.966 1.051h7.08c.53 0 .953-.474.953-1.051V12.05c0-.577-.424-1.051-.954-1.051zm-5.147 1.32c.577 0 1.036.513 1.036 1.129 0 .628-.46 1.14-1.036 1.14-.577 0-1.049-.512-1.049-1.14 0-.616.472-1.129 1.049-1.129zm5.465 4.629c0 .192-.141.359-.318.359h-7.08c-.176 0-.317-.167-.317-.36v-.204l1.284-1.398 1.06 1.154c.13.141.33.141.46 0l2.662-2.897 2.25 2.448v.898z"
          fill="#fff"
        />
      </Svg>
    );
  },
  (prev, next) => isEqual(prev, next),
);
