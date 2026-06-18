import * as React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcProfile = React.memo(
  (props: IconProps) => (
    <Svg width={21} height={20} viewBox="0 0 21 20" fill="none" {...props}>
      <Path
        opacity={0.4}
        d="M18.5182 10.0003C18.5182 12.5115 17.4075 14.7632 15.6506 16.291C14.1874 17.5634 12.2761 18.3337 10.1849 18.3337C8.09366 18.3337 6.18234 17.5634 4.7192 16.291C2.96227 14.7632 1.85156 12.5115 1.85156 10.0003C1.85156 5.39795 5.58252 1.66699 10.1849 1.66699C14.7873 1.66699 18.5182 5.39795 18.5182 10.0003Z"
        {...props}
      />
      <Circle cx={10.1846} cy={8.33398} r={2.5} {...props} />
      <Path
        d="M15.6501 16.2907C14.8223 14.0765 12.6875 12.5 10.1844 12.5C7.68142 12.5 5.54661 14.0765 4.71875 16.2907C6.18189 17.563 8.09321 18.3333 10.1844 18.3333C12.2757 18.3333 14.187 17.563 15.6501 16.2907Z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
