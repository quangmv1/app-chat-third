import * as React from 'react';
import Svg, {Rect} from 'react-native-svg';
import {IconProps} from '../utils/base';
import isEqual from 'react-fast-compare';

export const PSIcMessageSending12 = React.memo(
  (props: IconProps) => (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none" {...props}>
      <Rect x={0.5} y={0.5} width={11} height={11} rx={5.5} stroke="#C2C5C7" />
    </Svg>
  ),
  (prev, next) => isEqual(prev, next),
);
