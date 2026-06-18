import React from 'react';
import {Animated, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {IcLine15ArrowShapeTurnLeft} from '../../../../icons';
import {hapticHeavy} from '../../../../utils';
import {usePSMessageItemContext} from '../PSMessageItem';
import {
  usePSMessageInputRefContext,
  usePSReplyMessageSetIdContext,
} from '../../contexts';
import {PSMessageStatus} from '../../../../types';
import {useRenderCounter} from '../../../../hooks';

export const PSMessageSwipeable = ({
  messageId,
  isDeleted,
  status,
  containerStyle,
  children,
}: React.PropsWithChildren<{
  messageId: number;
  isDeleted: boolean;
  status: PSMessageStatus;
  containerStyle: StyleProp<ViewStyle>;
}>) => {
  useRenderCounter('PSMessageSwipeable');

  // const {isOverlay} = usePSMessageSimpleItemContext();

  // const textInputRef = usePSMessageInputRefContext();

  // const replyMessage = usePSReplyMessageSetIdContext();

  // const canSwipeable = !isDeleted && !isOverlay && status === 'sent';

  // const onSwipeableOpen = React.useCallback(
  //   (direction: 'left' | 'right', swipeable: Swipeable) => {
  //     if (direction === 'right' && canSwipeable) {
  //       swipeable.close();
  //     }
  //   },
  //   [canSwipeable],
  // );

  // const onSwipeableClose = React.useCallback(
  //   (direction: 'left' | 'right', _: Swipeable) => {
  //     if (direction === 'right' && canSwipeable) {
  //       hapticHeavy();
  //       replyMessage(messageId);
  //       textInputRef.current?.focus();
  //     }
  //   },
  //   [messageId, replyMessage, canSwipeable],
  // );

  // const renderRightActions = React.useCallback(
  //   (progress: Animated.AnimatedInterpolation<number>) => {
  //     return canSwipeable ? <RightActionIcon progress={progress} /> : null;
  //   },
  //   [canSwipeable],
  // );

  // const renderLeftActions = React.useCallback(() => {
  //   return null;
  // }, []);

  // const hitSlop = React.useMemo(() => {
  //   return {left: -60};
  // }, []);

  // return (
  //   <Swipeable
  //     childrenContainerStyle={containerStyle}
  //     friction={1.5}
  //     hitSlop={hitSlop}
  //     overshootFriction={2}
  //     overshootRight={canSwipeable}
  //     onSwipeableOpen={onSwipeableOpen}
  //     onSwipeableClose={onSwipeableClose}
  //     renderRightActions={renderRightActions}
  //     renderLeftActions={renderLeftActions}>
  //     {children}
  //   </Swipeable>
  // );
  return <View style={containerStyle}>{children}</View>;
};

const RightActionIcon = ({
  progress,
}: {
  progress: Animated.AnimatedInterpolation<number>;
}) => {
  const trans = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [64, 0],
  });

  return (
    <View style={styles.rightActionContainer}>
      <Animated.View
        style={[
          styles.rightActionAnimated,
          {
            transform: [{translateX: trans}],
          },
        ]}>
        <IcLine15ArrowShapeTurnLeft
          width={(24).px()}
          height={(24).px()}
          fill={'#C3C7CC'}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  rightActionContainer: {
    width: (48).px(),
    flexDirection: 'row',
  },
  rightActionAnimated: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
