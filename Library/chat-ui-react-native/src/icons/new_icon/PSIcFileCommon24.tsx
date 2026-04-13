import React from 'react';

import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcFileCommon24 = React.memo(
  (props: IconProps) => {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
          d="M6.115 3.5h7.947l6.437 5.023v9.396c0 1.221-.982 2.581-2.615 2.581H6.115c-1.633 0-2.615-1.36-2.615-2.581v-11.9c0-1.222.982-2.519 2.615-2.519z"
          fill="#0CA2FF"
        />
        <Path
          d="M6.5 16.884V12.5h3.118v.954H7.621v.701h1.596v.948H7.62v1.78H6.5zM11.404 16.853V12.5h1.113v3.407h1.892v.946h-3.005zM9.955 16.86V12.5h1.114v4.36H9.955zM14.744 12.5v4.384h3.12v-.95h-2l.001-.831h1.596v-.948h-1.596v-.701h1.998V12.5h-3.119z"
          fill="#fff"
        />
        <Path
          opacity={0.302}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.96 3.5v5.037h6.54L13.96 3.5z"
          fill="#fff"
        />
      </Svg>
    );
  },
  (prev, next) => isEqual(prev, next),
);
