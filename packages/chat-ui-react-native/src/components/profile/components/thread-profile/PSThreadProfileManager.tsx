import {PSThreadType} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSIcGroupMember24} from '../../../../icons';
import {
  usePSThreadProfileNavigationContext,
  useThreadProfileActionContext,
} from '../../contexts';
import {PSThreadProfileRowItem} from './PSThreadProfileRowItem';

const ManagerThreadProfile = () => {
  const {translator} = usePSTranslationContext();
  const {onMembersInThreadPress: onPressMembersInThread} = usePSThreadProfileNavigationContext();
  const {type, memberCount, isJoin} = useThreadProfileActionContext();

  const {colors} = usePSDesignSystemContext();

  return (
    <View>
      {type === PSThreadType.DIRECT ? null : (
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.Primary.white,
              // shadowColor: colors.Neutral.n100,
            },
          ]}>
          <PSThreadProfileRowItem
            title={translator(
              'ps_thread_profile_total_users',
              // @ts-ignore
              {
                total: `${memberCount}`,
              },
            )}
            colorTitle={colors.Primary.subText}
            showIconRight={isJoin ? true : false}
            onPress={() => {
              isJoin && onPressMembersInThread?.();
            }}>
            <PSIcGroupMember24 width={20} height={20} fill={colors.Primary.subText} />
          </PSThreadProfileRowItem>
        </View>
      )}
    </View>
  );
};

export const PSThreadProfileManager = React.memo(
  ManagerThreadProfile,
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
