import {
  PSMessageMetadataType,
  PSRoleThreadType,
} from '@communi/chat-api-client-typescript';
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Keyboard,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  PSScreenStylesProvider,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSIsDeskModeContext,
  useRealm,
} from '../../context';
import {PSDeviceEntity, PSThreadEntity} from '../../types';
import {psLogger} from '../../utils';
import {
  PSMessageCurrentThreadProvider,
  PSMessageSuggestionMentionsContextProvider,
} from '../messages';
import {
  ActionThreadsProvider,
  ThreadActionsDeleteOverlayProvider,
} from '../threads';
import {PSThreadProfileStyles} from './PSThreadProfileStyles';
import {
  PSActionThreadProfile,
  PSThreadProfileActionBar,
  PSThreadProfileBlockUser,
  PSThreadProfileDelete,
  PSThreadProfileDescription,
  PSThreadProfileInfo,
  PSThreadProfileJoinManager,
  PSThreadProfileLeave,
  PSThreadProfileManager,
  PSThreadProfileMediaCollections,
  PSThreadSettingPermission,
} from './components';
import {
  PSChangeThreadProfileProvider,
  PSThreadProfileNavigationProvider,
  PSThreadProfileProvider,
  useThreadProfileActionContext,
} from './contexts';
import {PSThreadProfileDesInputProvider} from './contexts/PSThreadProfileDesInputContext';
import {FETCH_DATA_THREAD_BY_ID_SAVE_TO_REALM} from './utils/Constants';

type PSThreadProfileProps = {
  threadId?: string;
  threadProfileStyles?: PSThreadProfileStyles;
  onBackPress?: null | (() => void);
  onAddMemberPress?: null | (() => void);
  onSearchMessagePress?: null | (() => void);
  onMembersInThreadPress?: null | (() => void);
  onLinkJoinThreadPress?: null | (() => void);
  onCompleteLeaveThread?: null | (() => void);
  onMediaCollectionPress?: null | ((type: PSMessageMetadataType) => void);
  onViewMessage?: null | ((messageId: number) => void);
  onUrlPress?: null | ((url: string) => void);
  onEmailPress?: null | ((email: string) => void);
  onPhoneNumberPress?: null | ((phoneNumber: string) => void);
  onUserPress?:
    | null
    | ((psUserId: string, currentThreadPartnerId?: string) => void);
  onSettingPermissionGroup?: null | ((userRole: PSRoleThreadType) => void);
};

const PSThreadProfileProviders = ({
  threadId,
  threadProfileStyles,
  onBackPress,
  onAddMemberPress,
  onSearchMessagePress,
  onMembersInThreadPress,
  onLinkJoinThreadPress,
  onCompleteLeaveThread,
  onMediaCollectionPress,
  onViewMessage,
  onEmailPress,
  onPhoneNumberPress,
  onUrlPress,
  onUserPress,
  onSettingPermissionGroup,
  children,
}: PropsWithChildren<PSThreadProfileProps>) => {
  return (
    <PSThreadProfileNavigationProvider
      onBackPress={onBackPress}
      onAddMemberPress={onAddMemberPress}
      onSearchMessagePress={onSearchMessagePress}
      onMembersInThreadPress={onMembersInThreadPress}
      onCompleteLeaveThread={onCompleteLeaveThread}
      onMediaCollectionPress={onMediaCollectionPress}
      onViewMessage={onViewMessage}
      onPressLinkJoinThread={onLinkJoinThreadPress}
      onEmailPress={onEmailPress}
      onPhoneNumberPress={onPhoneNumberPress}
      onUrlPress={onUrlPress}
      onUserPress={onUserPress}
      onSettingPermissionGroup={onSettingPermissionGroup}>
      <PSScreenStylesProvider styles={threadProfileStyles}>
        <ActionThreadsProvider>
          <PSMessageCurrentThreadProvider
            targetThreadId={threadId}
            targetUserId={undefined}>
            <PSThreadProfileProvider>
              <PSChangeThreadProfileProvider>
                {children}
              </PSChangeThreadProfileProvider>
            </PSThreadProfileProvider>
          </PSMessageCurrentThreadProvider>
        </ActionThreadsProvider>
      </PSScreenStylesProvider>
    </PSThreadProfileNavigationProvider>
  );
};

