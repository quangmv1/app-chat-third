import moment from 'moment';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleProp, View, ViewStyle, Text, StyleSheet} from 'react-native';
import {usePSDesignSystemContext} from '../../../../context';
import {usePSMessageItemContext} from '../PSMessageItem';

const MemoizeText = React.memo(
  ({text}: {text: string}) => {
    const {isMyMessage} = usePSMessageItemContext();

    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        typography.headingMediumS,
        {color: isMyMessage ? colors.Primary.mainText : colors.Primary.subText},
      ];
    }, [colors.Primary.subText, colors.Primary.mainText, isMyMessage, typography.headingMediumS]);

    return (
      <Text numberOfLines={1} ellipsizeMode="middle" style={textStyles}>
        {text.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeTime = React.memo(
  ({time}: {time: number}) => {
    const {isMyMessage} = usePSMessageItemContext();

    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.textTime,
        typography.bodyXLargeRI,
        {color: isMyMessage ? colors.Primary.mainText : colors.Primary.subText},
      ];
    }, [colors.Primary.subText, colors.Primary.mainText, isMyMessage, typography.bodyXLargeRI]);

    const timeSession = React.useMemo(() => {
      return moment(time).format('HH:mm, DD/MM/YYYY');
    }, [time]);

    return (
      <Text numberOfLines={1} ellipsizeMode="middle" style={textStyles}>
        {timeSession}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessageSession = React.memo(
  ({
    text,
    time,
    containerStyle,
  }: {
    text?: string;
    time?: number;
    containerStyle: StyleProp<ViewStyle>;
  }) => {
    return text && time ? (
      <View style={[styles.container, containerStyle]}>
        <MemoizeText text={text} />
        <MemoizeTime time={time} />
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  textTime: {
    marginTop: (8).px(),
  },
});
