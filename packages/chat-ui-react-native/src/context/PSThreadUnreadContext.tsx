import React, {PropsWithChildren} from 'react';
import isEqual from 'react-fast-compare';
import {useIsMountedRef} from '../hooks';
import {PSThreadEntity} from '../types';
import {psLogger} from '../utils';
import {usePSChatApiClientContext} from './PSChatApiClientContext';
import {useQuery, useRealm} from './PSRealmContext';

type ParamsFunc = {userId?: string; threadId?: string};

type PSThreadUnreadContextValue = {
  unreadThreadCount: number;
  unreadMessageCount: number;
  getUnreadMessageCount: ({userId, threadId}: ParamsFunc) => number;
};

const PSThreadUnreadContext = React.createContext(
  {} as PSThreadUnreadContextValue,
);

type PSThreadSetUnreadIdsContextValue = {
  setCachedUnreadThreadIds: React.Dispatch<React.SetStateAction<string[]>>;
};

const PSThreadSetUnreadIdsContext = React.createContext(
  {} as PSThreadSetUnreadIdsContextValue,
);

export const PSThreadUnreadProvider = ({children}: PropsWithChildren) => {
  const isMountedRef = useIsMountedRef();

  const [unreadThreadCount, setUnreadThreadCount] = React.useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = React.useState(0);

  const [remoteUnreadThreadIds, setRemoteUnreadThreadIds] = React.useState<
    string[]
  >([]);

  const [cachedUnreadThreadIds, setCachedUnreadThreadIds] = React.useState<
    string[]
  >([]);

  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!chatApiClient) {
        return;
      }
      try {
        const response = await chatApiClient.threadApi.fetchUnreadCount();
        if (isMountedRef.current && response.data) {
          setRemoteUnreadThreadIds(response.data);
        }
      } catch (e) {
        psLogger.error('PSThreadUnreadContext: fetchUnreadCount ', e);
      }
    };
    fetchUnreadCount();
  }, [chatApiClient]);

  // Chú ý case: Nếu BE trả số lượng unredThreadIds nhiều hơn ở Cached có thì vẫn phải hiển thị theo BE
  React.useEffect(() => {
    let unreadThreadIds: string[] = [];
    if (remoteUnreadThreadIds.length && !cachedUnreadThreadIds.length) {
      unreadThreadIds = remoteUnreadThreadIds;
    } else if (!remoteUnreadThreadIds.length && cachedUnreadThreadIds.length) {
      unreadThreadIds = cachedUnreadThreadIds;
    } else {
      // loại bỏ những remoteIds đã có trong cache
      const filteredRemote = remoteUnreadThreadIds.filter(
        id => !cachedUnreadThreadIds.includes(id),
      );
      if (!isEqual(filteredRemote, remoteUnreadThreadIds)) {
        // update lại remoteIds
        setRemoteUnreadThreadIds(filteredRemote);
        return;
      }
      unreadThreadIds = [...filteredRemote, ...cachedUnreadThreadIds];
    }
    if (unreadThreadIds.length) {
      setUnreadThreadCount(unreadThreadIds.length);
      const cachedThreads = PSThreadEntity.getByIds(realm, unreadThreadIds);
      setUnreadMessageCount(
        cachedThreads
          .filtered(PSThreadEntity.filteredByMute(false))
          .reduce((sum, current) => sum + current.getUnreadCount(), 0),
      );
    } else {
      setUnreadThreadCount(0);
      setUnreadMessageCount(0);
    }
  }, [realm, remoteUnreadThreadIds, cachedUnreadThreadIds]);

  const threadQuery = useQuery(PSThreadEntity);

  React.useEffect(() => {
    const ids = threadQuery
      .filtered(PSThreadEntity.filteredByUnRead())
      .filtered(PSThreadEntity.filteredByMuteAndHasMention())
      .map(thread => thread.id);
    setCachedUnreadThreadIds(ids);
  }, [threadQuery]);

  const getUnReadMessageCountById = React.useCallback(
    (threadId: string) => {
      try {
        const cachedThreads = PSThreadEntity.getFirstById(realm, threadId);
        return cachedThreads?.getUnreadCount() ?? 0;
      } catch (error) {
        return 0;
      }
    },
    [realm, remoteUnreadThreadIds, cachedUnreadThreadIds],
  );

  const getUnReadMessageCountByUserId = React.useCallback(
    (userId: string) => {
      try {
        const cachedThreads = PSThreadEntity.getFirstByPartnerId(realm, userId);
        return cachedThreads?.getUnreadCount() ?? 0;
      } catch (error) {
        return 0;
      }
    },
    [realm, remoteUnreadThreadIds, cachedUnreadThreadIds],
  );

  const getUnreadMessageCount = React.useCallback(
    ({userId, threadId}: ParamsFunc): any => {
      if (!userId && !threadId) {
        return 0;
      }
      if (userId) return getUnReadMessageCountByUserId(userId);
      if (threadId) return getUnReadMessageCountById(threadId);
    },
    [getUnReadMessageCountByUserId, getUnReadMessageCountById],
  );

  const unreadContextValue = React.useMemo(() => {
    return {
      unreadThreadCount: unreadThreadCount,
      unreadMessageCount: unreadMessageCount,
      getUnreadMessageCount,
    } as PSThreadUnreadContextValue;
  }, [unreadThreadCount, unreadMessageCount, getUnreadMessageCount]);

  const setUnreadIdsContextValue = React.useMemo(() => {
    return {
      setCachedUnreadThreadIds: setCachedUnreadThreadIds,
    } as PSThreadSetUnreadIdsContextValue;
  }, []);

  return (
    <PSThreadUnreadContext.Provider value={unreadContextValue}>
      <PSThreadSetUnreadIdsContext.Provider value={setUnreadIdsContextValue}>
        {children}
      </PSThreadSetUnreadIdsContext.Provider>
    </PSThreadUnreadContext.Provider>
  );
};

export const usePSThreadUnreadContext = () =>
  React.useContext(PSThreadUnreadContext);

export const usePSThreadSetUnreadIdsContext = () =>
  React.useContext(PSThreadSetUnreadIdsContext);
