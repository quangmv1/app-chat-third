import React from 'react';
import {StyleSheet} from 'react-native';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {
  mapUserEntityToModel,
  mapUsersDtoToModel,
  PSMessageReactionModel,
  PSUserEntity,
  PSUserModel,
} from '../../../../../types';
import {
  usePSMessageReactionsOverlayActionContext,
  usePSMessageReactionsOverlayContext,
} from '../../../contexts';
import {psLogger} from '../../../../../utils';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  useRealm,
} from '../../../../../context';
import {PSMessageReactionsOverlayUserItem} from './PSMessageReactionsOverlayUserItem';
import {PSMessageReactionsOverlayReactionItem} from './PSMessageReactionsOverlayReactionItem';
import {FlatList} from 'react-native-gesture-handler';
import {useDeepCompareMemoize, useIsMountedRef} from '../../../../../hooks';
import {
  PSUserDto,
  PS_FETCH_USER_BY_IDS_MAX,
} from '@communi/chat-api-client-typescript';

export const PSMessageReactionsOverlay = React.memo(() => {
  const isMounted = useIsMountedRef();
  const {colors} = usePSDesignSystemContext();

  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const {hide} = usePSMessageReactionsOverlayActionContext();

  const {isVisible, reactions, bottomSheetRef, selectedIndex} =
    usePSMessageReactionsOverlayContext();

  const [usersReaction, setUsersReaction] = React.useState<PSUserModel[]>([]);

  const reactionsFlatListRef = React.useRef<FlatList>(null);

  const selectedIndexRef = React.useRef(selectedIndex);

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
    ),
    [],
  );

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

  const keyReactionExtractor = React.useCallback(
    (item: PSMessageReactionModel) => item.name,
    [],
  );

  const renderReactionItem = React.useCallback(
    ({item, index}: {item: PSMessageReactionModel; index: number}) => (
      <PSMessageReactionsOverlayReactionItem index={index} reaction={item} />
    ),
    [],
  );

  const onScrollToIndexFailedRef = React.useRef(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      if (reactionsFlatListRef.current) {
        reactionsFlatListRef.current.scrollToOffset({
          animated: false,
          offset: info.averageItemLength * info.index,
        });
        setTimeout(() => {
          reactionsFlatListRef.current?.scrollToIndex({
            animated: false,
            index: info.index,
            viewPosition: 0.5,
          });
        }, 50);
      }
    },
  );

  const renderCustomHandle = React.useCallback(() => {
    return (
      <FlatList
        ref={reactionsFlatListRef}
        showsHorizontalScrollIndicator={false}
        onScrollToIndexFailed={onScrollToIndexFailedRef.current}
        horizontal
        data={reactions}
        bounces={false}
        onLayout={() => {
          reactionsFlatListRef.current?.scrollToIndex({
            animated: false,
            index: selectedIndexRef.current,
            viewPosition: 0.5,
          });
        }}
        contentContainerStyle={styles.reactionsContainer}
        keyExtractor={keyReactionExtractor}
        renderItem={renderReactionItem}
      />
    );
  }, [
    reactionsFlatListRef,
    reactions,
    keyReactionExtractor,
    renderReactionItem,
  ]);

  React.useLayoutEffect(() => {
    selectedIndexRef.current = selectedIndex;
    reactionsFlatListRef.current?.scrollToIndex({
      animated: false,
      index: selectedIndex,
      viewPosition: 0.5,
    });
  }, [selectedIndex]);

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
            setUsersReaction(values => [
              ...values,
              ...mapUsersDtoToModel(users),
            ]);
          }
        }
      } catch (error) {
        psLogger.error('PSMessageReactionsOverlay: fetchUserByIds', error);
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
    setUsersReaction([]);
    if (isVisible && reactions.length) {
      const userIds = reactions[selectedIndex]?.userIds;

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
          setUsersReaction(values => [...values, ...users]);
        }
        if (userIdsNotCached && userIdsNotCached.length) {
          fetchUserByIds(userIdsNotCached);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    realm,
    isVisible,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useDeepCompareMemoize(reactions),
    selectedIndex,
    fetchUserByIds,
  ]);

  const backgroundStyle = React.useMemo(() => {
    return {
      backgroundColor: colors.Primary.white,
    };
  }, [colors.Primary.linerBorder]);

  return isVisible && reactions.length ? (
    <BottomSheet
      ref={bottomSheetRef}
      enablePanDownToClose={true}
      handleComponent={renderCustomHandle}
      index={isVisible && reactions.length ? 0 : -1}
      snapPoints={['50%', '90%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      onClose={hide}>
      <BottomSheetFlatList
        style={[
          styles.usersContainer,
          {backgroundColor: colors.Primary.white},
        ]}
        data={usersReaction}
        keyExtractor={keyUserExtractor}
        renderItem={renderUserItem}
      />
    </BottomSheet>
  ) : null;
});

const styles = StyleSheet.create({
  reactionsContainer: {
    minWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: (16).px(),
    paddingTop: (16).px(),
    paddingBottom: (12).px(),
    borderTopStartRadius: (22).px(),
    borderTopEndRadius: (22).px(),
  },
  usersContainer: {
    flex: 1,
    paddingBottom: (12).px(),
  },
});
