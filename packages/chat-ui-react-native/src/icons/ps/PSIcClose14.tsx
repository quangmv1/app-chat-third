import React from 'react';

import {
  IconProps,
  RootG,
  RootMask,
  RootPath,
  RootRect,
  RootSvg,
} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcClose14 = React.memo(
  (props: IconProps) => (
    <RootSvg width={14} height={14} viewBox="0 0 14 14" fill="none" {...props}>
      <RootRect x={0.5} y={0.5} width={13} height={13} rx={6.5} fill="#000" />
      <RootMask
        id="a"
        style={{
          maskType: 'alpha',
        }}
        maskUnits="userSpaceOnUse"
        x={3}
        y={3}
        width={8}
        height={8}>
        <RootPath
          clipRule="evenodd"
          d="M3.646 3.646a.5.5 0 01.708 0l6 6a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708z"
          fill="#006FFD"
        />
        <RootPath
          clipRule="evenodd"
          d="M10.354 3.646a.5.5 0 00-.708 0l-6 6a.5.5 0 00.708.708l6-6a.5.5 0 000-.708z"
          fill="#006FFD"
        />
      </RootMask>
      <RootG mask="url(#a)">
        <RootPath fill="#fff" d="M1 1H13V13H1z" />
      </RootG>
      <RootRect
        x={0.5}
        y={0.5}
        width={13}
        height={13}
        rx={6.5}
        stroke="#F2F2F3"
      />
    </RootSvg>
  ),
  (prev, next) => isEqual(prev, next),
);
