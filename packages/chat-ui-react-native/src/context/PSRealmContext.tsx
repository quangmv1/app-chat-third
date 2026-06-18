/* eslint-disable react-native/no-inline-styles */
import {Realm, createRealmContext} from '@realm/react';
import {
  PSDeviceEntity,
  PSUserEntity,
  PSFolderEntity,
  PSThreadEntity,
  PSMessageMediaEntity,
  PSMessagePreviewLinkEntity,
  PSMessageEntity,
  PSMessageBodyEntity,
  PSMessageActionNoteEntity,
  PSMessageForwardFromEntity,
  PSMessageJsonPayloadEntity,
  PSLastMessageBodyEntity,
  PSLastMessageEntity,
  PSPinnedMessagesEntity,
  PSMessageSeenUsersEntity,
  PSMessageParticipantsEntity,
  PSMessageReactionEntity,
  PSMessageFileEntity,
  PSMessageFileSavedEntity,
  PSMessagePollEntity,
  PSMessagePollOptionEntity,
  PSThreadSettingEntity,
  PSThreadPermissionsEntity,
  PSThreadPermissionEntity,
  PSThreadScreenContextEntity,
  PSMessageChatBotQuickReplyEntity,
  PSMessageChatBotCardEntity,
  PSMessageChatBotCarouselEntity,
  PSMessageChatBotButtonEntity,
  PSMessageChatBotButtonActionEntity,
  PSMessageChatBotMenuEntity,
  PSMessageStickerEntity,
  PSStickerEntity,
  PSStickerPackageEntity,
  PSTagEntity,
  PSMessageSessionEntity,
  PSTagCategoryEntity,
  PSThreadListPCLEntity,
  PSThreadDraftEntity,
  PSMessagePromotionEntity,
  PSPartitioningPathEntity,
  PSMessageRatingEntity,
  PSThreadPermissionByCustomerEntity,
  PSSearchThreadRecentlyEntity,
} from '../types';
import React, {PropsWithChildren} from 'react';
import {
  usePSChatApiClientContext,
  usePSChatApiClientGuestContext,
} from './PSChatApiClientContext';
import {psLogger} from '../utils';

const config: Realm.Configuration = {
  schema: [
    PSDeviceEntity,
    PSPartitioningPathEntity,
    PSFolderEntity,
    PSThreadEntity,
    PSThreadSettingEntity,
    PSThreadPermissionsEntity,
    PSThreadPermissionEntity,
    PSThreadScreenContextEntity,
    PSTagEntity,
    PSTagCategoryEntity,
    PSMessageEntity,
    PSMessageMediaEntity,
    PSUserEntity,
    PSMessageBodyEntity,
    PSMessagePreviewLinkEntity,
    PSMessageActionNoteEntity,
    PSMessageForwardFromEntity,
    PSMessageJsonPayloadEntity,
    PSLastMessageEntity,
    PSLastMessageBodyEntity,
    PSPinnedMessagesEntity,
    PSMessageSeenUsersEntity,
    PSMessageParticipantsEntity,
    PSMessageReactionEntity,
    PSMessageFileEntity,
    PSMessageFileSavedEntity,
    PSMessagePollEntity,
    PSMessagePollOptionEntity,
    PSMessageChatBotQuickReplyEntity,
    PSMessageChatBotCardEntity,
    PSMessageChatBotCarouselEntity,
    PSMessageChatBotButtonEntity,
    PSMessageChatBotButtonActionEntity,
    PSMessageChatBotMenuEntity,
    PSMessageStickerEntity,
    PSStickerEntity,
    PSStickerPackageEntity,
    PSMessageSessionEntity,
    PSThreadListPCLEntity,
    PSThreadDraftEntity,
    PSMessagePromotionEntity,
    PSMessageRatingEntity,
    PSThreadPermissionByCustomerEntity,
    PSSearchThreadRecentlyEntity,
  ],
  schemaVersion: 11,
  deleteRealmIfMigrationNeeded: true,
  onFirstOpen(realm: Realm) {
    // tạo 2 defaul folders ALL và UNREAD
    PSFolderEntity.createDefaultFolders(realm);
  },
};

export const {RealmProvider, useQuery, useObject, useRealm} =
  createRealmContext(config);

const PSPartitioningPathContext = React.createContext<string | undefined>(
  undefined,
);

export const PSRealmProvider = ({
  userId,
  deviceId,
  children,
}: PropsWithChildren<{userId?: string; deviceId: string}>) => {
  const guestId = usePSChatApiClientGuestContext().guest?.ext_user_id;
  const id = React.useMemo(() => {
    return userId ?? guestId;
  }, [userId, guestId]);
  return (
    <RealmProvider path={`communi_chat.realm`}>
      <PSPartitioningPathContext.Provider value={id}>
        <DataHandlerComponent userId={id} />
        {children}
        <CreateMyProfile deviceId={deviceId} />
      </PSPartitioningPathContext.Provider>
    </RealmProvider>
  );
};

export const usePSPartitioningPathContext = () =>
  React.useContext(PSPartitioningPathContext);

const CreateMyProfile = ({deviceId}: {deviceId: string}) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  React.useEffect(() => {
    if (chatApiClient) {
      try {
        psLogger.error(`CreateMyProfile: deviceId = ${deviceId}`);
        realm.write(() => {
          PSDeviceEntity.save(realm, deviceId);
          PSUserEntity.createOrUpdate(realm, {
            extUserId: chatApiClient.userId,
          } as PSUserEntity);
        });
      } catch (e) {
        psLogger.error('CreateMyProfile: createMyProfile', e);
      }
    }
  }, [chatApiClient, realm, deviceId]);

  return null;
};

const DataHandlerComponent = React.memo(
  ({userId}: {userId?: string}) => {
    const realm = useRealm();

    React.useEffect(() => {
      if (!userId) return;
      const partitioningUserId = PSPartitioningPathEntity.get(realm);
      if (userId === partitioningUserId) return;
      // Xoá dữ liệu khi userId thay đổi
      psLogger.info(`Xoá dữ liệu cũ cho userId: ${partitioningUserId}`);
      psLogger.info(`Update partitioning là userId: ${userId}`);
      try {
        realm.write(() => {
          PSPartitioningPathEntity.save(realm, userId);
          // realm.deleteAll();
          realm.delete(realm.objects(PSMessageEntity.schema.name));
          realm.delete(realm.objects(PSThreadEntity.schema.name));
        });
      } catch (error) {
        psLogger.error('Lỗi khi xoá dữ liệu', error);
      }
    }, [userId, realm]);

    return null; // Component không cần render gì
  },
  (prev, next) => prev.userId === next.userId,
);
