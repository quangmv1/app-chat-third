import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useRenderCounter} from '../../../../../hooks';
import {PSUserModel} from '../../../../../types';
import {PSUsersTypingText} from '../../../../typing-indicator';
import {
  usePSDesignSystemContext,
  usePSScreenStylesContext,
} from '../../../../../context';
import {PSThreadsStyles} from '../../../PSThreadsStyles';

export const PSThreadItemLastMessageContent = ({
  hasUnreadCount,
  description,
  typingUsers,
}: {
  hasUnreadCount: boolean;
  description: string;
  typingUsers?: PSUserModel[];
}) => {
  useRenderCounter(
    'PSThreadItemLastMessageContent',
    typingUsers !== undefined && typingUsers.length > 0,
  );

  const {colors, typography} = usePSDesignSystemContext();

  return typingUsers && typingUsers.length ? (
    <View style={[styles.subTitle, styles.containerUsersTyping]}>
      {/* <PSLoadingDots numberOfDots={3} spacing={2} /> */}
      <PSUsersTypingText
        users={typingUsers}
        textStyle={{
          ...typography.bodyXLargeR,
          color: colors.Primary.subText,
        }}
      />
    </View>
  ) : (
    <MemoizeThreadSubTitleText
      hasUnreadCount={hasUnreadCount}
      description={description}
    />
  );
};

const ThreadSubTitleText = ({
  hasUnreadCount,
  description,
}: {
  hasUnreadCount: boolean;
  description: string;
}) => {
  useRenderCounter('ThreadSubTitleText');

  const {colors, typography} = usePSDesignSystemContext();

  const text2Style =
    usePSScreenStylesContext<PSThreadsStyles>().threadItem?.text2Style;
  const text2Props =
    usePSScreenStylesContext<PSThreadsStyles>().threadItem?.text2Props;
  const text2NumberOfLines =
    usePSScreenStylesContext<PSThreadsStyles>().threadItem?.text2NumberOfLines;

  return (
    <Text
      style={[
        hasUnreadCount ? typography.bodyXLargeR : typography.bodyXLargeR,
        styles.subTitle,
        {
          color: hasUnreadCount
            ? colors.Primary.subText
            : colors.Primary.subText,
        },
        typeof text2Style === 'function'
          ? text2Style(hasUnreadCount)
          : undefined,
      ]}
      numberOfLines={text2NumberOfLines ?? 1}
      ellipsizeMode="tail"
      {...text2Props}>
      {description.workAroundTextOneLineContainsNewLineIOS()}
    </Text>
  );
};

const MemoizeThreadSubTitleText = React.memo(
  ThreadSubTitleText,
  (prev, next) => {
    return (
      prev.hasUnreadCount === next.hasUnreadCount &&
      prev.description === next.description
    );
  },
);

const styles = StyleSheet.create({
  subTitle: {
    flex: 1,
  },
  containerUsersTyping: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
