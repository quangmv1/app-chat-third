import {
  PSChangeParticipantsLevel,
  PSRoleThreadType,
} from '@communi/chat-api-client-typescript';
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  PSDebouncedPressable,
  PSFlashMessage,
  useActionThreadsProviderContext,
  usePSMessageCurrentThreadContext,
} from '../../../components';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSPopupContext,
  usePSTranslationContext,
} from '../../../context';
import {
  IcLine15RectangleArrowRight,
  IcLine15Xmark,
  PSIcChatList24,
  PSIcKey24,
  PSIcKick24,
  PSIcRoleModify24,
} from '../../../icons';
import {PSUserModel} from '../../../types';
import {
  usePSMemberInThreadActionsContext,
  usePSMemberInThreadActionsOverlayContext,
  usePSMemberInThreadActionsOverlayVisibleContext,
} from '../contexts';
import { ActionItem } from './thread-profile';

const HeaderModal = ({
  user,
  toggleModal,
}: {
  user: PSUserModel;
  toggleModal: () => void;
}) => {
  const {colors, typography} = usePSDesignSystemContext();
  return (
    <View style={styles.header}>
      <Text style={[{color: colors.Primary.subText}, typography.bodyXLargeR]}>
        {user.name}
      </Text>
      <PSDebouncedPressable onPress={toggleModal}>
        <IcLine15Xmark
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
      </PSDebouncedPressable>
    </View>
  );
};

