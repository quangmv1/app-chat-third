import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {usePSMessageItemContext} from '../PSMessageItem';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../hooks';
import {usePSDesignSystemContext} from '../../../../context';
import {usePSHighlightMessageAfterScroll} from '../../contexts';
import {PSMessageStatus} from '../../../../types';

export const PSMessageHighlightBackground = React.memo(
  ({
    enabled,
    messageId,
    messageStatus,
    containerStyle,
    children,
  }: React.PropsWithChildren<{
    enabled?: boolean;
    messageId: number;
    messageStatus: PSMessageStatus;
    containerStyle: StyleProp<ViewStyle>;
  }>) => {
    useRenderCounter('MessageHighlightBackground');

    const {colors} = usePSDesignSystemContext();

    const {isOverlay} = usePSMessageItemContext();

    const messageIdToAnimate = usePSHighlightMessageAfterScroll();

    const isHighlight =
      enabled &&
      !isOverlay &&
      messageIdToAnimate === messageId &&
      messageStatus === 'sent';

    return (
      <View
        style={[
          {
            backgroundColor: isHighlight ? colors.Primary.bgBranding : undefined,
          },
          containerStyle,
        ]}>
        {children}
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);
