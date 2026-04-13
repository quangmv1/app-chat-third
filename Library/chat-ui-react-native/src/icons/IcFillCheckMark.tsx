import React from 'react';

import {IconProps, RootPath, RootSvg} from './utils/base';

export const IcFillCheckMark: React.FC<IconProps> = props => (
  <RootSvg width={24} height={24} fill="none" {...props}>
    <RootPath
      d="M19.6968 6.28272C20.0929 6.66755 20.1021 7.30064 19.7173 7.69679L10.003 17.6968C9.81131 17.8941 9.54679 18.0038 9.2717 17.9999C8.99662 17.996 8.73528 17.879 8.54919 17.6764L4.26348 13.0097C3.88991 12.603 3.91683 11.9704 4.3236 11.5968C4.73037 11.2232 5.36297 11.2502 5.73654 11.6569L9.30613 15.5438L18.2827 6.30321C18.6676 5.90707 19.3006 5.8979 19.6968 6.28272Z"
      {...props}
    />
  </RootSvg>
);
