import React from 'react';
import { PSMessageModel } from '../../../../types';
import {
  MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
  MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
  MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
  MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP,
  MESSAGE_MARGIN_HORIZONTAL,
} from '../PSMessageItem';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TextStyleAndroid,
} from 'react-native';
import { PSMessageLayout } from '../PSMessageLayout';
import { PSMessageBubbleLayout } from '../PSMessageBubbleLayout';
import isEqual from 'react-fast-compare';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import { PSMessageSenderName } from '../sender-name';
import { PSMessageTrailingTime } from '../time/PSMessageTrailingTime';

export const PSMessageDeletedWrapper = React.memo(
  ({ message }: { message: PSMessageModel }) => {
    const { typography, colors } = usePSDesignSystemContext();

    const senderNameStyle = React.useMemo(() => {
      return {
        marginTop: message.isSenderNameVisible
          ? MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP
          : undefined,
        marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
      } as TextStyle;
    }, [message.isSenderNameVisible]);

    const deletedTextStyle = React.useMemo(() => {
      return {
        marginHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
        marginTop: message.isSenderNameVisible
          ? MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP
          : MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP,
        marginBottom: MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
        color: colors.Primary.subText,
      } as TextStyle;
    }, [colors.Primary.subText, message.isSenderNameVisible]);
    const trailingTimeStyle = React.useMemo(() => {
      return {
        textAlign: 'right',
        alignSelf: 'flex-end',
        marginHorizontal: MESSAGE_MARGIN_HORIZONTAL,
        marginBottom: MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM,
      } as TextStyle;
    }, []);
    return (
      <PSMessageLayout
        isHighlightEnabled
        isFirstUnreadVisible={message.isFirstUnread}
        isHeaderTimeVisible={message.isHeaderTimeVisible}
        isInterceptorDisabled={true}
        messagePrimaryKey={message.primaryKey}
        messageId={message.id}
        messageCreatedAt={message.createdAt}
        messageStatus={message.status}>
        <PSMessageBubbleLayout
          avatarVisibility={message.avatarVisibility}
          messagePrimaryKey={message.primaryKey}
          messageId={message.id}
          messageStatus={message.status}
          isMessageStatusVisible={!message.isHideStatus}
          messageSender={message.sender}
          messageDeleteLevel={message.deleteLevel}
          withAwesomeBackground>
          <PSMessageSenderName
            verified={!!message.sender.verified}
            senderName={message.sender.name}
            isSenderNameVisible={message.isSenderNameVisible}
            senderAvatar={message.sender.avatar}
            isAvatarVisible={message.isAvatarOriginVisible}
            containerStyle={senderNameStyle}
          />
          <MemoizeText textStyle={[deletedTextStyle, typography.bodyXLargeR]} />
          <PSMessageTrailingTime
            createdAt={message.createdAt}
            containerStyle={trailingTimeStyle}
          />
        </PSMessageBubbleLayout>
      </PSMessageLayout>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  ({ textStyle }: { textStyle: StyleProp<TextStyleAndroid> }) => {
    const { translator } = usePSTranslationContext();

    return (
      <Text style={[textStyle, styles.text]}>
        {translator('ps_message_deleted')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  text: {
    flexShrink: 1,
    flexWrap: 'wrap',
    textAlign: 'left',
  },
});
