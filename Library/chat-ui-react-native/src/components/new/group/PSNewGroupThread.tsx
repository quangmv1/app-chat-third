import {
  useState,
  useEffect,
  useReducer,
  useCallback,
  PropsWithChildren,
  useRef,
} from 'react';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  userReducers,
  initialState,
  setApiRequest,
  setApiSuccess,
  setApiFail,
  setListEnd,
} from '../../../hooks/userReducers';
import {PSAvatarImage} from '../../PSAvatarImage';
import {PSSearch} from '../../PSSearch';
import {PSActionBar} from '../../PSActionBar';
import {IcFillXmarkCircle, PSIcClose24} from '../../../icons';
import {
  PSScreenStylesProvider,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {useDebounce} from '../../../hooks';
import {PSUserDto} from '@communi/chat-api-client-typescript';
import {PSUserModel, mapUsersDtoToModel} from '../../../types';
import {PSNewGroupThreadStyles} from './PSNewGroupThreadStyles';
import {
  PSNewGroupThreadNavigationProvider,
  usePSNewGroupThreadNavigationContext,
} from '../contexts';
import {UserCard} from '../../PSUserCard';
import {PSCommonEmptyState} from '../../PSCommonEmptyState';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';

type PSNewGroupThreadProps = {
  newGroupThreadStyles?: PSNewGroupThreadStyles;
  onBackPress?: null | (() => void);
  onNewNameGroupThreadPress?: (selectedUsers: PSUserModel[]) => void;
};

const PSNewGroupThreadProviders = ({
  children,
  newGroupThreadStyles,
  onBackPress,
  onNewNameGroupThreadPress,
}: PropsWithChildren<PSNewGroupThreadProps>) => {
  return (
    <PSNewGroupThreadNavigationProvider
      onBackPress={onBackPress}
      onNewNameGroupThreadPress={onNewNameGroupThreadPress}>
      <PSScreenStylesProvider styles={newGroupThreadStyles}>
        {children}
      </PSScreenStylesProvider>
    </PSNewGroupThreadNavigationProvider>
  );
};

const PSNewGroupThreadUI = () => {
  const {translator} = usePSTranslationContext();
  const {onBackPress, onNewNameGroupThreadPress} =
    usePSNewGroupThreadNavigationContext();
  const {colors, typography} = usePSDesignSystemContext();
  // const [isActive, setIsActive] = useState(false);
  const [keySearchUser, setKeySearchUser] = useState('');
  const debouncedValue = useDebounce<string>(keySearchUser, 500);
  const [page, setPage] = useState(1);
  const [state, dispatch] = useReducer(userReducers, initialState);
  const [usersSelected, setUsersSelected] = useState<PSUserModel[]>([]);
  const {loading, moreLoading, data, isListEnd, error} = state;
  const chatApiClient = usePSChatApiClientContext();

  const flatListRef = useRef(null);

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

  useEffect(() => {
    if (flatListRef.current && usersSelected.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [usersSelected]);

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

      // if (newUsersSelected && newUsersSelected.length > 0) {
      //   setIsActive(true);
      // } else {
      //   setIsActive(false);
      // }
      setUsersSelected(newUsersSelected);
    },
    [isUserChecked, setUsersSelected, usersSelected],
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
    if (!isListEnd && !moreLoading && !error) {
      setPage(page + 1);
    }
  };

  const renderItemUserSelected = useCallback(
    ({item, index}: {item: PSUserModel; index: number}) => {
      return (
        <View style={styles.container_user_selected}>
          <PSAvatarImage url={item.avatar} displayName={item.name} size={64} />
          <PSDebouncedPressable
            style={[
              styles.close,
              {
                backgroundColor: colors.Primary.linerBorder,
                borderRadius: 20,
              },
            ]}
            onPress={() => {
              handleSelectUser({
                index: index,
                item: item,
              });
            }}>
            <PSIcClose24 width={20} height={20} fill={colors.Primary.subText} />
          </PSDebouncedPressable>
          <Text
            style={[typography.bodySmallR, {color: colors.Primary.mainText}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.name.workAroundTextOneLineContainsNewLineIOS()}
          </Text>
        </View>
      );
    },
    [handleSelectUser, colors.Primary.subText, colors.Negative.normal],
  );

  const rightContent = useCallback(() => {
    return (
      <PSDebouncedPressable
        // disabled={!isActive}
        style={styles.rightContent}
        onPress={() => {
          onNewNameGroupThreadPress?.(usersSelected);
        }}>
        <Text
          style={[
            typography.headingMediumS,
            {
              color: colors.Primary.branding, // isActive ? colors.Primary.branding : colors.Neutral.n200,
            },
          ]}>
          {translator('ps_continue')}
        </Text>
      </PSDebouncedPressable>
    );
  }, [
    // isActive,
    typography.headingMediumS,
    colors.Primary.subText,
    colors.Neutral.n200,
    translator,
    onNewNameGroupThreadPress,
    usersSelected,
  ]);

  return (
    <View
      style={[styles.container, {backgroundColor: colors.Primary.background}]}>
      <PSActionBar
        titleText={translator('ps_new_thread_create_group')}
        RightContent={rightContent}
        onBackPress={onBackPress}
      />
      <PSSearch
        value={keySearchUser}
        onChangeText={newText => {
          setKeySearchUser(newText);
          setPage(1);
        }}
        placeholder={translator('ps_search')}
        placeholderTextColor={colors.Primary.disable}
        searchIconColor={colors.Primary.mainText}
        style={[styles.search, {backgroundColor: colors.Primary.white}]}
        textStyle={[{color: colors.Primary.subText}, typography.bodyXLargeR]}
        isVisibleClean={keySearchUser !== ''}
        onCleanPress={() => {
          setKeySearchUser('');
          setPage(1);
        }}
      />
      {usersSelected && usersSelected.length > 0 && (
        <View
          style={[
            styles.container_users_selected,
            {backgroundColor: colors.Primary.white},
          ]}>
          <FlatList
            ref={flatListRef}
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
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: colors.Primary.white,
            borderRadius: 8,
          }}>
          <FlatList
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
            onEndReachedThreshold={0.2}
            onEndReached={fetchMoreData}
            keyboardDismissMode={'on-drag'}
            keyboardShouldPersistTaps={'handled'}
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

export const PSNewGroupThread = ({
  newGroupThreadStyles,
  onBackPress,
  onNewNameGroupThreadPress,
}: PSNewGroupThreadProps) => {
  return (
    <PSNewGroupThreadProviders
      newGroupThreadStyles={newGroupThreadStyles}
      onBackPress={onBackPress}
      onNewNameGroupThreadPress={onNewNameGroupThreadPress}>
      <PSNewGroupThreadUI />
    </PSNewGroupThreadProviders>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  search: {marginHorizontal: (20).px(), marginVertical: (16).px()},
  container_users_selected: {
    // height: (84).px(),
    // marginVertical: (16).px(),
    marginHorizontal: (16).px(),
    marginBottom: (16).px(),
    padding: (12).px(),
    borderRadius: (8).px(),
  },
  container_user_selected: {
    width: (74).px(),
    marginStart: (16).px(),
    alignItems: 'center',
    flexDirection: 'column',
  },
  close: {position: 'absolute', left: (50).px(), top: 0},
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
  rightContent: {flex: 1, justifyContent: 'center'},
});
