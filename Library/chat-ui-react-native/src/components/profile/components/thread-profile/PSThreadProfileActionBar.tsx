import {
  PSRoleThreadType,
  PSThreadType,
} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {PSActionBar, PSDebouncedPressable} from '../../../../components';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSIcOption24} from '../../../../icons';
import {
  PSChangeThreadProfileType,
  usePSChangeThreadProfileContext,
  usePSThreadProfileNavigationContext,
  useThreadProfileActionContext,
} from '../../contexts';

const ThreadProfileActionBar = () => {
  const {translator} = usePSTranslationContext();
  const {colors} = usePSDesignSystemContext();
  const {onBackPress} = usePSThreadProfileNavigationContext();
  const {type, role} = useThreadProfileActionContext();

  const {show} = usePSChangeThreadProfileContext();

  const rightContent = React.useCallback(() => {
    return type === PSThreadType.GROUP &&
      (role === PSRoleThreadType.OWNER || role === PSRoleThreadType.ADMIN) ? (
      <PSDebouncedPressable
        onPress={() => {
          show(PSChangeThreadProfileType.NAME_DESCRIPTION);
        }}
        style={styles.rightContent}>
        <PSIcOption24
          width={(32).px()}
          height={(32).px()}
          fill={colors.Primary.subText}
        />
      </PSDebouncedPressable>
    ) : (
      <View style={styles.headerRightEmpty} />
    );
  }, [colors.Primary.subText, role, show, type]);

  return (
    <PSActionBar
      titleText={translator('ps_information')}
      onBackPress={onBackPress}
      RightContent={rightContent}
    />
  );
};

export const PSThreadProfileActionBar = React.memo(
  ThreadProfileActionBar,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  rightContent: {flex: 1, justifyContent: 'center'},
  headerRightEmpty: {height: (24).px(), width: (24).px()},
});
