import React from 'react';
import {
  usePSScrollToMessageContext,
  usePSMessageCurrentThreadUnreadCountContext,
  usePSPaginatedMessagesAutoScrollToTopContext,
} from '../../contexts';
import {IcLine15ArrowDown} from '../../../../icons';
import {StyleSheet, Text, View} from 'react-native';
import {useRenderCounter} from '../../../../hooks';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../context';

export const PSMessagesScrollToLastMessageButton = React.memo(() => {
  const {scrollToLastMessage} = usePSScrollToMessageContext();

  const autoScrollToTop = usePSPaginatedMessagesAutoScrollToTopContext();

  const unreadCount = usePSMessageCurrentThreadUnreadCountContext();

  useRenderCounter('PSMessagesScrollToLastMessageButton', !autoScrollToTop);

  const containerStyle = React.useMemo(() => {
    return {marginTop: unreadCount ? (16).px() : unreadCount};
  }, [unreadCount]);

  return autoScrollToTop === false ? (
    <PSDebouncedPressable onPress={scrollToLastMessage} style={containerStyle}>
      <MemoizeArrowDown />
      <MemoizeUnreadCount unreadCount={unreadCount} />
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

  return (
    <View style={containerStyles}>
      <IcLine15ArrowDown
        width={(24).px()}
        height={(24).px()}
        fill={colors.Primary.subText}
      />
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
