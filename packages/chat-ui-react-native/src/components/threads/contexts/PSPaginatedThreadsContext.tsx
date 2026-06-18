import React, {PropsWithChildren} from 'react';
import {
  usePSChatApiClientContext,
  usePSIsDeskModeContext,
  usePSLastOnlineTimeContext,
  usePSMqttClientConnectedContext,
  usePSMqttTypingUsersContext,
  // usePSThreadSetUnreadIdsContext,
  usePSTranslationContext,
  useQuery,
  useRealm,
} from '../../../context';
import {useDeepCompareMemoize} from '../../../hooks';
import {
  PSDeviceEntity,
  PSFolderEntity,
  PSMessageEntity,
  PSMessageSeenUsersEntity,
  PSPinnedMessagesEntity,
  PSThreadEntity,
  PSThreadModel,
  mapThreadsEntityToModel,
} from '../../../types';
import {psLogger} from '../../../utils';
import {useFolderContext} from './PSFolderContext';
import {usePSThreadListPCLContext} from './PSThreadListUserTypePCLContext';
import {PSThreadDto} from '@communi/chat-api-client-typescript';

const PAGING_THREAD_SIZE = 20;

const FIRST_PAGE_ID = '0';

const FIRST_PAGE_REALM_PAGING = 0;

type PSPaginatedThreadsContextValue = {
  loadingMore: boolean;
  isFirstFetching: boolean;
  threads: PSThreadModel[];
  nextPage: () => void;
  isRefresh: boolean;
  onRefresh: () => void;
  fetchThreads: (lastId: string, targetId?: string) => void;
};

const PSPaginatedThreadsContext = React.createContext(
  {} as PSPaginatedThreadsContextValue,
);

