/* eslint-disable no-extend-native */
import {scale} from './scaling-utils';

Number.prototype.px = function (): number {
  return scale(this.valueOf());
};
