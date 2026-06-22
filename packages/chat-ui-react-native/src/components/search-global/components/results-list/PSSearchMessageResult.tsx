import React, {useCallback, useEffect, useReducer, useState} from 'react';
import isEqual from 'react-fast-compare';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Text,
} from 'react-native';
import {
  initialState,
  setApiFail,
  setApiRequest,
  setApiSuccess,
  setListEnd,
  userReducers,
} from '../../../../hooks';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
} from '../../../../context';
import {
  mapSearchMessageFromDtoToModel,
  PSSearchMessageModel,
} from '../../../../types';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {PSAvatarImage} from '../../../PSAvatarImage';
import {PSIcVerified} from '../../../../icons';
import {processTextWithMentionFromBackEnd} from '../../../PSRichText';
import {usePSSearchThreadNavigationContext} from '../../contexts';
import moment from 'moment';
import {PSSearchMessageDto} from '@communi/chat-api-client-typescript';
import {psLogger} from '../../../../utils';
import {PSCommonEmptyState} from '../../../PSCommonEmptyState';
import {PSSkeleton} from '../../../PSSkeleton';

export const PSSearchMessageResult = React.memo(
  ({debouncedValue}: {debouncedValue: string}) => {
    const {colors, typography} = usePSDesignSystemContext();
    const onViewMessage = usePSSearchThreadNavigationContext().onViewMessage;
    const [page, setPage] = useState(1);
    const [state, dispatch] = useReducer(userReducers, initialState);
    const {loading, moreLoading, data, isListEnd} = state;
    const chatApiClient = usePSChatApiClientContext();

    const searchMessages = async () => {
      if (!chatApiClient) {
        return;
      }
      dispatch(setApiRequest(page));

      if (debouncedValue === '') {
        dispatch(setApiSuccess([]));
        dispatch(setListEnd());
        return;
      }
      try {
        const searchMessagesInThreadResponse =
          await chatApiClient.searchApi.searchMessages(
            debouncedValue,
            page,
            20,
          );

        const searchMessagesDto =
          searchMessagesInThreadResponse.data?.items?.map(item => {
            return {
              ...item,
              sender:
                searchMessagesInThreadResponse.data?.users?.[item.user_id],
              thread:
                searchMessagesInThreadResponse.data?.threads?.[item.thread_id],
            } as PSSearchMessageDto;
          });

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
        psLogger.error('PSSearchMessageResult searchMessages ', error);
      }
    };

    useEffect(() => {
      setPage(1);
    }, [debouncedValue]);

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
            keySearch={debouncedValue}
          />
        );
      },
      [onViewMessage, debouncedValue],
    );

    const fetchMoreData = () => {
      if (!isListEnd && !moreLoading) {
        setPage(page + 1);
      }
    };

    return (
      <>
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
            keyExtractor={item => `${item.threadId}_${item.id}`}
            renderItem={({item, index}) => renderItem({item, index})}
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
            ItemSeparatorComponent={ActionDivier}
          />
        )}
      </>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const ActionDivier = () => {
  return <View style={styles.divider} />;
};

