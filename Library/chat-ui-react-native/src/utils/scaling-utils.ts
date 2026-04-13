import {Dimensions} from 'react-native';


// https://github.com/nirsky/react-native-size-matters

const {width, height} = Dimensions.get('window');

const [shortDimension, longDimension] =
  width < height ? [width, height] : [height, width];

// https://github.com/nirsky/react-native-size-matters/blob/master/examples/change-guideline-sizes.md
const guidelineBaseWidth = 430;
const guidelineBaseHeight = 932;

// Will return a linear scaled result of the provided size, based on your device's screen width
export const scale = (size: number) =>
  (shortDimension / guidelineBaseWidth) * size;

// Will return a linear scaled result of the provided size, based on your device's screen height.
export const verticalScale = (size: number) =>
  (longDimension / guidelineBaseHeight) * size;

// If normal scale will increase your size by +2X, moderateScale will only increase it by +X
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Same as moderateScale, but using verticalScale instead of scale.
export const moderateVerticalScale = (size: number, factor = 0.5) =>
  size + (verticalScale(size) - size) * factor;
