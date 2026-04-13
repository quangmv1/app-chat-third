import React from 'react';

import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcFileAudio24 = React.memo(
  (props: IconProps) => {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
          d="M6.115 3.5h7.85L20.5 8.535v9.384c0 1.221-.982 2.581-2.615 2.581H6.115c-1.633 0-2.615-1.36-2.615-2.581v-11.9c0-1.222.982-2.519 2.615-2.519z"
          fill="#12B76A"
        />
        <Path
          opacity={0.302}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.963 3.5v5.037H20.5L13.963 3.5z"
          fill="#fff"
        />
        <Path
          d="M14.2 14.7a3.08 3.08 0 00.413-1.35 1.938 1.938 0 00-.2-.937c-.235-.48-.634-.745-1.025-1.01-.288-.193-.56-.377-.752-.635l-.037-.045c-.11-.155-.244-.332-.266-.48-.015-.147-.155-.25-.295-.243a.284.284 0 00-.266.288v5.061a1.613 1.613 0 00-.855-.236c-.783 0-1.417.51-1.417 1.136 0 .628.634 1.137 1.417 1.137.782 0 1.424-.51 1.424-1.137v-3.312c.427.17 1.12.583 1.313 1.55-.037.05-.067.11-.11.154a.29.29 0 00.029.406.282.282 0 00.398-.03c.074-.088.147-.184.207-.295l.022-.022z"
          fill="#fff"
        />
      </Svg>
    );
  },
  (prev, next) => isEqual(prev, next),
);
