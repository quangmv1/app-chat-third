import React from 'react';

import {IconProps, RootPath, RootSvg} from './utils/base';

export const IcFillPlay: React.FC<IconProps> = props => (
  <RootSvg width={24} height={24} fill="none" {...props}>
    <RootPath
      d="M4.56685 5.1082C4.73104 3.11197 6.85846 1.89969 8.67778 2.73754C12.7516 4.61363 16.637 6.98582 20.1597 9.76177C21.6075 10.9027 21.6075 13.0972 20.1597 14.2381C16.637 17.0141 12.7516 19.3863 8.67778 21.2624C6.85846 22.1002 4.73104 20.8879 4.56685 18.8917L4.40454 16.9184C4.1353 13.645 4.1353 10.3549 4.40454 7.0815L4.56685 5.1082Z"
      {...props}
    />
  </RootSvg>
);
