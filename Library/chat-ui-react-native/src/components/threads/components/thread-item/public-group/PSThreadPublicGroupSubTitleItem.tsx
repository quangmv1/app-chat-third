import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../../context';
import {useRenderCounter} from '../../../../../hooks';

const ThreadPublicGroupSubTitleItem = ({
  memberCount,
}: {
  memberCount: number;
}) => {
  useRenderCounter('ThreadPublicGroupTitleItem');
  const {colors, typography} = usePSDesignSystemContext();
  const {translator} = usePSTranslationContext();
  return (
    <Text
      style={[
        styles.title,
        typography.bodyXMediumR,
        {color: colors.Primary.subText},
      ]}
      numberOfLines={1}
      ellipsizeMode="tail">
      {translator(
        'ps_new_thread_group_named_total_users',
        // @ts-ignore
        {
          total: `${memberCount}`,
        },
      )}
    </Text>
  );
};

export const PSThreadPublicGroupSubTitleItem = React.memo(
  ThreadPublicGroupSubTitleItem,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  title: {
    flex: 1,
  },
});
