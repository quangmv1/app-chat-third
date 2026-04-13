import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {PSIcMuted24, IcFillXmarkCircle} from '../../../../../icons';
import {PSThreadItemLastMessageContent} from './PSThreadItemLastMessageContent';
import {PSUserModel} from '../../../../../types';
import {useRenderCounter} from '../../../../../hooks';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../../context';
import {PSThreadItemUnreadBadge} from './PSThreadItemUnreadBadge';
import {PSThreadItemUnreadMentionedBadge} from './PSThreadItemUnreadMentionedBadge';
import {usePSThreadItemContext} from '../../../contexts';
import {isEmpty} from 'lodash';

type ThreadItemSubTitleProps = {
  description: string;
  isLastMessageError: boolean;
  unreadCount: number;
  unreadMentionedCount: number;
  typingUsers?: PSUserModel[];
  visible?: boolean;
  isMute?: boolean;
};

export const PSThreadItemSubTitle = React.memo(
  ({
    description,
    isLastMessageError,
    unreadCount,
    unreadMentionedCount,
    typingUsers,
    visible,
    isMute,
  }: ThreadItemSubTitleProps) => {
    useRenderCounter('ThreadItemSubTitle');

    const {translator} = usePSTranslationContext();

    const {draftContent} = usePSThreadItemContext();

    const {colors, typography} = usePSDesignSystemContext();

    if (!isEmpty(draftContent)) {
      return (
        <View style={styles.contentRow}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              ...typography.bodyXLargeR,
              color: colors.Negative.normal,
              flex: 1,
            }}>
            {`${translator('ps_draft')}: `}
            <Text
              style={{
                ...typography.bodyXLargeR,
                color: colors.Primary.subText,
              }}>
              {draftContent}
            </Text>
          </Text>
          <PSThreadItemUnreadMentionedBadge
            unreadCount={unreadMentionedCount}
          />
          <PSThreadItemUnreadBadge unreadCount={unreadCount} isMute={isMute} />
        </View>
      );
    }

    return visible ? (
      <View style={styles.contentRow}>
        <PSThreadItemLastMessageContent
          hasUnreadCount={unreadCount > 0}
          description={description}
          typingUsers={typingUsers}
        />
        <MemoizeIconMessageError isError={isLastMessageError} />

        <PSThreadItemUnreadMentionedBadge unreadCount={unreadMentionedCount} />

        <PSThreadItemUnreadBadge unreadCount={unreadCount} isMute={isMute} />
      </View>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

export const MemoizeIconBell = React.memo(
  ({isMute}: {isMute: boolean}) => {
    const {colors} = usePSDesignSystemContext();
    return isMute ? (
      <PSIcMuted24
        width={(16).px()}
        height={(16).px()}
        fill={colors.Neutral.n400}
        style={styles.iconRight}
      />
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

export const MemoizeIconMessageError = React.memo(
  ({isError}: {isError: boolean}) => {
    return isError ? (
      <IcFillXmarkCircle
        width={(16).px()}
        height={(16).px()}
        fill={'red'}
        style={[styles.iconRight]}
      />
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconRight: {
    // marginLeft: (8).px(),
    marginStart: (4).px(),
  },
});
