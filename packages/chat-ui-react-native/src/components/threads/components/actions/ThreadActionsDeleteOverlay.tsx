import {
  PSRoleThreadType,
  PSThreadType,
} from '@communi/chat-api-client-typescript';
import React, {PropsWithChildren, useState} from 'react';
import isEqual from 'react-fast-compare';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  usePSDesignSystemContext,
  usePSPopupContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSThreadModel} from '../../../../types';
import {PSAvatarImage} from '../../../PSAvatarImage';
import {useActionThreadsProviderContext} from '../../contexts';

const ActionItem = React.memo(
  ({
    children,
    title,
    color,
    textStyle,
    style,
    onPress,
  }: PropsWithChildren<{
    title: string;
    color?: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
    onPress?: null | (() => void);
  }>) => {
    return (
      <Pressable
        onPress={onPress}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            padding: (12).px(),
          },
          style,
        ]}>
        {children}
        <Text
          numberOfLines={1}
          style={[
            {color: color ?? '#26282C', marginLeft: (12).px()},
            textStyle,
          ]}>
          {title}
        </Text>
      </Pressable>
    );
  },
);

export const ThreadActionsDeleteOverlay = React.memo(
  ({
    isVisible,
    toggleModal,
    thread,
  }: {
    isVisible: boolean;
    toggleModal: () => void;
    thread: PSThreadModel;
  }) => {
    const {translator} = usePSTranslationContext();

    const {colors} = usePSDesignSystemContext();

    const styles = useStylesThreadActionsDeleteOverlay();

    const {deleteThread, leaveThread, disbandGroupThread} =
      useActionThreadsProviderContext();

    const {show} = usePSPopupContext();

    const [loading, setLoading] = useState(false);

    // Xoá phía bạn dùng chung cho chat 1-1 và group chat
    const onDeletePressed = React.useCallback(() => {
      toggleModal();
      show({
        description: translator('ps_description_delete_your_side'),
        rightText: translator('ps_delete'),
        onPressRight: async () => {
          setLoading(true);
          await deleteThread(thread.id);
          setLoading(false);
        },
      });
    }, [deleteThread, thread.id, toggleModal]);

    // Xoá 2 phía dùng cho chat 1-1
    const onDeleteAllPressed = React.useCallback(() => {
      toggleModal();
      show({
        description: translator('ps_description_delete_both'),
        rightText: translator('ps_delete'),
        onPressRight: async () => {
          setLoading(true);
          await deleteThread(thread.id, true);
          setLoading(false);
        },
      });
    }, [deleteThread, thread.id, toggleModal]);

    // Rời nhóm
    const onLeaveThreadPressed = React.useCallback(async () => {
      toggleModal();
      show({
        description: translator('ps_description_leave_group'),
        onPressRight: async () => {
          const threadId = thread.id;
          setLoading(true);
          await leaveThread(threadId);
          setLoading(false);
        },
      });
    }, [leaveThread, toggleModal, thread.id]);

    // giải tán nhóm
    const onDisbandGroup = React.useCallback(() => {
      toggleModal();
      show({
        title: translator('ps_disband_group'),
        description: translator('ps_description_disband_group'),
        rightText: translator('ps_delete_all'),
        onPressRight: async () => {
          const threadId = thread.id;
          setLoading(true);
          await disbandGroupThread(threadId);
          setLoading(false);
        },
      });
    }, [disbandGroupThread, toggleModal, thread.id]);

    const isSubThread = React.useMemo(() => {
      return !!(
        thread.parentId &&
        thread.parentId !== '0' &&
        thread.originalMessageId !== 0
      );
    }, [thread.parentId, thread.originalMessageId]);

    return (
      <Modal
        onBackdropPress={toggleModal}
        isVisible={isVisible}
        onSwipeComplete={toggleModal}
        swipeDirection={['down']}
        style={styles.view}>
        {thread.type === PSThreadType.DIRECT ? (
          <View style={styles.container}>
            <ActionItem title={``} style={styles.styActionItem}>
              <PSAvatarImage
                url={thread.avatar}
                displayName={thread.name}
                size={(48).px()}
                imageStyle={{marginTop: (8).px()}}
              />
              <Text numberOfLines={2} style={styles.styTxtTitle}>
                {translator('ps_delete_forever_with')}{' '}
                <Text style={styles.styTxtName}>{thread.name}</Text>?
              </Text>
            </ActionItem>
            <ActionItem
              title={translator('ps_delete_your_side')}
              textStyle={styles.styTxtDelete}
              style={styles.styActionItem}
              onPress={onDeletePressed}
            />
            <ActionItem
              title={`${translator('ps_delete_both')} ${thread.name}`}
              textStyle={styles.styTxtDelete}
              style={{padding: (2).px(), flexDirection: 'column'}}
              onPress={onDeleteAllPressed}
            />
          </View>
        ) : (
          <View style={styles.container}>
            <ActionItem title={``} style={styles.styActionItem}>
              <PSAvatarImage
                url={thread.avatar}
                displayName={thread.name}
                size={(48).px()}
                imageStyle={{marginTop: (8).px()}}
              />
              <Text numberOfLines={2} style={styles.styTxtTitle}>
                {translator('ps_delete_group')}{' '}
                <Text style={styles.styTxtName}>{thread.name}</Text>?
              </Text>
            </ActionItem>
            {isSubThread ? (
              <ActionItem
                title={translator('ps_thread_action_delete')}
                textStyle={styles.styTxtDelete}
                style={styles.styActionItem}
                onPress={onDeletePressed}
              />
            ) : (
              <ActionItem
                title={translator('ps_delete_your_side')}
                textStyle={styles.styTxtDelete}
                style={styles.styActionItem}
                onPress={onDeletePressed}
              />
            )}
            {isSubThread ? null : thread.role === PSRoleThreadType.OWNER ? (
              <ActionItem
                title={translator('ps_disband_group')}
                textStyle={styles.styTxtDelete}
                style={{padding: (2).px(), flexDirection: 'column'}}
                onPress={onDisbandGroup}
              />
            ) : (
              <ActionItem
                title={translator('ps_thread_profile_leave_group')}
                textStyle={styles.styTxtDelete}
                style={{padding: (2).px(), flexDirection: 'column'}}
                onPress={onLeaveThreadPressed}
              />
            )}
          </View>
        )}
        <View style={styles.container}>
          <ActionItem
            title={translator('ps_cancel')}
            textStyle={styles.styTxtCancel}
            onPress={toggleModal}
            style={{flexDirection: 'column'}}
          />
        </View>
        {loading ? (
          <View style={styles.styWrapLoading}>
            <ActivityIndicator size={'large'} color={colors.Branding.b100} />
          </View>
        ) : null}
      </Modal>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const useStylesThreadActionsDeleteOverlay = () => {
  const {colors, typography} = usePSDesignSystemContext();

  return React.useMemo(
    () =>
      StyleSheet.create({
        view: {
          justifyContent: 'flex-end',
          margin: 0,
        },
        container: {
          borderRadius: (12).px(),
          padding: (5).px(),
          backgroundColor: colors.Primary.background,
          marginHorizontal: (16).px(),
          marginBottom: (16).px(),
        },
        styTxtCancel: {
          ...typography.headingLargeM,
          color: colors.Branding.b400,
        },
        styTxtDelete: {
          ...typography.bodyXXLargeR,
          color: colors.Negative.normal,
          marginVertical: (16).px(),
        },
        styTxtTitle: {
          ...typography.bodyMediumS,
          color: colors.Primary.subText,
          marginTop: (8).px(),
          marginHorizontal: (16).px(),
          textAlign: 'center',
        },
        styTxtName: {
          ...typography.headingMediumS,
          color: colors.Primary.subText,
        },
        styActionItem: {
          flexDirection: 'column',
          borderBottomWidth: 1,
          borderBottomColor: colors.Neutral.n50,
          padding: (0).px(),
          width: '100%',
        },
        styWrapLoading: {
          position: 'absolute',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: `${colors.Neutral.n1000}4f`,
        },
      }),
    [colors, typography],
  );
};