export const MemberInThreadActionsOverlay = ({
  threadId,
  allowChatWithUserOption,
  onPressChatWithUser,
  onRemoveParticipantsSuccess,
  onCompleteLeaveThread,
  onBackPress,
}: {
  threadId: string;
  allowChatWithUserOption?: boolean;
  onPressChatWithUser?: null | ((userId: string) => void);
  onRemoveParticipantsSuccess?: null | (() => void);
  onCompleteLeaveThread?: null | (() => void);
  onBackPress?: null | (() => void);
}) => {
  const {translator} = usePSTranslationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const currentThread = usePSMessageCurrentThreadContext();
  const {isVisible, user, permission} =
    usePSMemberInThreadActionsOverlayVisibleContext();
  const {hide} = usePSMemberInThreadActionsOverlayContext();
  const {removeMemberLocal, changeRoleMemberLocal} =
    usePSMemberInThreadActionsContext();
  const [loading, setLoading] = useState(false);
  const chatApiClient = usePSChatApiClientContext();

  const onLeaveThread = useActionThreadsProviderContext().leaveThread;

  const {show} = usePSPopupContext();

  const leaveThread = async () => {
    hide();
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

  const removeParticipants = async () => {
    if (!chatApiClient) {
      return;
    }
    setLoading(true);
    try {
      await chatApiClient.threadApi.changeParticipants(
        threadId,
        PSChangeParticipantsLevel.REMOVE,
        [user?.extUserId ?? ''],
      );
      PSFlashMessage.show({
        type: 'success',
        position: 'bottom',
        text1: `${translator('ps_success_remove_member')}`,
      });
      hide();
      setLoading(false);
      user?.extUserId && removeMemberLocal(user.extUserId);
      onRemoveParticipantsSuccess?.();
    } catch (error) {
      hide();
      setLoading(false);
      PSFlashMessage.show({
        type: 'error',
        position: 'bottom',
        text1: `${translator('ps_error_remove_member')}`,
      });
    }
  };

  const setRoleParticipants = async (role: PSRoleThreadType) => {
    if (!chatApiClient) {
      return;
    }
    setLoading(true);
    try {
      await chatApiClient.threadApi.setRoleParticipants(threadId, role, [
        user?.extUserId ?? '',
      ]);
      // PSFlashMessage.show({
      //   type: 'success',
      //   position: 'bottom',
      //   text1: `${translator('ps_success_remove_member')}`,
      // });
      hide();
      setLoading(false);
      user?.extUserId && changeRoleMemberLocal(user.extUserId, role);
    } catch (error) {
      hide();
      setLoading(false);
      PSFlashMessage.show({
        type: 'error',
        position: 'bottom',
        text1: `${error}`,
      });
    }
  };

  const onPress = React.useCallback(() => {
    if (user && onPressChatWithUser) {
      onPressChatWithUser(user.extUserId);
      hide();
    }
  }, [user, onPressChatWithUser, hide]);

  const isHasRemoveMemberPermission = React.useMemo(() => {
    return currentThread?.getPermissionByRole()?.removeMember;
  }, [currentThread]);

  const isOwner = React.useMemo(() => {
    return currentThread?.role === PSRoleThreadType.OWNER;
  }, [currentThread]);

  const allowedSetAdmin = useMemo(() => {
    if (
      isOwner &&
      user?.role !== PSRoleThreadType.ADMIN &&
      chatApiClient?.userId !== user?.extUserId
    )
      return true;
    if (
      permission?.permission?.addAdmin &&
      user?.role !== PSRoleThreadType.OWNER &&
      user?.role !== PSRoleThreadType.ADMIN &&
      chatApiClient?.userId !== user?.extUserId
    )
      return true;
    return false;
  }, [isOwner, user, chatApiClient?.userId]);

  return isVisible && user !== undefined ? (
    <Modal
      onBackdropPress={hide}
      isVisible={isVisible && user !== undefined}
      onSwipeComplete={hide}
      swipeDirection={['down']}
      style={styles.view}>
      <View
        style={[styles.container, {backgroundColor: colors.Primary.white}]}>
        {/* @ts-ignore */}
        {user && <HeaderModal toggleModal={hide} user={user} />}

        {allowChatWithUserOption === false ||
        chatApiClient?.userId === user.extUserId ? null : (
          <ActionItem
            title={translator('ps_member_in_thread_send_message')}
            color={colors.Primary.subText}
            textStyle={typography.bodyXLargeR}
            onPress={onPress}>
            <PSIcChatList24
              width={(24).px()}
              height={(24).px()}
              fill={colors.Primary.subText}
            />
          </ActionItem>
        )}

        {isOwner && chatApiClient?.userId !== user.extUserId ? (
          <ActionItem
            title={translator('ps_member_in_thread_transfer_owner')}
            color={colors.Primary.subText}
            textStyle={typography.bodyXLargeR}
            onPress={() => {
              setRoleParticipants(PSRoleThreadType.OWNER);
            }}>
            <PSIcKey24
              width={(24).px()}
              height={(24).px()}
              fill={colors.Primary.subText}
            />
          </ActionItem>
        ) : null}

        {allowedSetAdmin ? (
          <ActionItem
            title={translator('ps_member_in_thread_grant_admin')}
            color={colors.Primary.subText}
            textStyle={typography.bodyXLargeR}
            onPress={() => {
              setRoleParticipants(PSRoleThreadType.ADMIN);
            }}>
            <PSIcRoleModify24
              width={(24).px()}
              height={(24).px()}
              fill={colors.Primary.subText}
            />
          </ActionItem>
        ) : null}

        {isHasRemoveMemberPermission &&
          user.role !== PSRoleThreadType.OWNER &&
          chatApiClient?.userId !== user.extUserId && (
            <ActionItem
              title={translator('ps_member_in_thread_remove_member')}
              color="#E94040"
              textStyle={typography.bodyXLargeR}
              onPress={removeParticipants}>
              <PSIcKick24
                width={(24).px()}
                height={(24).px()}
                fill={'#E94040'}
              />
            </ActionItem>
          )}
        {chatApiClient?.userId === user.extUserId && (
          <ActionItem
            title={translator('ps_thread_profile_leave_group')}
            color="#E94040"
            textStyle={typography.bodyXLargeR}
            onPress={leaveThread}>
            <IcLine15RectangleArrowRight
              width={(28).px()}
              height={(28).px()}
              fill={colors.Negative.normal}
            />
          </ActionItem>
        )}
      </View>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.Branding.b100} />
        </View>
      )}
    </Modal>
  ) : null;
};

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    flexDirection: 'column',
    borderTopLeftRadius: (16).px(),
    borderTopRightRadius: (16).px(),
    paddingBottom: Platform.select({android: (2).px(), ios: (24).px()}),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: (12).px(),
  },
  loading: {
    backgroundColor: '#00000099',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
