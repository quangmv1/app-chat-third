import * as React from 'react';
import isEqual from 'react-fast-compare';
import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../utils/base';

export const PSIcSortDown = React.memo(
  (props: IconProps) => (
    <Svg width={10} height={15} viewBox="0 0 10 15" fill="none" {...props}>
      <Path
        d="M4.35783 14.5473L1.1012 11.2906C0.529062 10.7185 0.934276 9.74023 1.74341 9.74023H8.25667C9.06579 9.74023 9.47103 10.7185 8.89886 11.2906L5.64221 14.5473C5.28756 14.9019 4.71248 14.9019 4.35783 14.5473Z"
        fill="#686F72"
      />
      <Path
        d="M5.64221 0.766012L8.89886 4.02265C9.47103 4.59482 9.06579 5.57305 8.25667 5.57305H1.74341C0.934276 5.57305 0.529062 4.59482 1.1012 4.02265L4.35783 0.766012C4.71248 0.411329 5.28756 0.411329 5.64221 0.766012Z"
        fill="#686F72"
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
