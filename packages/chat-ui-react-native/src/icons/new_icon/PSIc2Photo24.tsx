import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath} from 'react-native-svg';
import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIc2Photo24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_2266_32970)" fill="#18202A" {...props}>
        <Path d="M4.225 4.174l7.727-2.07a3 3 0 013.674 2.12l.411 1.535 2.12.185-.599-2.237A5 5 0 0011.435.172l-7.728 2.07A5 5 0 00.172 8.366l2.07 7.727a4.996 4.996 0 003.252 3.451 4.993 4.993 0 01-.135-1.67l.05-.577a2.989 2.989 0 01-1.235-1.721l-2.07-7.728a3 3 0 012.12-3.674z" />
        <Path d="M12.31 10.544a.5.5 0 11-.996-.087.5.5 0 01.996.087z" />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.494 19.544a4.956 4.956 0 01-.137-1.646l.002-.024.698-7.97a5 5 0 015.416-4.545l7.97.698a5 5 0 014.545 5.416l-.697 7.97a5 5 0 01-5.417 4.545l-7.97-.697a5.002 5.002 0 01-4.41-3.747zm6.1-6.553a2.5 2.5 0 10.436-4.981 2.5 2.5 0 00-.436 4.98zM23.412 18l-4.804-5.769-5.106 3.685-2.373-1.883L6 17.767l1.177 1.617 3.9-2.838 2.369 1.878 4.82-3.478 3.61 4.336 1.536-1.28z"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.269 8.049l-7.97-.697a3 3 0 00-3.25 2.727l-.697 7.97a3 3 0 002.727 3.25l7.97.697a3 3 0 003.25-2.727l.697-7.97a3 3 0 00-2.727-3.25zm-7.796-2.69a5 5 0 00-5.416 4.546l-.698 7.97a5 5 0 004.546 5.416l7.97.697a5 5 0 005.416-4.545l.697-7.97a5 5 0 00-4.545-5.416l-7.97-.698z"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2266_32970">
          <Path fill="#fff" d="M0 0H24V24H0z" {...props} />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
