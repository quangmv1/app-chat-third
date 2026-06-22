import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {useRenderCounter} from '../../../../../hooks';
import {processTextWithMentionFromBackEnd} from '../../../../PSRichText';

const ThreadPublicGroupDescriptionItem = ({
  description,
}: {
  description: string;
}) => {
  useRenderCounter('ThreadPublicGroupDescriptionItem');
  const {colors, typography} = usePSDesignSystemContext();

  return description.trim() !== '' ? (
    <Text
      style={[
        styles.subTitle,
        typography.bodyXLargeR,
        {
          color: colors.Primary.mainText,
        },
      ]}
      numberOfLines={2}
      ellipsizeMode="tail">
      {processTextWithMentionFromBackEnd(description, [description]).text}
    </Text>
  ) : null;
};

export const PSThreadPublicGroupDescriptionItem = React.memo(
  ThreadPublicGroupDescriptionItem,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  subTitle: {
    flex: 1,
  },
});
