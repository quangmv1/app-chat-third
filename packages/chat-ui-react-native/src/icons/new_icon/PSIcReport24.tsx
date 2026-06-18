import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcReport24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M21.602 17.324l-3.196-3.66a.26.26 0 01-.006-.321l3.2-3.667A1.615 1.615 0 0020.4 7H15V5.222A2.222 2.222 0 0012.778 3H4a1 1 0 00-2 0v18a1 1 0 102 0v-5h3v1.777c0 .585.23 1.146.638 1.565.255.255.57.443.916.548a2.13 2.13 0 00.277.073c.055.017.112.03.169.037.026 0 .05-.01.076-.013.041.003.082.013.124.013h11.2a1.596 1.596 0 001.46-.954 1.616 1.616 0 00-.258-1.722zM4 5h8.778a.223.223 0 01.222.222V14H4V5zm7.148 11L9 17.719V16h2.148zm.703 2l2.773-2.219c.014-.011.02-.028.034-.04a1.166 1.166 0 00.33-.684c.002-.02.012-.037.012-.057V9h4.536l-2.648 3.035a2.256 2.256 0 00.005 2.937L19.537 18h-7.685z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
