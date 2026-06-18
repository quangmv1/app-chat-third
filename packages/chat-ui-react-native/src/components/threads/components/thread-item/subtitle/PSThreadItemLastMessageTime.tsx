import React from 'react';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../../hooks';
import {StyleSheet, Text} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';

const ThreadItemLastMessageTime = ({
  lastMessageCreatedAt,
}: {
  lastMessageCreatedAt: string;
}) => {
  useRenderCounter('ThreadItemSubTitleLastMessageTime');

  const {colors, typography} = usePSDesignSystemContext();

  return (
    <Text
      style={[
        styles.lastCreated,
        typography.bodySmallR,
        {color: colors.Primary.subText},
      ]}>
      {lastMessageCreatedAt}
    </Text>
  );
};

export const PSThreadItemLastMessageTime = React.memo(
  ThreadItemLastMessageTime,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  lastCreated: {
    marginLeft: (8).px(),
  },
});
