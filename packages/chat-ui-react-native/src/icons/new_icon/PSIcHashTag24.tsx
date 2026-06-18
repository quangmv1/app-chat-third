import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcHashTag24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_7_246596)">
        <Path
          d="M8.76839 20H6.67606L7.51956 15.7311H5L5.40532 13.6355H7.93584L8.62598 10.176H6.00782L6.41315 8.09148H9.04225L9.86385 4H11.9671L11.1455 8.09148H14.2457L15.0563 4H17.1706L16.3599 8.09148H19L18.6056 10.176H15.9437L15.2535 13.6355H17.9812L17.5869 15.7311H14.8263L13.9828 20H11.8576L12.723 15.7311H9.62285L8.76839 20ZM9.94053 13.7353H13.205L13.928 10.0984H10.6635L9.94053 13.7353Z"
          {...props}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_7_246596">
          <Rect width={24} height={24} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