export const SearchMessageItem = React.memo(
  ({
    item,
    keySearch,
    onViewMessage,
  }: {
    item: PSSearchMessageModel;
    index: number;
    keySearch: string;
    onViewMessage?: null | ((threadId: string, messageId: number) => void);
  }) => {
    const {colors, typography} = usePSDesignSystemContext();

    const createAt = React.useMemo(() => {
      return moment(item.createAt).format('DD/MM [at] HH:mm');
    }, [item.createAt]);

    const onPress = () => {
      onViewMessage?.(item.threadId, item.id);
    };

    const avatar = React.useMemo(() => {
      if (item.thread) {
        return item.thread.avatar;
      }
      return item.sender?.avatar;
    }, [item.sender?.avatar, item.thread]);

    const name = React.useMemo(() => {
      if (item.thread?.name) {
        return item.thread.name;
      }
      return item.sender?.name;
    }, [item.sender?.name, item.thread?.name]);

    return (
      <PSDebouncedPressable
        style={styles.containerSearchMessageItem}
        onPress={onPress}>
        <PSAvatarImage url={avatar} displayName={name} size={(42).px()} />

        <View style={styles.contentSearchMessageItem}>
          <View style={styles.container_info}>
            <View style={styles.titleSearchMessageItem}>
              <Text
                style={[
                  {color: colors.Primary.mainText},
                  typography.bodyXXLargeS,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {name?.workAroundTextOneLineContainsNewLineIOS()}
              </Text>
              {/* {item.sender?.verified ? (
                <PSIcVerified style={{marginLeft: (4).px()}} />
              ) : null} */}
            </View>
            <Text style={[{color: colors.Neutral.n500}, typography.bodyMediumR]}>
              {createAt}
            </Text>
          </View>

          {item.thread && (
            <View style={styles.container_sender}>
              <PSAvatarImage
                url={item.sender?.avatar}
                displayName={item.sender?.name}
                size={(20).px()}
              />
              <Text
                style={[
                  {marginStart: (4).px(), color: colors.Primary.subText},
                  typography.bodyMediumR,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.sender?.name}
              </Text>
            </View>
          )}

          {/* <Text
            style={[
              styles.desSearchMessageItem,
              {color: colors.Neutral.n500},
              typography.bodyXLargeR,
            ]}
            numberOfLines={3}
            ellipsizeMode="tail">
            {processTextWithMentionFromBackEnd(item.text, [item.text]).text}
          </Text> */}
          <HighlightedMessage
            message={
              processTextWithMentionFromBackEnd(item.text, [item.text]).text
            }
            searchKeyword={keySearch}
          />
        </View>
      </PSDebouncedPressable>
    );
  },
);

const HighlightedMessage = ({
  message,
  searchKeyword,
}: {
  message: string;
  searchKeyword: string;
}) => {
  const {colors, typography} = usePSDesignSystemContext();
  if (!searchKeyword) {
    return (
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[{color: colors.Primary.subText}, typography.bodyXLargeR]}>
        {message}
      </Text>
    );
  }

  const normalizedMessage = message.removeDiacritics().toLowerCase();
  const normalizedKeyword = searchKeyword
    .removeDiacritics()
    .toLowerCase()
    .trim();

  // Tìm tất cả các vị trí xuất hiện của từ khóa
  const indices: number[] = [];
  let startIndex = 0;
  while (true) {
    const index = normalizedMessage.indexOf(normalizedKeyword, startIndex);
    if (index === -1) break;
    indices.push(index);
    startIndex = index + normalizedKeyword.length;
  }

  // Nếu không tìm thấy từ khóa, hiển thị message bình thường
  if (indices.length === 0) {
    return (
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[{color: colors.Primary.subText}, typography.bodyXLargeR]}>
        {message}
      </Text>
    );
  }

  // Tạo mảng các phần của message
  const parts: {text: string; highlight: boolean}[] = [];
  let lastIndex = 0;
  indices.forEach(index => {
    if (index > lastIndex) {
      parts.push({text: message.slice(lastIndex, index), highlight: false});
    }
    parts.push({
      text: message.slice(index, index + searchKeyword.length),
      highlight: true,
    });
    lastIndex = index + searchKeyword.length;
  });
  if (lastIndex < message.length) {
    parts.push({text: message.slice(lastIndex), highlight: false});
  }

  // Kiểm tra và xử lý phần đầu không được highlight
  let displayParts: {text: string; highlight: boolean}[] = [];
  if (parts && parts.length > 0) {
    let hasUnhighlightedPartFirst = parts[0]!.highlight;
    const firstTrueIndex = parts.findIndex(part => part.highlight);

    if (hasUnhighlightedPartFirst) {
      displayParts = parts;
    } else {
      const firstPartsSplit = parts[0]!.text.trim().split(/\s+/);
      if (firstPartsSplit.length < 3) {
        displayParts = parts;
      } else {
        displayParts = [
          {
            text: `${firstPartsSplit.slice(0, 3).join(' ')}... `,
            highlight: false,
          },
          ...parts.slice(firstTrueIndex),
        ];
      }
    }
  }

  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={[{color: colors.Primary.mainText}, typography.bodyXLargeR]}>
      {displayParts.map((part, index) => (
        <Text
          key={index}
          style={
            part.highlight ? {backgroundColor: colors.Branding.b50} : undefined
          }>
          {part.text}
        </Text>
      ))}
    </Text>
  );
};

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
    // justifyContent: 'center',
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
    // marginVertical: (5).px(),
    marginStart: (42).px(),
  },
  containerSearchMessageItem: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: (12).px(),
    // paddingHorizontal: (12).px(),
  },
  contentSearchMessageItem: {
    marginLeft: (12).px(),
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  container_info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: (2).px(),
  },
  titleSearchMessageItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  desSearchMessageItem: {
    flex: 1,
  },
  container_sender: {flexDirection: 'row', marginBottom: (2).px()},
});
