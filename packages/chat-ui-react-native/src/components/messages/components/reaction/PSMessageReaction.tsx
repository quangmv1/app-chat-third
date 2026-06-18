import React from 'react';
import {PSMessageReactionModel} from '../../../../types';
import {usePSMessageItemContext} from '../PSMessageItem';
import {
  usePSMessageReaction,
  usePSMessageReactionsOverlayActionContext,
} from '../../contexts';
import {StyleSheet, Text} from 'react-native';
import {IcAddReaction} from '../../../../icons';
import isEqual from 'react-fast-compare';
import {PS_MESSAGE_REACTION_ADD_ITEM_NAME} from '../../../../utils';
import {useRenderCounter} from '../../../../hooks';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../context';
import {REACTION_ROW_HEIGHT} from './PSMessageReactions';

export const PSMessageReaction = React.memo(
  ({
    messageId,
    reaction,
    index,
  }: {
    messageId: number;
    reaction: PSMessageReactionModel;
    index: number;
  }) => {
    useRenderCounter('MessageReaction');

    const {colors} = usePSDesignSystemContext();

    const {myUserId} = usePSMessageItemContext();

    const {show} = usePSMessageReactionsOverlayActionContext();

    const {openEmojiPicker, onEmojiUnselected, fastReactMessage} =
      usePSMessageReaction();

    const isContainsMyReact = React.useMemo(() => {
      return reaction.userIds.includes(myUserId);
    }, [myUserId, reaction.userIds]);

    const onPress = () => {
      if (reaction.name === PS_MESSAGE_REACTION_ADD_ITEM_NAME) {
        openEmojiPicker(messageId);
      } else {
        if (reaction.userIds.includes(myUserId)) {
          onEmojiUnselected(messageId, reaction.name);
        } else {
          fastReactMessage(messageId, reaction.name);
        }
      }
    };

    const onLongPress = () => {
      if (reaction.name !== PS_MESSAGE_REACTION_ADD_ITEM_NAME) {
        show(messageId, index);
      }
    };

    const containerStyles = React.useMemo(() => {
      return [
        styles.container,
        {
          borderColor: isContainsMyReact
            ? colors.Primary.branding
            : colors.Primary.white,
          backgroundColor: isContainsMyReact
            ? colors.Primary.bgBranding
            : colors.Primary.background,
        },
      ];
    }, [
      colors.Primary.branding,
      colors.Primary.white,
      colors.Primary.bgBranding,
      colors.Primary.background,
      isContainsMyReact,
    ]);

    return (
      <PSDebouncedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={containerStyles}>
        <MemoizeReactContent
          reaction={reaction}
          isMyReact={isContainsMyReact}
        />
      </PSDebouncedPressable>
    );
  },
  (
    prev: {
      messageId: number;
      reaction: PSMessageReactionModel;
    },
    next: {
      messageId: number;
      reaction: PSMessageReactionModel;
    },
  ) => {
    return (
      prev.messageId === next.messageId && isEqual(prev.reaction, next.reaction)
    );
  },
);

const AddEmoji = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  return (
    <IcAddReaction
      width={(18).px()}
      height={(18).px()}
      fill={colors.Neutral.n700}
    />
  );
});

const EmojiText = React.memo(
  ({emoji}: {emoji: string}) => {
    return <Text>{emoji}</Text>;
  },
  (prev, next) => {
    return prev.emoji === next.emoji;
  },
);

const EmojiCounterText = React.memo(
  ({count}: {count: number}) => {
    return <Text> {count > 99 ? '99+' : count}</Text>;
  },
  (prev, next) => {
    return prev.count === next.count;
  },
);

const MemoizeReactContent = React.memo(
  ({
    reaction,
    isMyReact,
  }: {
    reaction: PSMessageReactionModel;
    isMyReact: boolean;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        {color: isMyReact ? colors.Primary.branding : colors.Primary.subText},
        typography.bodyMediumR,
      ];
    }, [
      colors.Primary.branding,
      colors.Primary.subText,
      typography.bodyMediumR,
      isMyReact,
    ]);

    return reaction.name === PS_MESSAGE_REACTION_ADD_ITEM_NAME ? (
      <AddEmoji />
    ) : (
      <Text style={textStyles}>
        <EmojiText emoji={reaction.emoji} />
        <EmojiCounterText count={reaction.userIds.length} />
      </Text>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    // paddingVertical: (4).px(),
    paddingHorizontal: (8).px(),
    borderWidth: (1).px(),
    borderRadius: (100).px(),
    marginEnd: (4).px(),
    height: REACTION_ROW_HEIGHT,
    justifyContent: 'center',
  },
});
