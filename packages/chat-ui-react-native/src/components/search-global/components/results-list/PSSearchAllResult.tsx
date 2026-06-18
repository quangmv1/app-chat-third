import React from 'react';
import isEqual from 'react-fast-compare';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSIsDeskModeContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
  useQuery,
  useRealm,
} from '../../../../context';
import {PSSearchThreadStyles} from '../../PSSearchThreadStyles';
import {
  mapSearchMessageFromDtoToModel,
  mapSearchThreadResponseDtoToSearchThreadUIModel,
  mapThreadsEntityToSearchThreadsUIModel,
  PSFolderEntity,
  PSSearchMessageModel,
  PSSearchThreadRecentlyEntity,
  PSThreadEntity,
  PSThreadListPCLEntity,
  SearchThreadUIModel,
} from '../../../../types';
import {psLogger} from '../../../../utils';
import {PSSearchThreadItem} from '../SearchThreadItem';
import {
  usePSSearchThreadNavigationContext,
  useSetSearchThreadFilterFolderContext,
} from '../../contexts';
import {PSCommonEmptyState} from '../../../PSCommonEmptyState';
import {PSIcRight24} from '../../../../icons';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {TabSearchId} from '../tab';
import {SearchMessageItem} from './PSSearchMessageResult';
import {PSSearchMessageDto} from '@communi/chat-api-client-typescript';
import {PSSkeleton} from '../../../PSSkeleton';

