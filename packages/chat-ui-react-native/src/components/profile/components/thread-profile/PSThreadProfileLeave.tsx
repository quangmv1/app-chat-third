import {PSThreadType} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {
  useActionThreadsProviderContext,
  usePSMessageCurrentThreadIdContext,
} from '../../../../components';
import {
  usePSDesignSystemContext,
  usePSPopupContext,
  usePSTranslationContext,
} from '../../../../context';
import {IcLine15RectangleArrowRight} from '../../../../icons';
import {
  usePSThreadProfileNavigationContext,
  useThreadProfileActionContext,
} from '../../contexts';
import {PSThreadProfileRowItem} from './PSThreadProfileRowItem';

const ThreadProfileLeave = ({
  setLoading,
}: {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {translator} = usePSTranslationContext();
  const {isJoin, type} = useThreadProfileActionContext();
  const {onBackPress, onCompleteLeaveThread} =
    usePSThreadProfileNavigationContext();
  const {colors} = usePSDesignSystemContext();
  const threadId = usePSMessageCurrentThreadIdContext();

  const onLeaveThread = useActionThreadsProviderContext().leaveThread;

  const {show} = usePSPopupContext();

  const leaveThread = async () => {
    show({
      description: translator('ps_description_leave_group'),
      onPressRight: async () => {
        setLoading(true);
        await onLeaveThread(threadId!, () => {
          typeof onCompleteLeaveThread === 'function'
            ? onCompleteLeaveThread?.()
            : onBackPress?.();
          onBackPress?.();
        });
        setLoading(false);
      },
    });
  };

  return type !== PSThreadType.DIRECT && isJoin ? (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.Primary.white,
        },
      ]}>
      <PSThreadProfileRowItem
        title={translator('ps_thread_profile_leave_group')}
        colorTitle={colors.Negative.normal}
        showIconRight={false}
        onPress={() => {
          leaveThread();
        }}>
        <IcLine15RectangleArrowRight
          width={(28).px()}
          height={(28).px()}
          fill={colors.Negative.normal}
        />
      </PSThreadProfileRowItem>
    </View>
  ) : null;
};

export const PSThreadProfileLeave = React.memo(
  ThreadProfileLeave,
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
