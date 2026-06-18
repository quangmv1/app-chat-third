import React from 'react';

import {IconProps, RootPath, RootSvg} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcFile16 = React.memo(
  (props: IconProps) => (
    <RootSvg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <RootPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 3.233A.767.767 0 003.233 4v8c0 .424.343.767.767.767h8a.767.767 0 00.767-.767V5.333A.767.767 0 0012 4.567H8.079c-.672 0-1.286-.38-1.586-.98a.64.64 0 00-.572-.354H4zm3.507-.153c-.3-.6-.914-.98-1.586-.98H4A1.9 1.9 0 002.1 4v8c0 1.05.85 1.9 1.9 1.9h8a1.9 1.9 0 001.9-1.9V5.333a1.9 1.9 0 00-1.9-1.9H8.079a.64.64 0 01-.572-.353z"
        {...props}
      />
      <RootPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.433 10.667c0-.313.254-.567.567-.567h4a.567.567 0 110 1.133H6a.567.567 0 01-.567-.566z"
        {...props}
      />
    </RootSvg>
  ),
  (prev, next) => isEqual(prev, next),
);
