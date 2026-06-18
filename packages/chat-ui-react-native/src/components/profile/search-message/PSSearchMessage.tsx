import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
import {useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Text,
  Pressable,
} from 'react-native';
import {
  PSScreenStylesProvider,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {useDebounce} from '../../../hooks';
import {
  userReducers,
  initialState,
  setApiRequest,
  setApiSuccess,
  setListEnd,
  setApiFail,
} from '../../../hooks';
import {PSSearchMessageModel} from '../../../types';
import {PSSearchMessageDto} from '@communi/chat-api-client-typescript';
import {mapSearchMessageFromDtoToModel} from '../../../types';
import {psLogger} from '../../../utils';
import {PSSearchMessageStyles} from './PSSearchMessageStyles';
import {
  PSSearchMessageNavigationProvider,
  usePSSearchMessageNavigationContext,
} from '../contexts';
import moment from 'moment';
import {PSActionBar} from '../../PSActionBar';
import {PSSearch} from '../../PSSearch';
import {PSAvatarImage} from '../../PSAvatarImage';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';
import {processTextWithMentionFromBackEnd} from '../../PSRichText';
import {PSIcVerified} from '../../../icons';

type PSSearchMessageProps = {
  threadId: string;
  searchMessageStyles?: PSSearchMessageStyles;
  onBackPress?: null | (() => void);
  onViewMessage?: null | ((messageId: number) => void);
};

const PSSearchMessageProviders = ({
  searchMessageStyles,
  onBackPress,
  onViewMessage,
  children,
}: PropsWithChildren<{
  searchMessageStyles?: PSSearchMessageStyles;
  onBackPress?: null | (() => void);
  onViewMessage?: null | ((messageId: number) => void);
}>) => {
  return (
    <PSSearchMessageNavigationProvider
      onBackPress={onBackPress}
      onViewMessage={onViewMessage}>
      <PSScreenStylesProvider styles={searchMessageStyles}>
        {children}
      </PSScreenStylesProvider>
    </PSSearchMessageNavigationProvider>
  );
};

const PSSearchMessageUI = ({threadId}: {threadId: string}) => {
  const {onBackPress, onViewMessage} = usePSSearchMessageNavigationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const {translator} = usePSTranslationContext();
  const [keySearch, setKeySearch] = useState('');
  const debouncedValue = useDebounce<string>(keySearch, 500);
  const [page, setPage] = useState(1);
  const [state, dispatch] = useReducer(userReducers, initialState);
  const {loading, moreLoading, data, isListEnd} = state;
  const chatApiClient = usePSChatApiClientContext();

  const searchMessages = async () => {
    if (!chatApiClient) {
      return;
    }
    dispatch(setApiRequest(page));

    if (keySearch === '') {
      dispatch(setApiSuccess([]));
      dispatch(setListEnd());
      return;
    }
    try {
      const searchMessagesInThreadResponse =
        await chatApiClient.searchApi.searchMessages(
          keySearch,
          page,
          20,
          threadId,
        );

      const searchMessagesDto = searchMessagesInThreadResponse.data?.items?.map(
        item => {
          return {
            ...item,
            sender: searchMessagesInThreadResponse.data?.users?.[item.user_id],
          } as PSSearchMessageDto;
        },
      );

      if (searchMessagesDto && searchMessagesDto.length > 0) {
        dispatch(
          setApiSuccess(
            searchMessagesDto.map(dto => mapSearchMessageFromDtoToModel(dto)),
          ),
        );
        if (searchMessagesInThreadResponse?.links?.total_pages === page) {
          dispatch(setListEnd());
        }
      } else {
        dispatch(setListEnd());
      }
    } catch (error) {
      dispatch(setApiFail());
      psLogger.error('PSSearchMessage searchMessages ', error);
    }
  };

  useEffect(() => {
    searchMessages();
  }, [debouncedValue, page]);

  const renderFooter = () => (
    <View style={styles.footerText}>
      {moreLoading && <ActivityIndicator />}
      {/* {isListEnd && <Text>No more . Het rooi !!!</Text>} */}
    </View>
  );

  const renderItem = useCallback(
    ({item, index}: {item: PSSearchMessageModel; index: number}) => {
      return (
        <SearchMessageItem
          item={item}
          index={index}
          onViewMessage={onViewMessage}
        />
      );
    },
    [onViewMessage],
  );

  const fetchMoreData = () => {
    if (!isListEnd && !moreLoading) {
      setPage(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <PSActionBar
        titleText={translator('ps_thread_profile_search_message')}
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
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => renderItem({item, index})}
            ListFooterComponent={renderFooter}
            // ListEmptyComponent={
            //   <PSCommonEmptyState
            //     textStyle={[{color: colors.Primary.subText}, typography.bodyMediumR]}
            //   />
            // }
            keyboardDismissMode={'on-drag'}
            keyboardShouldPersistTaps={'handled'}
            onEndReachedThreshold={0.2}
            onEndReached={fetchMoreData}
            ItemSeparatorComponent={ActionDivier}
          />
        )}
      </View>
    </View>
  );
};

