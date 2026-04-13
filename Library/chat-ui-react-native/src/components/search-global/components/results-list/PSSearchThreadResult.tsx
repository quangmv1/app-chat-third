import React, {useEffect, useReducer} from 'react';
import isEqual from 'react-fast-compare';
import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import {
  mapSearchThreadResponseDtoToSearchThreadUIModel,
  mapThreadsEntityToSearchThreadsUIModel,
  PSFolderEntity,
  PSSearchThreadRecentlyEntity,
  PSThreadEntity,
  PSThreadListPCLEntity,
  SearchThreadUIModel,
} from '../../../../types';
import {PSSearchThreadItem} from '../SearchThreadItem';
import {
  usePSSearchThreadFilterContext,
  usePSSearchThreadNavigationContext,
} from '../../contexts';
import {PSCommonEmptyState} from '../../../PSCommonEmptyState';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
  useQuery,
  useRealm,
} from '../../../../context';
import {
  initialState,
  setApiFail,
  setApiRequest,
  setApiSuccess,
  setListEnd,
  userReducers,
} from '../../../../hooks';
import {TabSearchId} from '../tab';
import {PSSearchThreadStyles} from '../../PSSearchThreadStyles';
import {PSSkeleton} from '../../../PSSkeleton';
import {ActionDivier} from './PSSearchAllResult';

