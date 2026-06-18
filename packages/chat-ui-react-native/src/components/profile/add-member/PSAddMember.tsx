import React, {PropsWithChildren} from 'react';
import {useCallback, useEffect, useReducer, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  userReducers,
  initialState,
  setApiRequest,
  setApiSuccess,
  setListEnd,
  setApiFail,
} from '../../../hooks';
import {UserCard} from '../../PSUserCard';
import {
  PSActionBar,
  PSAvatarImage,
  PSCommonEmptyState,
  PSFlashMessage,
  PSSearch,
} from '../../../components';
import {
  PSScreenStylesProvider,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {useDebounce} from '../../../hooks';
import {mapUsersDtoToModel, PSUserModel} from '../../../types';
import {
  PSChangeParticipantsLevel,
  PSResponseError,
  PSUserDto,
} from '@communi/chat-api-client-typescript';
import {IcFillXmarkCircle} from '../../../icons';
import {MEMBERS_INVALID, psLogger} from '../../../utils';
import {PSAddMemberStyles} from './PSAddMemberStyles';
import {
  PSAddMemberNavigationProvider,
  usePSAddMemberNavigationContext,
} from '../contexts/PSAddMemberNavigationContext';

type PSAddMemberProps = {
  threadId: string;
  addMemberStyles?: PSAddMemberStyles;
  onBackPress?: null | (() => void);
  onAddParticipantsSuccess?: null | (() => void);
};

const PSAddMemberProviders = ({
  children,
  addMemberStyles,
  onBackPress,
  onAddParticipantsSuccess,
}: PropsWithChildren<{
  addMemberStyles?: PSAddMemberStyles;
  onBackPress?: null | (() => void);
  onAddParticipantsSuccess?: null | (() => void);
}>) => {
  return (
    <PSAddMemberNavigationProvider
      onBackPress={onBackPress}
      onAddParticipantsSuccess={onAddParticipantsSuccess}>
      <PSScreenStylesProvider styles={addMemberStyles}>
        {children}
      </PSScreenStylesProvider>
    </PSAddMemberNavigationProvider>
  );
};

const PSAddMemberUI = ({threadId}: {threadId: string}) => {
  const {translator} = usePSTranslationContext();
  const {onBackPress, onAddParticipantsSuccess} =
    usePSAddMemberNavigationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const [isActive, setIsActive] = useState(false);

  const [keySearchUser, setKeySearchUser] = useState('');
  const debouncedValue = useDebounce<string>(keySearchUser, 500);

  const [page, setPage] = useState(1);
  const [state, dispatch] = useReducer(userReducers, initialState);
  const [usersSelected, setUsersSelected] = useState<PSUserModel[]>([]);

  const {loading, moreLoading, data, isListEnd} = state;

  const chatApiClient = usePSChatApiClientContext();
  const [loadingAddParticipants, setLoadingAddParticipants] = useState(false);

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
        threadId,
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
    return () => {
      setUsersSelected([]);
    };
  }, []);

  useEffect(() => {
    searchUsers();
  }, [debouncedValue, page]);

  const isUserChecked = useCallback(
    (userId: string) => {
      var isChecked = usersSelected
        .map((item: PSUserModel) => item.extUserId)
        .includes(userId);
      return isChecked;
    },
    [usersSelected],
  );

  const handleSelectUser = useCallback(
    ({item}: {item: PSUserModel; index: number}) => {
      var isChecked = isUserChecked(item.extUserId);
      var newUsersSelected: PSUserModel[] = [];
      if (isChecked) {
        newUsersSelected = usersSelected.filter(
          (user: PSUserModel) => user.extUserId !== item.extUserId,
        );
      } else {
        newUsersSelected = [...usersSelected, item];
      }

      if (newUsersSelected && newUsersSelected.length > 0) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
      setUsersSelected(newUsersSelected);
    },
    [isUserChecked, usersSelected],
  );

  const renderItemUser = useCallback(
    ({item, index}: {item: PSUserModel; index: number}) => {
      var isChecked = isUserChecked(item.extUserId);
      return (
        <UserCard
          index={index}
          user={item}
          isShowCheckBox={true}
          onSelected={handleSelectUser}
          isChecked={isChecked}
        />
      );
    },
    [isUserChecked, handleSelectUser],
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

  const renderItemUserSelected = useCallback(
    ({item, index}: {item: PSUserModel; index: number}) => {
      return (
        <View style={styles.container_user_selected}>
          <PSAvatarImage url={item.avatar} displayName={item.name} size={64} />
          <Pressable
            style={styles.close}
            onPress={() => {
              handleSelectUser({
                index: index,
                item: item,
              });
            }}>
            <IcFillXmarkCircle
              width={20}
              height={20}
              fill={colors.Negative.normal}
            />
          </Pressable>
          <Text
            style={{color: colors.Primary.subText}}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.name.workAroundTextOneLineContainsNewLineIOS()}
          </Text>
        </View>
      );
    },
    [handleSelectUser, colors.Primary.subText, colors.Negative.normal],
  );

  const addParticipants = React.useCallback(async () => {
    if (!chatApiClient) {
      return;
    }
    setLoadingAddParticipants(true);
    try {
      await chatApiClient.threadApi.changeParticipants(
        threadId,
        PSChangeParticipantsLevel.ADD,
        usersSelected.map(item => item.extUserId),
      );
      PSFlashMessage.show({
        type: 'success',
        position: 'bottom',
        text1: `${translator('ps_success_add_member')}`,
      });
      onAddParticipantsSuccess?.();
    } catch (error) {
      setLoadingAddParticipants(false);
      psLogger.error(`PSAddMember addParticipants : ${error}`);
      if (error && error instanceof PSResponseError) {
        if (
          error.http_code === 400 &&
          error.response?.data?.message_code === MEMBERS_INVALID
        ) {
          PSFlashMessage.show({
            type: 'error',
            text1: `${error.response?.data?.message}`,
            position: 'bottom',
            visibilityTime: 2000,
          });
        } else {
          PSFlashMessage.show({
            type: 'error',
            position: 'bottom',
            text1: `${translator('ps_error_add_member')}`,
          });
        }
      }
    }
  }, [
    chatApiClient,
    onAddParticipantsSuccess,
    threadId,
    translator,
    usersSelected,
  ]);

  const rightContent = useCallback(() => {
    return (
      <Pressable
        disabled={!isActive}
        style={styles.rightContent}
        onPress={() => {
          addParticipants();
        }}>
        <Text
          style={[
            typography.headingMediumS,
            {
              color: isActive ? colors.Primary.subText : colors.Neutral.n200,
            },
          ]}>
          {translator('ps_add')}
        </Text>
      </Pressable>
    );
  }, [
    isActive,
    typography.headingMediumS,
    colors.Primary.subText,
    colors.Neutral.n200,
    translator,
    addParticipants,
  ]);

  return (
    <View style={styles.container}>
      <PSActionBar
        titleText={translator('ps_add_member_header')}
        RightContent={rightContent}
        onBackPress={onBackPress}
      />
      <View
        style={[styles.container_content, {backgroundColor: colors.Primary.background}]}>
        <PSSearch
          value={keySearchUser}
          onChangeText={newText => {
            setKeySearchUser(newText);
            setPage(1);
          }}
          placeholder={translator('ps_search')}
          placeholderTextColor={colors.Neutral.n200}
          searchIconColor={colors.Neutral.n200}
          style={[styles.search, {backgroundColor: colors.Primary.background}]}
          textStyle={[{color: colors.Primary.subText}, typography.bodyXLargeR]}
        />
        {usersSelected && usersSelected.length > 0 && (
          <View style={styles.container_users_selected}>
            <FlatList
              horizontal
              keyExtractor={item => item.extUserId}
              data={usersSelected}
              renderItem={({item, index}) =>
                renderItemUserSelected({item, index})
              }
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={item => item.extUserId}
            renderItem={({item, index}) => renderItemUser({item, index})}
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
          />
        )}
        {loadingAddParticipants && (
          <View style={styles.loadingAddParticipants}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
    </View>
  );
};

export const PSAddMember = ({
  threadId,
  addMemberStyles,
  onBackPress,
  onAddParticipantsSuccess,
}: PSAddMemberProps) => {
  return (
    <PSAddMemberProviders
      addMemberStyles={addMemberStyles}
      onBackPress={onBackPress}
      onAddParticipantsSuccess={onAddParticipantsSuccess}>
      <PSAddMemberUI threadId={threadId} />
    </PSAddMemberProviders>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    // paddingRight: 15,
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  container_content: {
    flex: 1,
  },
  search: {marginHorizontal: (20).px(), marginVertical: (16).px()},
  container_users_selected: {
    height: 84,
    marginVertical: 12,
  },
  container_user_selected: {
    width: 74,
    marginHorizontal: 2,
    alignItems: 'center',
    flexDirection: 'column',
  },
  close: {position: 'absolute', left: 50, top: 0},
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
    paddingHorizontal: 10,
    backgroundColor: '#dcdcdc',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 48,
    margin: 12,
    height: 46,
  },
  loadingAddParticipants: {
    backgroundColor: '#00000099',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContent: {flex: 1, justifyContent: 'center'},
});
