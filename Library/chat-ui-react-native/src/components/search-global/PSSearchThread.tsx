import React, {PropsWithChildren, useCallback, useEffect} from 'react';
import {useState, useReducer} from 'react';
import {
  userReducers,
  initialState,
  setApiRequest,
  setApiSuccess,
  setApiFail,
  setListEnd,
} from '../../hooks';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {PSActionBar, PSCommonEmptyState, PSSearch} from '../../components';
import {
  PSScreenStylesProvider,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
  useQuery,
  useRealm,
} from '../../context';
import {useDebounce} from '../../hooks';
import {
  mapSearchThreadResponseDtoToSearchThreadUIModel,
  SearchThreadUIModel,
  PSThreadEntity,
  mapThreadsEntityToSearchThreadsUIModel,
  PSFolderEntity,
  PSThreadListPCLEntity,
} from '../../types';
import {PSSearchThreadStyles} from './PSSearchThreadStyles';
import {
  PSSearchThreadFilterProvider,
  PSSearchThreadNavigationProvider,
  PSSearchThreadRecentlyProvider,
  usePSSearchThreadFilterContext,
  usePSSearchThreadNavigationContext,
} from './contexts';
import {PSSearchThreadItem} from './components';
import {PSSearchThreadFilter} from './components/filter';
import {PSSearchThreadV2} from './PSSearchThreadV2';

type PSSearchThreadProps = {
  searchThreadStyles?: PSSearchThreadStyles;
  onBackPress?: null | (() => void);
  onThreadPress?: (targetThreadId?: string, targetUserId?: string) => void;
  onViewMessage?: null | ((threadId: string, messageId: number) => void);
};

const PSSearchThreadProviders = ({
  searchThreadStyles,
  onBackPress,
  onThreadPress,
  onViewMessage,
  children,
}: PropsWithChildren<PSSearchThreadProps>) => {
  return (
    <PSSearchThreadRecentlyProvider>
      <PSSearchThreadNavigationProvider
        onBackPress={onBackPress}
        onThreadPress={onThreadPress}
        onViewMessage={onViewMessage}>
        <PSScreenStylesProvider styles={searchThreadStyles}>
          <PSSearchThreadFilterProvider>
            {children}
          </PSSearchThreadFilterProvider>
        </PSScreenStylesProvider>
      </PSSearchThreadNavigationProvider>
    </PSSearchThreadRecentlyProvider>
  );
};

