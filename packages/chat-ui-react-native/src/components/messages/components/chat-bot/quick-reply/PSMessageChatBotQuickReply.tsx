import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {PSMessageChatBotButtonModel} from '../../../../../types';
import isEqual from 'react-fast-compare';
import {usePSDesignSystemContext} from '../../../../../context';
import {
  usePSMessageInputReplyChatBotContext,
  usePSMessageNavigationContext,
} from '../../../contexts';
import {PSMessageMetadataChatBotButtonActionType} from '@communi/chat-api-client-typescript';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';

export const PSMessageChatBotQuickReply = React.memo(
  ({
    buttons,
    hasReplied,
  }: {
    buttons: PSMessageChatBotButtonModel[];
    hasReplied: boolean;
  }) => {
    const {onChatBotActionPress} = usePSMessageNavigationContext();

    const replyChatBot = usePSMessageInputReplyChatBotContext();

    const onPress = React.useCallback(
      (button: PSMessageChatBotButtonModel) => {
        switch (button.action.type) {
          case PSMessageMetadataChatBotButtonActionType.URI:
            onChatBotActionPress?.(
              button.action.payload,
              button.label,
              button.action.payload,
            );
            break;
          case PSMessageMetadataChatBotButtonActionType.POST_BACK:
          case PSMessageMetadataChatBotButtonActionType.MESSAGE:
            replyChatBot(button.label, button.action.payload);
            onChatBotActionPress?.(
              undefined,
              button.label,
              button.action.payload,
            );
            break;
        }
      },
      [onChatBotActionPress, replyChatBot],
    );

    return !hasReplied ? (
      <View style={styles.replyOptionsContainer}>
        {buttons.map((button, index) => (
          <MemoizeText key={index} button={button} onPressAction={onPress} />
        ))}
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  ({
    button,
    onPressAction,
  }: {
    button: PSMessageChatBotButtonModel;
    onPressAction: (button: PSMessageChatBotButtonModel) => void;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();

    const onPress = () => {
      onPressAction(button);
    };

    const textStyles = React.useMemo(() => {
      return [
        styles.replyOptionText,
        {
          color: colors.Primary.branding,
          backgroundColor: colors.Primary.white,
        },
        typography.bodyXLargeR,
      ];
    }, [colors.Primary.white, colors.Primary.branding, typography.bodyXLargeR]);

    return (
      <PSDebouncedPressable onPress={onPress}>
        <Text style={textStyles}>{button.label}</Text>
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  replyOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: (8).px(),
  },
  replyOptionText: {
    marginHorizontal: (8).px(),
    marginTop: (16).px(),
    borderRadius: (12).px(),
    paddingHorizontal: (16).px(),
    paddingVertical: (8).px(),
    overflow: 'hidden',
  },
});
