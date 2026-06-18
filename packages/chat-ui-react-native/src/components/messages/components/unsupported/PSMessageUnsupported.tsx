import React from 'react';
import {StyleProp, Text, TextStyle} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {usePSMessageItemContext} from '../PSMessageItem';

export const PSMessageUnsupported = React.memo(
  ({
    isUnsuporrted,
    containerStyle,
  }: {
    isUnsuporrted?: boolean;
    containerStyle?: StyleProp<TextStyle>;
  }) => {
    const {typography, colors} = usePSDesignSystemContext();

    const {translator} = usePSTranslationContext();

    const {isMyMessage} = usePSMessageItemContext();

    const styles = React.useMemo(() => {
      return [
        containerStyle,
        typography.bodyXLargeRI,
        {color: isMyMessage ? colors.Neutral.n200 : colors.Neutral.n300},
      ];
    }, [
      colors.Neutral.n200,
      colors.Neutral.n300,
      containerStyle,
      isMyMessage,
      typography.bodyXLargeRI,
    ]);

    return isUnsuporrted ? (
      <Text style={styles}>{translator('ps_message_unsupported')}</Text>
    ) : null;
  },
  (prev, next) => prev.isUnsuporrted === next.isUnsuporrted,
);
