import {EmojisByCategory} from 'rn-emoji-keyboard/src/types';
import emojisByGroup from 'rn-emoji-keyboard/src/assets/emojis.json';

const categories = emojisByGroup as EmojisByCategory[];

const emojis = categories.map(item => item.data).flat();

export const getEmojiByEmojiCode = (emojiCode: string) => {
  const emoji = emojis.filter(emoji => emojiCode === emoji.emoji)[0];
  return emoji
    ? {
        emoji: emoji.emoji,
        name: emoji.emoji,
        v: emoji.v,
        toneEnabled: emoji.toneEnabled,
        keywords: emoji.keywords,
      }
    : undefined;
};

export const fastReactionsEmoji = () => {
  return ['❤️', '😆', '😮', '😥', '😠', '👍'].map(nameEmoji =>
    getEmojiByEmojiCode(nameEmoji),
  );
};

export const PS_MESSAGE_REACTION_ADD_ITEM_NAME = 'reaction_add_item_name';
