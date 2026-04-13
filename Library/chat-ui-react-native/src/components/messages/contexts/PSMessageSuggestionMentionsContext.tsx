import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useReducer,
  useState,
} from 'react';
import {usePSChatApiClientContext} from '../../../context';
import {mapUsersDtoToModel, PSMessageEntity, PSUserModel} from '../../../types';
import {
  initialState,
  setApiFail,
  setApiRequest,
  setApiSuccess,
  setListEnd,
  userReducers,
} from '../../../hooks';
import {PSThreadType} from '@communi/chat-api-client-typescript';
import {
  usePSMessageCurrentThreadContext,
  usePSMessageIsSubthreadContext,
} from './PSMessageCurrentThreadContext';

type PSMessageSuggestionMentionsContextValue = {
  suggestedMentionUsers: PSUserModel[];
  fetchMoreData?: () => void;
};

const PSMessageSuggestionMentionsContext =
  createContext<PSMessageSuggestionMentionsContextValue>({
    suggestedMentionUsers: [],
  });

const PSMessageSetSuggestionMentionQueryContext = createContext<
  React.Dispatch<React.SetStateAction<string>>
>(() => undefined);

export const PSMessageSuggestionMentionsContextProvider = ({
  children,
  isPSThreadProfileDescription,
}: PropsWithChildren<{isPSThreadProfileDescription?: boolean}>) => {
  const [page, setPage] = useState(1);
  const [mentionQuery, setMentionQuery] = React.useState<string>('');

  const currentThread = usePSMessageCurrentThreadContext();
  const chatApiClient = usePSChatApiClientContext();

  const isSubThread = usePSMessageIsSubthreadContext();

  const [state, dispatch] = useReducer(userReducers, initialState);

  const {moreLoading, data, isListEnd} = state;

  const searchUsersInThread = React.useCallback(async () => {
    const threadId = isSubThread ? currentThread?.parentId : currentThread?.id;

    if (!chatApiClient || !threadId) {
      return;
    }
    dispatch(setApiRequest(page));

    try {
      const includeMe = isPSThreadProfileDescription ? 1 : 0;
      const searchUsersResponse =
        await chatApiClient.searchApi.searchMembersInThread(
          mentionQuery === '@' ? '' : mentionQuery,
          page,
          20,
          includeMe,
          threadId,
        );
      const users = searchUsersResponse.data;

      if (users && users.length > 0) {
        var usersUiModel: PSUserModel[] = [];
        if (
          page === 1 &&
          (mentionQuery === '@' || 'all'.includes(mentionQuery.toLowerCase()))
        ) {
          usersUiModel.push({
            extUserId: PSMessageEntity.MENTION_ALL_ID,
            userId: PSMessageEntity.MENTION_ALL_ID,
            name: 'All',
          } as PSUserModel);
        }
        usersUiModel.push(...mapUsersDtoToModel(users));
        dispatch(setApiSuccess(usersUiModel));
        if (searchUsersResponse?.links?.total_pages === page) {
          dispatch(setListEnd());
        }
      } else {
        var usersUiModel: PSUserModel[] = [];
        if (
          page === 1 &&
          (mentionQuery === '@' || 'all'.includes(mentionQuery.toLowerCase()))
        ) {
          usersUiModel.push({
            extUserId: PSMessageEntity.MENTION_ALL_ID,
            userId: PSMessageEntity.MENTION_ALL_ID,
            name: 'All',
          } as PSUserModel);
        }
        dispatch(setApiSuccess(usersUiModel));
        dispatch(setListEnd());
      }
    } catch (error) {
      dispatch(setApiFail());
    }
  }, [
    isSubThread,
    chatApiClient,
    currentThread?.id,
    currentThread?.parentId,
    mentionQuery,
    page,
  ]);

  React.useEffect(() => {
    setPage(1);
  }, [mentionQuery]);

  React.useEffect(() => {
    if (currentThread?.type === PSThreadType.GROUP) {
      if (mentionQuery !== '') {
        searchUsersInThread();
      } else {
        dispatch(setApiRequest(page));
      }
    }
  }, [currentThread?.type, page, mentionQuery, searchUsersInThread]);

  const fetchMoreData = React.useCallback(() => {
    if (!isListEnd && !moreLoading) {
      setPage(page + 1);
    }
  }, [isListEnd, moreLoading, page]);

  const suggestionMentionsContextValue =
    React.useMemo<PSMessageSuggestionMentionsContextValue>(
      () => ({
        suggestedMentionUsers: data,
        fetchMoreData: fetchMoreData,
      }),
      [data, fetchMoreData],
    );

  return (
    <PSMessageSuggestionMentionsContext.Provider
      value={suggestionMentionsContextValue}>
      <PSMessageSetSuggestionMentionQueryContext.Provider
        value={setMentionQuery}>
        {children}
      </PSMessageSetSuggestionMentionQueryContext.Provider>
    </PSMessageSuggestionMentionsContext.Provider>
  );
};

export const usePSMessageSuggestionMentionsContext = () =>
  useContext(PSMessageSuggestionMentionsContext);

export const usePSMessageSetSuggestionMentionQueryContext = () =>
  useContext(PSMessageSetSuggestionMentionQueryContext);
