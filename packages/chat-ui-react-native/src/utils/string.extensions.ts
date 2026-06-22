/* eslint-disable no-bitwise */
/* eslint-disable no-extend-native */

import {Platform} from 'react-native';

String.prototype.hashCode = function (): number {
  var hash = 0,
    i,
    chr;
  if (this.length === 0) {
    return hash;
  }
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// https://github.com/facebook/react-native/issues/21406
String.prototype.workAroundTextOneLineContainsNewLineIOS = function (): String {
  return `${this}${Platform.select({ios: '\n\u00A0', default: ''})}`;
};

String.prototype.removeDiacritics = function (): String {
  return this.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
