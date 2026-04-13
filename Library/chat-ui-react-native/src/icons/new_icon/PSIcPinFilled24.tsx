import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcPinFilled24 = React.memo(
  (props: IconProps) => (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.7682 2.38462C8.94657 1.56299 7.54172 2.1449 7.54172 3.30685C7.54172 3.65276 7.40431 3.9845 7.15972 4.22909L6.07925 5.30955C5.83466 5.55415 5.50292 5.69156 5.15701 5.69156C3.99506 5.69156 3.41315 7.09641 4.23477 7.91803L5.81896 9.50222L2.14059 13.1806C1.95314 13.368 1.95314 13.672 2.14059 13.8594C2.32804 14.0469 2.63196 14.0469 2.81941 13.8594L6.49779 10.181L8.08195 11.7652C8.90358 12.5868 10.3084 12.0049 10.3084 10.843C10.3084 10.4971 10.4458 10.1653 10.6904 9.92073L11.7709 8.84027C12.0155 8.59567 12.3472 8.45826 12.6931 8.45826C13.8551 8.45826 14.437 7.05341 13.6154 6.23179L9.7682 2.38462Z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
