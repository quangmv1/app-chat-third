import * as React from 'react';
import isEqual from 'react-fast-compare';
import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../utils/base';

export const PSIcMessageSent12 = React.memo(
  (props: IconProps) => (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 13.8707C10.6819 13.8707 13.6667 10.8859 13.6667 7.20399C13.6667 3.52209 10.6819 0.537323 7 0.537323C3.3181 0.537323 0.333333 3.52209 0.333333 7.20399C0.333333 10.8859 3.3181 13.8707 7 13.8707ZM10.0613 5.51098C10.2309 5.29301 10.1916 4.97887 9.97364 4.80934C9.75567 4.6398 9.44153 4.67907 9.272 4.89704L6.60066 8.33162C6.54126 8.40799 6.42953 8.4179 6.35761 8.35318L4.66782 6.83237C4.46257 6.64764 4.14642 6.66428 3.96169 6.86953C3.77696 7.07479 3.7936 7.39093 3.99886 7.57566L5.68864 9.09647C6.19206 9.54955 6.9742 9.48017 7.39001 8.94556L10.0613 5.51098Z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
