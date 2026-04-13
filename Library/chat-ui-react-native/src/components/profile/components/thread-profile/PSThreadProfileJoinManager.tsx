import {
  PSThreadGroupLevelType,
  PSThreadType,
} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSIcInviteByLink24} from '../../../../icons';
import {
  usePSThreadProfileNavigationContext,
  useThreadProfileActionContext,
} from '../../contexts';
import {PSThreadProfileStyles} from '../../PSThreadProfileStyles';
import {PSThreadProfileRowItem} from './PSThreadProfileRowItem';

const ManagerJoinProfile = () => {
  const {translator} = usePSTranslationContext();
  const threadProfileStyles = usePSScreenStylesContext<PSThreadProfileStyles>();
  const {onPressLinkJoinThread} = usePSThreadProfileNavigationContext();
  const {type} = useThreadProfileActionContext();
  const {colors} = usePSDesignSystemContext();

  return (
    <View>
      {threadProfileStyles.isInvitationLinkVisible === false ||
      type === PSThreadType.DIRECT ? null : (
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.Primary.white,
              // shadowColor: colors.Neutral.n100,
            },
          ]}>
          <PSThreadProfileRowItem
            title={translator('ps_thread_profile_link_join_group')}
            colorTitle={colors.Primary.subText}
            onPress={onPressLinkJoinThread}>
            <PSIcInviteByLink24
              width={20}
              height={20}
              fill={colors.Primary.subText}
            />
          </PSThreadProfileRowItem>
        </View>
      )}
    </View>
  );
};

export const PSThreadProfileJoinManager = React.memo(
  ManagerJoinProfile,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderRadius: (12).px(),
    marginBottom: (16).px(),
    // shadowOffset: {width: 0, height: 2},
    // shadowRadius: 6,
    // shadowOpacity: 0.26,
    // elevation: 8,
  },
});
