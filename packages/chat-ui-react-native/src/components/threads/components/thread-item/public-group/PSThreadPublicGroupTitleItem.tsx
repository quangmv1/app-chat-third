import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {useRenderCounter} from '../../../../../hooks';

const ThreadPublicGroupTitleItem = ({name}: {name: string}) => {
  useRenderCounter('ThreadPublicGroupTitleItem');
  const {colors, typography} = usePSDesignSystemContext();
  return (
    <Text
      style={[
        styles.title,
        typography.bodyXLargeS,
        {color: colors.Primary.mainText},
      ]}
      numberOfLines={1}
      ellipsizeMode="tail">
      {name.workAroundTextOneLineContainsNewLineIOS()}
    </Text>
  );
};

export const PSThreadPublicGroupTitleItem = React.memo(
  ThreadPublicGroupTitleItem,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  title: {
    flex: 1,
  },
});
