import React, {useEffect} from 'react';
import {StyleSheet, useWindowDimensions, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {Defs, LinearGradient, Path, Rect, Stop, Svg} from 'react-native-svg';
import {usePSDesignSystemContext} from '../context';
import isEqual from 'react-fast-compare';

const paddingLarge = 16;
const paddingMedium = 12;
const paddingSmall = 8;

const styles = StyleSheet.create({
  background: {
    height: 64,
    position: 'absolute',
    width: '100%',
  },
  container: {
    // borderBottomWidth: 1,
    flexDirection: 'row',
  },
});

export const PSSkeleton =
  // javascript-obfuscator:disable
  React.memo(
    () => {
      const width = useWindowDimensions().width;
      const startOffset = useSharedValue(-width);

      //   const {
      //     theme: {
      //       channelListSkeleton: {
      //         animationTime = 1800,
      //         background,
      //         container,
      //         gradientStart,
      //         gradientStop,
      //         height = 64,
      //         maskFillColor,
      //       },
      //       colors: {border, grey_gainsboro, white_snow},
      //     },
      //   } = useTheme();
      const colors = usePSDesignSystemContext().colors;
      const animationTime = 1800;
      // const background = undefined;
      // const container = {
      //   borderBottomWidth: undefined,
      // paddingHorizontal: 50,
      // };
      const gradientStart = {
        stopOpacity: 0,
      };
      const gradientStop = {
        stopOpacity: 0.5,
      };
      const height = 64;
      // const maskFillColor = undefined;
      // const border = undefined;
      const grey_gainsboro = colors.Neutral.n100;
      const white_snow = colors.Neutral.n0;
      // ==============================

      useEffect(() => {
        startOffset.value = withRepeat(
          withTiming(width, {
            duration: animationTime,
            easing: Easing.linear,
          }),
          -1,
        );
      }, []);

      const animatedStyle = useAnimatedStyle(
        () => ({
          transform: [{translateX: startOffset.value}],
        }),
        [],
      );

      const d = useDerivedValue(() => {
        const useableHeight = height - paddingMedium * 2;
        const boneHeight = (useableHeight - 8) / 2;
        const boneRadius = boneHeight / 2;
        const circleRadius = useableHeight / 2;
        const avatarBoneWidth = circleRadius * 2 + paddingSmall * 2;
        const detailsBonesWidth = width - avatarBoneWidth;

        return `M0 0 h${width} v${height} h-${width}z M${paddingSmall} ${
          height / 2
        } a${circleRadius} ${circleRadius} 0 1 0 ${
          circleRadius * 2
        } 0 a${circleRadius} ${circleRadius} 0 1 0 -${circleRadius * 2} 0z M${
          avatarBoneWidth + boneRadius
        } ${paddingMedium} a${boneRadius} ${boneRadius} 0 1 0 0 ${boneHeight}z M${
          avatarBoneWidth - boneRadius + detailsBonesWidth * 0.25
        } ${paddingMedium} h-${detailsBonesWidth * 0.25 - boneRadius * 2} v${boneHeight} h${
          detailsBonesWidth * 0.25 - boneRadius * 2
        }z M${avatarBoneWidth - boneRadius + detailsBonesWidth * 0.25} ${
          paddingMedium + boneHeight
        } a${boneRadius} ${boneRadius} 0 1 0 0 -${boneHeight}z M${avatarBoneWidth + boneRadius} ${
          paddingMedium + boneHeight + paddingSmall
        } a${boneRadius} ${boneRadius} 0 1 0 0 ${boneHeight}z M${
          avatarBoneWidth + detailsBonesWidth * 0.8 - boneRadius
        } ${paddingMedium + boneHeight + paddingSmall} h-${
          detailsBonesWidth * 0.8 - boneRadius * 2
        } v${boneHeight} h${detailsBonesWidth * 0.8 - boneRadius * 2}z M${
          avatarBoneWidth + detailsBonesWidth * 0.8 - boneRadius
        } ${height - paddingMedium} a${boneRadius} ${boneRadius} 0 1 0 0 -${boneHeight}z M${
          avatarBoneWidth + detailsBonesWidth * 0.8 + boneRadius + paddingLarge
        } ${
          paddingMedium + boneHeight + paddingSmall
        } a${boneRadius} ${boneRadius} 0 1 0 0 ${boneHeight}z M${width - paddingSmall - boneRadius} ${
          paddingMedium + boneHeight + paddingSmall
        } h-${
          width -
          paddingSmall -
          boneRadius -
          (avatarBoneWidth +
            detailsBonesWidth * 0.8 +
            boneRadius +
            paddingLarge)
        } v${boneHeight} h${
          width -
          paddingSmall -
          boneRadius -
          (avatarBoneWidth +
            detailsBonesWidth * 0.8 +
            boneRadius +
            paddingLarge)
        }z M${width - paddingSmall * 2} ${
          height - paddingMedium
        } a${boneRadius} ${boneRadius} 0 1 0 0 -${boneHeight}z`;
      }, []);

      return (
        <View style={styles.container} testID="channel-preview-skeleton">
          <View style={[styles.background, {backgroundColor: white_snow}]} />
          <Animated.View style={[animatedStyle, styles.background]}>
            <Svg height={height} width={width}>
              <Rect
                fill="url(#gradient)"
                height={height}
                width={width}
                x={0}
                y={0}
              />
              <Defs>
                <LinearGradient
                  gradientUnits="userSpaceOnUse"
                  id="gradient"
                  x1={0}
                  x2={width}
                  y1={0}
                  y2={0}>
                  <Stop
                    offset={1}
                    stopColor={grey_gainsboro}
                    {...gradientStart}
                  />
                  <Stop
                    offset={0.5}
                    stopColor={grey_gainsboro}
                    {...gradientStop}
                  />
                  <Stop
                    offset={0}
                    stopColor={grey_gainsboro}
                    {...gradientStart}
                  />
                </LinearGradient>
              </Defs>
            </Svg>
          </Animated.View>
          <Svg height={height} width={width}>
            <Path d={d.value} fill={white_snow} />
          </Svg>
        </View>
      );
    },
    (prev, next) => isEqual(prev, next),
  );
