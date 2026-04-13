import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  usePSMessageActionsOverlayContext,
  usePSMessageActionsOverlayMessageContext,
  usePSMessageActionsOverlayVisibleContext,
} from '../../../contexts';
import {MESSAGE_MARGIN_HORIZONTAL, PSMessageItem} from '../../PSMessageItem';
import {PSMessageModel} from '../../../../../types';
import {PSMessageActionsOverlayReactions} from './PSMessageActionsOverlayReactions';
import {PSMessageActionsOverlayActions} from './PSMessageActionsOverlayActions';
import isEqual from 'react-fast-compare';

export const PSMessageActionsOverlay = React.memo(() => {
  const {hide} = usePSMessageActionsOverlayContext();

  const {message, isPinned} = usePSMessageActionsOverlayMessageContext();

  const isVisible = usePSMessageActionsOverlayVisibleContext();

  const [scrollOffset, setScrollOffset] = React.useState<number>();
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const handleScrollTo = (p: any) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo(p);
    }
  };

  React.useLayoutEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (isVisible && message && scrollViewRef.current) {
      timeout = setTimeout(() => {
        scrollViewRef.current!.scrollToEnd();
      }, 200);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isVisible, message]);

  return isVisible && message !== undefined ? (
    <Modal
      swipeDirection={['down']}
      scrollTo={handleScrollTo}
      scrollOffset={scrollOffset}
      scrollOffsetMax={100} // content height - ScrollView height
      propagateSwipe={true}
      onBackdropPress={hide}
      isVisible={isVisible && message !== undefined}
      backdropColor="#000000"
      backdropOpacity={0.8}
      style={styles.bottomSheet}
      animationIn="zoomInRight"
      animationOut="zoomOutRight"
      animationInTiming={600}
      animationOutTiming={600}
      backdropTransitionInTiming={600}
      backdropTransitionOutTiming={600}>
      <Pressable onPress={hide} style={styles.pressable}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.scrollContentContainerStyle}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onScroll={handleOnScroll}
          scrollEventThrottle={16}>
          <ContentContainer message={message} isPinned={isPinned} />
        </ScrollView>
      </Pressable>
    </Modal>
  ) : null;
});

const ContentContainer = React.memo(
  ({message, isPinned}: {message?: PSMessageModel; isPinned: boolean}) => {
    const style = React.useMemo(() => {
      return {
        alignItems: message?.isMyMessage ? 'flex-end' : 'flex-start',
      } as ViewStyle;
    }, [message?.isMyMessage]);

    return message ? (
      <View style={[styles.contentContainer, style]}>
        <View style={styles.fakeView} />
        <PSMessageItem message={message} isOverlay={true} />
        {!message.body?.poll && (
          <PSMessageActionsOverlayReactions
            messageId={message.id}
            messageStatus={message.status}
            isMyMessage={message.isMyMessage}
          />
        )}
        {!message.body?.promotion ? (
          <PSMessageActionsOverlayActions
            message={message}
            isPinned={isPinned}
          />
        ) : null}
        <View style={styles.fakeView} />
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  bottomSheet: {
    flexDirection: 'column',
    marginHorizontal: MESSAGE_MARGIN_HORIZONTAL,
  },
  pressable: {
    height: '100%',
    width: '100%',
  },
  scrollViewStyle: {flex: 1, width: '100%'},
  scrollContentContainerStyle: {flexGrow: 1, width: '100%'},
  contentContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  fakeView: {
    flex: 1,
  },
});
