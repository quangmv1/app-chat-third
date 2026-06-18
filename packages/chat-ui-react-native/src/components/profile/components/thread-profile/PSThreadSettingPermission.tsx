import {
  PSRoleThreadType,
  PSThreadType,
} from '@communi/chat-api-client-typescript';
import React, {useMemo} from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {IcSettiPerAdmin, IcSettiPermember} from '../../../../icons';
import {
  usePSThreadProfileNavigationContext,
  useThreadProfileActionContext,
} from '../../contexts';
import {PSThreadProfileRowItem} from './PSThreadProfileRowItem';

const ThreadSettingPermission = () => {
  const {translator} = usePSTranslationContext();
  const {onSettingPermissionGroup} = usePSThreadProfileNavigationContext();

  const {type, isJoin, role} = useThreadProfileActionContext();

  const {colors} = usePSDesignSystemContext();

  const styles = useStylePSThreadSettingPermission();

  return (
    <View>
      {type === PSThreadType.DIRECT ||
      role === PSRoleThreadType.MEMBER ? null : (
        <View style={styles.container}>
          {!!role &&
            [PSRoleThreadType.ADMIN, PSRoleThreadType.OWNER].includes(role) && (
              <PSThreadProfileRowItem
                title={translator('ps_setting_permission_member')}
                colorTitle={colors.Primary.subText}
                showIconRight={isJoin ? true : false}
                onPress={() => {
                  typeof onSettingPermissionGroup === 'function' &&
                    onSettingPermissionGroup(PSRoleThreadType.MEMBER);
                }}>
                <IcSettiPermember
                  width={20}
                  height={20}
                  fill={colors.Primary.subText}
                />
              </PSThreadProfileRowItem>
            )}

          {role === PSRoleThreadType.OWNER && (
            <PSThreadProfileRowItem
              title={translator('ps_setting_permission_admin')}
              colorTitle={colors.Primary.subText}
              showIconRight={isJoin ? true : false}
              onPress={() => {
                typeof onSettingPermissionGroup === 'function' &&
                  onSettingPermissionGroup(PSRoleThreadType.ADMIN);
              }}>
              <IcSettiPerAdmin width={20} height={20} fill={colors.Primary.subText} />
            </PSThreadProfileRowItem>
          )}
        </View>
      )}
    </View>
  );
};

export const PSThreadSettingPermission = React.memo(
  ThreadSettingPermission,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const useStylePSThreadSettingPermission = () => {
  const {colors} = usePSDesignSystemContext();

  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'column',
          borderRadius: (12).px(),
          marginBottom: (16).px(),
          backgroundColor: colors.Primary.white,
        },
      }),
    [colors],
  );
};
