import React from 'react';

import {IconProps, RootPath, RootSvg} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcRight24 = React.memo(
  (props: IconProps) => (
    <RootSvg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <RootPath
        d="M13.4628 11.997L8.22539 17.2346C8.08118 17.3785 8.00184 17.5709 8.00184 17.776C8.00184 17.9812 8.08118 18.1734 8.22539 18.3175L8.68431 18.7762C8.8283 18.9206 9.02077 19 9.22587 19C9.43098 19 9.62322 18.9206 9.76732 18.7762L16.0032 12.5404C16.1479 12.3959 16.2271 12.2027 16.2266 11.9974C16.2271 11.7911 16.148 11.5982 16.0032 11.4535L9.77313 5.22377C9.62903 5.07945 9.43679 5 9.23157 5C9.02646 5 8.83422 5.07945 8.69 5.22377L8.23119 5.68247C7.93264 5.98102 7.93264 6.46704 8.23119 6.76548L13.4628 11.997Z"
        {...props}
      />
    </RootSvg>
  ),
  (prev, next) => isEqual(prev, next),
);
