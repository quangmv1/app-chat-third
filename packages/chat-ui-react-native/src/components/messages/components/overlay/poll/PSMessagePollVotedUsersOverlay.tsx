import React, {useReducer} from 'react';
import {
  usePSMessageCurrentThreadIdContext,
  usePSMessagePollOverlayActionContext,
  usePSMessagePollOverlayContext,
} from '../../../contexts';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {StyleSheet, Text, View} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../../context';
import {
  initialState,
  setApiFail,
  setApiRequest,
  setApiSuccess,
  setListEnd,
  userReducers,
} from '../../../../../hooks';
import {
  mapUserEntityToModel,
  mapUsersDtoToModel,
  PSUserEntity,
  PSUserModel,
} from '../../../../../types';
import {useDeepCompareMemoize, useIsMountedRef} from '../../../../../hooks';
import {psLogger} from '../../../../../utils';
import {PSMessageReactionsOverlayUserItem} from '../reactions';
import {
  PSUserDto,
  PS_FETCH_USER_BY_IDS_MAX,
} from '@communi/chat-api-client-typescript';

export type PSMessagePollVotedUsersOverlayProps = {
  messageId: number;
  pollId: string;
  optionId: string;
  voteCount: number;
};

export const PSMessagePollVotedUsersOverlay = React.memo(() => {
  const {translator} = usePSTranslationContext();

  const isMounted = useIsMountedRef();
  const {typography, colors} = usePSDesignSystemContext();
  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const {
    isVisible,
    bottomSheetRef,
    usersVotedOverlayProps: props,
  } = usePSMessagePollOverlayContext();

  const {hide} = usePSMessagePollOverlayActionContext();

  const keyUserExtractor = React.useCallback(
    (item: PSUserModel) => item.extUserId,
    [],
  );

  const renderUserItem = React.useCallback(
    ({item}: {item: PSUserModel}) => (
      <PSMessageReactionsOverlayUserItem user={item} />
    ),
    [],
  );

  const renderBackdrop = React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} />
    ),
    [],
  );

  const renderCustomHandle = React.useCallback(() => {
    return (
      <View style={styles.handleContainer}>
        <Text style={[{color: colors.Primary.subText}, typography.bodyMediumS]}>
          {translator(
            'ps_message_poll_voted_users_overlay_title',
            // @ts-ignore
            {
              count: (props?.voteCount ?? 0).toString(),
            },
          )}
        </Text>
      </View>
    );
  }, [colors.Primary.subText, typography.bodyMediumS, translator, props?.voteCount]);

  const [page, setPage] = React.useState(1);
  const [state, dispatch] = useReducer(userReducers, initialState);
  const {moreLoading, data, isListEnd} = state;
  const [usersVoted, setUsersVoted] = React.useState<PSUserModel[]>([]);
  const chatApiClient = usePSChatApiClientContext();
  const realm = useRealm();

  const searchUsersVoted = async () => {
    if (!chatApiClient || !currentThreadId || !props) {
      return;
    }
    dispatch(setApiRequest(page));

    const userId = page === 1 ? '0' : data[page * 20 - 21];

    try {
      const response = await chatApiClient.messageApi.fetchUsersVoted(
        currentThreadId,
        props?.messageId,
        props?.pollId,
        props?.optionId,
        userId,
        20,
      );
      const userIds = response.data;

      if (userIds && userIds.length > 0) {
        dispatch(setApiSuccess(userIds));
        if (userIds.length < 20) {
          dispatch(setListEnd());
        }
      } else {
        dispatch(setListEnd());
      }
    } catch (error) {
      dispatch(setApiFail());
    }
  };

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
            setUsersVoted(values => [...values, ...mapUsersDtoToModel(users)]);
          }
        }
      } catch (error) {
        psLogger.error('PSMessagePollUsersVotedOverlay: fetchUserByIds', error);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chatApiClient, realm],
  );

  const fetchMoreData = () => {
    if (!isListEnd && !moreLoading) {
      setPage(page + 1);
    }
  };

  React.useEffect(() => {
    if (isVisible) {
      searchUsersVoted();
    } else {
      setPage(1);
      dispatch(setApiRequest(1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, page]);

  React.useEffect(() => {
    setUsersVoted([]);
    if (isVisible) {
      const userIds = data as string[];

      if (userIds && userIds.length) {
        const users =
          PSUserEntity.getByExtUserIds(realm, userIds).map(
            user => mapUserEntityToModel(user)!,
          ) ?? [];
        const userIdsCached = users.map(user => user.extUserId);
        const userIdsNotCached = userIds.filter(
          id => !userIdsCached.includes(id),
        );
        if (users && users.length) {
          setUsersVoted(values => [...values, ...users]);
        }
        if (userIdsNotCached && userIdsNotCached.length) {
          fetchUserByIds(userIdsNotCached);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useDeepCompareMemoize(data), fetchUserByIds, isVisible, realm]);

  const backgroundStyle = React.useMemo(() => {
    return {
      backgroundColor: colors.Primary.white,
    };
  }, [colors.Primary.linerBorder]);

  const flatListStyles = React.useMemo(() => {
    return [styles.usersContainer, {backgroundColor: colors.Primary.white}];
  }, [colors.Primary.linerBorder]);

  return isVisible ? (
    <BottomSheet
      ref={bottomSheetRef}
      enablePanDownToClose={true}
      handleComponent={renderCustomHandle}
      index={isVisible ? 0 : -1}
      snapPoints={['50%', '90%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      onClose={hide}>
      <BottomSheetFlatList
        style={flatListStyles}
        data={usersVoted}
        keyExtractor={keyUserExtractor}
        renderItem={renderUserItem}
        onEndReachedThreshold={0.2}
        onEndReached={fetchMoreData}
      />
    </BottomSheet>
  ) : null;
});

const styles = StyleSheet.create({
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: (16).px(),
    paddingVertical: (12).px(),
    borderTopStartRadius: (22).px(),
    borderTopEndRadius: (22).px(),
  },
  usersContainer: {
    flex: 1,
    paddingBottom: (12).px(),
  },
});
