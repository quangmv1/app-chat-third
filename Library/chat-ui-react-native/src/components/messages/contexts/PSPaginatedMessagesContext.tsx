import React, {PropsWithChildren} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
  // FlatList,
  ViewToken,
  ViewabilityConfigCallbackPairs,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {
  usePSChatApiClientContext,
  usePSIsDeskModeContext,
  usePSMqttClientConnectedContext,
  usePSMqttMessagesScreenTrackingContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
  useQuery,
  useRealm,
} from '../../../context';
import {
  DONT_HAVE_PERMISSION_CALL_API,
  PSBusEvent,
  PSEventBus,
  USER_ID_INVALID,
  findMissingNumbersAscending,
  findMissingNumbersDescending,
  psLogger,
} from '../../../utils';
import {
  PSMessageEntity,
  PSMessageModel,
  mapMessagesEntityToModel,
  PSThreadEntity,
  PSUserModel,
  PSUserEntity,
  PSMessageSeenUsersEntity,
  PSDeviceEntity,
} from '../../../types';
import {useSetPSHighlightMessageAfterScroll} from './PSHighlightMessageAfterScrollContext';
import {
  PSDeleteMessageLevel,
  PSMessageDto,
  PSResponseError,
  PSUserDto,
  PS_FETCH_USER_BY_IDS_MAX,
} from '@communi/chat-api-client-typescript';
import {
  usePSMessageCurrentThreadContext,
  usePSMessageCurrentThreadIdContext,
} from './PSMessageCurrentThreadContext';
import isEqual from 'react-fast-compare';
import {usePSMessageNavigationContext} from './PSMessageNavigationContext';
import {usePSMessageSeenUserContext} from './PSMessageSeenUserContext';
import {useDeepCompareMemoize, useIsMountedRef} from '../../../hooks';
import {PSFlashMessage} from '../../flash-message';

export const PAGING_SIZE = 30;

const SCROLL_TIME_OUT = 150;

export const VIEW_AREA_COVERAGE_PERCENT_THRESHOLD = 80;

type RealmPaging = {
  from: number;
  to: number;
};

type PSPaginatedMessagesContextValue = {
  isFirstFetching: boolean;
  messages: PSMessageModel[];
  onScrollBeginDrag: () => void;
  onMomentumScrollEnd: () => void;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  flatListRef: React.RefObject<FlatList>;
  onScrollToIndexFailedRef: React.RefObject<
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => void
  >;
  viewabilityConfigCallbackPairsRef: React.RefObject<ViewabilityConfigCallbackPairs>;
};

const PSPaginatedMessagesContext = React.createContext(
  {} as PSPaginatedMessagesContextValue,
);

type PSPaginatedMessagesFetchingContextValue = {
  isStartReachedFetching: boolean;
  isEndReachedFetching: boolean;
};

const PSPaginatedMessagesFetchingContext = React.createContext(
  {} as PSPaginatedMessagesFetchingContextValue,
);

const PSPaginatedMessagesAutoScrollToTopContext = React.createContext<
  boolean | undefined
>(undefined);

type PSScrollToMessageContextValue = {
  isScrolling: boolean;
  scrollToMessage: (messageId: number, highlight: boolean) => void;
  scrollToLastMessage: () => void;
};

const PSScrollToMessageContext =
  React.createContext<PSScrollToMessageContextValue>(
    {} as PSScrollToMessageContextValue,
  );