export const PSSearchMessage = ({
  threadId,
  searchMessageStyles,
  onBackPress,
  onViewMessage,
}: PSSearchMessageProps) => {
  return (
    <PSSearchMessageProviders
      searchMessageStyles={searchMessageStyles}
      onBackPress={onBackPress}
      onViewMessage={onViewMessage}>
      <PSSearchMessageUI threadId={threadId} />
    </PSSearchMessageProviders>
  );
};

const ActionDivier = () => {
  return <View style={styles.divider} />;
};

const SearchMessageItem = React.memo(
  ({
    item,
    onViewMessage,
  }: {
    item: PSSearchMessageModel;
    index: number;
    onViewMessage?: null | ((messageId: number) => void);
  }) => {
    const {colors, typography} = usePSDesignSystemContext();

    const createAt = React.useMemo(() => {
      return moment(item.createAt).format('DD/MM [at] HH:mm');
    }, [item.createAt]);

    const onPress = () => {
      onViewMessage?.(item.id);
    };

    return (
      <PSDebouncedPressable
        style={styles.containerSearchMessageItem}
        onPress={onPress}>
        <PSAvatarImage
          url={item.sender?.avatar}
          displayName={item.sender?.name}
          size={(42).px()}
        />

        <View style={styles.contentSearchMessageItem}>
          <View style={styles.container_info}>
            <View style={styles.titleSearchMessageItem}>
              <Text
                style={[{color: colors.Primary.subText}, typography.headingMediumS]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.sender?.name?.workAroundTextOneLineContainsNewLineIOS()}
              </Text>
              {item.sender?.verified ? (
                <PSIcVerified style={{marginLeft: (4).px()}} />
              ) : null}
            </View>
            <Text style={[{color: colors.Neutral.n500}, typography.bodyMediumR]}>
              {createAt}
            </Text>
          </View>

          <Text
            style={[
              styles.desSearchMessageItem,
              {color: colors.Neutral.n500},
              typography.bodyXLargeR,
            ]}
            numberOfLines={3}
            ellipsizeMode="tail">
            {processTextWithMentionFromBackEnd(item.text, [item.text]).text}
          </Text>
        </View>
      </PSDebouncedPressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container_content: {
    flex: 1,
    // paddingHorizontal: (16).px(),
  },
  search: {marginHorizontal: (20).px(), marginVertical: (16).px()},
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: (10).px(),
  },
  emptyText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    backgroundColor: '#dcdcdc',
    height: (0.7).px(),
    marginVertical: (5).px(),
  },
  containerSearchMessageItem: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: (6).px(),
    paddingHorizontal: (12).px(),
  },
  contentSearchMessageItem: {
    marginLeft: (12).px(),
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  container_info: {flexDirection: 'row'},
  titleSearchMessageItem: {
    flex: 1,
    flexDirection: 'row',
  },
  desSearchMessageItem: {
    flex: 1,
  },
});
