import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcRevokeLink24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 9.633c0-.488.395-.883.883-.883h.617a.883.883 0 010 1.766h-.617A.883.883 0 0113 9.633zm6.117 1.714c.488 0 .883.396.883.883v.52a4 4 0 01-4 4h-3.117a.883.883 0 010-1.766H16c1.234 0 2.234-1 2.234-2.234v-.52c0-.487.395-.883.883-.883zM11 9.633a.883.883 0 00-.883-.883H7a4 4 0 000 8h3.117a.883.883 0 000-1.766H7a2.234 2.234 0 010-4.468h3.117A.883.883 0 0011 9.633z"
        {...props}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 12.75c0-.552.398-1 .888-1h5.224c.49 0 .888.448.888 1s-.398 1-.888 1H8.888c-.49 0-.888-.448-.888-1zM20.53 6.22a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l3-3a.75.75 0 011.06 0z"
        {...props}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.47 6.22a.75.75 0 000 1.06l3 3a.75.75 0 101.06-1.06l-3-3a.75.75 0 00-1.06 0z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
