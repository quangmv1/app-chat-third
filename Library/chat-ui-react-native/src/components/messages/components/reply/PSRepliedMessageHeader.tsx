import React from 'react';
import {usePSMessageItemContext} from '../PSMessageItem';
import {Text} from 'react-native';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../hooks';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

export const PSRepliedMessageHeader = React.memo(
  ({senderId, senderName}: {senderId: string; senderName: string}) => {
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const {myUserId, isMyMessage} = usePSMessageItemContext();

    useRenderCounter('RepliedMessageHeader');

    const textStyles = React.useMemo(() => {
      return [
        typography.bodyMediumS,
        {
          color: isMyMessage ? colors.Primary.mainText : colors.Primary.subText,
        },
      ];
    }, [
      colors.Primary.mainText,
      colors.Primary.subText,
      isMyMessage,
      typography.bodyMediumS,
    ]);

    return (
      <Text numberOfLines={1} style={textStyles}>
        {senderId === myUserId ? translator('ps_you') : senderName}
      </Text>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);
