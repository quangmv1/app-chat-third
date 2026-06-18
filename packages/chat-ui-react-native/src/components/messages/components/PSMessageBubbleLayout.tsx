import React, {PropsWithChildren} from 'react';
import {
  PSMessageStatus,
  PSUserModel,
  PSVisibility,
  isDeletedMessage,
} from '../../../types';
import {PSDeleteMessageLevel} from '@communi/chat-api-client-typescript';
import {
  MESSAGE_AVATAR_SENDER_SIZE,
  MESSAGE_BORDER_RADIUS,
  MESSAGE_BORDER_WIDTH,
  MESSAGE_CONTENT_MARGIN_AVATAR,
  MESSAGE_CONTENT_MARGIN_STATUS,
  MESSAGE_MARGIN_HORIZONTAL,
  MESSAGE_MAX_WIDTH,
  MESSAGE_STATUS_SIZE,
  usePSMessageItemContext,
} from './PSMessageItem';
import {Platform, StyleSheet, View, ViewStyle} from 'react-native';
import {PSMessageSelector} from './select';
import {PSMessageErrorStatus, PSMessageMyStatus} from './status';
import {PSMessageSenderAvatar} from './sender-avatar';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../context';
import {usePSMessageIsSubthreadContext} from '../contexts';

export const PSMessageBubbleLayout = React.memo(
  (
    props: PropsWithChildren<{
      avatarVisibility: PSVisibility;
      messagePrimaryKey: string;
      messageId: number;
      messageStatus: PSMessageStatus;
      messageSender: PSUserModel;
      isMessageStatusVisible: boolean;
      messageDeleteLevel?: PSDeleteMessageLevel;
      withAwesomeBackground?: boolean;
      isStretchWidth?: boolean;
      isPSMessageSubThread?: boolean;
    }>,
  ) => {
    const {colors} = usePSDesignSystemContext();

    const {isOverlay, isMyMessage, onMessagePress, onMessageLongPress} =
      usePSMessageItemContext();

    const rowStyles = React.useMemo(
      () =>
        ({
          flexWrap: 'wrap',
          flexDirection: isMyMessage ? 'row-reverse' : 'row',
          marginStart: isMyMessage
            ? isOverlay
              ? undefined
              : MESSAGE_CONTENT_MARGIN_STATUS + MESSAGE_STATUS_SIZE
            : undefined,
          marginHorizontal: isOverlay ? undefined : MESSAGE_MARGIN_HORIZONTAL,
        }) as ViewStyle,
      [isMyMessage, isOverlay],
    );

    const contentStyles = React.useMemo(
      () =>
        ({
          overflow: 'hidden',
          maxWidth: MESSAGE_MAX_WIDTH,
          width: props.isStretchWidth ? MESSAGE_MAX_WIDTH : undefined,
          borderRadius: MESSAGE_BORDER_RADIUS,
          borderWidth: MESSAGE_BORDER_WIDTH,
          borderColor: isMyMessage
            ? colors.Primary.bgBubble
            : colors.Primary.white,
          backgroundColor: isMyMessage
            ? colors.Primary.bgBubble
            : colors.Primary.white,
          alignItems: isMyMessage ? 'flex-end' : 'flex-start',
          marginStart: isMyMessage
            ? undefined
            : props.avatarVisibility !== PSVisibility.GONE // || isOverlay
              ? MESSAGE_CONTENT_MARGIN_AVATAR
              : undefined,
          marginEnd: isMyMessage ? MESSAGE_CONTENT_MARGIN_STATUS : undefined,
          ...Platform.select({
            ios: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 1,
            },
            android: {
              elevation: 0.5, // Tăng giá trị này nếu muốn shadow rõ hơn
            },
          }),
        }) as ViewStyle,
      [
        props.isStretchWidth,
        colors.Primary.bgBubble,
        colors.Primary.white,
        isMyMessage,
        // isOverlay,
        props.avatarVisibility,
      ],
    );

    const isDeleted = isDeletedMessage(isMyMessage, props.messageDeleteLevel);

    const isSubThread = usePSMessageIsSubthreadContext();

    return (
      <View style={rowStyles}>
        {!isMyMessage && !isSubThread && (
          <PSMessageSelector
            messageId={props.messageId}
            isDeleted={isDeleted}
            status={props.messageStatus}
            containerStyle={styles.partnerSelector}
          />
        )}
        <PSMessageMyStatus
          status={props.messageStatus}
          isMessageStatusVisible={props.isMessageStatusVisible}
          size={MESSAGE_STATUS_SIZE}
        />
        <PSMessageSenderAvatar
          sender={props.messageSender}
          size={MESSAGE_AVATAR_SENDER_SIZE}
          visibility={props.avatarVisibility}
        />

        {props.withAwesomeBackground ? (
          <PSDebouncedPressable
            style={contentStyles}
            onPress={onMessagePress}
            onLongPress={onMessageLongPress}>
            {props.children}
          </PSDebouncedPressable>
        ) : (
          props.children
        )}

        <PSMessageErrorStatus
          messagePrimaryKey={props.messagePrimaryKey}
          isDeleted={isDeleted}
          status={props.messageStatus}
        />
        {isMyMessage && !props.isPSMessageSubThread && (
          <PSMessageSelector
            messageId={props.messageId}
            isDeleted={isDeleted}
            status={props.messageStatus}
            containerStyle={styles.mySelector}
          />
        )}
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  partnerSelector: {justifyContent: 'center', marginEnd: (8).px()},
  mySelector: {flex: 1, justifyContent: 'center', marginEnd: (8).px()},
});
