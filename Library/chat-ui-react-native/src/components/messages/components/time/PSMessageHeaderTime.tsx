import React from 'react';
import Moment from 'react-moment';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {usePSMessageToShowHeaderTimeContext} from '../../contexts';
import {usePSMessageItemContext} from '../PSMessageItem';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../hooks';
import moment from 'moment';
import {usePSDesignSystemContext} from '../../../../context';

export const PSMessageHeaderTime = React.memo(
  ({
    primaryKey,
    createdAt,
    isVisible,
    containerStyle,
  }: {
    primaryKey: string;
    createdAt: number;
    isVisible?: boolean;
    containerStyle: StyleProp<ViewStyle>;
  }) => {
    const {isOverlay} = usePSMessageItemContext();

    const messageToShowHeaderTime = usePSMessageToShowHeaderTimeContext();

    useRenderCounter(
      'MessageHeaderTime',
      !isOverlay && (isVisible || messageToShowHeaderTime === primaryKey),
    );

    return !isOverlay &&
      (isVisible || messageToShowHeaderTime === primaryKey) ? (
      <View style={[containerStyle, styles.container]}>
        <MemoizeTime createdAt={createdAt} />
      </View>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const MemoizeTime = React.memo(
  ({createdAt}: {createdAt: number}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const format = React.useMemo(() => {
      return moment(createdAt).isSame(moment(), 'day')
        ? 'HH:mm'
        : 'DD MMMM HH:mm';
    }, [createdAt]);

    const textStyles = React.useMemo(() => {
      return [{color: colors.Primary.subText}, typography.bodyMediumR];
    }, [colors.Primary.subText, typography.bodyMediumR]);

    useRenderCounter('MessageHeaderTime.Time');
    return (
      <Moment
        format={format}
        toNow
        unix
        element={Text}
        // @ts-ignore
        style={textStyles}>
        {createdAt / 1000}
      </Moment>
    );
  },
  (prev, next) => {
    return prev.createdAt === next.createdAt;
  },
);

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});
