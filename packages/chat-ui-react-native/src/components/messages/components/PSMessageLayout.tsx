import React, {PropsWithChildren} from 'react';
import {
  PSMessageReactionModel,
  PSMessageStatus,
  PSUserModel,
  PSVisibility,
} from '../../../types';
import {
  MESSAGE_AVATAR_SENDER_SIZE,
  MESSAGE_CONTENT_MARGIN_AVATAR,
  MESSAGE_MARGIN_HORIZONTAL,
  MESSAGE_REACTIONS_MARGIN_TOP,
  MESSAGE_REACTIONS_OVERLAY_TOP,
  MESSAGE_SEEN_USERS_MARGIN_TOP,
  MESSAGE_STATUS_SIZE,
  usePSMessageItemContext,
  usePSMessageSimpleItemStylesContext,
} from './PSMessageItem';
import {PSMessageHighlightBackground} from './background';
import {PSMessageUnreadHeader} from './unread';
import {PSMessageHeaderTime} from './time';
import {PSMessageInterceptorView} from './PSMessageInterceptorView';
import isEqual from 'react-fast-compare';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {
  PSMessageReactions,
  REACTION_ROW_DIVIDER_HEIGHT,
  REACTION_ROW_HEIGHT,
} from './reaction';
import {PSMessageSeenUsers} from './seen';

export const PSMessageLayout = React.memo(
  (
    props: PropsWithChildren<{
      isHighlightEnabled?: boolean;
      isPSMessageSubThread?: boolean;
      isFirstUnreadVisible?: boolean;
      isHeaderTimeVisible?: boolean;
      isInterceptorDisabled: boolean;
      messagePrimaryKey: string;
      messageId: number;
      messageCreatedAt: number;
      messageStatus: PSMessageStatus;
      messageReactions?: PSMessageReactionModel[];
      messageSeenUsers?: PSUserModel[];
      avatarVisibility?: PSVisibility;
    }>,
  ) => {
    const {margin} = usePSMessageSimpleItemStylesContext();

    const {isMyMessage} = usePSMessageItemContext();

    const messageContainerMarginStyle = React.useMemo(
      () =>
        ({
          marginTop: margin.marginTop,
          marginBottom: margin.marginBottom,
        }) as ViewStyle,
      [margin.marginTop, margin.marginBottom],
    );

    const reactionsStyle = React.useMemo(() => {
      return {
        alignItems: isMyMessage ? 'flex-end' : 'flex-start',
        marginStart: isMyMessage
          ? undefined
          : props.avatarVisibility !== PSVisibility.GONE
            ? MESSAGE_MARGIN_HORIZONTAL +
              MESSAGE_AVATAR_SENDER_SIZE +
              MESSAGE_CONTENT_MARGIN_AVATAR
            : MESSAGE_MARGIN_HORIZONTAL,
        marginEnd: isMyMessage
          ? MESSAGE_MARGIN_HORIZONTAL + MESSAGE_STATUS_SIZE
          : undefined,
        marginTop: MESSAGE_REACTIONS_MARGIN_TOP,
      } as ViewStyle;
    }, [isMyMessage, props.avatarVisibility]);

    const seenUsersStyle = React.useMemo(() => {
      return {
        flexDirection: 'row',
        alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
        marginTop: MESSAGE_SEEN_USERS_MARGIN_TOP,
        marginHorizontal: isMyMessage
          ? MESSAGE_MARGIN_HORIZONTAL + MESSAGE_STATUS_SIZE
          : props.avatarVisibility !== PSVisibility.GONE
            ? MESSAGE_MARGIN_HORIZONTAL +
              MESSAGE_AVATAR_SENDER_SIZE +
              MESSAGE_CONTENT_MARGIN_AVATAR
            : MESSAGE_MARGIN_HORIZONTAL,
      } as ViewStyle;
    }, [isMyMessage, props.avatarVisibility]);

    const reactionsHeight = React.useMemo(() => {
      if (!props.messageReactions) {
        return 0;
      } else {
        const numRows = Math.ceil(props.messageReactions.length / 5);
        const gridHeight =
          numRows * REACTION_ROW_HEIGHT +
          (numRows - 1) * REACTION_ROW_DIVIDER_HEIGHT;
        return gridHeight;
      }
    }, [props.messageReactions]);

    return (
      <PSMessageHighlightBackground
        enabled={props.isHighlightEnabled}
        messageId={props.messageId}
        messageStatus={props.messageStatus}
        containerStyle={[styles.messageContainer, messageContainerMarginStyle]}>
        <PSMessageUnreadHeader isVisible={props.isFirstUnreadVisible} />
        <PSMessageHeaderTime
          primaryKey={props.messagePrimaryKey}
          createdAt={props.messageCreatedAt}
          isVisible={props.isHeaderTimeVisible}
          containerStyle={styles.headerTimeContainer}
        />
        <View
          style={{
            position: 'relative',
            marginBottom: Math.max(
              0,
              reactionsHeight - MESSAGE_REACTIONS_OVERLAY_TOP,
            ),
          }}>
          {props.children}
          {props.messageReactions && (
            <View
              style={[
                {backgroundColor: 'transparent'}, // transparent
                {
                  width: '100%',
                  position: 'absolute',
                  bottom: -reactionsHeight + MESSAGE_REACTIONS_OVERLAY_TOP,
                  zIndex: 1,
                },
              ]}>
              <PSMessageReactions
                messageId={props.messageId}
                reactions={props.messageReactions}
                containerStyle={reactionsStyle}
              />
            </View>
          )}
        </View>

        {props.messageSeenUsers && (
          <PSMessageSeenUsers
            seenUsers={props.messageSeenUsers}
            containerStyle={seenUsersStyle}
          />
        )}
        <PSMessageInterceptorView
          messageId={props.messageId}
          disabled={props.isInterceptorDisabled || !!props.isPSMessageSubThread}
        />
      </PSMessageHighlightBackground>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  messageContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerTimeContainer: {
    paddingHorizontal: (8).px(),
    paddingVertical: (4).px(),
    marginTop: (4).px(),
    marginBottom: (12).px(),
  },
});