export const PSPaginatedThreadsProvider = ({children}: PropsWithChildren) => {
  const {translator} = usePSTranslationContext();

  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const userTypeSelected = usePSThreadListPCLContext().userTypeSelected ?? {};

  const isMqttConnected = usePSMqttClientConnectedContext();

  const {currentFolderAlias} = useFolderContext();

  // const {setCachedUnreadThreadIds} = usePSThreadSetUnreadIdsContext();

  const [currentPage, setCurrentPage] = React.useState(FIRST_PAGE_REALM_PAGING);

  const [loadingMore, setLoadingMore] = React.useState(false);

  const {isDeskMode} = usePSIsDeskModeContext();

  const cachedThreads = useQuery(
    PSThreadEntity,
    threads => {
      let result = threads.filtered(
        [
          PSFolderEntity.PUBLIC_GROUP,
          PSFolderEntity.PCL,
          PSFolderEntity.SHARED_INBOX,
        ].includes(currentFolderAlias)
          ? PSThreadEntity.filteredByLastMessageNotNull()
          : PSThreadEntity.filteredByLastMessageNotNullAndThreadNotDeleted(),
      );
      if (currentFolderAlias === PSFolderEntity.ALL) {
        result = result.filtered(PSThreadEntity.filteredByFolderAll());
      } else if (currentFolderAlias === PSFolderEntity.UNREAD) {
        result = result.filtered(PSThreadEntity.filteredByUnRead());
      } else if (currentFolderAlias === PSFolderEntity.PUBLIC_GROUP) {
        result = result.filtered(
          PSThreadEntity.filteredByPublicGroupUserType(
            PSFolderEntity.PUBLIC_GROUP,
          ),
        );
      } else if (currentFolderAlias === PSFolderEntity.SHARED_INBOX) {
        // filteredByPCL
        result = result.filtered(
          PSThreadEntity.filteredByPCL(
            PSFolderEntity.SHARED_INBOX,
            userTypeSelected?.[PSFolderEntity.SHARED_INBOX],
          ),
        );
      } else if (currentFolderAlias === PSFolderEntity.PCL) {
        // filteredByPCL
        result = result.filtered(
          PSThreadEntity.filteredByPCL(
            PSFolderEntity.PCL,
            userTypeSelected?.[PSFolderEntity.PCL],
          ),
        );
      }
      return result.sorted(PSThreadEntity.sorted);
    },
    [currentFolderAlias, useDeepCompareMemoize(userTypeSelected)],
  );

  const typingUsers = usePSMqttTypingUsersContext();

  const {onlineTimePartners} = usePSLastOnlineTimeContext();

  const paginatedThreads = React.useMemo(() => {
    if (!chatApiClient) {
      return [];
    }
    const page = currentPage === FIRST_PAGE_REALM_PAGING ? 1 : currentPage;
    return mapThreadsEntityToModel(
      chatApiClient.userId,
      [...cachedThreads],
      typingUsers,
      onlineTimePartners,
      translator,
    )
      .sort((threadA, threadB) => {
        if (
          [PSFolderEntity.PUBLIC_GROUP, PSFolderEntity.PCL].includes(
            currentFolderAlias,
          )
        ) {
          return 0; // Number(threadA.id) - Number(threadB.id);
        }
        if (threadA.pinnedAt === threadB.pinnedAt) {
          return threadB.lastMessage.createdAt - threadA.lastMessage.createdAt;
        } else {
          return threadB.pinnedAt - threadA.pinnedAt;
        }
      })
      .slice(0, Math.min(page * PAGING_THREAD_SIZE, cachedThreads.length));
  }, [
    currentFolderAlias,
    chatApiClient,
    currentPage,
    cachedThreads,
    translator,
    useDeepCompareMemoize(typingUsers),
    useDeepCompareMemoize(onlineTimePartners),
  ]);

  const [isFirstFetching, setFirstFetching] = React.useState(true);

  const [isFetching, setFetching] = React.useState(false);

  const numberOfPageToFetchRef = React.useRef(0);

  const fetchThreadsPromiseRef = React.useRef<Promise<void> | undefined>();

  const isRemoteThreadReachEnd = React.useRef(false);

  const showRefreshTimeRef = React.useRef<number>(0);

  const onFetching = React.useCallback(() => {
    setFetching(prev => {
      if (!prev) {
        setCurrentPage(FIRST_PAGE_REALM_PAGING);
        showRefreshTimeRef.current = new Date().getTime();
      }
      return true;
    });
  }, []);

  const [isRefresh, setRefresh] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefresh(true);
    onFetching();
  }, [onFetching]);

  React.useEffect(() => {
    if (!isFetching) {
      setRefresh(false);
    }
  }, [isFetching]);

  const handleDeleteDataRealm = React.useCallback(() => {
    try {
      // xoá threads cached thuộc currentFolderAlias hiện tại
      if (currentFolderAlias === PSFolderEntity.SHARED_INBOX) {
        realm.write(() => {
          realm.delete(
            realm
              .objects(PSThreadEntity.schema.name)
              .filtered(
                PSThreadEntity.filteredByPCL(
                  PSFolderEntity.SHARED_INBOX,
                  userTypeSelected?.[PSFolderEntity.SHARED_INBOX],
                ),
              ),
          );
        });
      } else if (currentFolderAlias === PSFolderEntity.PCL) {
        realm.write(() => {
          realm.delete(
            realm
              .objects(PSThreadEntity.schema.name)
              .filtered(
                PSThreadEntity.filteredByPCL(
                  PSFolderEntity.PCL,
                  userTypeSelected?.[PSFolderEntity.PCL],
                ),
              ),
          );
        });
      } else if (currentFolderAlias === PSFolderEntity.PUBLIC_GROUP) {
        realm.write(() => {
          realm.delete(
            realm
              .objects(PSThreadEntity.schema.name)
              .filtered(
                PSThreadEntity.filteredByPublicGroupUserType(
                  PSFolderEntity.PUBLIC_GROUP,
                ),
              ),
          );
        });
      } else {
        realm.write(() => {
          realm.delete(realm.objects(PSMessageSeenUsersEntity.schema.name));
          realm.delete(realm.objects(PSPinnedMessagesEntity.schema.name));
          realm.delete(realm.objects(PSMessageEntity.schema.name));
          realm.delete(realm.objects(PSThreadEntity.schema.name));
        });
      }
    } catch (error) {
      psLogger.error('PSPaginatedThreadsProvider: deleteAllThreads', error);
    }
  }, [currentFolderAlias, realm, userTypeSelected]);

  const fetchThreadIdsDeleted = async () => {
    if (!chatApiClient) {
      return;
    }
    try {
      const threadIdsDeletedResponse =
        await chatApiClient.threadApi.fetchThreadIdsDeleted();
      const threadIdsDeleted = (threadIdsDeletedResponse.data ?? []).filter(
        (threadId: string) => PSThreadEntity.getFirstById(realm, threadId)?.isValid(),
      );

      realm.write(() => {
        for (const threadId of threadIdsDeleted) {
          PSThreadEntity.deleteThreadImprove(realm, threadId);
        }
      });
    } catch (error) {
      psLogger.error(
        'PSPaginatedThreadsProvider: fetchThreadIdsDeleted',
        error,
      );
    }
  };

  const fetchThreads = async (lastId: string, targetId?: string) => {
    if (currentFolderAlias === PSFolderEntity.UNREAD) return; // tab chưa đọc không cho phép call api
    if (!chatApiClient) {
      return;
    }

    // hiện tại thì select folder ALL thì mới cần fetchThreadIdsDeleted
    if (lastId === FIRST_PAGE_ID && currentFolderAlias === PSFolderEntity.ALL) {
      await fetchThreadIdsDeleted();
    }

    let remoteThreads: PSThreadDto[] | undefined;

    try {
      if (currentFolderAlias === PSFolderEntity.ALL) {
        const response = await chatApiClient.threadApi.fetchThreads(
          PAGING_THREAD_SIZE,
          lastId,
          undefined,
          isDeskMode ? ['tags,tag_categories'] : undefined,
        );
        remoteThreads = response.data;
      } else if (currentFolderAlias === PSFolderEntity.PUBLIC_GROUP) {
        const response = await chatApiClient.threadApi.fetchGroupPublicThreads(
          PAGING_THREAD_SIZE,
          lastId,
        );
        remoteThreads = response.data;
        remoteThreads = remoteThreads?.map(ite => ({
          ...ite,
          userType: PSFolderEntity.PUBLIC_GROUP,
        }));
      } else if (currentFolderAlias === PSFolderEntity.SHARED_INBOX) {
        const response = await chatApiClient.threadApi.fetchGroupPublicThreads(
          PAGING_THREAD_SIZE,
          lastId,
          PSFolderEntity.SHARED_INBOX,
          targetId ?? userTypeSelected?.[PSFolderEntity.SHARED_INBOX],
          isDeskMode ? ['tags,tag_categories'] : undefined,
        );
        remoteThreads = response.data;
        remoteThreads = remoteThreads?.map(ite => ({
          ...ite,
          userType: PSFolderEntity.SHARED_INBOX,
          targetIdUserType:
            targetId ?? userTypeSelected?.[PSFolderEntity.SHARED_INBOX],
        }));
      } else if (currentFolderAlias === PSFolderEntity.PCL) {
        const response = await chatApiClient.threadApi.fetchGroupPublicThreads(
          PAGING_THREAD_SIZE,
          lastId,
          PSFolderEntity.PCL,
          targetId ?? userTypeSelected?.[PSFolderEntity.PCL],
        );
        remoteThreads = response.data;
        remoteThreads = remoteThreads?.map(ite => ({
          ...ite,
          userType: PSFolderEntity.PCL,
          targetIdUserType: targetId ?? userTypeSelected?.[PSFolderEntity.PCL],
        }));
      }
    } catch (e) {
      psLogger.error('PSPaginatedThreadsProvider: fetchThreads', e);
      return undefined;
    }

    if (remoteThreads && remoteThreads.length) {
      psLogger.error(
        `PSPaginatedThreadsProvider: read from REMOTE lastId ${lastId} -> length: ${remoteThreads.length} `,
      );

      // kiểm tra empty remote threads = true or false
      isRemoteThreadReachEnd.current =
        remoteThreads.length < PAGING_THREAD_SIZE;

      try {
        const deviceId = PSDeviceEntity.get(realm);
        // fetchThreadIdsDeleted k trả về ids public thread nên phải xoá cached khi fetch đc first page
        if (
          [
            PSFolderEntity.PUBLIC_GROUP,
            PSFolderEntity.PCL,
            PSFolderEntity.SHARED_INBOX,
          ].includes(currentFolderAlias) &&
          lastId === FIRST_PAGE_ID
        ) {
          handleDeleteDataRealm();
        }
        realm.write(() => {
          remoteThreads!.forEach(item => {
            try {
              PSThreadEntity.createOrUpdate(
                realm,
                PSThreadEntity.mapFromDto(deviceId, chatApiClient.userId, item),
              );
            } catch (error) {
              psLogger.error(
                `PSPaginatedThreadsProvider.saveThreads: thread = ${JSON.stringify(
                  item,
                )} `,
                error,
              );
            }
          });
        });
      } catch (error) {
        psLogger.error('PSPaginatedThreadsProvider: saveThreads', error);
      }

      return remoteThreads[remoteThreads.length - 1]?.id;
    } else if (lastId === FIRST_PAGE_ID) {
      // khi api ko trả về data thì thực hiện xoá data all của currentFolderAlias hiện tại
      handleDeleteDataRealm();
      return undefined;
    } else {
      return undefined;
    }
  };

  const fetch = (lastThreadId: string) => {
    fetchThreadsPromiseRef.current = fetchThreads(lastThreadId)
      .then(nextLastThreadId => {
        if (lastThreadId === FIRST_PAGE_ID) {
          // nếu là query của first page thì tính timeout để đủ thời gian RefreshControl để hiển thị
          const timeout =
            new Date().getTime() - showRefreshTimeRef.current < 500 ? 500 : 0;
          showRefreshTimeRef.current = 0;
          setTimeout(() => {
            setFetching(false);
            setFirstFetching(false);
          }, timeout);
        }

        fetchThreadsPromiseRef.current = undefined;

        if (numberOfPageToFetchRef.current >= 1) {
          numberOfPageToFetchRef.current -= 1;
        }

        // nếu vẫn còn page để fetch thì fetch tiếp
        if (numberOfPageToFetchRef.current && nextLastThreadId) {
          fetch(nextLastThreadId);
        }
      })
      .catch(error => {
        psLogger.error('PSPaginatedThreadsProvider: fetch', error);
        // fetch lại nếu lỗi
        setTimeout(() => fetch(lastThreadId), 1000);
      });
  };

  const nextPage = React.useCallback(() => {
    // nếu remote đã hết thì ko cần fetch nữa
    if (isRemoteThreadReachEnd.current) {
      return;
    }
    if (
      currentPage > FIRST_PAGE_REALM_PAGING + 1 &&
      paginatedThreads.length &&
      currentFolderAlias !== PSFolderEntity.UNREAD
    )
      setLoadingMore(true);
    // fetch từ page 0
    if (currentPage === FIRST_PAGE_REALM_PAGING) {
      if (isMqttConnected) {
        fetch(FIRST_PAGE_ID);
      } else {
        setFetching(false);
      }
    } else if (fetchThreadsPromiseRef.current) {
      // tăng page cần fetch và đợi để tự động fetch tiếp next page
      numberOfPageToFetchRef.current += 1;
    } else {
      // vì thời điểm này threads ở local tương đương remote
      // fetch next page = last_thread_id ở theo local
      const nextLastId = paginatedThreads[paginatedThreads.length - 1]?.id;
      if (isMqttConnected && nextLastId) {
        fetch(nextLastId);
      } else {
        setFetching(false);
      }
    }
    // next page phụ thuộc vào threads.length để tính + 1
    setCurrentPage(prev => prev + 1);
  }, [isMqttConnected, currentPage, paginatedThreads, currentFolderAlias]);

  React.useEffect(() => {
    if (isFetching) {
      fetchThreadsPromiseRef.current = undefined;
      isRemoteThreadReachEnd.current = false;
      // trick để update lại first page
      numberOfPageToFetchRef.current = 0;
      nextPage();
    }
  }, [isFetching]);

  React.useEffect(() => {
    if (
      currentFolderAlias === PSFolderEntity.ALL ||
      currentFolderAlias === PSFolderEntity.PUBLIC_GROUP ||
      currentFolderAlias === PSFolderEntity.SHARED_INBOX ||
      currentFolderAlias === PSFolderEntity.PCL
    ) {
      setFirstFetching(true);
      setCurrentPage(FIRST_PAGE_REALM_PAGING);
    }
  }, [currentFolderAlias]);

  React.useEffect(() => {
    psLogger.error(`PSPaginatedThreadsProvider: isOnline = ${isMqttConnected}`);
    if (isMqttConnected && chatApiClient) {
      // hiện tại thì select folder ALL or PUBLIC_GROUP mới Refresh
      if (
        currentFolderAlias === PSFolderEntity.ALL ||
        currentFolderAlias === PSFolderEntity.PUBLIC_GROUP ||
        currentFolderAlias === PSFolderEntity.SHARED_INBOX ||
        currentFolderAlias === PSFolderEntity.PCL
      ) {
        onFetching();
      }
    } else {
      setFetching(false);
    }
  }, [isMqttConnected, chatApiClient, currentFolderAlias, isDeskMode]);

  // React.useEffect(() => {
  //   const unreadThreadIds = paginatedThreads
  //     .filter(thread => thread.isJoined && thread.unreadCount > 0)
  //     .map(thread => thread.id);
  //   setCachedUnreadThreadIds(unreadThreadIds);
  // }, [paginatedThreads]);

  React.useEffect(() => {
    if (
      (!paginatedThreads.length ||
        paginatedThreads.length === cachedThreads.length) &&
      loadingMore
    ) {
      setLoadingMore(false);
    }
  }, [paginatedThreads.length, cachedThreads.length, loadingMore]);

  const contextValue = React.useMemo<PSPaginatedThreadsContextValue>(
    () => ({
      isFirstFetching: isFirstFetching,
      loadingMore,
      threads: paginatedThreads,
      nextPage: nextPage,
      isRefresh: isRefresh,
      onRefresh: onRefresh,
      fetchThreads,
    }),
    [
      isFirstFetching,
      isRefresh,
      nextPage,
      onRefresh,
      fetchThreads,
      useDeepCompareMemoize(paginatedThreads),
    ],
  );

  return (
    <PSPaginatedThreadsContext.Provider value={contextValue}>
      {children}
    </PSPaginatedThreadsContext.Provider>
  );
};

export const usePSPaginatedThreadsContext = () =>
  React.useContext(PSPaginatedThreadsContext);
