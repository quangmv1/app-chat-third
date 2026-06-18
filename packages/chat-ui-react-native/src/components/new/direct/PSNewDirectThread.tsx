import {
  useState,
  useEffect,
  useCallback,
  useReducer,
  PropsWithChildren,
} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {CreateGroupCard, UserCard} from '../../PSUserCard';
import {
  userReducers,
  initialState,
  setApiRequest,
  setApiSuccess,
  setListEnd,
  setApiFail,
} from '../../../hooks';
import React from 'react';
import {PSActionBar} from '../../PSActionBar';
import {PSSearch} from '../../PSSearch';
import {
  PSScreenStylesProvider,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {useDebounce} from '../../../hooks';
import {PSUserDto} from '@communi/chat-api-client-typescript';
import {PSUserModel, mapUsersDtoToModel} from '../../../types';
import {PSNewDirectThreadStyles} from './PSNewDirectThreadStyles';
import {
  PSNewDirectThreadNavigationProvider,
  usePSNewDirectThreadNavigationContext,
} from '../contexts';
import {PSCommonEmptyState} from '../../PSCommonEmptyState';

type PSNewDirectThreadProps = {
  newDirectThreadStyles?: PSNewDirectThreadStyles;
  onBackPress?: null | (() => void);
  onNewGroupThreadPress?: null | (() => void);
  onSelectedUserPress?: (user: PSUserModel) => void;
};

const PSNewDirectThreadProviders = ({
  newDirectThreadStyles,
  onBackPress,
  onNewGroupThreadPress,
  onSelectedUserPress,
  children,
}: PropsWithChildren<PSNewDirectThreadProps>) => {
  return (
    <PSNewDirectThreadNavigationProvider
      onBackPress={onBackPress}
      onPressNewGroupThread={onNewGroupThreadPress}
      onPressUserSelected={onSelectedUserPress}>
      <PSScreenStylesProvider styles={newDirectThreadStyles}>
        {children}
      </PSScreenStylesProvider>
    </PSNewDirectThreadNavigationProvider>
  );
};

const PSNewDirectThreadUI = () => {
  const {translator} = usePSTranslationContext();
  const {onBackPress, onPressNewGroupThread, onPressUserSelected} =
    usePSNewDirectThreadNavigationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const [keySearchUser, setKeySearchUser] = useState('');
  const debouncedValue = useDebounce<string>(keySearchUser, 500);
  const [page, setPage] = useState(1);
  const [state, dispatch] = useReducer(userReducers, initialState);
  const {loading, moreLoading, data, isListEnd} = state;
  const chatApiClient = usePSChatApiClientContext();

  const searchUsers = async () => {
    if (!chatApiClient) {
      return;
    }
    dispatch(setApiRequest(page));

    try {
      const searchUsersResponse = await chatApiClient.searchApi.searchUsers(
        keySearchUser,
        page,
        20,
        '',
        0,
      );
      const users = searchUsersResponse.data?.filter(
        (user: PSUserDto) => user.ext_user_id !== chatApiClient.userId,
      );

      if (users && users.length > 0) {
        dispatch(setApiSuccess(mapUsersDtoToModel(users)));
        if (searchUsersResponse?.links?.total_pages === page) {
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
    searchUsers();
  }, [debouncedValue, page]);

  const handleOnPress = useCallback(
    ({item}: {item: PSUserModel}) => {
      onPressUserSelected?.(item);
    },
    [onPressUserSelected],
  );

  const renderItemUser = useCallback(
    ({item, index}: {item: PSUserModel; index: number}) => {
      return (
        <UserCard
          user={item}
          isShowCheckBox={false}
          index={index}
          onPress={handleOnPress}
        />
      );
    },
    [handleOnPress],
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
    <View
      style={[styles.container, {backgroundColor: colors.Primary.background}]}>
      <PSActionBar
        titleText={translator('ps_new_message')}
        onBackPress={onBackPress}
      />
      <PSSearch
        value={keySearchUser}
        onChangeText={newText => {
          setKeySearchUser(newText);
          setPage(1);
        }}
        placeholder={translator('ps_to')}
        placeholderTextColor={colors.Primary.disable}
        searchIconColor={colors.Primary.mainText}
        style={[styles.search, {backgroundColor: colors.Primary.white}]}
        textStyle={[{color: colors.Primary.subText}, typography.bodyXLargeR]}
        isVisibleClean={keySearchUser !== ''}
        onCleanPress={() => {
          setKeySearchUser("");
          setPage(1);
        }}
      />
      <CreateGroupCard onPressNewGroupThread={onPressNewGroupThread} />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: colors.Primary.white,
            borderRadius: 8,
            marginTop: 16,
          }}>
          <FlatList
            contentContainerStyle={{flexGrow: 1}}
            data={data}
            keyExtractor={(item, index) => item.extUserId + '' + index}
            renderItem={({item, index}) => renderItemUser({item, index})}
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
            ItemSeparatorComponent={ActionDivider}
          />
        </View>
      )}
    </View>
  );
};

const ActionDivider = () => {
  const colors = usePSDesignSystemContext().colors;
  return (
    <View style={{backgroundColor: colors.Primary.linerBorder, height: 1}} />
  );
};

export const PSNewDirectThread = ({
  newDirectThreadStyles,
  onBackPress,
  onNewGroupThreadPress,
  onSelectedUserPress,
}: PSNewDirectThreadProps) => {
  return (
    <PSNewDirectThreadProviders
      newDirectThreadStyles={newDirectThreadStyles}
      onBackPress={onBackPress}
      onNewGroupThreadPress={onNewGroupThreadPress}
      onSelectedUserPress={onSelectedUserPress}>
      <PSNewDirectThreadUI />
    </PSNewDirectThreadProviders>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
