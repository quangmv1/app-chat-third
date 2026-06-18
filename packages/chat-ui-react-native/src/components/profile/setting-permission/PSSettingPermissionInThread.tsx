import {
  PSResponseError,
  PSRoleThreadType,
} from '@communi/chat-api-client-typescript';
import React, {useCallback, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {PSThreadPermissionsEntity, PSThreadSettingEntity} from '../../../types';
import {PSActionBar} from '../../PSActionBar';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';
import {PSFlashMessage} from '../../flash-message';
import {PSMessageCurrentThreadProvider} from '../../messages';
import {
  PSThreadProfileProvider,
  useThreadProfileActionContext,
} from '../contexts';
import {SettingPermissionItem} from './SettingPermissionItem';
import {FETCH_DATA_THREAD_BY_ID_SAVE_TO_REALM} from '../utils/Constants';

export interface PSSettingPermissionProps {
  userRole: PSRoleThreadType;
  threadId: string;
  onBackPress: () => void;
}

export const PSSettingPermissionInThread = ({
  threadId,
  userRole: roleSelectSetup,
  onBackPress,
}: PSSettingPermissionProps) => {
  const styles = useStyleSettingPermission();

  const {translator} = usePSTranslationContext();

  const currentThread = useThreadProfileActionContext();

  const chatApiCline = usePSChatApiClientContext();

  const [permissions, setPermissions] = useState(
    currentThread?.setting?.permissions,
  );

  const [loading, setLoading] = useState(false);

  const handledBackPress = useCallback(() => {
    typeof onBackPress === 'function' && onBackPress();
  }, [onBackPress]);

  const titleText = useMemo(() => {
    switch (roleSelectSetup) {
      case PSRoleThreadType.MEMBER:
        return translator('ps_setting_permission_member');
      case PSRoleThreadType.ADMIN:
        return translator('ps_setting_permission_admin');
      default:
        return '';
    }
  }, [roleSelectSetup]);

  const toggleSwitch = useCallback(
    (key: string, userRole: PSRoleThreadType) => (value: boolean) => {
      setPermissions((prv: any) => {
        if (userRole === PSRoleThreadType.MEMBER && value) {
          // Nếu quyền thành viên được bật thì mặc định bật cho Admin
          prv = prv.map((ite: PSThreadPermissionsEntity) => {
            if (ite.userRole === PSRoleThreadType.ADMIN) {
              return {
                userRole: PSRoleThreadType.ADMIN,
                permission: {
                  ...ite.permission,
                  [key]: value,
                },
              };
            }
            return ite;
          });
        }

        return prv.map((ite: PSThreadPermissionsEntity) => {
          if (userRole === ite.userRole) {
            return {
              userRole,
              permission: {
                ...ite.permission,
                [key]: value,
              },
            };
          }
          return ite;
        });
      });
    },
    [],
  );

  const handledSavePermission = async () => {
    try {
      setLoading(true);
      const response = await chatApiCline?.threadApi.settingPermission(
        threadId,
        // @ts-ignore
        PSThreadSettingEntity.mapFromEntityToDto({permissions})?.permissions,
      );
      setLoading(false);
      if (response?.message_code === 'M200') {
        PSFlashMessage.show({
          type: 'success',
          text1: translator('ps_setting_permission_success'),
        });
        DeviceEventEmitter.emit(FETCH_DATA_THREAD_BY_ID_SAVE_TO_REALM);
        handledBackPress();
      }
    } catch (error: any) {
      setLoading(false);
      if (
        error &&
        error instanceof PSResponseError &&
        (error.http_code === 500 || error.http_code === 403)
      ) {
        PSFlashMessage.show({
          type: 'error',
          text1: error?.message,
          text2: translator('ps_error_general'),
        });
      }
    }
  };

  const renderRightContent = () => {
    return (
      <PSDebouncedPressable onPress={handledSavePermission}>
        <Text style={styles.styTxtSave}>{translator('ps_save')}</Text>
      </PSDebouncedPressable>
    );
  };

  return (
    <View style={styles.container}>
      <PSActionBar
        titleText={titleText}
        RightContent={renderRightContent}
        onBackPress={handledBackPress}
      />

      {currentThread?.setting?.permissions?.map(
        ({permission, ...ite}, index) => {
          /*Start setup quyền cho admin */
          if (
            roleSelectSetup === PSRoleThreadType.ADMIN &&
            ite.userRole === PSRoleThreadType.ADMIN
          ) {
            const permissionMember =
              currentThread?.setting?.permissions?.filter(
                ite => ite.userRole === PSRoleThreadType.MEMBER,
              )?.[0]?.permission;
            return (
              <View key={`${ite.userRole}-${index}`}>
                <SettingPermissionItem
                  label={translator('ps_setting_send_message')}
                  value={permission.sendMessage}
                  disable={
                    permissionMember?.sendMessage && permission.sendMessage
                  }
                  toggleSwitch={toggleSwitch('sendMessage', ite.userRole)}
                />
                <SettingPermissionItem
                  label={translator('ps_send_comment')}
                  value={permission.sendComment}
                  disable={
                    permissionMember?.sendComment && permission.sendComment
                  }
                  toggleSwitch={toggleSwitch('sendComment', ite.userRole)}
                />
                <SettingPermissionItem
                  label={translator('ps_setting_add_member')}
                  value={permission.addMember}
                  disable={permissionMember?.addMember && permission.addMember}
                  toggleSwitch={toggleSwitch('addMember', ite.userRole)}
                />
                <SettingPermissionItem
                  label={translator('ps_setting_pin_message')}
                  value={permission.pinMessage}
                  disable={
                    permissionMember?.pinMessage && permission.pinMessage
                  }
                  toggleSwitch={toggleSwitch('pinMessage', ite.userRole)}
                />
                <SettingPermissionItem
                  label={translator('ps_setting_un_pin_message')}
                  value={permission.unpinMessage}
                  disable={
                    permissionMember?.unpinMessage && permission.unpinMessage
                  }
                  toggleSwitch={toggleSwitch('unpinMessage', ite.userRole)}
                />

                <View style={styles.styWrapPermAdmin}>
                  {/* <SettingPermissionItem
                    label={translator('ps_setting_disable_chat_member')}
                    value={permission.muteMember}
                    toggleSwitch={toggleSwitch('muteMember', ite.userRole)}
                  /> */}
                  <SettingPermissionItem
                    label={translator('ps_setting_remove_member')}
                    value={permission.removeMember}
                    toggleSwitch={toggleSwitch('removeMember', ite.userRole)}
                  />
                  <SettingPermissionItem
                    label={translator('ps_setting_block_member')}
                    value={permission.banMember}
                    toggleSwitch={toggleSwitch('banMember', ite.userRole)}
                  />
                  <SettingPermissionItem
                    label={translator('ps_setting_link_join_group')}
                    value={permission.setupInvitationLink}
                    toggleSwitch={toggleSwitch(
                      'setupInvitationLink',
                      ite.userRole,
                    )}
                  />
                  <SettingPermissionItem
                    label={translator('ps_setting_add_admin')}
                    value={permission.addAdmin}
                    toggleSwitch={toggleSwitch('addAdmin', ite.userRole)}
                  />
                </View>
              </View>
            );
          }
          /*End setup quyền cho admin */

          /*Start setup quyền cho Member */
          if (
            roleSelectSetup === PSRoleThreadType.MEMBER &&
            ite.userRole === PSRoleThreadType.MEMBER
          )
            return (
              <View key={`${ite.userRole}--${index}`}>
                <SettingPermissionItem
                  label={translator('ps_setting_send_message')}
                  value={permission.sendMessage}
                  toggleSwitch={toggleSwitch('sendMessage', ite.userRole)}
                />
                <SettingPermissionItem
                  label={translator('ps_send_comment')}
                  value={permission.sendComment}
                  toggleSwitch={toggleSwitch('sendComment', ite.userRole)}
                />
                <SettingPermissionItem
                  label={translator('ps_setting_add_member')}
                  value={permission.addMember}
                  toggleSwitch={toggleSwitch('addMember', ite.userRole)}
                />
                <SettingPermissionItem
                  label={translator('ps_setting_pin_message')}
                  value={permission.pinMessage}
                  toggleSwitch={toggleSwitch('pinMessage', ite.userRole)}
                />
                <SettingPermissionItem
                  label={translator('ps_setting_un_pin_message')}
                  value={permission.unpinMessage}
                  toggleSwitch={toggleSwitch('unpinMessage', ite.userRole)}
                />
              </View>
            );
          /*End setup quyền cho Member */
          return null;
        },
      )}
      {loading && <ActivityIndicator style={styles.styLoading} />}
    </View>
  );
};

export const PSSettingPermissionInThreadScreen = ({
  userRole,
  threadId,
  onBackPress,
}: PSSettingPermissionProps) => {
  return (
    <PSMessageCurrentThreadProvider
      targetThreadId={threadId}
      targetUserId={undefined}>
      <PSThreadProfileProvider>
        <PSSettingPermissionInThread
          threadId={threadId}
          userRole={userRole}
          onBackPress={onBackPress}
        />
      </PSThreadProfileProvider>
    </PSMessageCurrentThreadProvider>
  );
};

const useStyleSettingPermission = () => {
  const {colors, typography} = usePSDesignSystemContext();
  const {width, height} = Dimensions.get('window');

  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        styTxtSave: {
          ...typography.headingMediumS,
          color: colors.Branding.b400,
        },
        styWrapPermAdmin: {
          borderTopWidth: 1,
          borderTopColor: colors.Neutral.n50,
          marginTop: (16).px(),
          paddingTop: (16).px(),
        },
        styLoading: {
          backgroundColor: 'rgba(255,255,255,0.7)',
          position: 'absolute',
          width,
          height,
          top: -50,
        },
      }),
    [colors, typography],
  );
};