export const PSThreadProfile = ({
  threadId,
  threadProfileStyles,
  onBackPress,
  onAddMemberPress,
  onSearchMessagePress,
  onMembersInThreadPress,
  onLinkJoinThreadPress,
  onCompleteLeaveThread,
  onMediaCollectionPress,
  onViewMessage,
  onEmailPress,
  onPhoneNumberPress,
  onUrlPress,
  onUserPress,
  onSettingPermissionGroup,
}: PSThreadProfileProps) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const {isDeskMode} = usePSIsDeskModeContext();

  const fetchThreadById = async (id: string | undefined) => {
    if (chatApiClient) {
      try {
        if (id) {
          const response = await chatApiClient.threadApi.fetchThreadById(
            id,
            isDeskMode ? ['tags,tag_categories'] : undefined,
          );
          return response.data;
        } else {
          return undefined;
        }
      } catch (e) {
        psLogger.error('PSThreadProfile: fetchThreadById ', e);
        return undefined;
      }
    } else {
      return undefined;
    }
  };

  const fetchDataThreadByIdSaveToRealm = useCallback(async () => {
    if (!chatApiClient) return;
    const threadDto = await fetchThreadById(threadId);
    if (threadDto) {
      const deviceId = PSDeviceEntity.get(realm);
      realm.write(() => {
        PSThreadEntity.createOrUpdate(
          realm,
          PSThreadEntity.mapFromDto(deviceId, chatApiClient.userId, threadDto),
        );
      });
    }
  }, [chatApiClient, realm, threadId]);

  DeviceEventEmitter.addListener(
    FETCH_DATA_THREAD_BY_ID_SAVE_TO_REALM,
    () => {
      fetchDataThreadByIdSaveToRealm();
    },
    [fetchDataThreadByIdSaveToRealm],
  );

  React.useEffect(() => {
    fetchDataThreadByIdSaveToRealm();
  }, [fetchDataThreadByIdSaveToRealm]);

  return (
    <PSThreadProfileProviders
      threadId={threadId}
      threadProfileStyles={threadProfileStyles}
      onBackPress={onBackPress}
      onAddMemberPress={onAddMemberPress}
      onSearchMessagePress={onSearchMessagePress}
      onMembersInThreadPress={onMembersInThreadPress}
      onLinkJoinThreadPress={onLinkJoinThreadPress}
      onCompleteLeaveThread={onCompleteLeaveThread}
      onMediaCollectionPress={onMediaCollectionPress}
      onViewMessage={onViewMessage}
      onEmailPress={onEmailPress}
      onPhoneNumberPress={onPhoneNumberPress}
      onUrlPress={onUrlPress}
      onUserPress={onUserPress}
      onSettingPermissionGroup={onSettingPermissionGroup}>
      <PSThreadProfileScreenUI />
    </PSThreadProfileProviders>
  );
};

const PSThreadProfileScreenUI = () => {
  const {colors} = usePSDesignSystemContext();
  const [loading, setLoading] = useState(false);
  const refScrollView = useRef<ScrollView>(null);
  const [view, setView] = useState(false);
  const isJoin = useThreadProfileActionContext().isJoin;

  useEffect(() => {
    const susbcriptionKeyboardDidShow = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setView(true);
      },
    );
    const susbcriptionKeyboardDidHide = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setView(false);
      },
    );
    return () => {
      if (typeof susbcriptionKeyboardDidShow?.remove === 'function') {
        susbcriptionKeyboardDidShow.remove();
      }

      if (typeof susbcriptionKeyboardDidHide?.remove === 'function') {
        susbcriptionKeyboardDidHide.remove();
      }
    };
  }, []);

  return (
    <View style={{flex: 1}}>
      <PSThreadProfileActionBar />
      <ScrollView
        ref={refScrollView}
        style={[styles.container, {backgroundColor: colors.Primary.background}]}
        keyboardShouldPersistTaps={'handled'}>
        {/* =====Thread avatar, name ===== */}
        <PSThreadProfileInfo />

        {/* =====Nut them nguoi, tim tin nhan, tat thong bao===== */}
        <PSActionThreadProfile />

        {/* =====Description ===== */}
        <PSMessageSuggestionMentionsContextProvider
          isPSThreadProfileDescription>
          <PSThreadProfileDesInputProvider>
            {/* @ts-ignore */}
            <PSThreadProfileDescription refScrollView={refScrollView} />
          </PSThreadProfileDesInputProvider>
        </PSMessageSuggestionMentionsContextProvider>

        {/* =====Browsing Collections (File/Image/Video/Link)===== */}
        <PSThreadProfileMediaCollections />

        {/* ========thanh vien========= */}
        <PSThreadProfileManager />

        {/* ========Setting Permission========= */}
        <PSThreadSettingPermission />

        {/* ========link tham gia========= */}
        <PSThreadProfileJoinManager />

        {/* ========Chan nguoi dung========= */}
        <PSThreadProfileBlockUser />

        {/* ========Roi nhom========= */}
        <PSThreadProfileLeave setLoading={setLoading} />

        {/* ========Xoá cuộc hội thoại========= */}
        {isJoin ? (
          <ThreadActionsDeleteOverlayProvider>
            <PSThreadProfileDelete />
          </ThreadActionsDeleteOverlayProvider>
        ) : null}

        {view && <View style={{height: 150}} />}
      </ScrollView>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.Branding.b100} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: (16).px(),
    paddingTop: (8).px(),
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
});
