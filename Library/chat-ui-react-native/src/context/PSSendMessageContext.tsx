import {
  PSCreateMessageBodyMetadataRequestDto,
  PSMessageMetadataType,
  PSResponseError,
  PSUploadDataDto,
  PSUploadRequestDto,
  PSUserBlockStatus,
  mapUploadDataDtoToCreateMessageBodyMetadataRequestDto,
} from '@communi/chat-api-client-typescript';
import cloneDeep from 'lodash.clonedeep';
import React, { PropsWithChildren } from 'react';
import { useDeepCompareMemoize, useIsMountedRef } from '../hooks';
import {
  PSDeviceEntity,
  PSMessageEntity,
  PSMessageFileEntity,
  PSMessageFileModel,
  PSMessageJsonPayloadEntity,
  PSMessageMediaEntity,
  PSMessageMediaModel,
  PSMessagePollEntity,
  PSMessagePollModel,
  PSMessagePreviewLinkEntity,
  PSMessagePreviewLinkModel,
  PSMessageSessionEntity,
  PSMessageSessionModel,
  PSMessageStickerEntity,
  PSStickerModel,
  PSThreadEntity,
  PSUserEntity,
  mapMessagePreviewLinkModelToEntity,
} from '../types';
import {
  BLOCKED_BY_PARTNER,
  DONT_HAVE_PERMISSION_CALL_API,
  PSBusEvent,
  PSEventBus,
  createFormData,
  psLogger,
} from '../utils';
import { usePSChatApiClientContext } from './PSChatApiClientContext';
import { useRealm } from './PSRealmContext';

type SendMessagePayload = {
  threadId: string;
  text?: string;
  media?: PSMessageMediaModel[];
  files?: PSMessageFileModel[];
  messageIdToReply?: number;
  messageIdToEdit?: number;
  previewLink?: PSMessagePreviewLinkModel;
  mentionIds?: string[];
  poll?: PSMessagePollModel;
  postback?: string; // reply chat-bot
  sticker?: PSStickerModel;
  session?: PSMessageSessionModel;
  jsonPayload?: string;
  customName?: string;
};

type PSSendMessageContextValue = {
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  sendMessageLocal: (payload: SendMessagePayload) => Promise<void>;
  retrySendMessage: (threadId: string, primaryKey: string) => Promise<void>;
};

const PSSendMessageContext = React.createContext(
  {} as PSSendMessageContextValue,
);

type PSSendMessageUploadProgressContextValue = {
  uploadProgress: Record<string, number>;
};

const PSSendMessageUploadProgressContext = React.createContext(
  {} as PSSendMessageUploadProgressContextValue,
);

