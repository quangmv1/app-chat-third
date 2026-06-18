import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcChatList24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_180_13013)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11 4.75c-.69 0-1.25.56-1.25 1.25v4.571c0 .69.56 1.25 1.25 1.25h5.743c.73 0 1.429.29 1.945.806l1.135 1.136a.25.25 0 00.427-.177V6c0-.69-.56-1.25-1.25-1.25h-8zm-2.75 3.5V6A2.75 2.75 0 0111 3.25h8A2.75 2.75 0 0121.75 6v7.586c0 1.559-1.885 2.34-2.987 1.237l-1.136-1.136a1.25 1.25 0 00-.884-.366h-.993v2.25a2.75 2.75 0 01-2.75 2.75H7.257c-.332 0-.65.132-.884.366l-1.136 1.136c-1.102 1.103-2.987.322-2.987-1.237V11A2.75 2.75 0 015 8.25h3.25zm6 5.071H11a2.75 2.75 0 01-2.75-2.75V9.75H5c-.69 0-1.25.56-1.25 1.25v7.586c0 .223.27.334.427.177l1.135-1.136a2.75 2.75 0 011.945-.806H13c.69 0 1.25-.56 1.25-1.25v-2.25z"
          {...props}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_180_13013">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
