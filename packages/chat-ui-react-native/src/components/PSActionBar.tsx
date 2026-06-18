import React from 'react';
import {
  ColorValue,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {PSIcQuickLeft24} from '../icons';
import {PSDebouncedPressable} from './PSDebouncedPressable';
import isEqual from 'react-fast-compare';
import {usePSDesignSystemContext} from '../context';

const ACTION_BAR_CONTENT_HEIGHT = (60).px();

type PSActionBarProps = {
  titleText: string;
  inSafeArea?: boolean;
  LeftContent?: React.ElementType;
  onBackPress?: null | (() => void);
  RightContent?: React.ElementType;
  style?: StyleProp<ViewStyle>;
  Subtitle?: React.ElementType;
  subtitleText?: string;
  Title?: React.ElementType;
};

export const PSActionBar = React.memo(
  (props: PSActionBarProps) => {
    const {
      // inSafeArea,
      LeftContent,
      onBackPress,
      RightContent = () => (
        <View style={{height: (24).px(), width: (24).px()}} />
      ),
      style,
      Subtitle,
      subtitleText,
      Title,
      titleText = 'PiScale Chat',
    } = props;

    const {typography, colors} = usePSDesignSystemContext();

    return (
      <View
        style={[
          styles.safeAreaContainer,
          {
            backgroundColor: colors.Primary.white,
            borderBottomColor: colors.Primary.border,
            height: ACTION_BAR_CONTENT_HEIGHT,
          },
          style,
        ]}>
        <View
          style={[
            styles.contentContainer,
            {
              height: ACTION_BAR_CONTENT_HEIGHT,
            },
          ]}>
          <View style={styles.centerContainer}>
            <View
              style={{
                paddingBottom:
                  !!Subtitle || !!subtitleText ? (3).px() : undefined,
              }}>
              {Title ? (
                <Title />
              ) : (
                !!titleText && (
                  <Text
                    style={[
                      typography.headingLargeB,
                      {
                        color: colors.Primary.subText,
                      },
                    ]}>
                    {titleText}
                  </Text>
                )
              )}
            </View>
            {Subtitle ? (
              <Subtitle />
            ) : (
              !!subtitleText && (
                <Text
                  style={[
                    typography.bodyMediumS,
                    {
                      color: colors.Neutral.n500,
                    },
                  ]}>
                  {subtitleText}
                </Text>
              )
            )}
          </View>
          <View style={styles.leftContainer}>
            {LeftContent ? (
              <LeftContent />
            ) : (
              <PSBackButton
                onBackPress={onBackPress}
                fillColor={colors.Primary.subText}
              />
            )}
          </View>
          <View style={styles.rightContainer}>
            <RightContent />
          </View>
        </View>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const PSBackButton = React.memo(
  ({
    style,
    fillColor,
    size,
    onBackPress,
  }: {
    style?: StyleProp<ViewStyle>;
    fillColor?: ColorValue;
    size?: number;
    onBackPress?: null | (() => void);
  }) => {
    return (
      <PSDebouncedPressable
        onPress={onBackPress}
        style={[styles.backButton, style]}>
        <PSIcQuickLeft24
          width={size ?? (32).px()}
          height={size ?? (32).px()}
          fill={fillColor}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  backButton: {
    // height: '100%',
    justifyContent: 'center',
  },
  backButtonUnreadCount: {
    left: (25).px(),
    position: 'absolute',
  },
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: (10).px(),
    paddingHorizontal: (16).px(),
  },
  leftContainer: {
    position: 'absolute',
    left: (16).px(),
    width: (150).px(),
    alignItems: 'flex-start',
  },
  rightContainer: {
    position: 'absolute',
    right: (16).px(),
    alignItems: 'flex-end',
    width: (150).px(),
  },
  safeAreaContainer: {
    borderBottomWidth: (0.5).px(),
  },
  subTitle: {
    fontSize: (12).px(),
  },
});
