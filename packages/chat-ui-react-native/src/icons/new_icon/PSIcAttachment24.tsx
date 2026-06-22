import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcAttachment24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_7_246385)">
        <Path
          d="M10.2662 10.2662L13.9727 6.55971C15.508 5.0244 17.997 5.0244 19.5324 6.55971C21.0677 8.09502 21.0677 10.5841 19.5324 12.1194L13.5093 18.1424C11.2064 20.4453 7.47271 20.4454 5.16978 18.1424C2.86688 15.8395 2.86688 12.1058 5.16978 9.80287L10.2662 4.70647M15.8259 10.2662L10.7295 15.3626C9.96185 16.1302 8.71725 16.1302 7.94964 15.3626C7.18203 14.595 7.182 13.3504 7.94964 12.5827L12.5406 7.9918"
          stroke="#393E40"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_7_246385">
          <Rect width={24} height={24} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
