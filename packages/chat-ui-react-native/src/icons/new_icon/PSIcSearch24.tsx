import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcSearch24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_7_246261)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.1881 16.8484C19.3549 15.3897 20.0527 13.5395 20.0527 11.5263C20.0527 6.81737 16.2353 3 11.5263 3C6.81737 3 3 6.81737 3 11.5263C3 16.2353 6.81737 20.0527 11.5263 20.0527C13.5395 20.0527 15.3897 19.3549 16.8484 18.1881L19.3828 20.7225C19.7527 21.0925 20.3526 21.0925 20.7225 20.7225C21.0925 20.3526 21.0925 19.7527 20.7225 19.3828L18.1881 16.8484ZM18.1579 11.5263C18.1579 15.1889 15.1889 18.1579 11.5263 18.1579C7.86381 18.1579 4.89474 15.1889 4.89474 11.5263C4.89474 7.86381 7.86381 4.89474 11.5263 4.89474C15.1889 4.89474 18.1579 7.86381 18.1579 11.5263Z"
          {...props}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_7_246261">
          <Rect width={24} height={24} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
