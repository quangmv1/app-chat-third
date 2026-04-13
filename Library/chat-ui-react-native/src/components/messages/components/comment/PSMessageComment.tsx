import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleProp, Text, TextStyle, StyleSheet, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSIcRight24} from '../../../../icons';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSMessageItemContext} from '../PSMessageItem';
import {usePSMessageNavigationContext} from '../../contexts';

export const PSMessageComment = React.memo(
  ({
    messageId,
    subThreadName,
    subThreadId,
    messageSubThreadCount,
    containerStyle,
  }: {
    messageId: number;
    subThreadName: string;
    subThreadId?: string;
    messageSubThreadCount?: number;
    containerStyle?: StyleProp<TextStyle>;
  }) => {
    const {colors} = usePSDesignSystemContext();

    const {onCommentPress} = usePSMessageNavigationContext();

    const {isMyMessage} = usePSMessageItemContext();

    const stylesContainer = React.useMemo(() => {
      return [
        {
          borderTopColor: isMyMessage
            ? colors.Branding.b300
            : colors.Neutral.n100,
        },
        containerStyle,
      ];
    }, [
      colors.Branding.b300,
      colors.Neutral.n100,
      containerStyle,
      isMyMessage,
    ]);

    const handleComment = React.useCallback(() => {
      subThreadId && onCommentPress?.(subThreadId);
    }, [messageId, subThreadId]);

    return subThreadId && messageSubThreadCount && messageSubThreadCount > 0 ? (
      <PSDebouncedPressable
        style={[styles.container, stylesContainer]}
        onPress={handleComment}>
        <MemoizeText messageSubThreadCount={messageSubThreadCount ?? 0} />
        <MemoizeIcon />
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const MemoizeText = React.memo(
  ({messageSubThreadCount}: {messageSubThreadCount: number}) => {
    const {isMyMessage} = usePSMessageItemContext();

    const {typography, colors} = usePSDesignSystemContext();

    const {translator} = usePSTranslationContext();

    const textStyles = React.useMemo(() => {
      return [
        typography.bodyXLargeR,
        {
          color: isMyMessage
            ? colors.Primary.branding
            : colors.Primary.branding,
        },
      ];
    }, [colors, isMyMessage, typography.bodyXLargeR]);

    return (
      <Text
        numberOfLines={1}
        ellipsizeMode="middle"
        style={[styles.text, textStyles]}>
        {translator(
          'ps_message_comment_count',
          // @ts-ignore
          {
            num: `${messageSubThreadCount}`,
          },
        )}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeIcon = React.memo(
  () => {
    const {isMyMessage} = usePSMessageItemContext();

    const {colors} = usePSDesignSystemContext();

    const iconColor = React.useMemo(() => {
      return isMyMessage ? colors.Primary.branding : colors.Primary.branding;
    }, [colors, isMyMessage]);

    return (
      <View style={styles.icon}>
        <PSIcRight24 width={(16).px()} height={(16).px()} fill={iconColor} />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderTopWidth: (0.5).px(),
  },
  text: {
    marginEnd: (97).px(),
  },
  icon: {
    position: 'absolute',
    right: (12).px(),
  },
});
