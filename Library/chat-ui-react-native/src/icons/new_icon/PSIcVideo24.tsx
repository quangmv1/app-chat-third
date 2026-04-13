import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcVideo24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_7_246300)">
        <G clipPath="url(#clip1_7_246300)">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.15002 5.58024C3.15002 4.23805 4.23808 3.14999 5.58027 3.14999H18.4198C19.762 3.14999 20.85 4.23805 20.85 5.58024V18.4197C20.85 19.7619 19.762 20.85 18.4198 20.85H5.58027C4.23808 20.85 3.15002 19.7619 3.15002 18.4197V5.58024ZM5.58027 4.84999C5.17697 4.84999 4.85002 5.17694 4.85002 5.58024V18.4197C4.85002 18.8231 5.17697 19.15 5.58027 19.15H18.4198C18.8231 19.15 19.15 18.8231 19.15 18.4197V5.58024C19.15 5.17694 18.8231 4.84999 18.4198 4.84999H5.58027Z"
            {...props}
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.5 8.84999H4V7.14999H19.5V8.84999Z"
            {...props}
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.15 20L11.15 4L12.85 4L12.85 20L11.15 20Z"
            {...props}
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.15 8L15.15 4L16.85 4L16.85 8L15.15 8Z"
            {...props}
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.14998 8L7.14998 4L8.84998 4L8.84998 8L7.14998 8Z"
            {...props}
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.14998 20L7.14998 16L8.84998 16L8.84998 20L7.14998 20Z"
            {...props}
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.15 20L15.15 16L16.85 16L16.85 20L15.15 20Z"
            {...props}
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.5 16.85H4V15.15H19.5V16.85Z"
            {...props}
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_7_246300">
          <Rect width={24} height={24} fill="white" />
        </ClipPath>
        <ClipPath id="clip1_7_246300">
          <Rect width={24} height={24} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
