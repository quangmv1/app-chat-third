import React from 'react';

import {IconProps, RootPath, RootSvg} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcReply = React.memo(
  (props: IconProps) => (
    <RootSvg width={15} height={18} viewBox="0 0 24 10" fill="none" {...props}>
      <RootPath
        d="M1 0.500001C0.447716 0.500002 3.91405e-08 0.947717 8.74228e-08 1.5L2.62268e-07 3.5C6.00244e-07 7.36599 3.13401 10.5 7 10.5L14.5858 10.5L11.2929 13.7929C10.9024 14.1834 10.9024 14.8166 11.2929 15.2071C11.6834 15.5976 12.3166 15.5976 12.7071 15.2071L17.7071 10.2071C17.8946 10.0196 18 9.76522 18 9.5C18 9.23478 17.8946 8.98043 17.7071 8.79289L12.7071 3.79289C12.3166 3.40237 11.6834 3.40237 11.2929 3.79289C10.9024 4.18342 10.9024 4.81658 11.2929 5.20711L14.5858 8.5L7 8.5C4.23858 8.5 2 6.26142 2 3.5L2 1.5C2 0.947717 1.55228 0.500001 1 0.500001Z"
        fill={props.fill ?? '#000'}
      />
    </RootSvg>
  ),
  (prev, next) => isEqual(prev, next),
);