const PSSearchThreadUI = () => {
  const {translator} = usePSTranslationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const {onBackPress, onThreadPress} = usePSSearchThreadNavigationContext();
  const {currentSearchThreadFilterAlias} = usePSSearchThreadFilterContext();
  const [keySearch, setKeySearch] = useState('');
  const debouncedValue = useDebounce<string>(keySearch, 500);

  const [page, setPage] = useState(1);
  const [state, dispatch] = useReducer(userReducers, initialState);
  const {loading, moreLoading, data, isListEnd} = state;

  const chatApiClient = usePSChatApiClientContext();

  const searchThreadStyles = usePSScreenStylesContext<PSSearchThreadStyles>();

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

  const cachedThreads = useQuery(
    PSThreadEntity,
    threads => {
      let result = threads.filtered(
        PSThreadEntity.filteredByLastMessageNotNullAndThreadNotDeleted(),
      );
      if (currentSearchThreadFilterAlias === PSFolderEntity.ALL) {
        result = result.filtered(PSThreadEntity.filteredByFolderAll());
      } else if (currentSearchThreadFilterAlias === PSFolderEntity.UNREAD) {
        result = result.filtered(PSThreadEntity.filteredByUnRead());
      } else if (
        currentSearchThreadFilterAlias === PSFolderEntity.PUBLIC_GROUP
      ) {
        result = result.filtered(PSThreadEntity.filteredByPublicGroup());
      } else if (
        currentSearchThreadFilterAlias === PSFolderEntity.SHARED_INBOX
      ) {
        result = result.filtered(
          PSThreadEntity.filteredByPublicGroupUserType(
            PSFolderEntity.SHARED_INBOX,
          ),
        );
      } else if (currentSearchThreadFilterAlias === PSFolderEntity.PCL) {
        result = result.filtered(
          PSThreadEntity.filteredByPublicGroupUserType(PSFolderEntity.PCL),
        );
      }
      return result.sorted(PSThreadEntity.sorted);
    },
    [currentSearchThreadFilterAlias],
  );

  const queryThreads = () => {
    dispatch(setApiRequest(1));
    dispatch(
      setApiSuccess(
        mapThreadsEntityToSearchThreadsUIModel(
          [...cachedThreads],
          targetCSTeams,
        ),
      ),
    );
  };

  const searchThreads = async () => {
    dispatch(setApiRequest(page));
    try {
      const searchThreadsResponse =
        currentSearchThreadFilterAlias === PSFolderEntity.PUBLIC_GROUP
          ? await chatApiClient?.searchApi.searchPublicThread(
              keySearch,
              page,
              20,
            )
          : currentSearchThreadFilterAlias === PSFolderEntity.SHARED_INBOX
            ? await chatApiClient?.searchApi.searchPublicThread(
                keySearch,
                page,
                20,
                1,
              )
            : currentSearchThreadFilterAlias === PSFolderEntity.PCL
              ? await chatApiClient?.searchApi.searchPublicThread(
                  keySearch,
                  page,
                  20,
                  2,
                )
              : await chatApiClient?.searchApi.searchThreadV2(
                  keySearch,
                  page,
                  20,
                  searchThreadStyles.isSearchOnlyJoinedThreads ? 2 : 0,
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

  const handleOnPress = useCallback(
    ({item}: {item: SearchThreadUIModel}) => {
      onThreadPress?.(item.threadId, item.targetUserId);
    },
    [onThreadPress],
  );

  const renderItemThread = useCallback(
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
    <View style={styles.container}>
      <PSActionBar
        titleText={translator('ps_search_thread_header')}
        onBackPress={onBackPress}
      />
      <View
        style={[styles.container_content, {backgroundColor: colors.Primary.background}]}>
        <PSSearch
          value={keySearch}
          onChangeText={newText => {
            setKeySearch(newText);
            setPage(1);
          }}
          placeholder={translator('ps_search')}
          placeholderTextColor={colors.Neutral.n200}
          searchIconColor={colors.Neutral.n200}
          style={[styles.search, {backgroundColor: colors.Primary.background}]}
          textStyle={[{color: colors.Primary.subText}, typography.bodyXLargeR]}
          autoFocus={true}
        />
        {searchThreadStyles.isVisibleFilterSearchTab && (
          <PSSearchThreadFilter />
        )}
        {debouncedValue === '' && (
          <Text
            style={[
              {marginVertical: (16).px(), color: colors.Primary.subText},
              typography.headingMediumS,
            ]}>
            {translator('ps_search_thread_recently')}
          </Text>
        )}
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{flexGrow: 1}}
            data={data}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => renderItemThread({item, index})}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <PSCommonEmptyState
                textStyle={[{color: colors.Primary.subText}, typography.bodyMediumR]}
              />
            }
            keyboardDismissMode={'on-drag'}
            keyboardShouldPersistTaps={'handled'}
            onEndReachedThreshold={0.2}
            onEndReached={fetchMoreData}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export const PSSearchThread = ({
  onBackPress,
  onThreadPress,
  onViewMessage,
  searchThreadStyles,
}: PSSearchThreadProps) => {
  return (
    <PSSearchThreadProviders
      onBackPress={onBackPress}
      onThreadPress={onThreadPress}
      onViewMessage={onViewMessage}
      searchThreadStyles={searchThreadStyles}>
      {/* <PSSearchThreadUI /> */}
      <PSSearchThreadV2 />
    </PSSearchThreadProviders>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container_content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  search: {marginHorizontal: (4).px(), marginVertical: (20).px()},
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  emptyText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexShrink: 1,
    maxHeight: 90,
    height: 90,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 2,
  },
  inputUser: {
    height: 46,
    paddingHorizontal: 10,
    backgroundColor: '#dcdcdc',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
