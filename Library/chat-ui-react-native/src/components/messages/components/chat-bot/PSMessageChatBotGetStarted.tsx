import React from 'react';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {usePSMessageInputReplyChatBotContext} from '../../contexts';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {StyleSheet, Text} from 'react-native';
import isEqual from 'react-fast-compare';

export const PSMessageChatBotGetStarted = React.memo(
  () => {
    const {translator} = usePSTranslationContext();

    const {colors} = usePSDesignSystemContext();

    const replyChatBot = usePSMessageInputReplyChatBotContext();

    const onPress = () => {
      replyChatBot(
        translator('ps_message_input_with_bot_get_started'),
        'start',
      );
    };

    const containerStyles = React.useMemo(() => {
      return [
        styles.container,
        {
          borderTopColor: colors.Neutral.n200,
          backgroundColor: colors.Branding.b600,
        },
      ];
    }, [colors.Neutral.n200, colors.Branding.b600]);

    return (
      <PSDebouncedPressable onPress={onPress} style={containerStyles}>
        <MemoizeText />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  () => {
    const {typography, colors} = usePSDesignSystemContext();

    const {translator} = usePSTranslationContext();

    const textStyles = React.useMemo(() => {
      return [typography.headingMediumM, {color: colors.Primary.white}];
    }, [colors.Primary.white, typography.headingMediumM]);

    return (
      <Text style={textStyles}>
        {translator('ps_message_input_with_bot_get_started')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: (0.5).px(),
    justifyContent: 'center',
    alignItems: 'center',
    height: (56).px(),
  },
});