export const PSSearchAllResult = React.memo(
  ({debouncedValue}: {debouncedValue: string}) => {
    const {translator} = usePSTranslationContext();
    const {colors, typography} = usePSDesignSystemContext();
    const searchThreadStyles = usePSScreenStylesContext<PSSearchThreadStyles>();
    const isDeskMode = usePSIsDeskModeContext()?.isDeskMode ?? false;

    const isVisibleSearchPCL =
      searchThreadStyles.isVisibleFilterSearchPCL ?? !isDeskMode;
    const isVisibleSearchSharedInbox =
      searchThreadStyles.isVisibleFilterSearchSharedInbox ?? isDeskMode;

    const [isEmptySearchChats, setIsEmptySearchChats] = React.useState(false);
    const [isEmptySearchPCL, setIsEmptySearchPCL] = React.useState(
      isVisibleSearchPCL ? false : true,
    );
    const [isEmptySearchSharedInbox, setIsEmptySearchSharedInbox] =
      React.useState(isVisibleSearchSharedInbox ? false : true);
    const [isEmptySearchMessageBlock, setIsEmptyEmptySearchMessageBlock] =
      React.useState(false);
    const [isEmptySearchGlobalChats, setIsEmptySearchGlobalChats] =
      React.useState(false);

    const isAllEmpty =
      isEmptySearchChats &&
      isEmptySearchPCL &&
      isEmptySearchSharedInbox &&
      isEmptySearchMessageBlock &&
      isEmptySearchGlobalChats;

    const {onThreadPress} = usePSSearchThreadNavigationContext();

    const [data, setData] = React.useState<SearchThreadUIModel[]>([]);

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

    const realm = useRealm();

    const targetCSTeams = React.useMemo(() => {
      return [
        ...PSThreadListPCLEntity.getAll(realm).filtered(
          PSThreadListPCLEntity.filteredByTypeString(PSFolderEntity.ALL),
        ),
      ];
    }, [realm]);

    const cachedThreadsRecently = useQuery(
      PSSearchThreadRecentlyEntity,
      threadsRecently => {
        return threadsRecently.sorted(PSSearchThreadRecentlyEntity.sorted);
      },
      [],
    );

    const queryThreads = () => {
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

        setData(
          // @ts-ignore
          mapThreadsEntityToSearchThreadsUIModel([...results], targetCSTeams),
        );
      }
    };

    React.useEffect(() => {
      if (debouncedValue === '') {
        queryThreads();
      } else {
        setIsEmptySearchChats(false);
        setIsEmptyEmptySearchMessageBlock(false);
        setIsEmptySearchPCL(isVisibleSearchPCL ? false : true);
        setIsEmptySearchSharedInbox(isVisibleSearchSharedInbox ? false : true);
      }
    }, [debouncedValue]);

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
        {debouncedValue === '' && (
          <FlatList
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: (12).px(),
              paddingVertical: (8).px(),
            }}
            data={data}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => renderItemThread({item, index})}
            ListEmptyComponent={
              <PSCommonEmptyState
                textStyle={[
                  {color: colors.Primary.subText},
                  typography.bodyXLargeR,
                ]}
              />
            }
            keyboardDismissMode={'on-drag'}
            keyboardShouldPersistTaps={'handled'}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={ActionDivier}
          />
        )}
        {debouncedValue !== '' &&
          (!isAllEmpty ? (
            <View style={{flex: 1}}>
              <ScrollView style={{flex: 1}}>
                <SearchThreadBlock
                  title={translator('ps_chats')}
                  keySearch={debouncedValue}
                  currentSearchThreadFilterAlias={TabSearchId.CHATS}
                  setIsEmpty={setIsEmptySearchChats}
                />
                {!isEmptySearchChats && (
                  <View
                    style={{
                      height: (4).px(),
                      backgroundColor: colors.Primary.background,
                    }}
                  />
                )}
                {isVisibleSearchPCL && (
                  <SearchThreadBlock
                    title={translator('ps_folder_pcl')}
                    keySearch={debouncedValue}
                    currentSearchThreadFilterAlias={PSFolderEntity.PCL}
                    setIsEmpty={setIsEmptySearchPCL}
                  />
                )}
                {!isEmptySearchPCL && (
                  <View
                    style={{
                      height: (4).px(),
                      backgroundColor: colors.Primary.background,
                    }}
                  />
                )}
                {isVisibleSearchSharedInbox && (
                  <SearchThreadBlock
                    title={translator('ps_folder_shared_inbox')}
                    keySearch={debouncedValue}
                    currentSearchThreadFilterAlias={PSFolderEntity.SHARED_INBOX}
                    setIsEmpty={setIsEmptySearchSharedInbox}
                  />
                )}
                {!isEmptySearchSharedInbox && (
                  <View
                    style={{
                      height: (4).px(),
                      backgroundColor: colors.Primary.background,
                    }}
                  />
                )}
                <SearchMessageBlock
                  title={translator('ps_messages')}
                  keySearch={debouncedValue}
                  currentSearchThreadFilterAlias={TabSearchId.MESSAGES}
                  setIsEmpty={setIsEmptyEmptySearchMessageBlock}
                />
                {!isEmptySearchMessageBlock && (
                  <View
                    style={{
                      height: (4).px(),
                      backgroundColor: colors.Primary.background,
                    }}
                  />
                )}
                <SearchThreadBlock
                  title={translator('ps_global')}
                  keySearch={debouncedValue}
                  currentSearchThreadFilterAlias={TabSearchId.GLOBAL}
                  setIsEmpty={setIsEmptySearchGlobalChats}
                />
              </ScrollView>
            </View>
          ) : (
            <PSCommonEmptyState
              textStyle={[
                {color: colors.Primary.subText},
                typography.bodyMediumR,
              ]}
            />
          ))}
      </>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const SearchThreadBlock = React.memo(
  ({
    title,
    keySearch,
    currentSearchThreadFilterAlias,
    setIsEmpty,
  }: {
    title: string;
    keySearch: string;
    currentSearchThreadFilterAlias: string;
    setIsEmpty: (value: boolean) => void;
  }) => {
    const {translator} = usePSTranslationContext();
    const {colors, typography} = usePSDesignSystemContext();
    const chatApiClient = usePSChatApiClientContext();
    const searchThreadStyles = usePSScreenStylesContext<PSSearchThreadStyles>();

    const setCurrentSearchThreadFilterAlias =
      useSetSearchThreadFilterFolderContext();

    const [loading, setLoading] = React.useState(false);

    const [data, setData] = React.useState<SearchThreadUIModel[]>([]);

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

    const searchThreads = async () => {
      if (!chatApiClient) {
        return;
      }
      setLoading(true);

      if (keySearch === '') {
        setIsEmpty(true);
        setData([]);
        setLoading(false);
        return;
      }
      try {
        const searchThreadsResponse =
          currentSearchThreadFilterAlias === PSFolderEntity.PUBLIC_GROUP
            ? await chatApiClient?.searchApi.searchConversations(
                keySearch,
                1,
                5,
              )
            : currentSearchThreadFilterAlias === PSFolderEntity.SHARED_INBOX
              ? await chatApiClient?.searchApi.searchConversations(
                  keySearch,
                  1,
                  5,
                  1,
                )
              : currentSearchThreadFilterAlias === PSFolderEntity.PCL
                ? await chatApiClient?.searchApi.searchConversations(
                    keySearch,
                    1,
                    5,
                    2,
                  )
                : currentSearchThreadFilterAlias === TabSearchId.GLOBAL
                  ? await chatApiClient?.searchApi.searchConversations(
                      keySearch,
                      1,
                      5,
                      8,
                    )
                  : await chatApiClient?.searchApi.searchConversations(
                      keySearch,
                      1,
                      5,
                      5,
                    );

        setLoading(false);
        const threadsDto = searchThreadsResponse?.data;
        if (threadsDto && threadsDto.length > 0) {
          const isHaveTargetName = threadsDto.find(
            threadDto =>
              threadDto.thread?.targets && threadDto.thread?.targets.length > 0,
          );
          const cSTeams = isHaveTargetName ? targetCSTeams : undefined;

          const dataSearchThread =
            mapSearchThreadResponseDtoToSearchThreadUIModel(
              threadsDto,
              cSTeams,
            );
          setIsEmpty(dataSearchThread.length === 0);
          setData(dataSearchThread);
        } else {
          setIsEmpty(true);
          setData([]);
        }
      } catch (error) {
        setIsEmpty(true);
        setData([]);
        setLoading(false);
        psLogger.error('SearchThreadBlock searchThreads ', error);
      }
    };

    React.useEffect(() => {
      searchThreads();
    }, [keySearch]);

    const {onThreadPress} = usePSSearchThreadNavigationContext();

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
            keySearch={keySearch}
          />
        );
      },
      [keySearch, handleOnPress],
    );

    if (loading) {
      //   return (
      //     <View style={styles.loading}>
      //       <ActivityIndicator size="large" />
      //     </View>
      //   );
      return (
        <View style={styles.loading}>
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <PSSkeleton key={index} />
            ))}
        </View>
      );
    }

    return !!data.length ? (
      <View style={styles.container_block}>
        <Text
          style={[{color: colors.Primary.mainText}, typography.bodyXLargeS]}>
          {title.toLocaleUpperCase()}
        </Text>

        <FlatList
          contentContainerStyle={
            {
              //   flexGrow: 1,
              //   paddingHorizontal: (12).px(),
              //   paddingVertical: (8).px(),
            }
          }
          data={data.slice(0, 3)}
          keyExtractor={item => `${currentSearchThreadFilterAlias}_${item.id}`}
          renderItem={({item, index}) => renderItemThread({item, index})}
          keyboardDismissMode={'on-drag'}
          keyboardShouldPersistTaps={'handled'}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ItemSeparatorComponent={ActionDivier}
        />

        {data.length > 3 && (
          <PSDebouncedPressable
            style={styles.container_more}
            onPress={() => {
              setCurrentSearchThreadFilterAlias(currentSearchThreadFilterAlias);
            }}>
            <Text
              style={[
                {
                  color: colors.Primary.branding,
                  marginEnd: (4).px(),
                },
                typography.bodyXXLargeS,
              ]}>
              {translator('ps_view_more')}
            </Text>

            <PSIcRight24
              width={(24).px()}
              height={(24).px()}
              fill={colors.Primary.branding}
            />
          </PSDebouncedPressable>
        )}
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const SearchMessageBlock = React.memo(
  ({
    title,
    keySearch,
    currentSearchThreadFilterAlias,
    setIsEmpty,
  }: {
    title: string;
    keySearch: string;
    currentSearchThreadFilterAlias: string;
    setIsEmpty: (value: boolean) => void;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();
    const {translator} = usePSTranslationContext();
    const chatApiClient = usePSChatApiClientContext();
    const onViewMessage = usePSSearchThreadNavigationContext().onViewMessage;
    const setCurrentSearchThreadFilterAlias =
      useSetSearchThreadFilterFolderContext();

    const [loading, setLoading] = React.useState(false);

    const [data, setData] = React.useState<PSSearchMessageModel[]>([]);

    const searchMessages = async () => {
      if (!chatApiClient) {
        return;
      }
      setLoading(true);

      if (keySearch === '') {
        setIsEmpty(true);
        setData([]);
        setLoading(false);
        return;
      }
      try {
        const searchMessagesInThreadResponse =
          await chatApiClient.searchApi.searchMessages(keySearch, 1, 8);

        setLoading(false);
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
          setData(
            searchMessagesDto.map(dto => mapSearchMessageFromDtoToModel(dto)),
          );
        } else {
          setIsEmpty(true);
          setData([]);
        }
      } catch (error) {
        setIsEmpty(true);
        setData([]);
        setLoading(false);
        psLogger.error('SearchThreadBlock searchThreads ', error);
      }
    };

    React.useEffect(() => {
      searchMessages();
    }, [keySearch]);

    const renderItem = React.useCallback(
      ({item, index}: {item: PSSearchMessageModel; index: number}) => {
        return (
          <SearchMessageItem
            item={item}
            index={index}
            onViewMessage={onViewMessage}
            keySearch={keySearch}
          />
        );
      },
      [onViewMessage, keySearch],
    );

    if (loading) {
      //   return (
      //     <View style={styles.loading}>
      //       <ActivityIndicator size="large" />
      //     </View>
      //   );
      return (
        <View style={styles.loading}>
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <PSSkeleton key={index} />
            ))}
        </View>
      );
    }

    return !!data.length ? (
      <View style={styles.container_block}>
        <Text
          style={[{color: colors.Primary.mainText}, typography.bodyXLargeS]}>
          {title.toLocaleUpperCase()}
        </Text>

        <FlatList
          contentContainerStyle={
            {
              //   flexGrow: 1,
              //   paddingHorizontal: (12).px(),
              //   paddingVertical: (8).px(),
            }
          }
          data={data.slice(0, 5)}
          keyExtractor={item =>
            `${currentSearchThreadFilterAlias}_${item.threadId}_${item.id}`
          }
          renderItem={({item, index}) => renderItem({item, index})}
          keyboardDismissMode={'on-drag'}
          keyboardShouldPersistTaps={'handled'}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ItemSeparatorComponent={ActionDivier}
        />

        {data.length > 5 && (
          <PSDebouncedPressable
            style={styles.container_more}
            onPress={() => {
              setCurrentSearchThreadFilterAlias(currentSearchThreadFilterAlias);
            }}>
            <Text
              style={[
                {
                  color: colors.Primary.branding,
                  marginEnd: (4).px(),
                },
                typography.bodyXXLargeS,
              ]}>
              {translator('ps_view_more')}
            </Text>

            <PSIcRight24
              width={(24).px()}
              height={(24).px()}
              fill={colors.Primary.branding}
            />
          </PSDebouncedPressable>
        )}
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

export const ActionDivier = () => {
  const colors = usePSDesignSystemContext().colors;
  return (
    <View style={[styles.divider, {backgroundColor: colors.Primary.linerBorder}]} />
  );
};

const styles = StyleSheet.create({
  container_block: {
    padding: (12).px(),
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container_more: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: (4).px(),
  },
  divider: {
    backgroundColor: '#dcdcdc',
    height: (0.7).px(),
    // marginVertical: (5).px(),
    marginStart: (52).px(),
  },
});
