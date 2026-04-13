import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {IcAddReaction} from '../../../../../icons';
import {
  usePSMessageActionsOverlayModeContext,
  usePSMessageActionsOverlayContext,
  usePSMessageReaction,
  usePSMessageCurrentThreadIdContext,
} from '../../../contexts';
import {
  fastReactionsEmoji,
  PS_MESSAGE_REACTION_ADD_ITEM_NAME,
} from '../../../../../utils';
import {PSMessageStatus} from '../../../../../types';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../../context';
import {
  MESSAGE_AVATAR_SENDER_SIZE,
  MESSAGE_BORDER_RADIUS,
  MESSAGE_CONTENT_MARGIN_AVATAR,
} from '../../PSMessageItem';

type MessageReactionItem = {
  id: number;
  name?: string;
  emoji?: string;
};

const fastReactions = fastReactionsEmoji();

const messageReactions: MessageReactionItem[] = [
  ...fastReactions.map((emoji, index) => {
    return {
      id: index,
      name: emoji?.emoji,
      emoji: emoji?.emoji,
    } as MessageReactionItem;
  }),
  {
    id: fastReactions.length,
    name: PS_MESSAGE_REACTION_ADD_ITEM_NAME,
    emoji: undefined,
  },
];

export const PSMessageActionsOverlayReactions = React.memo(
  ({
    messageId,
    messageStatus,
    isMyMessage,
  }: {
    messageId: number;
    messageStatus: PSMessageStatus;
    isMyMessage: boolean;
  }) => {
    const {colors} = usePSDesignSystemContext();

    const {mode} = usePSMessageActionsOverlayModeContext();

    const containerStyles = React.useMemo(() => {
      return [
        styles.reactionList,
        {
          backgroundColor: colors.Primary.white,
          marginStart: isMyMessage
            ? undefined
            : MESSAGE_AVATAR_SENDER_SIZE + MESSAGE_CONTENT_MARGIN_AVATAR,
        },
      ];
    }, [colors.Primary.white, isMyMessage]);

    return mode === 'normal' && messageStatus === 'sent' ? (
      <View style={containerStyles}>
        {messageReactions.map(item => (
          <ReactionItem
            key={item.id.toString()}
            item={item}
            messageId={messageId}
          />
        ))}
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const ReactionItem = React.memo(
  ({item, messageId}: {item: MessageReactionItem; messageId: number}) => {
    const {colors} = usePSDesignSystemContext();

    const currentThreadId = usePSMessageCurrentThreadIdContext();

    const {hide} = usePSMessageActionsOverlayContext();

    const {fastReactMessage, openEmojiPicker} = usePSMessageReaction();

    const onPress = () => {
      hide();
      if (currentThreadId && item.name) {
        if (item.name === PS_MESSAGE_REACTION_ADD_ITEM_NAME) {
          openEmojiPicker(messageId);
        } else {
          fastReactMessage(messageId, item.name);
        }
      }
    };

    return (
      <PSDebouncedPressable style={styles.reactionContainer} onPress={onPress}>
        {item.name === PS_MESSAGE_REACTION_ADD_ITEM_NAME ? (
          <IcAddReaction
            width={(24).px()}
            height={(24).px()}
            fill={colors.Primary.subText}
          />
        ) : (
          <Text style={styles.reactionEmoji}>{item.emoji}</Text>
        )}
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  reactionList: {
    flexDirection: 'row',
    padding: (12).px(),
    borderRadius: MESSAGE_BORDER_RADIUS,
    marginTop: (12).px(),
    maxWidth: (300).px(),
  },
  reactionContainer: {justifyContent: 'center', alignItems: 'center'},
  reactionEmoji: {fontSize: (20).px(), marginEnd: (12).px(), color: '#000'},
});
