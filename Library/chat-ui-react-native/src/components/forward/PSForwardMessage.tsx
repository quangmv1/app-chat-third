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
import {PSActionBar} from '../PSActionBar';
import {PSFlashMessage} from '../flash-message';
import {PSSearch} from '../PSSearch';
import {
  PSScreenStylesProvider,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
  useQuery,
} from '../../context';
import {useDebounce} from '../../hooks';
import {psLogger} from '../../utils';
import {ForwardThreadItem} from './components';
import {PSThreadType} from '@communi/chat-api-client-typescript';
import {
  mapSearchThreadResponseDtoToSearchThreadUIModel,
  mapThreadsEntityToSearchThreadsUIModel,
  PSThreadEntity,
  SearchThreadUIModel,
} from '../../types';
import {PSForwardMessageStyles} from './PSForwardMessageStyles';
import {
  PSForwardMessageNavigationProvider,
  usePSForwardMessageNavigationContext,
} from './contexts';
import {PSCommonEmptyState} from '../PSCommonEmptyState';

type PSForwardMessageProps = {
  threadId: string;
  messageIds: number[];
  forwardMessageStyles?: PSForwardMessageStyles;
  onBackPress?: null | (() => void);
};

const PSForwardMessageProviders = ({
  onBackPress,
  forwardMessageStyles,
  children,
}: PropsWithChildren<{
  onBackPress?: null | (() => void);
  forwardMessageStyles?: PSForwardMessageStyles;
}>) => {
  return (
    <PSForwardMessageNavigationProvider onBackPress={onBackPress}>
      <PSScreenStylesProvider styles={forwardMessageStyles}>
        {children}
      </PSScreenStylesProvider>
    </PSForwardMessageNavigationProvider>
  );
};

const PSForwardMessageUI = ({
  threadId,
  messageIds,
}: {
  threadId: string;
  messageIds: number[];
}) => {
  const {translator} = usePSTranslationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const {onBackPress} = usePSForwardMessageNavigationContext();
  const [threadIdsForwarded, setThreadIdsForwarded] = useState<string[]>([]);

  const [keySearch, setKeySearch] = useState('');
  const debouncedValue = useDebounce<string>(keySearch, 500);

  const [page, setPage] = useState(1);
  const [state, dispatch] = useReducer(userReducers, initialState);
  const {loading, moreLoading, data, isListEnd} = state;

  const chatApiClient = usePSChatApiClientContext();

  const forwardMessageStyles =
    usePSScreenStylesContext<PSForwardMessageStyles>();

  const cachedThreads = useQuery(
    PSThreadEntity,
    threads => {
      let result = threads.filtered(
        PSThreadEntity.filteredByLastMessageNotNullAndThreadNotDeleted(),
      );
      result = result.filtered(PSThreadEntity.filteredByFolderAll());
      return result.sorted(PSThreadEntity.sorted);
    },
    [],
  );

  const queryThreads = () => {
    dispatch(setApiRequest(1));
    dispatch(
      setApiSuccess(mapThreadsEntityToSearchThreadsUIModel([...cachedThreads])),
    );
  };

  const searchThreads = async () => {
    dispatch(setApiRequest(page));
    try {
      const searchThreadsResponse =
        await chatApiClient?.searchApi.searchConversations(
          keySearch,
          page,
          20,
          5,
        );
      const threadsDto = searchThreadsResponse?.data;

      if (threadsDto && threadsDto.length > 0) {
        dispatch(
          setApiSuccess(
            mapSearchThreadResponseDtoToSearchThreadUIModel(threadsDto),
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
  }, [debouncedValue, page]);

  const onForwardMessage = useCallback(
    async (targetThreadId: string, targetThreadType: PSThreadType) => {
      try {
        await chatApiClient?.messageApi.forwardMessages({
          src_thread_id: threadId,
          src_msg_ids: messageIds,
          target_id: targetThreadId,
          target_type: targetThreadType,
        });

        setThreadIdsForwarded([...threadIdsForwarded, targetThreadId]);
      } catch (error) {
        // PSFlashMessage.show({
        //   type: 'error',
        //   text1: translator('ps_error_forward_message'),
        //   position: 'bottom',
        //   visibilityTime: 2000,
        // });
        psLogger.error(`PSForwardMessage: onForwardMessage ${error}`);
      }
    },
    [chatApiClient, threadIdsForwarded, messageIds, threadId, translator],
  );

  const renderItemThread = useCallback(
    ({item, index}: {item: SearchThreadUIModel; index: number}) => {
      return (
        <ForwardThreadItem
          thread={item}
          index={index}
          forwarded={threadIdsForwarded.includes(item.id)}
          onForwardMessage={onForwardMessage}
          verified={item.verified}
        />
      );
    },
    [onForwardMessage, threadIdsForwarded],
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
        titleText={translator('ps_forward_message_header')}
        onBackPress={onBackPress}
      />
      <View
        style={[
          styles.container_content,
          {backgroundColor: colors.Primary.background},
        ]}>
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
        />
        {debouncedValue === '' && (
          <Text
            style={[
              {margin: (16).px(), color: colors.Primary.subText},
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
          />
        )}
      </View>
    </View>
  );
};

export const PSForwardMessage = ({
  threadId,
  messageIds,
  forwardMessageStyles,
  onBackPress,
}: PSForwardMessageProps) => {
  return (
    <PSForwardMessageProviders
      onBackPress={onBackPress}
      forwardMessageStyles={forwardMessageStyles}>
      <PSForwardMessageUI threadId={threadId} messageIds={messageIds} />
    </PSForwardMessageProviders>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container_content: {
    flex: 1,
    // padding: 16,
  },
  search: {marginHorizontal: (20).px(), marginVertical: (20).px()},
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