export const PSSendMessageProvider = ({ children }: PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const isMounted = useIsMountedRef();

  const [uploadProgress, setUploadProgress] = React.useState<
    Record<string, number>
  >({});

  const uploadFile = async (index: number, file: PSUploadRequestDto) => {
    if (!chatApiClient) {
      throw new Error('chatApiClient = undefined');
    }

    const handleUploadProgress = (progressEvent: any) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );

      if (isMounted.current) {
        setUploadProgress(prev => {
          const fileId = file.id;
          if (fileId) {
            const percent = prev[fileId];
            // 5% 1 lần thì mới fire event
            if (
              percent &&
              percentCompleted < 100 &&
              (percent === 100 || percentCompleted - percent < 5)
            ) {
              return prev;
            } else {
              const newRecord = cloneDeep(prev);
              newRecord[fileId] = Math.min(percentCompleted, 100);
              return newRecord;
            }
          } else {
            return prev;
          }
        });
      }
    };

    let uploadData: PSUploadDataDto | undefined;
    let metadataType: PSMessageMetadataType;

    if (file.type === 'video') {
      metadataType = PSMessageMetadataType.VIDEO;
      const response = await chatApiClient.uploadApi.uploadVideo(
        createFormData('video', [file]),
        handleUploadProgress,
        file.size,
      );
      uploadData = response.data;
    } else if (file.type === 'image') {
      metadataType = PSMessageMetadataType.IMAGE;
      const response = await chatApiClient.uploadApi.uploadImage(
        createFormData('image', [file]),
        handleUploadProgress,
        file.size,
      );
      uploadData = response.data;
    } else {
      metadataType = PSMessageMetadataType.FILE;
      const response = await chatApiClient.uploadApi.uploadFile(
        createFormData('file', [file]),
        handleUploadProgress,
        file.size,
      );
      uploadData = response.data;
    }

    if (!uploadData) {
      throw new Error('Upload response data is null');
    }

    if (!uploadData.width || !uploadData.height) {
      uploadData!.width = file.width;
      uploadData!.height = file.height;
    }

    // dùng cho send message video, upload service ko trả về duration
    if (file.type === 'video') {
      uploadData.duration = file.duration;
    }

    setUploadProgress(prev => {
      const fileId = file.id;
      if (fileId) {
        const newRecord = cloneDeep(prev);
        newRecord[fileId] = 100;
        return newRecord;
      } else {
        return prev;
      }
    });

    return {
      index: index,
      value: uploadData,
      type: metadataType,
    };
  };

  const uploadMultipleFiles = async (files: PSUploadRequestDto[]) => {
    const promises = files.map((file, index) => uploadFile(index, file));
    const results = await Promise.all(promises);
    return results
      .sort(item => item.index)
      .map(item =>
        mapUploadDataDtoToCreateMessageBodyMetadataRequestDto(
          item.value,
          item.type,
        ),
      );
  };

  const createMessageRemote = React.useCallback(
    async (threadId: string, message: PSMessageEntity) => {
      if (!chatApiClient) {
        return;
      }

      let mediaMetadata: PSCreateMessageBodyMetadataRequestDto[] | undefined;

      if (message.body?.media) {
        try {
          const mediaUploadRequets = message.body.media.map<PSUploadRequestDto>(
            item => PSMessageMediaEntity.mapToUploadRequestDto(item),
          );
          mediaMetadata = await uploadMultipleFiles(mediaUploadRequets);
        } catch (e) {
          psLogger.error('PSSendMessageProvider: uploadMultipleMedia ', e);
        }
      }

      if (!isMounted.current) {
        return;
      }

      let filesMetadata: PSCreateMessageBodyMetadataRequestDto[] | undefined;

      if (message.body?.files) {
        try {
          const fileUploadRequests = message.body.files.map<PSUploadRequestDto>(
            item => PSMessageFileEntity.mapToUploadRequestDto(item),
          );
          filesMetadata = await uploadMultipleFiles(fileUploadRequests);
        } catch (e) {
          psLogger.error('PSSendMessageProvider: uploadMultipleFiles ', e);
        }
      }

      if (!isMounted.current) {
        return;
      }

      const previewLinkMetadata = PSMessagePreviewLinkEntity.mapToRequestDto(
        message.body?.previewLink,
      );

      const pollMetadata = PSMessagePollEntity.mapToRequestDto(
        message.body?.poll,
      );

      const stickerMetadata = PSMessageStickerEntity.mapToRequestDto(
        message.body?.sticker,
      );

      const sessionMetadata = PSMessageSessionEntity.mapToRequestDto(
        message.body?.session,
      );

      const jsonPayloadMetadata = PSMessageJsonPayloadEntity.mapToRequestDto(
        message.body?.jsonPayload,
      );

      let messageId: number | undefined;

      // 5. send message to remote
      try {
        if (message.body?.media && !mediaMetadata) {
          throw new Error('MessagePayload has media but upload failed');
        }

        if (message.body?.files && !filesMetadata) {
          throw new Error('MessagePayload has files but upload failed');
        }

        const metadata: PSCreateMessageBodyMetadataRequestDto[] = [];

        if (mediaMetadata) {
          metadata.push(...mediaMetadata);
        }

        if (filesMetadata) {
          metadata.push(...filesMetadata);
        }

        if (previewLinkMetadata) {
          metadata.push(previewLinkMetadata);
        }

        if (pollMetadata) {
          metadata.push(pollMetadata);
        }

        if (stickerMetadata) {
          metadata.push(stickerMetadata);
        }

        if (sessionMetadata) {
          metadata.push(sessionMetadata);
        }

        if (jsonPayloadMetadata) {
          metadata.push(jsonPayloadMetadata);
        }

        if (message.isValid()) {
          realm.write(() => {
            message.status = 'sent';
          });
        }

        const remoteMessage = await chatApiClient.messageApi.createMessage(
          threadId,
          {
            request_id: message.requestId,
            body: {
              text: message.body?.text,
              metadata: metadata,
              mention_ids: [...(message.body?.mentionIds ?? [])],
              reply_to_msg_id: message.body?.repliedMessage?.id,
              postback: message.body?.postback,
            },
          },
        );

        if (remoteMessage.data?.message_id) {
          messageId = remoteMessage.data.message_id;
        }
      } catch (e) {
        if (
          e &&
          e instanceof PSResponseError &&
          e.http_code === 403 &&
          e.response?.data?.message_code === DONT_HAVE_PERMISSION_CALL_API
        ) {
          PSEventBus.getInstance().dispatch(PSBusEvent.LEAVE_THREAD, threadId);
        } else if (
          e &&
          e instanceof PSResponseError &&
          e.http_code === 403 &&
          e.response?.data?.message_code === BLOCKED_BY_PARTNER
        ) {
          // TH bị partner block k gửi được message
          realm.write(() => {
            PSThreadEntity.getFirstById(realm, threadId)?.updateBlockStatus(
              PSUserBlockStatus.BLOCKED_BY_PARTNER,
            );
          });
        }
        psLogger.error('PSSendMessageProvider: createMessage => ', e);
      }

      // 6. update lại messageId ở cache theo clientId
      try {
        if (message.isValid()) {
          const thread = PSThreadEntity.getFirstById(realm, threadId);

          realm.write(() => {
            if (messageId) {
              message.id = messageId;
            } else {
              message.status = 'error';
            }

            if (thread) {
              thread.updateLastMessage(message);
              thread.markSeen(message.id);
            }
          });

          PSEventBus.getInstance().dispatch(PSBusEvent.NEW_MESSAGE, message);
        }
      } catch (e) {
        psLogger.error('PSSendMessageProvider: updateMessage => ', e);
      }
    },
    [chatApiClient, realm],
  );

  const handleJoinSubThread = React.useCallback(
    (threadId: string) => {
      const thread = PSThreadEntity.getFirstById(realm, threadId);
      if (thread?.isValid()) {
        const isSubthread =
          thread?.parentId &&
          thread?.parentId !== '0' &&
          thread?.originalMessageId !== 0;
        if (isSubthread) {
          realm.write(() => {
            thread?.updateIsJoined(true);
          });
        }
      }
    },
    [realm],
  );

  const createMessage = React.useCallback(
    async (payload: SendMessagePayload, isLocalOnly: boolean = false) => {
      if (!chatApiClient) {
        return;
      }

      const me = PSUserEntity.getFirstByExtUserId(realm, chatApiClient.userId);

      if (!me) {
        psLogger.error('PSSendMessageProvider: me = undefined');
        return;
      }

      // 1. tạo requestId để update messageId sau khi sendMessage thành công
      const deviceId = PSDeviceEntity.get(realm);
      const requestId = PSMessageEntity.createRequestId(deviceId);

      const thread = PSThreadEntity.getFirstById(realm, payload.threadId);

      if (!thread) {
        psLogger.error('PSSendMessageProvider: thread = undefined');
        return;
      }

      const messageToReply = payload.messageIdToReply
        ? PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
          realm,
          payload.threadId,
          payload.messageIdToReply,
        )
        : undefined;

      // 3. tạo messageId tạm thời
      // message đầu tiên của chat 1-1 với target = user_id thì sẽ là 0 nên sẽ ko lưu
      const tempNextMessageId = thread.lastMessage
        ? thread.lastMessage.id
        : PSMessageEntity.FIRST_MESSAGE_ID;

      let messageToSend: PSMessageEntity | undefined;

      const media = payload.media?.map<PSMessageMediaEntity>(item =>
        PSMessageMediaEntity.mapFromModel(item),
      );

      if (media && media.length) {
        // bắt đầu download set luôn 1% để UI thay đổi
        setUploadProgress(prev => {
          const newRecord = cloneDeep(prev);
          media!.forEach(item => (newRecord[item.id!] = 1));
          return newRecord;
        });
      }

      const files = payload.files?.map<PSMessageFileEntity>(item =>
        PSMessageFileEntity.mapFromModel(item),
      );

      if (files && files.length) {
        // bắt đầu download set luôn 1% để UI thay đổi
        setUploadProgress(prev => {
          const newRecord = cloneDeep(prev);
          files!.forEach(item => (newRecord[item.id!] = 1));
          return newRecord;
        });
      }

      // 4. save message to cache
      try {
        realm.write(() => {
          messageToSend = PSMessageEntity.createOrUpdate(realm, {
            primaryKey: PSMessageEntity.generatePrimaryKey(
              deviceId,
              chatApiClient.userId,
              payload.threadId,
              tempNextMessageId,
              chatApiClient.userId,
              requestId,
            ),
            id: tempNextMessageId,
            requestId: requestId!,
            threadId: payload.threadId,
            sender: me,
            body: {
              text: payload.text,
              media: media,
              files: files,
              repliedMessage: messageToReply,
              previewLink: mapMessagePreviewLinkModelToEntity(
                payload.previewLink,
              ),
              poll: PSMessagePollEntity.mapFromModel(payload.poll),
              mentionIds: (payload.mentionIds ?? []) as unknown,
              postback: payload.postback,
              sticker: PSMessageStickerEntity.mapFromStickerModel(
                payload.sticker,
              ),
              session: PSMessageSessionEntity.mapFromSessionModel(
                payload.session,
              ),
              jsonPayload: PSMessageJsonPayloadEntity.mapFromJsonPayloadModel(
                payload.jsonPayload,
                payload.customName,
              ),
            },
            createdAt: new Date().getTime(),
            status: 'sending',
          } as unknown as PSMessageEntity);

          psLogger.error(`messageToSend = ${JSON.stringify(messageToSend)}`);

          thread.updateLastMessage(messageToSend);
          thread.markSeen(messageToSend.id);
        });
      } catch (e) {
        psLogger.error('PSSendMessageProvider: saveMessage => ', e);
        return;
      }
      // tạm thời nếu là subthread mà chưa join thì set bằng join
      handleJoinSubThread(payload.threadId);

      if (messageToSend) {
        try {
          PSEventBus.getInstance().dispatch(
            PSBusEvent.NEW_MESSAGE,
            messageToSend,
          );
          !isLocalOnly &&
            (await createMessageRemote(payload.threadId, messageToSend));
        } catch (e) {
          psLogger.error('PSSendMessageProvider: sendMessageRemote => ', e);
        }
      }
    },
    [chatApiClient, realm, createMessageRemote],
  );

  const editMessageRemote = React.useCallback(
    async (threadId: string, message: PSMessageEntity) => {
      if (!chatApiClient || !message.body) {
        return;
      }
      try {
        const metadata: PSCreateMessageBodyMetadataRequestDto[] = [];

        const previewLinkMetadata = PSMessagePreviewLinkEntity.mapToRequestDto(
          message.body?.previewLink,
        );

        if (previewLinkMetadata) {
          metadata.push(previewLinkMetadata);
        }

        if (message.body?.media.length) {
          metadata.push(
            ...message.body.media
              .filter(item => item.path && item.bucket)
              .map(item => PSMessageMediaEntity.mapToRequestDto(item)),
          );
          const mediaMetadata = await uploadMultipleFiles(
            message.body.media
              .filter(item => !item.path || !item.bucket)
              .map<PSUploadRequestDto>(item =>
                PSMessageMediaEntity.mapToUploadRequestDto(item),
              ),
          );

          metadata.push(...mediaMetadata);
        }

        if (!isMounted.current) {
          return;
        }

        if (message.body?.files.length) {
          metadata.push(
            ...message.body.files
              .filter(item => item.path && item.bucket)
              .map(item => PSMessageFileEntity.mapToRequestDto(item)),
          );
          const filesMetadata = await uploadMultipleFiles(
            message.body.files
              .filter(item => !item.path || !item.bucket)
              .map<PSUploadRequestDto>(item =>
                PSMessageFileEntity.mapToUploadRequestDto(item),
              ),
          );

          metadata.push(...filesMetadata);
        }

        if (!isMounted.current) {
          return;
        }

        const response = await chatApiClient.messageApi.editMessage(
          threadId,
          message.id,
          {
            request_id: message.requestId,
            body: {
              text: message.body.text,
              mention_ids: [...message.body.mentionIds],
              metadata: metadata,
            },
          },
        );
        if (response) {
          psLogger.error(
            `PSSendMessageProvider: response = ${JSON.stringify(response)}`,
          );
        }
      } catch (e) {
        psLogger.error('PSSendMessageProvider: editMessageRemote', e);
        realm.write(() => {
          if (message.isValid()) {
            message.status = 'error';
          }
        });
      }
    },
    [chatApiClient, realm],
  );

  const editMessage = React.useCallback(
    async (payload: SendMessagePayload) => {
      try {
        const thread = PSThreadEntity.getFirstById(realm, payload.threadId);

        if (!thread) {
          psLogger.error('PSSendMessageProvider: thread = undefined');
          return;
        }

        const message = payload.messageIdToEdit
          ? PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
            realm,
            payload.threadId,
            payload.messageIdToEdit,
          )
          : undefined;

        psLogger.error(`payload = ${JSON.stringify(payload)}`);

        if (message) {
          const newMedia =
            payload.media?.map(item =>
              PSMessageMediaEntity.mapFromModel(item),
            ) ?? [];

          const newFiles =
            payload.files?.map(item =>
              PSMessageFileEntity.mapFromModel(item),
            ) ?? [];

          realm.write(() => {
            message.editedAt = new Date().getTime();
            if (message.body) {
              message.body.text = payload.text;
              message.body.mentionIds.splice(
                0,
                message.body.mentionIds.length,
                ...(payload.mentionIds ?? []),
              );
              message.body.media.splice(
                0,
                message.body.media.length,
                ...newMedia,
              );
              message.body.files.splice(
                0,
                message.body.files.length,
                ...newFiles,
              );
              message.body.previewLink = mapMessagePreviewLinkModelToEntity(
                payload.previewLink,
              );
            }
            thread.updateLastMessage(message);
          });

          await editMessageRemote(payload.threadId, message);
        }
      } catch (e) {
        psLogger.error('PSSendMessageProvider: editMessage', e);
      }
    },
    [realm, editMessageRemote],
  );

  const sendMessage = React.useCallback(
    async (payload: SendMessagePayload) => {
      if (payload.messageIdToEdit) {
        await editMessage(payload);
      } else {
        await createMessage(payload);
      }
    },
    [createMessage, editMessage],
  );

  const sendMessageLocal = React.useCallback(
    async (payload: SendMessagePayload) => {
      await createMessage(payload, true);
    },
    [createMessage],
  );

  const retrySendMessage = React.useCallback(
    async (threadId: string, primaryKey: string) => {
      try {
        const message = PSMessageEntity.getFirstByThreadIdAndPrimaryKey(
          realm,
          threadId,
          primaryKey,
        );

        if (message) {
          if (message.editedAt) {
            await editMessageRemote(threadId, message);
          } else {
            await createMessageRemote(threadId, message);
          }
        }
      } catch (e) {
        psLogger.error('PSSendMessageProvider: retrySendMessage', e);
      }
    },
    [realm, editMessageRemote, createMessageRemote],
  );

  const sendMessageContextValue = React.useMemo<PSSendMessageContextValue>(
    () => ({
      sendMessage: sendMessage,
      sendMessageLocal: sendMessageLocal,
      retrySendMessage: retrySendMessage,
    }),
    [sendMessage, sendMessageLocal, retrySendMessage],
  );

  const uploadProgressContextValue =
    React.useMemo<PSSendMessageUploadProgressContextValue>(
      () =>
        ({
          uploadProgress: uploadProgress,
        }) as PSSendMessageUploadProgressContextValue,
      [useDeepCompareMemoize(uploadProgress)],
    );

  return (
    <PSSendMessageContext.Provider value={sendMessageContextValue}>
      <PSSendMessageUploadProgressContext.Provider
        value={uploadProgressContextValue}>
        {children}
      </PSSendMessageUploadProgressContext.Provider>
    </PSSendMessageContext.Provider>
  );
};

export const usePSSendMessageContext = () =>
  React.useContext(PSSendMessageContext);

export const usePSSendMessageUploadProgressContext = () =>
  React.useContext(PSSendMessageUploadProgressContext);
