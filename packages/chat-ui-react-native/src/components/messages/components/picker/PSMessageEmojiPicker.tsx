import React from 'react';
import {usePSMessageReaction} from '../../contexts';
import {EmojiType} from 'rn-emoji-keyboard/src/types';
import EmojiPicker from 'rn-emoji-keyboard';
import {usePSDesignSystemContext} from '../../../../context';

export const PSMessageEmojiPicker = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const {isOpenned, closeEmojiPicker, onEmojiSelected} = usePSMessageReaction();

  const onEmojiSelectedCallback = React.useCallback(
    (emoji: EmojiType) => {
      onEmojiSelected(emoji.name, emoji.emoji);
    },
    [onEmojiSelected],
  );

  const theme = React.useMemo(() => {
    return {
      knob: colors.Neutral.n50,
      container: colors.Neutral.n0,
      header: colors.Primary.subText,
      skinTonesContainer: colors.Neutral.n0,
      search: {
        background: colors.Neutral.n0,
        text: colors.Primary.subText,
        placeholder: colors.Neutral.n400,
      },
      category: {
        icon: colors.Primary.subText,
        iconActive: colors.Branding.b600,
        container: colors.Neutral.n0,
        containerActive: colors.Neutral.n100,
      },
    };
  }, [
    colors.Neutral.n0,
    colors.Neutral.n100,
    colors.Neutral.n400,
    colors.Neutral.n50,
    colors.Primary.subText,
    colors.Branding.b600,
  ]);

  return (
    <EmojiPicker
      categoryPosition="bottom"
      onEmojiSelected={onEmojiSelectedCallback}
      open={isOpenned}
      onClose={closeEmojiPicker}
      enableRecentlyUsed
      enableSearchBar
      theme={theme}
    />
  );
});