export const PSPaginatedMessagesProvider = ({
  children,
  targetThreadId,
  targetUserId,
  targetMessageId,
}: PropsWithChildren<{
  targetThreadId?: string;
  targetUserId?: string;
  targetMessageId?: number;
}>) => {
  const {isDeskMode} = usePSIsDeskModeContext();

  const isMounted = useIsMountedRef();

  const flatListRef = React.useRef<FlatList>(null);

  const {onBackPress, onCompleteLeaveThread} = usePSMessageNavigationContext();
  const {enterMessagesScreen, exitMessagesScreen} =
    usePSMqttMessagesScreenTrackingContext();

  const chatApiClient = usePSChatApiClientContext();

  const {translator} = usePSTranslationContext();

  const isMqttConnected = usePSMqttClientConnectedContext();

  const [isFirstFetching, setFirstFetching] = React.useState(true);

  const realm = useRealm();

  const currentThread = usePSMessageCurrentThreadContext();
  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const setHighlightMessageAfterScroll = useSetPSHighlightMessageAfterScroll();

  const prevNewMessageIdScrolledRef = React.useRef<number>(-1);

  const messageIdToScrollToRef = React.useRef<number | undefined>(undefined);

  const messageIdToHighlightAfterScrollToRef = React.useRef<
    number | undefined
  >();

  const firstUnreadMessageIdRef = React.useRef<number | undefined>();

  const scrollToDebounceTimeoutRef = React.useRef<NodeJS.Timeout>();

  const onStartReachedTracker = React.useRef<Record<number, boolean>>({});
  const onEndReachedTracker = React.useRef<Record<number, boolean>>({});

  const onStartReachedFetchingRef = React.useRef(false);
  const onEndReachedFetchingRef = React.useRef(false);

  const [isStartReachedFetching, setStartReachedFetching] =
    React.useState(false);
  const [isEndReachedFetching, setEndReachedFetching] = React.useState(false);

  const onStartReachedInPromiseRef = React.useRef<Promise<void> | null>(null);
  const onEndReachedInPromiseRef = React.useRef<Promise<void> | null>(null);

  const resetPaginationTrackersRef = React.useRef(() => {
    onStartReachedTracker.current = {};
    onEndReachedTracker.current = {};
  });

  const [isScrollingToTargetMessage, setScrollingToTargetMessage] =
    React.useState(false);

  const [autoScrollToTop, setAutoScrollToTop] = React.useState<
    boolean | undefined
  >();

  const scrollByUserRef = React.useRef(false);

  const [realmPaging, setRealmPaging] = React.useState<RealmPaging>({
    from: -1,
    to: -1,
  });

  const messagesByThread = useQuery(
    PSMessageEntity,
    result =>
      result
        .filtered(
          PSMessageEntity.filteredByThreadId(
            currentThreadId ?? PSThreadEntity.THREAD_ID_NOT_FOUND,
          ),
        )
        .sorted(PSMessageEntity.sorted),
    [currentThreadId],
  );

  const {messageSeenUsers, markSeen} = usePSMessageSeenUserContext();

  const pagingatedMessagesRef = React.useRef<PSMessageModel[]>([]);

  const pagingatedMessages = React.useMemo(() => {
    if (!chatApiClient || !currentThread) {
      return [];
    }
    psLogger.error(
      `PSPaginatedMessagesProvider: pagingatedMessages = ${JSON.stringify(
        realmPaging,
      )}`,
    );
    const {from, to} = realmPaging;
    if (!messagesByThread.length || from === -1 || to === -1) {
      return [];
    }

    const time = new Date().getTime();

    let indexOfFrom = messagesByThread.findIndex(item => item.id === from);
    psLogger.error(
      `PSPaginatedMessagesProvider: indexOfFrom = ${indexOfFrom}, from = ${from}`,
    );
    if (indexOfFrom === -1) {
      // bỏ qua để tránh case lấy pinned messages
      return pagingatedMessagesRef.current;
    }

    let indexOfTo = messagesByThread.findIndex(item => item.id === to);
    psLogger.error(
      `PSPaginatedMessagesProvider: indexOfTo = ${indexOfTo}, to = ${to}`,
    );
    if (indexOfTo === -1) {
      // bỏ qua để tránh case lấy pinned messages
      return pagingatedMessagesRef.current;
    } else {
      indexOfTo += 1;
    }
    psLogger.error(
      `PSPaginatedMessagesProvider: indexOfFrom = ${indexOfFrom}, indexOfTo = ${indexOfTo}, messageIds = ${JSON.stringify(
        messagesByThread.slice(indexOfFrom, indexOfTo).map(item => item.id),
      )}`,
    );
    const messages = mapMessagesEntityToModel(
      chatApiClient.userId,
      [...messagesByThread.slice(indexOfFrom, indexOfTo)],
      messageSeenUsers,
      firstUnreadMessageIdRef.current,
      currentThread.type,
    );
    pagingatedMessagesRef.current = messages;
    psLogger.error(
      `mapMessagesEntityToModel: time = ${new Date().getTime() - time}ms`,
    );
    // psLogger.error(`messages = ${JSON.stringify(messages)}`);
    return messages;
  }, [
    chatApiClient,
    useDeepCompareMemoize(realmPaging),
    messagesByThread,
    useDeepCompareMemoize(messageSeenUsers),
    currentThread?.type,
  ]);

  const lastMessageIdRef = React.useRef<number | undefined>();

  const onScrollToIndexFailedRef = React.useRef(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          animated: false,
          offset: info.averageItemLength * info.index,
        });
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({
              animated: false,
              index: info.index,
              viewPosition: 0.5,
            });
          } catch (error) {
            psLogger.error(
              'PSPaginatedMessagesProvider: onScrollToIndexFailedRef scrollToIndex',
              error,
            );
          }
        }, SCROLL_TIME_OUT);
      }
    },
  );

  const viewabilityConfigCallbackPairsRef = React.useRef([
    {
      viewabilityConfig: {
        viewAreaCoveragePercentThreshold: VIEW_AREA_COVERAGE_PERCENT_THRESHOLD,
      },
      onViewableItemsChanged: ({
        viewableItems,
      }: {
        viewableItems: ViewToken[];
      }) => {
        if (viewableItems.length) {
          const lastMessageId = lastMessageIdRef.current;
          const lastMessageIdOnUI = viewableItems[0]?.item?.id;
          if (
            lastMessageId &&
            lastMessageIdOnUI &&
            lastMessageIdOnUI < lastMessageId - 1
          ) {
            setAutoScrollToTop(false);
          } else {
            setAutoScrollToTop(true);
          }
          const message = viewableItems
            .filter(item => item.isViewable && item.item.status === 'sent')
            .map(item => item.item)[0];
          if (message) {
            PSEventBus.getInstance().dispatch(PSBusEvent.SEEN_MESSAGE, {
              threadId: message.threadId,
              messageId: message.id,
            });
          }
        }
      },
    },
  ]);

  const fetchUserByIds = React.useCallback(
    async (userIds: string[]) => {
      if (!userIds.length || !chatApiClient) {
        return;
      }
      try {
        // api fetchUserByIds chỉ lấy đc max = PS_FETCH_USER_BY_IDS_MAX
        const userIdsArray: string[][] = [];
        const length =
          Math.floor(userIds.length / PS_FETCH_USER_BY_IDS_MAX) +
          (userIds.length % PS_FETCH_USER_BY_IDS_MAX === 0 ? 0 : 1);

        for (let i = 0; i < length; i++) {
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
        }
      } catch (error) {
        psLogger.error('PSPaginatedMessagesProvider: fetchUserByIds', error);
      }
    },
    [chatApiClient, realm],
  );

  const fetchMessages = React.useCallback(
    async (threadId: string, {from, to}: RealmPaging) => {
      if (!chatApiClient) {
        return;
      }
      const nextLimit =
        from === 1 && to === 1 ? 1 : to > from ? to - from : undefined;
      const prevLimit =
        from === 1 && to === 1 ? 1 : from > to ? from - to : undefined;
      if (!nextLimit && !prevLimit) {
        return;
      }
      let remoteMessages: PSMessageDto[] | undefined;
      try {
        const response = await chatApiClient.messageApi.fetchMessages(
          threadId,
          from,
          nextLimit,
          prevLimit,
        );

        let missingIds: number[] = [];

        // xử lý trường hợp fetchMessages trả về thiếu messages
        if (
          response.data &&
          response.data.length &&
          response.data.length <= (prevLimit ?? nextLimit)!
        ) {
          if (nextLimit) {
            missingIds = findMissingNumbersAscending(
              response.data.map(item => item.id),
              (prevLimit ?? nextLimit)! + 1,
            );
          } else if (prevLimit) {
            missingIds = findMissingNumbersDescending(
              response.data.map(item => item.id),
              (prevLimit ?? nextLimit)! + 1,
            );
          }

          psLogger.error(
            'PSPaginatedMessagesProvider: missingIds ',
            JSON.stringify(missingIds),
          );
        }

        if (response.data && response.data.length) {
          const deviceId = PSDeviceEntity.get(realm);
          remoteMessages = [
            ...response.data,
            ...missingIds.map(id => {
              const requestId = PSMessageEntity.createRequestId(deviceId);
              return {
                ...response.data![0]!,
                request_id: requestId,
                id: id,
                delete_level: PSDeleteMessageLevel.DELETE_THREAD,
              };
            }),
          ];
        }
      } catch (e) {
        psLogger.error('PSPaginatedMessagesProvider: fetchMessages ', e);
        throw e;
      }
      const time = new Date().getTime();
      if (remoteMessages && remoteMessages.length) {
        const seenUsers = remoteMessages
          .filter(item => item.viewed_user_ids && item.viewed_user_ids.length)
          .map(item => {
            return {
              messageId: item.id,
              users: item.viewed_user_ids!.map(
                userId => ({extUserId: userId}) as PSUserModel,
              ),
            };
          });
        try {
          const cachedMessageSeenUsers = PSMessageSeenUsersEntity.getByThreadId(
            realm,
            threadId,
          );
          const deviceId = PSDeviceEntity.get(realm);
          const userIds = realm.write(() => {
            remoteMessages!.forEach(item => {
              try {
                PSMessageEntity.createOrUpdate(
                  realm,
                  PSMessageEntity.mapFromDto(
                    deviceId,
                    chatApiClient.userId,
                    threadId,
                    item,
                  )!,
                );
              } catch (error) {
                psLogger.error(
                  `PSPaginatedMessagesProvider.saveMessages: message = ${JSON.stringify(
                    item,
                  )}`,
                  error,
                );
              }
            });
            return PSMessageSeenUsersEntity.markSeen(
              realm,
              threadId,
              // @ts-ignore
              cachedMessageSeenUsers,
              seenUsers,
            );
          });
          fetchUserByIds(userIds);
        } catch (error) {
          psLogger.error('PSPaginatedMessagesProvider: saveMessages', error);
          throw error;
        }
      }
      psLogger.error(
        `PSPaginatedMessagesProvider: time = ${new Date().getTime() - time}ms`,
      );
    },
    [chatApiClient, realm, fetchUserByIds],
  );

  const maybeCallOnStartReached = React.useCallback(async () => {
    const threadId = currentThreadId;
    const lastMessageId = lastMessageIdRef.current;
    if (
      !threadId ||
      !lastMessageId ||
      onStartReachedFetchingRef.current ||
      !pagingatedMessagesRef.current.length ||
      onStartReachedTracker.current[pagingatedMessagesRef.current.length]
    ) {
      return;
    }

    // lưu lại giá trị length hiện tại để lần cuộn tới xem có còn messages nữa hay không
    onStartReachedTracker.current[pagingatedMessagesRef.current.length] = true;

    const nextLocalPage = {
      from: Math.min(lastMessageId, realmPaging.from + PAGING_SIZE),
      to: realmPaging.to,
    };

    psLogger.error(
      `PSPaginatedMessagesProvider: maybeCallOnStartReached.page = ${JSON.stringify(
        nextLocalPage,
      )}`,
    );

    if (isEqual(realmPaging, nextLocalPage)) {
      return;
    }

    onStartReachedFetchingRef.current = true;
    setStartReachedFetching(true);

    const endReachedPromise = onEndReachedInPromiseRef.current;

    if (endReachedPromise) {
      await endReachedPromise;
    }

    setRealmPaging(nextLocalPage);

    // vì phải giữ local paging nên local.from != remote.from
    onStartReachedInPromiseRef.current = fetchMessages(threadId, {
      from: nextLocalPage.from,
      to: realmPaging.from,
    })
      .then(() => {
        return new Promise<void>(resolve => {
          setStartReachedFetching(false);
          onStartReachedFetchingRef.current = false;
          onStartReachedInPromiseRef.current = null;
          resolve();
        });
      })
      .catch(() => {
        setTimeout(() => {
          setStartReachedFetching(false);
          onStartReachedFetchingRef.current = false;
          onStartReachedTracker.current = {};
        }, 1000);
      });
  }, [useDeepCompareMemoize(realmPaging), fetchMessages, currentThreadId]);

  const maybeCallOnEndReached = React.useCallback(async () => {
    const threadId = currentThreadId;
    const lastMessageId = lastMessageIdRef.current;
    if (
      !threadId ||
      !lastMessageId ||
      onEndReachedFetchingRef.current ||
      !pagingatedMessagesRef.current.length ||
      onEndReachedTracker.current[pagingatedMessagesRef.current.length]
    ) {
      return;
    }

    onEndReachedTracker.current[pagingatedMessagesRef.current.length] = true;

    const prevLocalPage = {
      from: realmPaging.from,
      to: Math.max(
        PSMessageEntity.FIRST_MESSAGE_ID,
        realmPaging.to - PAGING_SIZE,
      ),
    };

    psLogger.error(
      `PSPaginatedMessagesProvider: maybeCallOnEndReached => prevLocalPage= ${JSON.stringify(
        prevLocalPage,
      )}`,
    );

    if (isEqual(realmPaging, prevLocalPage)) {
      return;
    }

    setEndReachedFetching(true);
    onEndReachedFetchingRef.current = true;

    const startReachedPromise = onStartReachedInPromiseRef.current;

    if (startReachedPromise) {
      await startReachedPromise;
    }

    setRealmPaging(prevLocalPage);

    // vì phải giữ local paging nên local.from != remote.from
    onEndReachedInPromiseRef.current = fetchMessages(threadId, {
      from: realmPaging.to,
      to: prevLocalPage.to,
    })
      .then(() => {
        return new Promise<void>(resolve => {
          setEndReachedFetching(false);
          onEndReachedFetchingRef.current = false;
          onEndReachedInPromiseRef.current = null;
          resolve();
        });
      })
      .catch(() => {
        setTimeout(() => {
          setEndReachedFetching(false);
          onEndReachedFetchingRef.current = false;
          onEndReachedTracker.current = {};
        }, 1000);
      });
  }, [useDeepCompareMemoize(realmPaging), fetchMessages, currentThreadId]);

  const handleScroll: ScrollViewProps['onScroll'] = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.y;
      const visibleLength = event.nativeEvent.layoutMeasurement.height;
      const contentLength = event.nativeEvent.contentSize.height;

      const isScrollAtStart = offset < 50;
      const isScrollAtEnd = contentLength - visibleLength - offset < 50;

      // Kiểm tra xem đã cuộn tới cuối chưa
      if (offset === 0) {
        if (currentThreadId && lastMessageIdRef.current)
          PSEventBus.getInstance().dispatch(PSBusEvent.SEEN_MESSAGE, {
            threadId: currentThreadId,
            messageId: lastMessageIdRef.current,
          });
      }

      if (scrollByUserRef.current && isScrollAtStart) {
        maybeCallOnStartReached();
      }

      if (scrollByUserRef.current && isScrollAtEnd) {
        maybeCallOnEndReached();
      }
    },
    [maybeCallOnStartReached, maybeCallOnEndReached],
  );

  const onScrollBeginDrag = React.useCallback(() => {
    scrollByUserRef.current = true;
  }, []);

  const onMomentumScrollEnd = React.useCallback(() => {
    scrollByUserRef.current = false;
  }, []);

  const scrollToMessage = React.useCallback(
    async (messageId: number, highlight: boolean) => {
      const threadId = currentThreadId;
      const lastMessageId = lastMessageIdRef.current;
      if (!threadId || !lastMessageId || !flatListRef.current) {
        return;
      }

      setHighlightMessageAfterScroll(undefined);

      // lấy target_message_id làm điểm giữa
      // max from = lastMessageId
      // nếu from === lastMessageId thì to = from - PAGING_SIZE
      // /2 để đảm bảo cuộn nhanh hơn và messages.length = PAGING_SIZE
      let from = Math.min(lastMessageId, messageId + PAGING_SIZE / 2);

      let to = Math.max(
        PSMessageEntity.FIRST_MESSAGE_ID,
        from === lastMessageId
          ? from - PAGING_SIZE
          : messageId - PAGING_SIZE / 2,
      );

      // nếu "from" gần điểm cuối thì lấy luôn điểm cuối để paging hoạt động đúng
      // ví dụ: last_message_id = 40, from = 39, to = 9
      if (lastMessageId - from < PAGING_SIZE / 2) {
        from = lastMessageId;
      }

      // nếu "to" gần điểm đầu thì lấy luôn điểm đầu để paging hoạt động đúng
      // ví dụ: last_message_id = 40, from = 39, to = 9
      if (to < PAGING_SIZE / 2) {
        to = PSMessageEntity.FIRST_MESSAGE_ID;
      }

      const targetPage: RealmPaging = {
        from: from,
        to: to,
      };

      psLogger.error(
        `PSPaginatedMessagesProvider: scrollToMessage = ${JSON.stringify(
          targetPage,
        )}`,
      );

      setRealmPaging(prev => {
        // nếu bằng nhau thì cuộn đến luôn không cần fetch từ remote
        if (isEqual(prev, targetPage)) {
          const index = pagingatedMessagesRef.current.findIndex(
            item => item.id === messageId,
          );

          if (index > -1) {
            if (highlight) {
              setHighlightMessageAfterScroll(messageId);
            }
            try {
              flatListRef.current?.scrollToIndex({
                animated: false,
                index: index,
                viewPosition: 0.5,
              });
            } catch (error) {
              psLogger.error(
                'PSPaginatedMessagesProvider: setRealmPaging scrollToIndex',
                error,
              );
            }
          }
          return prev;
        } else {
          if (highlight) {
            messageIdToHighlightAfterScrollToRef.current = messageId;
          }
          setScrollingToTargetMessage(true);
          resetPaginationTrackersRef.current();
          messageIdToScrollToRef.current = messageId;
          return targetPage;
        }
      });

      try {
        await fetchMessages(threadId, targetPage);
      } catch (error) {
        messageIdToScrollToRef.current = undefined;
        psLogger.error('PSPaginatedMessagesProvider: scrollToMessage', error);
      } finally {
        setScrollingToTargetMessage(false);
      }
    },
    [currentThreadId, fetchMessages],
  );

  const scrollToLastMessage = React.useCallback(async () => {
    const lastMessageId = lastMessageIdRef.current;
    if (lastMessageId) {
      setHighlightMessageAfterScroll(undefined);
      const index = pagingatedMessagesRef.current.findIndex(
        item => item.id === lastMessageId,
      );
      if (index > -1) {
        flatListRef.current?.scrollToOffset({
          offset: 0,
        });
      } else {
        scrollToMessage(lastMessageId, false);
      }
    }
  }, [scrollToMessage]);

  React.useEffect(() => {
    if (!currentThreadId) {
      return;
    }
    enterMessagesScreen(currentThreadId);
    return () => exitMessagesScreen(currentThreadId);
  }, [currentThreadId, enterMessagesScreen, exitMessagesScreen]);

  React.useEffect(() => {
    lastMessageIdRef.current = currentThread?.lastMessage?.id;
  }, [currentThread?.lastMessage?.id]);

  React.useEffect(() => {
    scrollToDebounceTimeoutRef.current = setTimeout(() => {
      const messageId = messageIdToScrollToRef.current;
      const index = pagingatedMessages.findIndex(item => item.id === messageId);

      if (index > -1 && flatListRef.current) {
        if (messageId === lastMessageIdRef.current) {
          flatListRef.current?.scrollToOffset({
            offset: 0,
          });
        } else {
          try {
            flatListRef.current?.scrollToIndex({
              animated: false,
              index: index,
              viewPosition: 0.5,
            });
          } catch (error) {
            psLogger.error(
              'PSPaginatedMessagesProvider: useEffect scrollToIndex',
              error,
            );
          }
        }

        if (messageIdToHighlightAfterScrollToRef.current) {
          setHighlightMessageAfterScroll(
            messageIdToHighlightAfterScrollToRef.current,
          );
        }

        messageIdToScrollToRef.current = undefined;
        messageIdToHighlightAfterScrollToRef.current = undefined;
      }
    }, SCROLL_TIME_OUT);
    return () => {
      clearTimeout(scrollToDebounceTimeoutRef.current);
    };
  }, [useDeepCompareMemoize(pagingatedMessages)]);

  React.useEffect(() => {
    const callback = (messageId: number) => {
      scrollToMessage(messageId, true);
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.SCROLL_TO_MESSAGE,
      callback,
    );

    return () => listener.unsubscribe();
  }, []);

  React.useEffect(() => {
    const callback = ({
      threadId,
      messageId,
    }: {
      threadId: string;
      messageId: number;
    }) => {
      markSeen(threadId, messageId);
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.SEEN_MESSAGE,
      callback,
    );

    return () => listener.unsubscribe();
  }, [markSeen]);

  React.useEffect(() => {
    if (!chatApiClient || !currentThreadId) {
      return;
    }
    const callback = (newMessage: PSMessageEntity) => {
      if (
        newMessage.threadId === currentThreadId &&
        newMessage.id > prevNewMessageIdScrolledRef.current
      ) {
        prevNewMessageIdScrolledRef.current = newMessage.id;
        resetPaginationTrackersRef.current();
        // chỗ này mục đích cho case khi ở ngoài vùng đỉnh mà có message của mình thì scroll đỉnh
        if (
          newMessage.sender.extUserId === chatApiClient.userId &&
          !newMessage.body?.pinOrUnpinMessage &&
          !autoScrollToTop
        ) {
          firstUnreadMessageIdRef.current = undefined;
          messageIdToScrollToRef.current = newMessage.id;
        }
        setRealmPaging(prev => ({
          from: newMessage.id,
          to:
            prev.to === -1
              ? Math.max(
                  PSMessageEntity.FIRST_MESSAGE_ID,
                  newMessage.id - PAGING_SIZE,
                )
              : prev.to,
        }));
      }
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.NEW_MESSAGE,
      callback,
    );

    return () => listener.unsubscribe();
  }, [chatApiClient, currentThreadId, autoScrollToTop]);

  const fetchThreadById = async (_threadId?: string, _userId?: string) => {
    if (chatApiClient) {
      if (_threadId) {
        const response = await chatApiClient.threadApi.fetchThreadById(
          _threadId,
          isDeskMode ? ['tags,tag_categories'] : undefined,
        );
        return response.data;
      } else if (_userId) {
        const response =
          await chatApiClient.threadApi.fetchThreadByUserId(_userId);
        return response.data;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  };

  const fetchThreadByIdError = (
    e: Error,
    _threadId?: string,
    _userId?: string,
  ) => {
    if (e && e instanceof PSResponseError) {
      if (
        e.http_code === 400 &&
        e.response?.data?.message_code === USER_ID_INVALID
      ) {
        if (isMounted.current) {
          PSFlashMessage.show({
            type: 'error',
            text1: `${translator('ps_user_invalid')}`,
            position: 'bottom',
            visibilityTime: 2000,
          });
          onBackPress?.();
        }
      }
      if (
        e.http_code === 403 &&
        e.response?.data?.message_code === DONT_HAVE_PERMISSION_CALL_API
      ) {
        try {
          let id: string | undefined;
          if (_threadId) {
            id = _threadId;
          } else if (_userId) {
            id = PSThreadEntity.getFirstByPartnerId(realm, _userId)?.id;
          }
          PSEventBus.getInstance().dispatch(PSBusEvent.LEAVE_THREAD, id);
        } catch (error) {
          psLogger.error(
            'PSPaginatedMessagesProvider: fetchThreadByIdError.getFirstByPartnerId',
            error,
          );
        }
      }

      if (e.http_code === 404) {
        if (isMounted.current) {
          PSFlashMessage.show({
            type: 'error',
            text1: `${e.response?.data?.message ?? translator('ps_thread_not_found')}`,
            // text1: `${translator('ps_thread_not_found')}`,
            position: 'bottom',
            visibilityTime: 2000,
          });
          onBackPress?.();
        }
      }
    }
    psLogger.error('PSPaginatedMessagesProvider: fetchThreadByIdError ', e);
  };

  const firstTimeOnlineRef = React.useRef(true);

  const firstTimeOfflineRef = React.useRef(true);

  React.useEffect(() => {
    if (!chatApiClient) {
      return;
    }
    if (isMqttConnected) {
      if (firstTimeOnlineRef.current) {
        psLogger.error(
          `PSPaginatedMessagesProvider: targetThreadId = ${targetThreadId}, targetUserId = ${targetUserId}, targetMessageId = ${targetMessageId}, lastMessageId = ${lastMessageIdRef.current}`,
        );
        firstTimeOnlineRef.current = false;
        firstTimeOfflineRef.current = false;

        let cachedThread: PSThreadEntity | undefined;

        if (targetThreadId) {
          cachedThread = PSThreadEntity.getFirstById(realm, targetThreadId);
        } else if (targetUserId) {
          cachedThread = PSThreadEntity.getFirstByPartnerId(
            realm,
            targetUserId,
          );
        } else {
          onBackPress?.();
          return;
        }

        const getFirstPage = (lastMessageId: number, isJoinned?: boolean) => {
          let fromMessageId = lastMessageId;

          if (targetMessageId && isJoinned) {
            fromMessageId = targetMessageId;
          }

          let from = Math.min(lastMessageId, fromMessageId + PAGING_SIZE);

          let to = Math.max(
            PSMessageEntity.FIRST_MESSAGE_ID,
            from === lastMessageId
              ? from - PAGING_SIZE
              : fromMessageId - PAGING_SIZE,
          );

          // nếu "from" gần điểm cuối thì lấy luôn điểm cuối để paging hoạt động đúng
          // ví dụ: last_message_id = 40, from = 39, to = 9
          if (lastMessageId - from < PAGING_SIZE / 2) {
            from = lastMessageId;
          }

          // nếu "to" gần điểm đầu thì lấy luôn điểm đầu để paging hoạt động đúng
          // ví dụ: last_message_id = 40, from = 39, to = 9
          if (to < PAGING_SIZE / 2) {
            to = PSMessageEntity.FIRST_MESSAGE_ID;
          }

          const page: RealmPaging = {
            from: from,
            to: to,
          };

          psLogger.error(
            `PSPaginatedMessagesProvider: useEffect.fetchMessages.getFirstPage = ${JSON.stringify(
              page,
            )}`,
          );

          setRealmPaging(page);

          return page;
        };

        let firstPage: RealmPaging | undefined;
        let localMessageViewedCount: number | undefined;

        if (
          cachedThread &&
          cachedThread.lastMessage?.id &&
          cachedThread.messageViewedCount
        ) {
          localMessageViewedCount = cachedThread.messageViewedCount;

          if (targetMessageId) {
            messageIdToScrollToRef.current = targetMessageId;
          }

          if (cachedThread.messageViewedCount < cachedThread.lastMessage.id) {
            firstUnreadMessageIdRef.current =
              cachedThread.messageViewedCount + 1;
          }

          // get message từ cache nếu có để hiển thị UI sớm nhất có thể
          firstPage = getFirstPage(cachedThread.lastMessage.id);
        } else {
          psLogger.error(
            `PSPaginatedMessagesProvider: useEffect.fetchMessages cachedThread = ${JSON.stringify(
              cachedThread,
            )}`,
          );
        }

        fetchThreadById(targetThreadId, targetUserId)
          .then(threadDto => {
            if (threadDto) {
              const deviceId = PSDeviceEntity.get(realm);
              realm.write(() => {
                PSThreadEntity.createOrUpdate(
                  realm,
                  PSThreadEntity.mapFromDto(
                    deviceId,
                    chatApiClient.userId,
                    threadDto,
                  ),
                );
              });

              if (threadDto.last_message.id) {
                lastMessageIdRef.current = threadDto.last_message.id;

                if (
                  messageIdToScrollToRef.current === threadDto.last_message.id
                ) {
                  messageIdToScrollToRef.current = undefined;
                }

                firstPage = getFirstPage(
                  threadDto.last_message.id,
                  threadDto.is_joinned,
                );

                if (
                  threadDto.message_viewed_count < threadDto.last_message.id &&
                  localMessageViewedCount &&
                  threadDto.message_viewed_count !== localMessageViewedCount
                ) {
                  firstUnreadMessageIdRef.current =
                    threadDto.message_viewed_count + 1;
                }

                fetchMessages(threadDto.id, firstPage)
                  .then(() => {
                    targetMessageId = undefined;
                    setTimeout(() => {
                      // trick để đợi write vào realm xong
                      setFirstFetching(false);
                    }, 500);
                  })
                  .catch(error => {
                    setFirstFetching(false);
                    psLogger.error(
                      'PSPaginatedMessagesProvider: useEffect.fetchMessages',
                      error,
                    );
                  });
              } else {
                setFirstFetching(false);
              }
            } else {
              psLogger.error(
                `PSPaginatedMessagesProvider: useEffect.fetchMessages threadDto = ${JSON.stringify(
                  threadDto,
                )}`,
              );
            }
          })
          .catch(error =>
            fetchThreadByIdError(error, targetThreadId, targetUserId),
          );
      } else {
        fetchThreadById(targetThreadId, targetUserId)
          .then(threadDto => {
            if (threadDto && threadDto.last_message.id) {
              const shouldScrollToLastMessage =
                !lastMessageIdRef.current ||
                (lastMessageIdRef.current &&
                  threadDto.last_message.id > lastMessageIdRef.current);
              const deviceId = PSDeviceEntity.get(realm);
              realm.write(() => {
                PSThreadEntity.createOrUpdate(
                  realm,
                  PSThreadEntity.mapFromDto(
                    deviceId,
                    chatApiClient.userId,
                    threadDto,
                  ),
                );
              });

              if (isMounted.current && shouldScrollToLastMessage) {
                // có thể khi gọi scrollToMessage thì lastMessageIdRef chưa được update nên sẽ set trước
                lastMessageIdRef.current = threadDto.last_message.id;

                let firstUnreadMessageId = threadDto.last_message.id;

                if (
                  threadDto.message_viewed_count < threadDto.last_message.id
                ) {
                  firstUnreadMessageId = threadDto.message_viewed_count + 1;
                  firstUnreadMessageIdRef.current =
                    threadDto.message_viewed_count + 1;
                }

                scrollToMessage(firstUnreadMessageId, false);
              }
            }
          })
          .catch(error =>
            fetchThreadByIdError(error, targetThreadId, targetUserId),
          );
      }
    } else {
      // nếu lần đầu vào không có kết nối internet và lastMessageId valid
      const lastMessageId = lastMessageIdRef.current;
      if (firstTimeOfflineRef.current && lastMessageId) {
        firstTimeOfflineRef.current = false;
        const from = Math.min(lastMessageId, targetMessageId ?? lastMessageId);
        const to = Math.max(
          PSMessageEntity.FIRST_MESSAGE_ID,
          from - PAGING_SIZE,
        );
        setRealmPaging({
          from: from,
          to: to,
        });
        setFirstFetching(false);
      }
    }
  }, [chatApiClient, isMqttConnected]);

  React.useEffect(() => {
    const callback = async (threadId: string | undefined) => {
      if (isMounted.current && currentThreadId === threadId) {
        // PSFlashMessage.show({
        //   type: 'error',
        //   text1: `${translator('ps_error_do_not_have_permission')}`,
        //   position: 'bottom',
        //   visibilityTime: 2000,
        // });
        // default rời khỏi nhóm onBackPress 2màn hình
        onBackPress?.();
        typeof onCompleteLeaveThread === 'function'
          ? onCompleteLeaveThread()
          : onBackPress?.();
      }
    };
    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.LEAVE_THREAD,
      callback,
    );
    return () => listener.unsubscribe();
  }, [translator, currentThreadId, onBackPress, onCompleteLeaveThread]);

  const scrollContextValue = React.useMemo<PSScrollToMessageContextValue>(
    () => ({
      isScrolling: isScrollingToTargetMessage,
      scrollToMessage: scrollToMessage,
      scrollToLastMessage: scrollToLastMessage,
    }),
    [isScrollingToTargetMessage, scrollToMessage, scrollToLastMessage],
  );

  const paginatedContextValue = React.useMemo<PSPaginatedMessagesContextValue>(
    () => ({
      isFirstFetching: isFirstFetching,
      messages: pagingatedMessages,
      onScrollBeginDrag: onScrollBeginDrag,
      onMomentumScrollEnd: onMomentumScrollEnd,
      handleScroll: handleScroll,
      flatListRef: flatListRef,
      onScrollToIndexFailedRef: onScrollToIndexFailedRef,
      viewabilityConfigCallbackPairsRef: viewabilityConfigCallbackPairsRef,
    }),
    [
      isFirstFetching,
      useDeepCompareMemoize(pagingatedMessages),
      onScrollBeginDrag,
      onMomentumScrollEnd,
      handleScroll,
    ],
  );

  const paginatedFetchingContextValue =
    React.useMemo<PSPaginatedMessagesFetchingContextValue>(
      () => ({
        isStartReachedFetching: isStartReachedFetching,
        isEndReachedFetching: isEndReachedFetching,
      }),
      [isStartReachedFetching, isEndReachedFetching],
    );

  return (
    <PSScrollToMessageContext.Provider value={scrollContextValue}>
      <PSPaginatedMessagesContext.Provider value={paginatedContextValue}>
        <PSPaginatedMessagesAutoScrollToTopContext.Provider
          value={autoScrollToTop}>
          <PSPaginatedMessagesFetchingContext.Provider
            value={paginatedFetchingContextValue}>
            {children}
          </PSPaginatedMessagesFetchingContext.Provider>
        </PSPaginatedMessagesAutoScrollToTopContext.Provider>
      </PSPaginatedMessagesContext.Provider>
    </PSScrollToMessageContext.Provider>
  );
};

export const usePSScrollToMessageContext = () =>
  React.useContext(PSScrollToMessageContext);

export const usePSPaginatedMessagesContext = () =>
  React.useContext(PSPaginatedMessagesContext);

export const usePSPaginatedMessagesAutoScrollToTopContext = () =>
  React.useContext(PSPaginatedMessagesAutoScrollToTopContext);

export const usePSPaginatedMessagesFetchingContext = () =>
  React.useContext(PSPaginatedMessagesFetchingContext);
