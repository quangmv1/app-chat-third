/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  ColorValue,
  LayoutAnimation,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {usePSIsOnlineContext} from '../context';
import isEqual from 'react-fast-compare';

type NetInfoStatusProps = {
  offlineText: string;
  offlineTextStyle: StyleProp<TextStyle>;
  offlineBackgroundColor: ColorValue;
  style?: StyleProp<ViewStyle>;
};

export const PSNetInfoStatus = React.memo(
  ({
    offlineText,
    offlineTextStyle,
    offlineBackgroundColor,
    style,
  }: NetInfoStatusProps) => {
    const isOnline = usePSIsOnlineContext();

    const prevRef = React.useRef<boolean | undefined>(undefined);

    const [isConnected, setConnected] = React.useState<boolean | undefined>();

    const timeoutRef = React.useRef<NodeJS.Timeout>();

    const lostConnection = () => {
      prevRef.current = false;

      setConnected(prev => {
        if (prev !== false) {
          // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        return false;
      });
    };

    const resetState = () => {
      prevRef.current = undefined;

      setConnected(prev => {
        if (prev !== undefined) {
          // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        return undefined;
      });
    };

    React.useEffect(() => {
      if (!isOnline) {
        if (prevRef.current === undefined) {
          timeoutRef.current = setTimeout(() => {
            lostConnection();
          }, 2000);
        } else {
          lostConnection();
        }
      } else if (prevRef.current === false && isOnline) {
        setConnected(true);
        timeoutRef.current = setTimeout(() => {
          resetState();
        }, 500);
      }
      return () => {
        clearTimeout(timeoutRef.current);
      };
    }, [isOnline]);

    return isConnected === false ? (
      <Content
        offlineText={offlineText}
        offlineTextStyle={offlineTextStyle}
        offlineBackgroundColor={offlineBackgroundColor}
        style={style}
      />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const Content = React.memo(
  ({
    offlineText,
    offlineTextStyle,
    offlineBackgroundColor,
    style,
  }: NetInfoStatusProps) => {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: offlineBackgroundColor,
          },
          style,
        ]}>
        <Text style={[styles.content, offlineTextStyle]}>{offlineText}</Text>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {paddingHorizontal: 16, paddingVertical: 8},
});
