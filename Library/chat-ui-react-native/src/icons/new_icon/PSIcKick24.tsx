import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcKick24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.1 14a.9.9 0 01.9-.9h4a.9.9 0 110 1.8h-4a.9.9 0 01-.9-.9zM9.318 5.85a2.606 2.606 0 100 5.213 2.606 2.606 0 000-5.213zM5.012 8.456a4.306 4.306 0 118.612 0 4.306 4.306 0 01-8.612 0zM6.1 16.821c-.824.683-1.25 1.525-1.25 2.27a.85.85 0 01-1.7 0c0-1.382.765-2.667 1.865-3.579 1.11-.92 2.631-1.525 4.303-1.525 1.672 0 3.192.605 4.302 1.525 1.1.912 1.865 2.197 1.865 3.58a.85.85 0 11-1.7 0c0-.746-.425-1.588-1.25-2.27-.814-.676-1.952-1.135-3.217-1.135-1.265 0-2.404.46-3.218 1.134z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
