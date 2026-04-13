import React from 'react';

import {IconProps, RootPath, RootSvg} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcPencil24 = React.memo(
  (props: IconProps) => (
    <RootSvg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <RootPath
        d="M17.3964 10.6628L13.3371 6.60352L4.57501 15.3656L4.00957 19.0652C3.9268 19.6068 4.3932 20.0732 4.93477 19.9904L8.6343 19.425L17.3964 10.6628Z"
        {...props}
      />
      <RootPath
        d="M14.4863 5.45539L15.4664 4.4754C15.7709 4.171 16.1838 4 16.6143 4C17.0449 4 17.4579 4.171 17.7623 4.4754L19.5257 6.23876C19.8301 6.54324 20.0011 6.95617 20.0011 7.38672C20.0011 7.81728 19.8301 8.23019 19.5257 8.53469L18.5457 9.51469L14.4863 5.45539Z"
        {...props}
      />
    </RootSvg>
  ),
  (prev, next) => isEqual(prev, next),
);
