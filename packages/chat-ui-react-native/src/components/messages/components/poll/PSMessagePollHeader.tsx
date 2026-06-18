import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {useRenderCounter} from '../../../../hooks';
import {usePSMessageItemContext} from '../PSMessageItem';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

export const PSMessagePollHeader = React.memo(
  ({name}: {name: string}) => {
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const {isMyMessage, isOverlay} = usePSMessageItemContext();

    useRenderCounter('MessagePollHeader', !isOverlay);

    const textStyles = React.useMemo(() => {
      return [styles.text, typography.bodyMediumR, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.bodyMediumR]);

    return !isOverlay ? (
      <Text style={textStyles} numberOfLines={1}>
        <Text style={typography.bodyMediumM}>{`${
          isMyMessage ? translator('ps_you') : name
        } `}</Text>
        <Text>{translator('ps_message_poll_created_a_poll')}</Text>
      </Text>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  text: {
    alignSelf: 'center',
    marginHorizontal: (16).px(),
    marginTop: (8).px(),
  },
});
