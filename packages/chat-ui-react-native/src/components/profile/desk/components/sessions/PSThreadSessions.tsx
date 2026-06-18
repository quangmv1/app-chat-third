import {PSSessionDto} from '@communi/chat-api-client-typescript';
import React, {useState} from 'react';
import isEqual from 'react-fast-compare';
import {ActivityIndicator, FlatList, StyleSheet, View} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
} from '../../../../../context';
import {
  setApiFail,
  setApiRequest,
  setApiSuccess,
  setListEnd,
} from '../../../../../hooks';
import {usePSMessageCurrentThreadIdContext} from '../../../../messages';
import {PSCommonEmptyState} from '../../../../PSCommonEmptyState';
import {
  useThreadDeskProfileActionsContext,
  useThreadDeskProfileContext,
} from '../../contexts';

import {PSThreadSession} from './PSThreadSession';

interface Props {
  ListHeaderComponent?: React.ReactElement | null;
}

const ThreadSessions = ({ListHeaderComponent}: Props) => {
  const {colors, typography} = usePSDesignSystemContext();
  const chatApiClient = usePSChatApiClientContext();
  const threadId = usePSMessageCurrentThreadIdContext();

  const [page, setPage] = useState(1);
  const {dispatch} = useThreadDeskProfileActionsContext();
  const {state} = useThreadDeskProfileContext();
  const {loading, moreLoading, data, isListEnd} = state;

  const [sessionIdSelect, setSessionIdSelect] = React.useState('');

  const fetchSessions = async () => {
    if (!chatApiClient || !threadId) {
      return;
    }
    dispatch(setApiRequest(page));

    const lastId = page === 1 ? 0 : data[page * 20 - 21].id;

    try {
      const response = await chatApiClient.sessionApi.fetchSessions(
        threadId,
        lastId,
        20,
      );
      const sessions = response.data ?? [];

      if (sessions && sessions.length > 0) {
        dispatch(setApiSuccess(sessions));
        if (sessions.length < 20) {
          dispatch(setListEnd());
        }
      } else {
        dispatch(setListEnd());
      }
    } catch (error) {
      dispatch(setApiFail());
    }
  };

  React.useEffect(() => {
    fetchSessions();
  }, [page]);

  const renderFooter = () => (
    <View style={styles.footerText}>
      {moreLoading && <ActivityIndicator />}
    </View>
  );

  const fetchMoreData = () => {
    if (!isListEnd && !moreLoading) {
      setPage(page + 1);
    }
  };

  const handleSessionClick = React.useCallback((sessionId: string) => {
    setSessionIdSelect(prev => (prev === sessionId ? '' : sessionId));
  }, []);

  const renderItemSession = React.useCallback(
    ({item}: {item: PSSessionDto; index: number}) => {
      return (
        <PSThreadSession
          key={`${item.id}`}
          isSelect={sessionIdSelect === item.id}
          session={item}
          onPress={handleSessionClick}
        />
      );
    },
    [handleSessionClick, sessionIdSelect],
  );

  const ActionDivider = React.useCallback(() => {
    return <View style={styles.divider} />;
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{flexGrow: 1}}
          data={data}
          keyExtractor={(item, index) => item.id + '' + index}
          renderItem={({item, index}) => renderItemSession({item, index})}
          ListHeaderComponent={ListHeaderComponent}
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
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={ActionDivider}
        />
      )}
    </View>
  );
};

export const PSThreadSessions = React.memo(ThreadSessions, (prev, next) => {
  return isEqual(prev, next);
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  divider: {
    height: (16).px(),
  },
});
