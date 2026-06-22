import React from 'react';
import {View, Text, StyleSheet, TextStyle} from 'react-native';
import {PSMessageChatBotButtonActionModel} from '../../../../types';
import {usePSDesignSystemContext} from '../../../../context';
import {
  usePSMessageInputReplyChatBotContext,
  usePSMessageNavigationContext,
} from '../../contexts';
import {PSMessageMetadataChatBotButtonActionType} from '@communi/chat-api-client-typescript';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import isEqual from 'react-fast-compare';

export const PSMessageChatBotButton = React.memo(
  ({
    label,
    action,
    textStyles,
  }: {
    label: string;
    action: PSMessageChatBotButtonActionModel;
    textStyles?: TextStyle;
  }) => {
    const {colors} = usePSDesignSystemContext();

    const {onChatBotActionPress} = usePSMessageNavigationContext();

    const replyChatBot = usePSMessageInputReplyChatBotContext();

    const onPress = () => {
      switch (action.type) {
        case PSMessageMetadataChatBotButtonActionType.URI:
          onChatBotActionPress?.(action.payload, label, action.payload);
          break;
        case PSMessageMetadataChatBotButtonActionType.POST_BACK:
        case PSMessageMetadataChatBotButtonActionType.MESSAGE:
          replyChatBot(label, action.payload);
          onChatBotActionPress?.(undefined, label, action.payload);
          break;
      }
    };

    const dividerStyles = React.useMemo(() => {
      return [styles.divider, {backgroundColor: colors.Neutral.n50}];
    }, [colors.Neutral.n200]);

    return (
      <PSDebouncedPressable onPress={onPress} style={styles.container}>
        <View style={dividerStyles} />
        <MemoizeText label={label} labelStyles={textStyles} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  ({label, labelStyles}: {label: string; labelStyles?: TextStyle}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.text,
        typography.bodyMediumS,
        {color: colors.Branding.b600},
        labelStyles,
      ];
    }, [colors.Branding.b600, typography.bodyMediumS, labelStyles]);

    return <Text style={textStyles}>{label}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
    marginHorizontal: (16).px(),
    marginVertical: (12).px(),
  },
  divider: {
    height: (1).px(),
  },
});
