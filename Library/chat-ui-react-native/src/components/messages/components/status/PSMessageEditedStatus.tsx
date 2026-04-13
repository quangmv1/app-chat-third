import React from 'react';
import isEqual from 'react-fast-compare';

import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { useRenderCounter } from '../../../../hooks';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

export const PSMessageEditedStatus = React.memo(
  ({
    editedAt,
    isVisible,
    containerStyle,
  }: {
    editedAt?: number;
    isVisible?: boolean;
    containerStyle: StyleProp<TextStyle>;
  }) => {
    useRenderCounter(
      'MessageEditedStatus',
      editedAt !== undefined && editedAt > 0,
    );

    const { translator } = usePSTranslationContext();

    const { typography, colors } = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.text,
        containerStyle,
        typography.bodyMediumR,
        { color: colors.Primary.subText },
      ];
    }, [colors.Primary.subText, containerStyle, typography.bodyMediumR]);


    return editedAt && (isVisible === undefined || isVisible) ? (
      <Text style={textStyles}>{translator('ps_message_edited')}</Text>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  text: {
    fontStyle: 'italic',
  },
});
