import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import {
  PSScreenStylesProvider,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {useDebounce} from '../../../hooks';
import {IcFill3DotHorizontal} from '../../../icons';
import {
  mapMembersInThreadDtoToModel,
  PSMemberInThreadModel,
} from '../../../types';
import {
  setApiFail,
  setApiRequest,
  setApiSuccess,
  setListEnd,
} from '../../../hooks';
import {UserCard} from '../../PSUserCard';
import {
  PSMemberInThreadActionsOverlayProvider,
  PSMemberInThreadProvider,
  usePSMemberInThreadActionsContext,
  usePSMemberInThreadActionsOverlayContext,
  usePSMemberInThreadContext,
} from '../contexts';
import {PSMembersInThreadStyles} from './PSMembersInThreadStyles';
import {PSActionBar} from '../../PSActionBar';
import {PSSearch} from '../../PSSearch';
import {
  PSMessageCurrentThreadProvider,
  usePSMessageCurrentThreadContext,
} from '../../messages';
import {PSCommonEmptyState} from '../../PSCommonEmptyState';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';
import {PSRoleThreadType} from '@communi/chat-api-client-typescript';

type PSMembersInThreadProps = {
  threadId: string;
  membersInThreadStyles?: PSMembersInThreadStyles;
  allowChatWithUserOption?: boolean;
  onBackPress?: null | (() => void);
  onAddMemberPress?: null | (() => void);
  onChatWithUserPress?: null | ((userId: string) => void);
  onRemoveParticipantsSuccess?: null | (() => void);
  onCompleteLeaveThread?: null | (() => void);
};

export const PSMembersInThread = ({
  threadId,
  membersInThreadStyles,
  allowChatWithUserOption,
  onBackPress,
  onAddMemberPress,
  onChatWithUserPress,
  onRemoveParticipantsSuccess,
  onCompleteLeaveThread,
}: PSMembersInThreadProps) => {
  return (
    <PSScreenStylesProvider styles={membersInThreadStyles}>
      <PSMessageCurrentThreadProvider
        targetThreadId={threadId}
        targetUserId={undefined}>
        <PSMemberInThreadProvider threadId={threadId}>
          <PSMemberInThreadActionsOverlayProvider
            threadId={threadId}
            allowChatWithUserOption={allowChatWithUserOption}
            onPressChatWithUser={onChatWithUserPress}
            onRemoveParticipantsSuccess={onRemoveParticipantsSuccess}
            onCompleteLeaveThread={onCompleteLeaveThread}>
            <PSMembersInThreadScreen
              threadId={threadId}
              allowChatWithUserOption={allowChatWithUserOption}
              onBackPress={onBackPress}
              onAddMemberPress={onAddMemberPress}
            />
          </PSMemberInThreadActionsOverlayProvider>
        </PSMemberInThreadProvider>
      </PSMessageCurrentThreadProvider>
    </PSScreenStylesProvider>
  );
};

const PSMembersInThreadScreen = ({
  threadId,
  allowChatWithUserOption,
  onBackPress,
  onAddMemberPress,
}: PSMembersInThreadProps) => {
  const {translator} = usePSTranslationContext();
  const currentThread = usePSMessageCurrentThreadContext();
  const {colors, typography} = usePSDesignSystemContext();
  const [keySearchUser, setKeySearchUser] = useState('');
  const debouncedValue = useDebounce<string>(keySearchUser, 500);

  const [page, setPage] = useState(1);
  // const [state, dispatch] = useReducer(userReducers, initialState);
  const {dispatch} = usePSMemberInThreadActionsContext();
  const {state} = usePSMemberInThreadContext();

  const {loading, moreLoading, data, isListEnd} = state;

  const chatApiClient = usePSChatApiClientContext();

  const {show} = usePSMemberInThreadActionsOverlayContext();

  const isHasAddMemberPermission = React.useMemo(() => {
    return currentThread?.getPermissionByRole()?.addMember;
  }, [currentThread]);

  const searchUsers = async () => {
    if (!chatApiClient) {
      return;
    }
    dispatch(setApiRequest(page));

    try {
      const searchUsersResponse =
        await chatApiClient.searchApi.searchMembersInThread(
          keySearchUser,
          page,
          20,
          1,
          threadId,
        );
      const users = searchUsersResponse.data;

      if (users && users.length > 0) {
        dispatch(setApiSuccess(mapMembersInThreadDtoToModel(users)));
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

  const rightContentItemUser = React.useCallback(
    (item: PSMemberInThreadModel) => {
      return allowChatWithUserOption === false &&
        currentThread?.role === PSRoleThreadType.MEMBER ? null : (
        <PSDebouncedPressable
          onPress={() => {
            show(item);
          }}>
          <IcFill3DotHorizontal width={20} height={20} fill="#73787E" />
        </PSDebouncedPressable>
      );
    },
    [allowChatWithUserOption, currentThread?.role, show],
  );

  const renderItemUser = useCallback(
    ({item, index}: {item: PSMemberInThreadModel; index: number}) => {
      return (
        <UserCard
          user={item}
          isShowCheckBox={false}
          index={index}
          RightContent={() => {
            return rightContentItemUser(item);
          }}
          role={item.role}
        />
      );
    },
    [rightContentItemUser],
  );

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

  const rightContent = React.useCallback(() => {
    return (
      <PSDebouncedPressable
        style={styles.rightContent}
        onPress={onAddMemberPress}>
        <Text
          style={[
            typography.headingMediumS,
            {
              color: colors.Primary.subText,
            },
          ]}>
          {translator('ps_add')}
        </Text>
      </PSDebouncedPressable>
    );
  }, [colors.Primary.subText, onAddMemberPress, translator, typography.headingMediumS]);

  return (
    <View style={styles.container}>
      <PSActionBar
        titleText={translator('ps_member_in_thread_header')}
        RightContent={isHasAddMemberPermission ? rightContent : undefined}
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
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{flexGrow: 1}}
            data={data}
            keyExtractor={(item, index) => item.extUserId + '' + index}
            renderItem={({item, index}) => renderItemUser({item, index})}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <PSCommonEmptyState
                textStyle={[{color: colors.Primary.subText}, typography.bodyMediumR]}
              />
            }
            onEndReachedThreshold={0.2}
            onEndReached={fetchMoreData}
            keyboardDismissMode={'on-drag'}
            keyboardShouldPersistTaps={'handled'}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container_content: {
    flex: 1,
    // padding: 12,
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
    height: 46,
    paddingHorizontal: 10,
    backgroundColor: '#dcdcdc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    fontSize: 16,
    color: 'green',
  },
  rightContent: {flex: 1, justifyContent: 'center'},
});
