import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  usePSThreadNavigationContext,
  usePSThreadSwipeRowContext,
  useThreadActionsOverlay,
} from '../../contexts';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {PSThreadItemTitle} from './title/PSThreadItemTitle';
import {PSMessageEntity, PSThreadModel} from '../../../../types';
import {PSThreadItemSubTitle} from './subtitle/PSThreadItemSubTitle';
import {PSThreadItemSwipeRight} from './PSThreadItemSwipeRight';
import moment from 'moment';
import {PSThreadItemAvatar} from './avatar';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {
  usePSDesignSystemContext,
  usePSIsDeskModeContext,
  usePSScreenStylesContext,
} from '../../../../context';
import {PSThreadGroupLevelType} from '@communi/chat-api-client-typescript';
import {PSThreadItemTags} from './tags';
import {PSThreadsStyles} from '../../PSThreadsStyles';
import {
  THREAD_AVATAR_SIZE,
  THREAD_MARGIN_BOTTOM,
  THREAD_MARGIN_HORIZONTAL,
  THREAD_MARGIN_TOP,
} from './PSThreadItem';

export const BUTTON_WIDTH = (75).px();
export const MARGIN_BUTTON_WIDTH = (4).px();
const MAX_TRANSLATE = -(BUTTON_WIDTH * 3 + MARGIN_BUTTON_WIDTH * 3 * 2);
const TWO_TRANSLATE = -(BUTTON_WIDTH * 2 + MARGIN_BUTTON_WIDTH * 2 * 2);

export const springConfig = (velocity: number) => {
  'worklet';
  return {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
    velocity,
  };
};

type PSThreadItemContentProps = {
  item: PSThreadModel;
};

export const PSThreadItemContent =
  // javascript-obfuscator:disable
  React.memo(
    ({item}: PSThreadItemContentProps) => {
      const {colors} = usePSDesignSystemContext();

      const {translateX} = usePSThreadSwipeRowContext();

      const handler = useAnimatedGestureHandler({
        onStart: (_evt: any, ctx: {x: any}) => {
          ctx.x = translateX.value;
        },

        onActive: (evt: {translationX: any}, ctx: {x: any}) => {
          const nextTranslate = evt.translationX + ctx.x;
          translateX.value = Math.min(
            0,
            Math.max(
              nextTranslate,
              item.isJoined ? MAX_TRANSLATE : TWO_TRANSLATE,
            ),
          );
        },

        onEnd: (evt: {velocityX: number}) => {
          if (evt.velocityX < -20) {
            translateX.value = withSpring(
              item.isJoined ? MAX_TRANSLATE : TWO_TRANSLATE,
              springConfig(evt.velocityX),
            );
          } else {
            translateX.value = withSpring(0, springConfig(evt.velocityX));
          }
        },
      });

      const animatedStyles = useAnimatedStyle(() => {
        return {
          transform: [
            {
              translateX: translateX.value,
            },
          ],
        };
      });

      return (
        <View style={{position: 'relative'}}>
          <PanGestureHandler
            hitSlop={{left: -60}}
            activeOffsetX={[-30, 30]}
            onGestureEvent={handler}>
            <Animated.View style={animatedStyles}>
              <PSThreadItemInfo item={item} />
              <PSThreadItemSwipeRight
                threadId={item.id}
                pinnedAt={item.pinnedAt}
                isMute={item.isMute}
                isJoin={item.isJoined}
              />
            </Animated.View>
          </PanGestureHandler>
          <View
            style={[
              styles.borderDivider,
              {
                left: THREAD_AVATAR_SIZE + THREAD_MARGIN_HORIZONTAL * 2,
                right: THREAD_MARGIN_HORIZONTAL,
                backgroundColor: colors.Primary.linerBorder,
              },
            ]}
          />
        </View>
      );
    },
    (prev, next) => isEqual(prev, next),
  );

const PSThreadItemInfo =
  // javascript-obfuscator:disable
  React.memo(
    ({item}: {item: PSThreadModel}) => {
      const threadItemStyle =
        usePSScreenStylesContext<PSThreadsStyles>().threadItem?.style;

      const contentContainerStyle =
        usePSScreenStylesContext<PSThreadsStyles>().threadItem
          ?.contentContainerStyle;

      const {onPressThread} = usePSThreadNavigationContext();

      const showThreadActions = useThreadActionsOverlay();

      const lastMessageCreatedAt = React.useMemo(() => {
        return moment(item.lastMessage.createdAt).format(
          moment(item.lastMessage.createdAt).isSame(moment(), 'day')
            ? 'HH:mm A'
            : 'DD/MM',
        );
      }, [item.lastMessage.createdAt]);

      const onPress = () => {
        onPressThread?.(
          item.id,
          Math.max(
            item.lastMessage.id - item.unreadCount,
            PSMessageEntity.FIRST_MESSAGE_ID,
          ),
        );
      };

      const onLongPress = React.useCallback(() => {
        showThreadActions(item.id);
      }, [item.id, showThreadActions]);

      const {colors} = usePSDesignSystemContext();

      const {isDeskMode} = usePSIsDeskModeContext();

      const isSubThread = React.useMemo(() => {
        return !!(
          item.parentId &&
          item.parentId !== '0' &&
          item.originalMessageId !== 0
        );
      }, [item.parentId, item.originalMessageId]);

      return (
        <PSDebouncedPressable
          // @ts-ignore
          style={({pressed}) => [
            styles.container,
            {
              backgroundColor: pressed
                ? colors.Primary.background
                : colors.Primary.white,
              opacity: pressed ? 0.6 : 1,
            },
            threadItemStyle,
          ]}
          onPress={onPress}
          onLongPress={onLongPress}>
          <PSThreadItemAvatar
            parentId={item.parentId}
            isSubThread={isSubThread}
            avatar={item.avatar}
            name={item.name}
            isOnline={item.isOnline}
            isPublicGroup={
              item.groupLevel === PSThreadGroupLevelType.PUBLIC_GROUP
            }
          />
          <View style={[styles.contentContainerStyle, contentContainerStyle]}>
            <PSThreadItemTitle
              isSubThread={isSubThread}
              name={item.name}
              pinnedAt={item.pinnedAt}
              lastMessageCreatedAt={lastMessageCreatedAt}
              isMute={item.isMute}
              isBot={item.isBot}
              isAgent={item.isAgent}
              verified={item.verified}
              isLastMessageCreatedAtVisible={item.lastMessage.createdAt !== 0}
            />

            <PSThreadItemSubTitle
              description={item.contentLastMessage}
              typingUsers={item.typingUsers}
              isLastMessageError={item.lastMessage.status === 'error'}
              unreadCount={item.unreadCount}
              unreadMentionedCount={item.unreadMentionedCount}
              visible={item.lastMessage.createdAt !== 0}
              isMute={item.isMute}
            />

            {isDeskMode ? (
              <PSThreadItemTags
                tags={item.tags.filter(tag => tag.isPredefined)}
              />
            ) : null}
          </View>
        </PSDebouncedPressable>
      );
    },
    (prev, next) => isEqual(prev, next),
  );

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: THREAD_MARGIN_TOP,
    paddingBottom: THREAD_MARGIN_BOTTOM,
    paddingHorizontal: THREAD_MARGIN_HORIZONTAL,
  },
  contentContainerStyle: {
    marginLeft: THREAD_MARGIN_HORIZONTAL,
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  borderDivider: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: (1).px(),
  },
});
