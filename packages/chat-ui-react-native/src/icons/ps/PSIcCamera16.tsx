import React from 'react';

import {IconProps, RootPath, RootSvg} from '../utils/base';
import isEqual from 'react-fast-compare';
import {Circle} from 'react-native-svg';

export const PSIcCamera16 = React.memo(
  (props: IconProps) => (
    <RootSvg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <RootPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 10.167a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.4-1.5a2.4 2.4 0 11-4.8 0 2.4 2.4 0 014.8 0z"
        {...props}
      />
      <RootPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.184 3.513A1.833 1.833 0 016.824 2.5h2.019c.694 0 1.329.392 1.64 1.013l.113.228a.167.167 0 00.15.092h1.587c1.013 0 1.834.821 1.834 1.834v6c0 1.012-.821 1.833-1.834 1.833H3.667a1.833 1.833 0 01-1.834-1.833v-6c0-1.013.821-1.834 1.834-1.834H4.92c.063 0 .121-.035.15-.092l.113-.228zm1.64-.013a.833.833 0 00-.745.46l-.114.228a1.167 1.167 0 01-1.044.645H3.667a.833.833 0 00-.834.834v6c0 .46.373.833.834.833h8.666c.46 0 .834-.373.834-.833v-6a.833.833 0 00-.834-.834h-1.588c-.442 0-.846-.25-1.043-.645l-.114-.227a.833.833 0 00-.745-.461H6.824zM8 7.167a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-2.5 1.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0z"
        {...props}
      />
      <Circle cx={11.3332} cy={5.99998} r={0.666667} {...props} />
    </RootSvg>
  ),
  (prev, next) => isEqual(prev, next),
);