export const PSSearchThreadResult = React.memo(
  ({debouncedValue}: {debouncedValue: string}) => {
    const {translator} = usePSTranslationContext();
    const {colors, typography} = usePSDesignSystemContext();
    const searchThreadStyles = usePSScreenStylesContext<PSSearchThreadStyles>();
    const {currentSearchThreadFilterAlias} = usePSSearchThreadFilterContext();

    const {onThreadPress} = usePSSearchThreadNavigationContext();

    const [page, setPage] = React.useState(1);
    const [state, dispatch] = useReducer(userReducers, initialState);
    const {loading, moreLoading, data, isListEnd} = state;

    const chatApiClient = usePSChatApiClientContext();
    const realm = useRealm();

    const targetCSTeams = React.useMemo(() => {
      return [
        ...PSThreadListPCLEntity.getAll(realm).filtered(
          PSThreadListPCLEntity.filteredByTypeString(
            currentSearchThreadFilterAlias,
          ),
        ),
      ];
    }, [realm, currentSearchThreadFilterAlias]);

    // const cachedThreads = useQuery(
    //   PSThreadEntity,
    //   threads => {
    //     let result = threads.filtered(
    //       PSThreadEntity.filteredByLastMessageNotNullAndThreadNotDeleted(),
    //     );
    //     if (currentSearchThreadFilterAlias === TabSearchId.CHATS) {
    //       result = result.filtered(PSThreadEntity.filteredByFolderAll());
    //     } else if (currentSearchThreadFilterAlias === PSFolderEntity.UNREAD) {
    //       result = result.filtered(PSThreadEntity.filteredByUnRead());
    //     } else if (
    //       currentSearchThreadFilterAlias === PSFolderEntity.PUBLIC_GROUP
    //     ) {
    //       result = result.filtered(PSThreadEntity.filteredByPublicGroup());
    //     } else if (
    //       currentSearchThreadFilterAlias === PSFolderEntity.SHARED_INBOX
    //     ) {
    //       result = result.filtered(
    //         PSThreadEntity.filteredByPublicGroupUserType(
    //           PSFolderEntity.SHARED_INBOX,
    //         ),
    //       );
    //     } else if (currentSearchThreadFilterAlias === PSFolderEntity.PCL) {
    //       result = result.filtered(
    //         PSThreadEntity.filteredByPublicGroupUserType(PSFolderEntity.PCL),
    //       );
    //     }
    //     return result.sorted(PSThreadEntity.sorted);
    //   },
    //   [currentSearchThreadFilterAlias],
    // );

    const cachedThreadsRecently = useQuery(
      PSSearchThreadRecentlyEntity,
      threadsRecently => {
        return threadsRecently.sorted(PSSearchThreadRecentlyEntity.sorted);
      },
      [],
    );

    const queryThreads = () => {
      dispatch(setApiRequest(1));
      if (cachedThreadsRecently && cachedThreadsRecently.length) {
        const results = cachedThreadsRecently
          .map(recentThread => {
            if (recentThread.threadId) {
              return PSThreadEntity.getFirstById(realm, recentThread.threadId);
            } else if (recentThread.userId) {
              return PSThreadEntity.getFirstByPartnerId(
                realm,
                recentThread.userId,
              );
            }
            return null;
          })
          .filter(Boolean); // Loại bỏ các kết quả null

        dispatch(
          setApiSuccess(
            // @ts-ignore
            mapThreadsEntityToSearchThreadsUIModel([...results], targetCSTeams),
          ),
        );
      } else {
        dispatch(setApiSuccess([]));
      }
    };

    const searchThreads = async () => {
      dispatch(setApiRequest(page));
      try {
        const searchThreadsResponse =
          currentSearchThreadFilterAlias === PSFolderEntity.PUBLIC_GROUP
            ? await chatApiClient?.searchApi.searchConversations(
                debouncedValue,
                page,
                20,
              )
            : currentSearchThreadFilterAlias === PSFolderEntity.SHARED_INBOX
              ? await chatApiClient?.searchApi.searchConversations(
                  debouncedValue,
                  page,
                  20,
                  1,
                )
              : currentSearchThreadFilterAlias === PSFolderEntity.PCL
                ? await chatApiClient?.searchApi.searchConversations(
                    debouncedValue,
                    page,
                    20,
                    2,
                  )
                : currentSearchThreadFilterAlias === TabSearchId.GLOBAL
                  ? await chatApiClient?.searchApi.searchConversations(
                      debouncedValue,
                      page,
                      20,
                      8,
                    )
                  : await chatApiClient?.searchApi.searchConversations(
                      debouncedValue,
                      page,
                      20,
                      5,
                    );

        const threadsDto = searchThreadsResponse?.data;
        if (threadsDto && threadsDto.length > 0) {
          const isHaveTargetName = threadsDto.find(
            threadDto =>
              threadDto.thread?.targets && threadDto.thread?.targets.length > 0,
          );
          const cSTeams = isHaveTargetName ? targetCSTeams : undefined;
          dispatch(
            setApiSuccess(
              mapSearchThreadResponseDtoToSearchThreadUIModel(
                threadsDto,
                cSTeams,
              ),
            ),
          );
          if (searchThreadsResponse?.links?.total_pages === page) {
            dispatch(setListEnd());
          }
        } else {
          dispatch(setListEnd());
        }
      } catch (error) {
        dispatch(setApiFail());
      }
    };

    useEffect(() => {
      setPage(1);
    }, [debouncedValue]);

    useEffect(() => {
      if (debouncedValue === '') {
        queryThreads();
      } else {
        searchThreads();
      }
    }, [debouncedValue, page, currentSearchThreadFilterAlias]);

    useEffect(() => {
      if (debouncedValue === '') {
        queryThreads();
      }
      setPage(1);
    }, [currentSearchThreadFilterAlias]);

    const handleOnPress = React.useCallback(
      ({item}: {item: SearchThreadUIModel}) => {
        onThreadPress?.(item.threadId, item.targetUserId);
      },
      [onThreadPress],
    );

    const renderItemThread = React.useCallback(
      ({item, index}: {item: SearchThreadUIModel; index: number}) => {
        return (
          <PSSearchThreadItem
            key={`${item.id}_${index}`}
            thread={item}
            index={index}
            onPress={handleOnPress}
            verified={item.verified}
            keySearch={debouncedValue}
          />
        );
      },
      [debouncedValue, handleOnPress],
    );

    const renderFooter = () => (
      <View style={styles.footerText}>
        {moreLoading && <ActivityIndicator />}
        {/* {isListEnd && <Text>No more . Het rooi !!!</Text>} */}
      </View>
    );

    const fetchMoreData = () => {
      if (!isListEnd && !moreLoading) {
        setPage(page + 1);
      }
    };

    return (
      <>
        {debouncedValue === '' && (
          <Text
            style={[
              {
                marginHorizontal: (12).px(),
                marginTop: (12).px(),
                marginBottom: (8).px(),
                color: colors.Primary.subText,
              },
              typography.bodyXLargeS,
            ]}>
            {translator('ps_search_thread_recently')}
          </Text>
        )}
        {loading ? (
          // <View style={styles.loading}>
          //   <ActivityIndicator size="large" />
          // </View>
          <View style={styles.loading}>
            {Array(10)
              .fill(null)
              .map((_, index) => (
                <PSSkeleton key={index} />
              ))}
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: (12).px(),
              paddingVertical: (8).px(),
            }}
            data={data}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => renderItemThread({item, index})}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <PSCommonEmptyState
                textStyle={[
                  {color: colors.Primary.subText},
                  typography.bodyMediumR,
                ]}
              />
            }
            keyboardDismissMode={'on-drag'}
            keyboardShouldPersistTaps={'handled'}
            onEndReachedThreshold={0.2}
            onEndReached={fetchMoreData}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={ActionDivier}
          />
        )}
      </>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  footerText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
