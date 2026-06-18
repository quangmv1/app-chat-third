import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {
  usePSMessageCurrentThreadIdContext,
  useThreadActionsDeleteOverlay,
} from '../../..';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSIcDelete24} from '../../../../icons';
import {PSThreadProfileRowItem} from './PSThreadProfileRowItem';

const ThreadProfileDelete = () => {
  const {translator} = usePSTranslationContext();
  const {colors} = usePSDesignSystemContext();

  const showThreadActions = useThreadActionsDeleteOverlay();

  const threadId = usePSMessageCurrentThreadIdContext();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.Primary.white,
        },
      ]}>
      <PSThreadProfileRowItem
        title={translator('ps_thread_action_delete')}
        colorTitle={colors.Negative.normal}
        showIconRight={false}
        onPress={() => showThreadActions(threadId!)}>
        <PSIcDelete24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Negative.normal}
        />
      </PSThreadProfileRowItem>
    </View>
  );
};

export const PSThreadProfileDelete = React.memo(
  ThreadProfileDelete,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderRadius: (12).px(),
    marginBottom: (16).px(),
  },
});
