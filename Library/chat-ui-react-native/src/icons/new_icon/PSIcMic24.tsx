import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcMic24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_7_246381)">
        <Path
          d="M9.6001 5.7C9.6001 4.20884 10.8089 3 12.3001 3C13.7913 3 15.0001 4.20884 15.0001 5.7V11.1C15.0001 12.5912 13.7913 13.8 12.3001 13.8C10.8089 13.8 9.6001 12.5912 9.6001 11.1V5.7Z"
          {...props}
        />
        <Path
          d="M7.8 11.1C7.8 10.6029 7.39705 10.2 6.9 10.2C6.40295 10.2 6 10.6029 6 11.1C6 14.2738 8.34694 16.8995 11.4 17.3361V19.2H9.6C9.10295 19.2 8.7 19.6029 8.7 20.1C8.7 20.597 9.10295 21 9.6 21H15C15.4971 21 15.9 20.597 15.9 20.1C15.9 19.6029 15.4971 19.2 15 19.2H13.2V17.3361C16.2531 16.8995 18.6 14.2738 18.6 11.1C18.6 10.6029 18.1971 10.2 17.7 10.2C17.2029 10.2 16.8 10.6029 16.8 11.1C16.8 13.5852 14.7853 15.6 12.3 15.6C9.81472 15.6 7.8 13.5852 7.8 11.1Z"
          {...props}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_7_246381">
          <Rect width={24} height={24} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
