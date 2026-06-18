import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import isEqual from 'react-fast-compare';
import {IconProps} from '../utils/base';

export const PSIcClose24 = React.memo(
  (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.601 6.399a.85.85 0 010 1.202l-10 10A.85.85 0 116.4 16.399l10-10a.85.85 0 011.202 0z"
        {...props}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.4 6.399a.85.85 0 011.201 0l10 10A.85.85 0 1116.4 17.6l-10-10a.85.85 0 010-1.202z"
        {...props}
      />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
