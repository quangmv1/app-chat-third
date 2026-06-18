import {PSThreadType} from '@communi/chat-api-client-typescript';
import React, {PropsWithChildren} from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {
  PSIcMute24,
  PSIcMuted24,
  PSIcSearch24,
  PSIcPersonPlus,
} from '../../../../icons';
import {usePSMessageCurrentThreadIdContext} from '../../../messages';
import {useActionThreadsProviderContext} from '../../../threads';
import {
  usePSThreadProfileNavigationContext,
  useThreadProfileActionContext,
} from '../../../profile';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

const IconAction = ({
  children,
  onPress,
}: PropsWithChildren<{
  onPress?: null | (() => void);
}>) => {
  const {colors} = usePSDesignSystemContext();

  return (
    <PSDebouncedPressable onPress={onPress}>
      <View
        style={[
          styles.icon_action,
          {
            backgroundColor: colors.Branding.b400,
            // shadowColor: colors.Primary.subText,
          },
        ]}>
        {children}
      </View>
    </PSDebouncedPressable>
  );
};

const ActionThreadProfile = () => {
  const {translator} = usePSTranslationContext();
  const {onAddMemberPress: onPressAddMember, onSearchMessagePress: onPressSearchMessage} =
    usePSThreadProfileNavigationContext();
  const {muteThread} = useActionThreadsProviderContext();

  const currentThreadId = usePSMessageCurrentThreadIdContext();
  const {type, isMute, isHasAddMemberPermission, isJoin} =
    useThreadProfileActionContext();

  const {colors, typography} = usePSDesignSystemContext();

  return isJoin ? (
    <View style={styles.container}>
      {type === PSThreadType.DIRECT ? null : isHasAddMemberPermission ? (
        <View style={styles.action_one}>
          <IconAction onPress={onPressAddMember}>
            <PSIcPersonPlus
              width={(28).px()}
              height={(28).px()}
              fill={colors.Neutral.n0}
            />
          </IconAction>
          <Text
            style={[{color: colors.Primary.subText}, typography.bodyMediumS]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {translator('ps_thread_profile_add_participants')}
          </Text>
        </View>
      ) : null}

      <View style={styles.action_one}>
        <IconAction onPress={onPressSearchMessage}>
          <PSIcSearch24
            width={(28).px()}
            height={(28).px()}
            fill={colors.Neutral.n0}
          />
        </IconAction>
        <Text
          style={[{color: colors.Primary.subText}, typography.bodyMediumS]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {translator('ps_thread_profile_search_message')}
        </Text>
      </View>

      <View style={styles.action_one}>
        <IconAction
          onPress={() => {
            currentThreadId && muteThread(currentThreadId);
          }}>
          {isMute ? (
            <PSIcMuted24
              width={(28).px()}
              height={(28).px()}
              fill={colors.Neutral.n0}
            />
          ) : (
            <PSIcMute24
              width={(28).px()}
              height={(28).px()}
              fill={colors.Neutral.n0}
            />
          )}
        </IconAction>
        <Text
          style={[{color: colors.Primary.subText}, typography.bodyMediumS]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {isMute
            ? translator('ps_thread_action_un_mute')
            : translator('ps_thread_action_mute')}
        </Text>
      </View>
    </View>
  ) : (
    <View style={{marginTop: (16).px()}} />
  );
};

export const PSActionThreadProfile = React.memo(
  ActionThreadProfile,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: (88).px(),
    marginTop: (16).px(),
    marginBottom: (32).px(),
  },
  action_one: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon_action: {
    width: (52).px(),
    height: (52).px(),
    borderRadius: (52 / 2).px(),
    justifyContent: 'center',
    alignItems: 'center',
    // shadowOffset: {width: 0, height: 2},
    // shadowRadius: 6,
    // shadowOpacity: 0.26,
    // elevation: 8,
  },
});
