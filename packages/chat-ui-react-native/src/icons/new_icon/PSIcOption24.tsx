import React from 'react';

import {IconProps} from '../utils/base';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';
import isEqual from 'react-fast-compare';

export const PSIcOption24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_7_246264)">
        <Path
          d="M7.5 12C7.5 13.2427 6.49264 14.25 5.25 14.25C4.00736 14.25 3 13.2427 3 12C3 10.7573 4.00736 9.75 5.25 9.75C6.49264 9.75 7.5 10.7573 7.5 12Z"
          {...props}
        />
        <Path
          d="M14.25 12C14.25 13.2427 13.2427 14.25 12 14.25C10.7573 14.25 9.75 13.2427 9.75 12C9.75 10.7573 10.7573 9.75 12 9.75C13.2427 9.75 14.25 10.7573 14.25 12Z"
          {...props}
        />
        <Path
          d="M21 12C21 13.2427 19.9927 14.25 18.75 14.25C17.5073 14.25 16.5 13.2427 16.5 12C16.5 10.7573 17.5073 9.75 18.75 9.75C19.9927 9.75 21 10.7573 21 12Z"
          {...props}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_7_246264">
          <Rect width={24} height={24} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
