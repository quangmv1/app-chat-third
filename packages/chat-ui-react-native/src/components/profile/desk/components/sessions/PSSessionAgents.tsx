import {
  PSUserDto,
  PS_FETCH_USER_BY_IDS_MAX,
} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View, Text, StyleProp, ViewStyle} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  useRealm,
} from '../../../../../context';
import {useDeepCompareMemoize, useIsMountedRef} from '../../../../../hooks';
import {PSIcAddCircleDash32} from '../../../../../icons';
import {
  mapUserEntityToModel,
  mapUsersDtoToModel,
  PSUserEntity,
  PSUserModel,
} from '../../../../../types';
import {psLogger} from '../../../../../utils';
import {PSAvatarImage} from '../../../../PSAvatarImage';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {usePSThreadProfileNavigationContext} from '../../../contexts';

const MEMBER_SHOW_MAX = 3;

const SessionAgents = ({
  memberIds,
  isClosed,
  style,
}: {
  memberIds: string[];
  isClosed: boolean;
  style?: StyleProp<ViewStyle>;
}) => {
  const isMounted = useIsMountedRef();

  const realm = useRealm();

  const chatApiClient = usePSChatApiClientContext();

  const {typography, colors} = usePSDesignSystemContext();

  const {onAddMemberPress} = usePSThreadProfileNavigationContext();

  const [members, setMembers] = React.useState<PSUserModel[]>([]);

  const subMemberIds = React.useMemo(() => {
    return memberIds.slice(0, MEMBER_SHOW_MAX);
  }, [useDeepCompareMemoize(memberIds)]);

  const fetchUserByIds = React.useCallback(
    async (userIds: string[]) => {
      if (!userIds.length || !chatApiClient) {
        return;
      }
      try {
        // api fetchUserByIds chỉ lấy đc max = PS_FETCH_USER_BY_IDS_MAX
        const userIdsArray: string[][] = [];
        for (let i = 0; i < userIds.length / PS_FETCH_USER_BY_IDS_MAX; i++) {
          userIdsArray.push(
            userIds.slice(
              i * PS_FETCH_USER_BY_IDS_MAX,
              PS_FETCH_USER_BY_IDS_MAX + i * PS_FETCH_USER_BY_IDS_MAX,
            ),
          );
        }
        const responses = await Promise.all(
          userIdsArray.map(items =>
            chatApiClient.userApi.fetchUserByIds(items),
          ),
        );
        const users: PSUserDto[] = [];
        for (const response of responses) {
          if (response.data) {
            users.push(...response.data);
          }
        }
        if (users && users.length) {
          realm.write(() => {
            for (const user of users) {
              PSUserEntity.createOrUpdate(
                realm,
                PSUserEntity.mapFromDto(user)!,
              );
            }
          });
          if (isMounted.current) {
            setMembers(values => [...values, ...mapUsersDtoToModel(users)]);
          }
        }
      } catch (error) {
        psLogger.error('SessionAgents: fetchUserByIds', error);
        await new Promise(resolver =>
          setTimeout(() => {
            resolver('');
          }, 1000),
        );
        if (isMounted.current) {
          fetchUserByIds(userIds);
        }
      }
    },
    [chatApiClient, realm],
  );

  React.useEffect(() => {
    setMembers([]);
    if (subMemberIds.length) {
      const users =
        PSUserEntity.getByExtUserIds(realm, subMemberIds).map(
          user => mapUserEntityToModel(user)!,
        ) ?? [];
      const userIdsCached = users.map(user => user.extUserId);
      const userIdsNotCached = subMemberIds.filter(
        id => !userIdsCached.includes(id),
      );
      if (users && users.length) {
        setMembers(values => [...values, ...users]);
      }
      if (userIdsNotCached && userIdsNotCached.length) {
        fetchUserByIds(userIdsNotCached);
      }
    }
  }, [realm, fetchUserByIds, useDeepCompareMemoize(subMemberIds)]);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, typography.headingMediumM, {color: colors.Primary.subText}]}>
        Agents
      </Text>

      {members.length
        ? members.map(user => (
            <PSAvatarImage
              key={user.extUserId}
              size={32}
              displayName={user.name}
              url={user.avatar ?? ''}
              imageStyle={styles.userAvatar}
            />
          ))
        : null}

      {isClosed ? null : (
        <PSDebouncedPressable onPress={onAddMemberPress}>
          <PSIcAddCircleDash32
            width={(32).px()}
            height={(32).px()}
            fill={colors.Primary.subText}
          />
        </PSDebouncedPressable>
      )}
    </View>
  );
};

export const PSSessionAgents = React.memo(SessionAgents, (prev, next) => {
  return isEqual(prev, next);
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: (12).px(),
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  tag: {
    marginEnd: (4).px(),
  },
  userAvatar: {marginEnd: (2).px()},
});
