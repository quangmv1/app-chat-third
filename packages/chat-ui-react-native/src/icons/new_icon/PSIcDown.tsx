import * as React from 'react';
import isEqual from 'react-fast-compare';
import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../utils/base';

export const PSIcDown = React.memo(
  (props: IconProps) => (
    <Svg width={14} height={8} viewBox="0 0 14 8" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.7071 0.292906C13.3166 -0.0976247 12.6834 -0.0976352 12.2929 0.292883L6.99982 5.58579L1.70712 0.292905C1.3166 -0.0976258 0.683436 -0.0976364 0.292905 0.292881C-0.0976257 0.683399 -0.0976363 1.31656 0.292881 1.70709L6.29268 7.7071C6.48021 7.89464 6.73457 8 6.99978 8C7.265 8 7.51936 7.89465 7.70689 7.70712L13.7071 1.70712C14.0976 1.3166 14.0976 0.683437 13.7071 0.292906Z"
        fill={props.fill}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
