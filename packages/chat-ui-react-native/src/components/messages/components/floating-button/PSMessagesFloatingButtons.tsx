import React from 'react';
import {StyleSheet, View} from 'react-native';
import {PSMessagesScrollToLastMessageButton} from './PSMessagesScrollToLastMessageButton';
import {PSMessagesScrollToMentionedMessageButton} from './PSMessagesScrollToMentionedMessageButton';
import {usePSMessageAgainStartedChatBotContext} from '../../contexts';

export const PSMessagesFloatingButtons = React.memo(() => {
  const styles = useStylePSMessagesFloatingButtons();
  return (
    <View style={styles.container}>
      <PSMessagesScrollToMentionedMessageButton />
      <PSMessagesScrollToLastMessageButton />
    </View>
  );
});

const useStylePSMessagesFloatingButtons = () => {
  const isAgainStartedChatBot = usePSMessageAgainStartedChatBotContext();
  return React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'column',
          position: 'absolute',
          bottom: isAgainStartedChatBot ? (60).px() : 0,
          right: 0,
          marginEnd: (10).px(),
        },
      }),
    [isAgainStartedChatBot],
  );
};
