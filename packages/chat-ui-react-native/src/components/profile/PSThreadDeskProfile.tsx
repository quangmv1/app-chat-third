import React, {PropsWithChildren} from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {
  PSScreenStylesProvider,
  useObject,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../context';
import {PSDeviceEntity, PSThreadEntity} from '../../types';
import {psLogger} from '../../utils';
import {PSActionBar} from '../PSActionBar';
import {PSMessageCurrentThreadProvider} from '../messages';
import {ActionThreadsProvider} from '../threads';
import {PSThreadDeskProfileStyles} from './PSThreadDeskProfileStyles';
import {PSThreadProfileInfo} from './components';
import {
  PSChangeThreadProfileProvider,
  PSThreadProfileNavigationProvider,
  PSThreadProfileProvider,
  usePSThreadProfileNavigationContext,
} from './contexts';
import {ThreadInfoUserChatWithBotProvider} from './contexts';
import {PSThreadDeskProfileInfo} from './desk';

type PSThreadDeskProfileProps = {
  threadId?: string;
  threadProfileStyles?: PSThreadDeskProfileStyles;
  onBackPress?: null | (() => void);
  onAddMemberPress?: null | (() => void);
  onViewMessage?: null | ((messageId: number) => void);
};

const PSThreadDeskProfileProviders = ({
  threadId,
  threadProfileStyles,
  onBackPress,
  onAddMemberPress,
  onViewMessage,
  children,
}: PropsWithChildren<PSThreadDeskProfileProps>) => {
  return (
    <PSThreadProfileNavigationProvider
      onBackPress={onBackPress}
      onPressAddMember={onAddMemberPress}
      onViewMessage={onViewMessage}>
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

export const PSThreadDeskProfile = ({
  threadId,
  threadProfileStyles,
  onBackPress,
  onAddMemberPress,
  onViewMessage,
}: PSThreadDeskProfileProps) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const fetchThreadById = async (id: string | undefined) => {
    if (chatApiClient) {
      try {
        if (id) {
          const response = await chatApiClient.threadApi.fetchThreadById(id, [
            'tags,tag_categories',
          ]);
          return response.data;
        } else {
          return undefined;
        }
      } catch (e) {
        psLogger.error('PSThreadDeskProfile: fetchThreadById ', e);
        return undefined;
      }
    } else {
      return undefined;
    }
  };

  const myThread = useObject(PSThreadEntity, threadId);
  const fetAllTagCategory = async () => {
    if (chatApiClient) {
      try {
        const response = await chatApiClient.tagCategoryApi.fetAllTagCategory();
        const tagCateDto = response.data;
        if (tagCateDto && tagCateDto.length) {
          const tagCategoriesDto = tagCateDto.filter(val => {
            return !myThread?.tagCategories.find(val2 => {
              return val.id === val2.id;
            });
          });
          realm.write(() => {
            // @ts-ignore
            myThread?.tagCategories.push(...tagCategoriesDto);
          });
        }
        return response.data;
      } catch (e) {
        psLogger.error('PSThreadDeskProfile: fetAllTagCategory ', e);
        return undefined;
      }
    } else {
      return undefined;
    }
  };

  React.useEffect(() => {
    if (chatApiClient) {
      const fetch = async () => {
        const threadDto = await fetchThreadById(threadId);
        if (threadDto) {
          threadDto.tag_categories = []; // gán trống để lấy data từ fetAllTagCategory
          const deviceId = PSDeviceEntity.get(realm);
          realm.write(() => {
            PSThreadEntity.createOrUpdate(
              realm,
              PSThreadEntity.mapFromDto(
                deviceId,
                chatApiClient.userId,
                threadDto,
              ),
            );
          });
          fetAllTagCategory();
        }
      };

      fetch();
    }
  }, [chatApiClient, realm, threadId]);

  return (
    <PSThreadDeskProfileProviders
      threadId={threadId}
      threadProfileStyles={threadProfileStyles}
      onBackPress={onBackPress}
      onAddMemberPress={onAddMemberPress}
      onViewMessage={onViewMessage}>
      <ThreadInfoUserChatWithBotProvider>
        <PSThreadDeskProfileScreenUI />
      </ThreadInfoUserChatWithBotProvider>
    </PSThreadDeskProfileProviders>
  );
};

const PSThreadDeskProfileScreenUI = () => {
  const {colors} = usePSDesignSystemContext();

  return (
    <View style={{flex: 1}}>
      <PSThreadDeskProfileActionBar />
      <View style={[styles.container, {backgroundColor: colors.Primary.background}]}>
        {/* =====Thread avatar, name, description ===== */}
        <PSThreadProfileInfo />

        {/* ========Thread Desk Profile========= */}
        <PSThreadDeskProfileInfo />
      </View>
    </View>
  );
};

const PSThreadDeskProfileActionBar = React.memo(
  () => {
    const {translator} = usePSTranslationContext();

    const {onBackPress} = usePSThreadProfileNavigationContext();

    return (
      <PSActionBar
        titleText={translator('ps_information')}
        onBackPress={onBackPress}
      />
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

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
