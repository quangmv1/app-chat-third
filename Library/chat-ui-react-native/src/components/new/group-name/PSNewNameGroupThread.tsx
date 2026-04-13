import React, {PropsWithChildren} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import {useState, useCallback} from 'react';
import {UserCard} from '../../PSUserCard';
import {PSActionBar} from '../../PSActionBar';
import {
  PSScreenStylesProvider,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../context';
import {
  PSUserModel,
  PSMessageEntity,
  PSThreadEntity,
  PSUserEntity,
  PSDeviceEntity,
} from '../../../types';
import {
  PSResponseError,
  PSThreadType,
} from '@communi/chat-api-client-typescript';
import {MEMBERS_INVALID, psLogger} from '../../../utils';
import {PSNewNameGroupThreadStyles} from './PSNewNameGroupThreadStyles';
import {
  PSNewNameGroupThreadNavigationProvider,
  usePSNewNameGroupThreadNavigationContext,
} from '../contexts';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';
import {PSFlashMessage} from '../../flash-message';
import {PSCheckBox} from '../../PSCheckBox';
import {PSRadioButton} from '../../PSRadioButton';

const MAX_LENGTH = 3;

type PSNewNameGroupThreadProps = {
  selectedUsers: PSUserModel[];
  newNameGroupThreadStyles?: PSNewNameGroupThreadStyles;
  onBackPress?: null | (() => void);
  onComplete?: null | ((threadId: string) => void);
};

const PSNewNameGroupThreadProviders = ({
  children,
  newNameGroupThreadStyles,
  onBackPress,
  onComplete,
}: PropsWithChildren<{
  newNameGroupThreadStyles?: PSNewNameGroupThreadStyles;
  onBackPress?: null | (() => void);
  onComplete?: null | ((threadId: string) => void);
}>) => {
  return (
    <PSNewNameGroupThreadNavigationProvider
      onBackPress={onBackPress}
      onComplete={onComplete}>
      <PSScreenStylesProvider styles={newNameGroupThreadStyles}>
        {children}
      </PSScreenStylesProvider>
    </PSNewNameGroupThreadNavigationProvider>
  );
};

const PSNewNameGroupThreadUI = ({
  selectedUsers,
}: {
  selectedUsers: PSUserModel[];
}) => {
  const {translator} = usePSTranslationContext();
  const {onBackPress, onComplete} = usePSNewNameGroupThreadNavigationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const realm = useRealm();
  const chatApiClient = usePSChatApiClientContext();
  const [nameGroup, setNameGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPrivate, setPrivate] = useState(true);

  const createThread = React.useCallback(async () => {
    if (!chatApiClient) {
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    try {
      var threadName = '';
      if (nameGroup.trim() === '') {
        threadName = selectedUsers
          .slice(0, MAX_LENGTH)
          .map(user => user.name)
          .join(', ');
        if (selectedUsers.length > MAX_LENGTH) {
          threadName =
            threadName +
            ` ${translator(
              'ps_message_seen_users_with_other_count',
              // @ts-ignore
              {
                count: selectedUsers.length - MAX_LENGTH,
              },
            )}`;
        }
      } else {
        threadName = nameGroup.trim();
      }

      const apiResponse = await chatApiClient.threadApi.createThread({
        type: PSThreadType.GROUP,
        member_ids: selectedUsers.map(user => user.extUserId),
        name: threadName,
        group_level: isPrivate ? 1 : 2,
      });

      const threadId = apiResponse.data?.thread_id;

      if (!threadId) {
        return;
      }

      const me = PSUserEntity.getFirstByExtUserId(realm, chatApiClient.userId);

      if (threadId && me) {
        const deviceId = PSDeviceEntity.get(realm);
        realm.write(() => {
          const message = PSMessageEntity.createFirstMessageInGroupThread(
            deviceId,
            chatApiClient.userId,
            realm,
            threadId,
            me,
          );
          PSThreadEntity.createGroupThread(
            realm,
            threadId,
            threadName,
            selectedUsers.length + 1,
            message,
          );
        });

        setTimeout(() => {
          onComplete?.(threadId);
        }, 1000);
      }
    } catch (e) {
      setLoading(false);
      if (e && e instanceof PSResponseError) {
        if (
          e.http_code === 400 &&
          e.response?.data?.message_code === MEMBERS_INVALID
        ) {
          PSFlashMessage.show({
            type: 'error',
            text1: `${e.response?.data?.message}`,
            position: 'bottom',
            visibilityTime: 2000,
          });
        }
      }
      psLogger.error(`PSNewNameGroupThread createThread : ${e}`);
    }
  }, [chatApiClient, nameGroup, onComplete, realm, selectedUsers, translator]);

  const renderItemUser = useCallback(
    ({item, index}: {item: PSUserModel; index: number}) => {
      return <UserCard index={index} user={item} isShowCheckBox={false} />;
    },
    [],
  );

  const rightContent = useCallback(() => {
    const isActive = nameGroup.trim() !== '';
    return (
      <PSDebouncedPressable
        disabled={!isActive}
        style={styles.rightContent}
        onPress={() => {
          createThread();
        }}>
        <Text
          style={[
            typography.headingMediumS,
            {
              color: isActive ? colors.Primary.branding : colors.Neutral.n200,
            },
          ]}>
          {translator('ps_continue')}
        </Text>
      </PSDebouncedPressable>
    );
  }, [
    typography.headingMediumS,
    colors.Primary.subText,
    translator,
    createThread,
    nameGroup,
  ]);

  return (
    <View
      style={[styles.container, {backgroundColor: colors.Primary.background}]}>
      <PSActionBar
        titleText={translator('ps_new_thread_create_group')}
        RightContent={rightContent}
        onBackPress={onBackPress}
      />
      <TextInput
        multiline
        numberOfLines={2}
        maxLength={100}
        style={[
          styles.inputName,
          {
            backgroundColor: colors.Primary.white,
            color: colors.Primary.mainText,
            // borderColor: colors.Neutral.n400,
            // textAlignVertical: 'top',
          },
          typography.bodyXXXLargeR,
          {
            lineHeight: undefined, // https://github.com/facebook/react-native/issues/33986
          },
        ]}
        value={nameGroup}
        onChangeText={newText => {
          setNameGroup(newText);
        }}
        placeholder={translator('ps_new_thread_group_named')}
        placeholderTextColor={colors.Primary.disable}
      />

      <View
        style={{
          marginHorizontal: 16,
          padding: 12,
          backgroundColor: colors.Primary.white,
          borderRadius: 8,
        }}>
        <PSDebouncedPressable
          onPress={() => {
            setPrivate(prev => !prev);
          }}
          style={{flexDirection: 'row', alignItems: 'center'}}>
          <PSRadioButton
            size={16}
            checkFillColor={colors.Branding.b300}
            uncheckBorderColor={colors.Primary.placeHolder}
            value={isPrivate}
            onValueChange={() => {
              setPrivate(prev => !prev);
            }}
          />

          <View style={{marginHorizontal: 12}}>
            <Text
              style={[
                typography.bodyXLargeS,
                {color: colors.Primary.mainText},
              ]}>
              Private
            </Text>
            <Text
              style={[typography.bodyMediumR, {color: colors.Primary.subText}]}>
              Chỉ thành viên mới có thể truy cập và tìm kiếm nhóm chat
            </Text>
          </View>
        </PSDebouncedPressable>
        <View
          style={{
            width: '100%',
            height: 1,
            backgroundColor: colors.Primary.linerBorder,
            marginVertical: 12,
          }}
        />
        <PSDebouncedPressable
          onPress={() => {
            setPrivate(prev => !prev);
          }}
          style={{flexDirection: 'row', alignItems: 'center'}}>
          <PSRadioButton
            size={16}
            checkFillColor={colors.Branding.b300}
            uncheckBorderColor={colors.Primary.placeHolder}
            value={!isPrivate}
            onValueChange={() => {
              setPrivate(prev => !prev);
            }}
          />
          <View style={{marginHorizontal: 12}}>
            <Text
              style={[
                typography.bodyXLargeS,
                {color: colors.Primary.mainText},
              ]}>
              Public
            </Text>
            <Text
              style={[typography.bodyMediumR, {color: colors.Primary.subText}]}>
              Nhóm chat mở cho tất cả mọi người có thể tìm kiếm và tham gia
            </Text>
          </View>
        </PSDebouncedPressable>
      </View>

      {selectedUsers.length == 0 ? null : (
        <View
          style={{
            backgroundColor: colors.Primary.white,
            borderRadius: 8,
            margin: 16,
            // padding: 12,
          }}>
          <Text
            style={[
              styles.text,
              {
                color: colors.Primary.subText,
              },
              typography.bodyMediumR,
            ]}>
            {translator(
              'ps_new_thread_group_named_total_users',
              // @ts-ignore
              {
                total: `${selectedUsers.length}`,
              },
            )}
          </Text>
          {selectedUsers && selectedUsers.length > 0 && (
            <FlatList
              contentContainerStyle={{flexGrow: 1}}
              data={selectedUsers}
              keyExtractor={(item, index) => item.extUserId + '' + index}
              renderItem={({item, index}) => renderItemUser({item, index})}
              keyboardDismissMode={'on-drag'}
              keyboardShouldPersistTaps={'handled'}
            />
          )}
        </View>
      )}

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
};

export const PSNewNameGroupThread = ({
  newNameGroupThreadStyles,
  selectedUsers,
  onBackPress,
  onComplete,
}: PSNewNameGroupThreadProps) => {
  return (
    <PSNewNameGroupThreadProviders
      newNameGroupThreadStyles={newNameGroupThreadStyles}
      onBackPress={onBackPress}
      onComplete={onComplete}>
      <PSNewNameGroupThreadUI selectedUsers={selectedUsers} />
    </PSNewNameGroupThreadProviders>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputName: {
    margin: (16).px(),
    borderRadius: (8).px(),
    // borderWidth: (1).px(),
    padding: (12).px(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginHorizontal: (16).px(),
    marginTop: 12,
    marginBottom: 8,
  },
  loading: {
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
