import React from 'react';

import {IconProps, RootPath, RootSvg} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcPoll16 = React.memo(
  (props: IconProps) => (
    <RootSvg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <RootPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.1 4c0-.681.552-1.233 1.233-1.233h1.334c.68 0 1.233.552 1.233 1.233v2.77c.033-.002.066-.003.1-.003h1.333c.681 0 1.234.552 1.234 1.233v2c0 .681-.553 1.233-1.234 1.233H4.667A1.233 1.233 0 013.433 10V6.667c0-.681.553-1.234 1.234-1.234H6c.034 0 .067.002.1.004V4zm1.133 6.1h1.534V4a.1.1 0 00-.1-.1H7.333a.1.1 0 00-.1.1v6.1zm2.667 0h1.433a.1.1 0 00.1-.1V8a.1.1 0 00-.1-.1H10a.1.1 0 00-.1.1v2.1zm-3.8 0V6.667a.1.1 0 00-.1-.1H4.667a.1.1 0 00-.1.1V10a.1.1 0 00.1.1H6.1zm-2.667 2.567c0-.313.254-.567.567-.567h8a.567.567 0 110 1.133H4a.567.567 0 01-.567-.566z"
        {...props}
      />
    </RootSvg>
  ),
  (prev, next) => isEqual(prev, next),
);
