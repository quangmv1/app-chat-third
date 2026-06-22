import React from 'react';
import {
  usePSMessageCurrentThreadUnreadMetionedMessagesContext,
  usePSScrollToMessageContext,
} from '../../contexts';
import {StyleSheet, Text, View} from 'react-native';
import {useRenderCounter} from '../../../../hooks';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../context';

export const PSMessagesScrollToMentionedMessageButton = React.memo(() => {
  const {scrollToMessage} = usePSScrollToMessageContext();

  const unreadMentionedMessages =
    usePSMessageCurrentThreadUnreadMetionedMessagesContext();

  useRenderCounter(
    'PSMessagesScrollToMentionedMessageButton',
    unreadMentionedMessages.length > 0,
  );

  const onPress = () => {
    const mentionedMessageId = unreadMentionedMessages[0];
    if (mentionedMessageId) {
      scrollToMessage(mentionedMessageId, true);
    }
  };

  return unreadMentionedMessages.length ? (
    <PSDebouncedPressable onPress={onPress} style={styles.container}>
      <MemoizeArrowDown />
      <MemoizeUnreadCount unreadCount={unreadMentionedMessages.length} />
    </PSDebouncedPressable>
  ) : null;
});

const MemoizeArrowDown = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const containerStyles = React.useMemo(() => {
    return [
      styles.shadow,
      {
        backgroundColor: colors.Primary.bgBranding,
      },
    ];
  }, [colors.Primary.bgBranding]);

  const textStyles = React.useMemo(() => {
    return [styles.iconStyle, {color: colors.Primary.subText}];
  }, [colors.Primary.subText]);

  return (
    <View style={containerStyles}>
      <Text style={textStyles}>@</Text>
    </View>
  );
});

const MemoizeUnreadCount = React.memo(
  ({unreadCount}: {unreadCount: number}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const containerStyles = React.useMemo(() => {
      return [
        styles.unreadCountContainer,
        {
          backgroundColor: colors.Primary.branding,
        },
      ];
    }, [colors.Primary.branding]);

    const textStyles = React.useMemo(() => {
      return [
        styles.unreadCountText,
        typography.bodyXSmallR,
        {color: colors.Branding.b100},
      ];
    }, [colors.Branding.b100, typography.bodyXSmallR]);

    return unreadCount ? (
      <View style={containerStyles}>
        <Text style={textStyles}>{unreadCount}</Text>
      </View>
    ) : null;
  },
  (prev, next) => {
    return prev.unreadCount === next.unreadCount;
  },
);

const styles = StyleSheet.create({
  container: {},
  iconStyle: {
    fontSize: (24).px(),
  },
  shadow: {
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 3,
    width: (48).px(),
    height: (48).px(),
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: (8).px(),
  },
  unreadCountContainer: {
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 3,
    height: (24).px(),
    width: (24).px(),
    borderRadius: 1000,
    marginTop: (-20).px(),
    marginStart: (12).px(),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  unreadCountText: {},
});
