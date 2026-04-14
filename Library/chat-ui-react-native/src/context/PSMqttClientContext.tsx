import React, { PropsWithChildren } from 'react';
import { PSBusEvent, PSEventBus, getEmojiByEmojiCode, psLogger } from '../utils';
import {
  PSMessageEntity,
  PSThreadEntity,
  getPreviewContentLastMessage,
  mapUserDtoToModel,
  PSUserModel,
  PSPinnedMessagesEntity,
  PSMessageSeenUsersEntity,
  PSMessageFileEntity,
  PSMessagePollEntity,
  PSUserEntity,
  PSDeviceEntity,
  isDeletedMessage,
  PSLastMessageEntity,
  PSMessageMediaEntity,
} from '../types';
import {
  PSMqttNewMessageEventPayload,
  PSMqttEvent,
  PSMqttEventType,
  PSMqttTypingEventPayload,
  PSMqttDeleteMessageEventPayload,
  PSMqttSeenMessageEventPayload,
  PSMqttToggleNotifyThreadEventPayload,
  PSMqttPinnedThreadEventPayload,
  PSMqttReactMessagePayload,
  PSMqttEditMessageEventPayload,
  PSMqttVoteMessagePayload,
  PSMqttAddOptionPollMessagePayload,
  PSMqttLeaveThreadPayload,
  PSMqttRatingSessionThreadEventPayload,
  PSMqttAddToThreadListEventPayload,
} from '../mqtt/types';
import cloneDeep from 'lodash/cloneDeep';
import { usePSChatApiClientContext } from './PSChatApiClientContext';
import { usePSIsOnlineContext } from './PSIsOnlineContext';
import { usePSTranslationContext } from './PSTranslationContext';
import { useRealm } from './PSRealmContext';
import { PSMqttClient } from '../mqtt/mqtt';
import { PSFlashMessage } from '../components';
import {
  PSMessageActionNoteType,
  PSMessageMetadataType,
  PSThreadGroupLevelType,
  PSThreadType,
  PSUserBlockStatus,
} from '@communi/chat-api-client-typescript';
import { useAppStateListener, useIsMountedRef } from '../hooks';

const PSMqttClientConnectedContext = React.createContext<boolean>(false);

const PSMqttTypingUsersContext = React.createContext<
  Record<string, PSUserModel[]>
>({});

type PSMqttMessagesScreenTrackingContextValue = {
  enterMessagesScreen: (threadId: string) => void;
  exitMessagesScreen: (threadId: string) => void;
};

const PSMqttMessagesScreenTrackingContext =
  React.createContext<PSMqttMessagesScreenTrackingContextValue>(
    {} as PSMqttMessagesScreenTrackingContextValue,
  );

export const PSMqttClientProvider = ({
  appId,
  onFlashMessagePress,
  children,
}: PropsWithChildren<{
  appId: string;
  onFlashMessagePress?:
  | ((threadId: string, messageId?: number) => void)
  | undefined
  | null;
}>) => {
  const isMounted = useIsMountedRef();

  const isOnline = usePSIsOnlineContext();

  const [isConnected, setConnected] = React.useState(false);

  const chatApiClient = usePSChatApiClientContext();

  const [jwt, setJWT] = React.useState<string | undefined>();

  const realm = useRealm();

  const { translator } = usePSTranslationContext();

  const [mqttClient, setMqttClient] = React.useState<
    PSMqttClient | undefined
  >();

  const [superGroups, setSuperGroups] = React.useState<string[]>([]);

  const [typingUsers, setTypingUsers] = React.useState<
    Record<string, PSUserModel[]>
  >({});

  const removeTypingUserTimeoutRef = React.useRef<
    Record<string, [{ userId: string; timeout: NodeJS.Timeout }]>
  >({});

  const messagesScreenByThreadIdStack = React.useRef<string[]>([]);

  const enterMessagesScreen = React.useCallback((threadId: string) => {
    messagesScreenByThreadIdStack.current.push(threadId);
  }, []);

  const exitMessagesScreen = React.useCallback((threadId: string) => {
    // vì có thể hàm enterMessagesScreen sẽ được invoke trước khi
    // hàm exitMessagesScreen được invoke nên sẽ remove last trong stack
    const index = messagesScreenByThreadIdStack.current.findLastIndex(
      item => item === threadId,
    );
    if (index > -1) {
      messagesScreenByThreadIdStack.current.splice(index, 1);
    }
  }, []);

  const appStateIntervalIdRef = React.useRef<NodeJS.Timeout | undefined>();

  const reconnect = async () => {
    appStateIntervalIdRef.current = setInterval(async () => {
      psLogger.error('PSMqttClientProvider: onForeground try in connect');
      try {
        if (mqttClient) {
          const connected = await mqttClient.isConnected();
          if (connected) {
            clearReconnect();
          } else {
            await mqttClient.connect();
            if (await mqttClient.isConnected()) {
              clearReconnect();
            }
          }
        }
      } catch (error) {
        // không clearReconnect vì thời điểm này có thể jwt vẫn chưa được refresh
        setJWT(chatApiClient?.getJWT());
        psLogger.error('PSMqttClientProvider: reconnect failed', error);
      }
    }, 500);
  };

  const clearReconnect = () => {
    const intervalId = appStateIntervalIdRef.current;
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const handleUpdateMessageCountSubThread = React.useCallback(
    (payload: PSMqttNewMessageEventPayload | undefined) => {
      // eslint-disable-next-line curly
      if (!payload) return;
      // Handle trường hợp tăng message count cho sub thread
      const parent_id = payload.thread.parent_id;
      const original_message_id = payload.thread.original_message_id;
      if (parent_id && parent_id !== '0' && original_message_id) {
        const originMessage = PSMessageEntity.getFirstByThreadIdAndMessageId(
          realm,
          parent_id,
          original_message_id,
        );
        realm.write(() => {
          if (typeof originMessage?.messageSubThreadCount === 'number') {
            // ở những tin nhắn tiếp theo đã có messageSubThreadCount thì tăng thêm 1
            originMessage?.updateMessageSubThreadCount(
              originMessage.messageSubThreadCount + 1,
            );
          } else {
            // ở lần đầu khởi tạo sẽ chưa có messageSubThreadCount gán mặc định là 1.
            originMessage?.updateMessageSubThreadCount(1);
          }
          originMessage?.updateMessageSubThreadId(payload.thread.id);
        });
      }
    },
    [realm],
  );

  const handleUnBlockedUser = React.useCallback(
    (payload: PSMqttNewMessageEventPayload | undefined) => {
      // Nếu đang bị partner chặn, và nhận được tin nhắn của partner từ thread 1-1 với partner thì update bỏ chặn
      // eslint-disable-next-line curly
      if (!payload) return;
      const threadCached = PSThreadEntity.getFirstById(
        realm,
        payload.thread.id,
      );
      if (
        threadCached?.blockStatus === PSUserBlockStatus.BLOCKED_BY_PARTNER &&
        threadCached?.partner?.extUserId === payload.message.sender.ext_user_id
      ) {
        realm.write(() => {
          threadCached.updateBlockStatus(PSUserBlockStatus.NO_BLOCK);
        });
      }
    },
    [realm],
  );

  const onForeground = React.useCallback(() => {
    psLogger.error('PSMqttClientProvider: onForeground');
    clearReconnect();
    reconnect();
  }, [mqttClient]);

  const onBackground = React.useCallback(() => {
    psLogger.error('PSMqttClientProvider: onBackground');
    clearReconnect();
  }, []);

  useAppStateListener(onForeground, onBackground);

  React.useEffect(() => {
    clearReconnect();
    if (isOnline) {
      reconnect().then(() => { });
    }
  }, [isOnline]);

  const onTypingEvent = React.useCallback(
    (event: PSMqttEvent) => {
      let payload: PSMqttTypingEventPayload | undefined;
      if (!chatApiClient || event.retain) {
        return;
      }
      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttTypingEventPayload;
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onTypingEvent', e);
      }
      if (payload) {
        const threadId = payload!.thread_id;
        const user = mapUserDtoToModel(payload!.actor);
        if (user.extUserId === chatApiClient.userId) {
          return;
        }
        PSEventBus.getInstance().dispatch(
          PSBusEvent.USER_TYPING,
          user.extUserId,
        );

        // clear timeout typing
        const threadUsersTyping = removeTypingUserTimeoutRef.current[threadId];
        const indexOfTimeoutByUserId = threadUsersTyping?.findIndex(
          item => item.userId === user.extUserId,
        );
        if (
          threadUsersTyping &&
          indexOfTimeoutByUserId !== undefined &&
          indexOfTimeoutByUserId > -1
        ) {
          const userTimeout = threadUsersTyping[indexOfTimeoutByUserId]!;
          clearTimeout(userTimeout.timeout);
          threadUsersTyping.splice(indexOfTimeoutByUserId, 1);
        }

        setTypingUsers(prev => {
          const _typingUsers = cloneDeep(prev);
          const users = _typingUsers[threadId];
          if (users && users.length) {
            if (users.some(item => item.extUserId === user.extUserId)) {
              return prev;
            } else {
              users.push(user);
            }
          } else {
            _typingUsers[threadId] = [user];
          }
          return _typingUsers;
        });

        // cache timeout typing
        const timeout = setTimeout(() => {
          setTypingUsers(prev => {
            const _typingUsers = cloneDeep(prev);
            const users = _typingUsers[threadId];
            if (users && users.length) {
              _typingUsers[threadId] = users.filter(
                item => item.extUserId !== user.extUserId,
              );
            }
            return _typingUsers;
          });
        }, 1500);

        if (threadUsersTyping) {
          threadUsersTyping.push({ userId: user.extUserId, timeout: timeout });
        } else {
          removeTypingUserTimeoutRef.current[threadId] = [
            { userId: user.extUserId, timeout: timeout },
          ];
        }
      }
    },
    [chatApiClient],
  );

  const onCreateMessageEvent = React.useCallback(
    (event: PSMqttEvent) => {
      if (!chatApiClient) {
        return;
      }
      let payload: PSMqttNewMessageEventPayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttNewMessageEventPayload;
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onCreateMessageEvent.parse', e);
        return;
      }

      if (payload && !event.retain) {
        handleUnBlockedUser(payload);
        handleUpdateMessageCountSubThread(payload);
        // nếu chính mình leave group thì xoá thread ở local
        if (
          payload.message.sender.ext_user_id === chatApiClient.userId &&
          payload.message.body?.action_note &&
          payload.message.body.action_note.type ===
          PSMessageActionNoteType.LEAVE_GROUP
        ) {
          try {
            PSThreadEntity.deleteThread(realm, payload!.thread.id);
          } catch (error) {
            psLogger.error(
              'PSMqttClientProvider: onCreateMessageEvent.leaveGroup',
              error,
            );
          }
          return;
        }

        let cachedThread: PSThreadEntity | undefined;

        let message: PSMessageEntity | undefined;

        const deviceId = PSDeviceEntity.get(realm);

        try {
          message = PSMessageEntity.getFirstByThreadIdAndPrimaryKey(
            realm,
            payload.thread.id,
            PSMessageEntity.generatePrimaryKey(
              deviceId,
              chatApiClient.userId,
              payload.thread.id,
              payload.message.id,
              payload.message.sender.ext_user_id,
              payload.message.request_id,
            ),
          );

          if (message && message.status === 'sent') {
            // message send trên device bởi chính mình thì
            // chỉ update file để cập nhật remote url
            // hoặc nếu là msg POLL_VOTE thì update id cho poll và options
            if (message.body && payload.message.body) {
              const files = payload.message.body.metadata?.filter(
                item => item.type === PSMessageMetadataType.FILE,
              );
              if (files && files.length) {
                realm.write(() => {
                  message!.body!.files.splice(0, message!.body!.files.length);
                  message!.body!.files.push(
                    ...(files?.mapNotNull(item =>
                      PSMessageFileEntity.mapFromDto(item),
                    ) ?? []),
                  );
                });
              }

              const media = payload.message.body.metadata?.filter(
                item => item.type === PSMessageMetadataType.IMAGE || item.type === PSMessageMetadataType.VIDEO,
              );
              if (media && media.length) {
                realm.write(() => {
                  message!.body!.media.splice(0, message!.body!.media.length);
                  message!.body!.media.push(
                    ...(media?.mapNotNull(item =>
                      PSMessageMediaEntity.mapFromDto(item),
                    ) ?? []),
                  );
                });
              }

              const poll = payload.message.body.metadata?.filter(
                item => item.type === PSMessageMetadataType.POLL,
              )[0];
              if (poll) {
                realm.write(() => {
                  message!.body!.poll = PSMessagePollEntity.mapFromDto(poll);
                });
              }
            }
            return;
          }

          cachedThread = PSThreadEntity.getFirstById(realm, payload.thread.id);
          // xác định xem có phải là vừa được add vào thread hay không
          const isThreadExisted = cachedThread !== undefined;

          realm.write(() => {
            const thread = isThreadExisted
              ? cachedThread!
              : PSThreadEntity.createOrUpdate(
                realm,
                PSThreadEntity.mapFromMqtt(payload!.thread),
              );

            if (
              !isThreadExisted &&
              payload &&
              thread.isValid() &&
              !thread.parentId &&
              payload.thread.parent_id
            ) {
              // nếu chưa có trong cache và chưa có parentId thì update cho nó
              thread.updateParentId(
                payload.thread.parent_id,
                payload.thread.original_message_id,
              );
            }

            // if msg là actionNote GROUP_NAME_UPDATED/GROUP_AVATAR_UPDATED thì update name, avatar of thread
            if (
              isThreadExisted &&
              payload &&
              payload.message.body?.action_note &&
              (payload.message.body.action_note.type ===
                PSMessageActionNoteType.GROUP_NAME_UPDATED ||
                payload.message.body.action_note.type ===
                PSMessageActionNoteType.GROUP_AVATAR_UPDATED)
            ) {
              thread.changeInfoThread({
                name: payload!.thread.name,
                avatar: payload!.thread.avatar_url,
              });
            }

            // if msg là actionNote JOIN_PUBLIC_GROUP của mình thì update isJoined of thread
            if (
              payload &&
              payload.message.body?.action_note &&
              payload.message.body.action_note.type ===
              PSMessageActionNoteType.JOIN_PUBLIC_GROUP &&
              payload.message.sender.ext_user_id === chatApiClient.userId
            ) {
              thread.updateIsJoined(true);
            }

            // nếu là tin nhắn 1-1 đầu tiên thì save partner cho thread
            // vì thông tin mqtt trả về thiếu
            if (
              !isThreadExisted &&
              thread.type === PSThreadType.DIRECT &&
              payload!.message.sender.ext_user_id !== chatApiClient.userId
            ) {
              const userPartner = PSUserEntity.getFirstByExtUserId(
                realm,
                payload!.message.sender.ext_user_id,
              );
              thread.partner =
                userPartner ?? PSUserEntity.mapFromDto(payload!.message.sender);
            }

            message = PSMessageEntity.mapFromDto(
              deviceId,
              chatApiClient.userId,
              payload!.thread.id,
              payload!.message,
            )!;

            // Mqtt trả về thiếu reactions cho tính năng ghim và bỏ ghim
            if (message?.body?.pinOrUnpinMessage?.id) {
              try {
                const id = message.body?.pinOrUnpinMessage?.id;
                const messageOld =
                  PSMessageEntity.getFirstByThreadIdAndMessageId(
                    realm,
                    thread.id,
                    id,
                  );
                // lấy reactions từ tin nhắn được ghim để thay thế
                message = PSMessageEntity.mapFromDto(
                  deviceId,
                  chatApiClient.userId,
                  payload!.thread.id,
                  {
                    ...payload!.message,
                    // @ts-ignore
                    reactions: messageOld?.reactions?.map(ite => ({
                      name: ite.name,
                      ext_user_ids: ite.userIds,
                      count: ite.userIds.length,
                    })),
                  },
                )!;
              } catch (error) {
                psLogger.error(
                  'PSMqttClientProvider: onCreateMessageEvent.handlePinOrUnpin',
                  error,
                );
              }
            }

            // case A tạo Poll, B nhận được
            // A tạo reply message từ message Poll
            // B nhận được event CreateNewMessage với ref_object = message Poll
            // nhưng Poll obj trong ref_object không trả về myVotes nên bị mất thông tin nếu save db
            // do vậy phải lấy từ cache ở hiện tại
            if (
              message.body &&
              message.body.repliedMessage &&
              message.body.repliedMessage.body &&
              message.body.repliedMessage.body.poll
            ) {
              const repliedMessage =
                PSMessageEntity.getFirstByThreadIdAndPrimaryKey(
                  realm,
                  message.body.repliedMessage.threadId,
                  PSMessageEntity.generatePrimaryKey(
                    deviceId,
                    chatApiClient.userId,
                    message.body.repliedMessage.threadId,
                    message.body.repliedMessage.id,
                    message.body.repliedMessage.sender.extUserId,
                    message.body.repliedMessage.requestId,
                  ),
                );
              if (repliedMessage) {
                message.body.repliedMessage.body.poll = repliedMessage.body
                  ?.poll
                  ? JSON.parse(JSON.stringify(repliedMessage.body?.poll))
                  : undefined;
              }
            }

            message = PSMessageEntity.createOrUpdate(realm, message);

            if (thread) {
              thread.updateLastMessage(message);
              thread.checkLastMessageContainsMentionMe(chatApiClient.userId);

              // nếu mới được thêm vào thread thì mark seen lastMessageId - 1
              if (
                !isThreadExisted &&
                message.id > PSMessageEntity.FIRST_MESSAGE_ID
              ) {
                thread.markSeen(message.id - 1);
              }
            }

            switch (message.body?.actionNote?.type) {
              case PSMessageActionNoteType.PIN:
                PSPinnedMessagesEntity.pinMessage(realm, message);
                break;
              case PSMessageActionNoteType.UNPIN:
                PSPinnedMessagesEntity.unpinMessage(realm, message);
                break;
            }
          });

          PSEventBus.getInstance().dispatch(PSBusEvent.NEW_MESSAGE, message);
        } catch (e) {
          psLogger.error(
            'PSMqttClientProvider: onCreateMessageEvent.createOrUpdate',
            e,
          );
        }

        const lastCurrentThreadId =
          messagesScreenByThreadIdStack.current[
          messagesScreenByThreadIdStack.current.length - 1
          ];

        const isMute = cachedThread?.isMute ?? false;

        if (
          payload.thread.id !== lastCurrentThreadId &&
          payload!.message.sender.ext_user_id !== chatApiClient.userId &&
          message &&
          !isMute
        ) {
          let displayName = payload.thread.name;
          let urlAvatar = payload.thread.avatar_url;

          const isSubThread =
            payload.thread.parent_id && payload.thread.parent_id !== '0';
          if (isSubThread) {
            const parentThreadCached = PSThreadEntity.getFirstById(
              realm,
              payload.thread.parent_id,
            );
            if (parentThreadCached) {
              displayName = parentThreadCached.name ?? '';
              urlAvatar = parentThreadCached.avatar ?? '';
            }
          }
          PSFlashMessage.show({
            type: 'flashMessage',
            onPress: () => {
              PSFlashMessage.hide();
              onFlashMessagePress?.(payload!.thread.id);
            },
            props: {
              text1: payload.thread.name,
              text2: getPreviewContentLastMessage(
                translator,
                chatApiClient.userId,
                PSLastMessageEntity.mapFromMessageEntity(message),
                payload.thread.type,
              ),
              displayName: displayName,
              urlAvatar: urlAvatar,
              isSubThread: isSubThread,
            },
          });
        }
      }
    },
    [
      chatApiClient,
      onFlashMessagePress,
      handleUpdateMessageCountSubThread,
      realm,
      translator,
    ],
  );

  const onEditMessageEvent = React.useCallback(
    (event: PSMqttEvent) => {
      if (!chatApiClient) {
        return;
      }
      let payload: PSMqttEditMessageEventPayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttEditMessageEventPayload;
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onEditMessageEvent.parse', e);
        return;
      }

      if (payload && !event.retain) {
        try {
          const thread = PSThreadEntity.getFirstById(realm, payload.thread.id);

          const deviceId = PSDeviceEntity.get(realm);

          realm.write(() => {
            const messageCurrent =
              PSMessageEntity.getFirstByThreadIdAndMessageId(
                realm,
                payload!.thread.id,
                payload!.message.id,
              );
            if (messageCurrent?.isValid()) {
              messageCurrent?.editText(
                payload!.message?.body?.text ?? '',
                payload!.message?.edited_at ?? Date.now(),
              );
              if (
                payload!.message?.body?.metadata &&
                payload!.message?.body?.metadata.length &&
                payload!.message?.body?.metadata[0]?.type ===
                PSMessageMetadataType.FORM &&
                payload!.message?.body?.metadata[0]?.skip
              ) {
                //  if là edit msg form skip
                messageCurrent.editFormSkip(true);
              }
            }
            const message =
              messageCurrent ??
              PSMessageEntity.createOrUpdate(
                realm,
                PSMessageEntity.mapFromDto(
                  deviceId,
                  chatApiClient.userId,
                  payload!.thread.id,
                  payload!.message,
                )!,
              );
            if (thread) {
              thread.updateLastMessage(message);
              thread.checkLastMessageContainsMentionMe(chatApiClient.userId);
            }
          });
        } catch (e) {
          psLogger.error(
            'PSMqttClientProvider: onEditMessageEvent.createOrUpdateMessageEntity',
            e,
          );
          return;
        }
      }
    },
    [chatApiClient, realm],
  );

  const onDeleteMessageEvent = React.useCallback(
    (event: PSMqttEvent) => {
      if (!chatApiClient) {
        return;
      }
      let payload: PSMqttDeleteMessageEventPayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttDeleteMessageEventPayload;
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onDeleteMessageEvent.parse', e);
        return;
      }

      if (payload && !event.retain) {
        try {
          const message =
            PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
              realm,
              payload.thread_id,
              payload.message_id,
            );

          if (message) {
            const thread = PSThreadEntity.getFirstById(
              realm,
              payload.thread_id,
            );

            realm.write(() => {
              if (payload) {
                message.deleteLevel = payload.delete_level;
                // vì hiện tại chỉ mình mới có thể xoá tin nhắn của chính mình
                // nên actor = sender
                const isDeleted = isDeletedMessage(
                  payload.actor.ext_user_id === chatApiClient.userId,
                  payload.delete_level,
                );
                if (isDeleted) {
                  message.body = undefined;
                  if (thread) {
                    thread.handleDeleteMessage(message);
                  }
                }
              }
            });
          }
        } catch (e) {
          psLogger.error(
            'PSMqttClientProvider: onDeleteMessageEvent.delete',
            e,
          );
          return;
        }
      }
    },
    [chatApiClient, realm],
  );

  const onSeenMessageEvent = React.useCallback(
    (event: PSMqttEvent) => {
      let payload: PSMqttSeenMessageEventPayload | undefined;

      if (!chatApiClient) {
        return;
      }

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttSeenMessageEventPayload;
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onSeenMessageEvent.parse', e);
        return;
      }

      if (payload && !event.retain) {
        PSEventBus.getInstance().dispatch(
          PSBusEvent.USER_SEEN,
          payload.actor.ext_user_id,
        );
        try {
          const thread = PSThreadEntity.getFirstById(realm, payload.thread_id);
          const cachedMessageSeenUsers = PSMessageSeenUsersEntity.getByThreadId(
            realm,
            payload.thread_id,
          );
          if (thread) {
            realm.write(() => {
              PSMessageSeenUsersEntity.markSeen(
                realm,
                payload!.thread_id,
                // @ts-ignore
                cachedMessageSeenUsers,
                [
                  {
                    messageId: payload!.message_id,
                    users: [mapUserDtoToModel(payload!.actor)],
                  },
                ],
              );

              if (payload!.actor.ext_user_id === chatApiClient.userId) {
                thread.markSeen(payload!.message_id);
              }
            });
          }
        } catch (e) {
          psLogger.error('PSMqttClientProvider: onSeenMessageEvent.mark', e);
          return;
        }
      }
    },
    [chatApiClient, realm],
  );

  const onToggleNotifyThreadEvent = React.useCallback(
    (event: PSMqttEvent) => {
      let payload: PSMqttToggleNotifyThreadEventPayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttToggleNotifyThreadEventPayload;
      } catch (e) {
        psLogger.error(
          'PSMqttClientProvider: onToggleNotifyThreadEvent.parse',
          e,
        );
        return;
      }

      if (payload && !event.retain) {
        try {
          const thread = PSThreadEntity.getFirstById(realm, payload.thread_id);
          if (thread) {
            realm.write(() => {
              thread.updateMute(!payload!.enable_notify);
            });
          }
        } catch (e) {
          psLogger.error(
            'PSMqttClientProvider: onToggleNotifyThreadEvent.isMute',
            e,
          );
          return;
        }
      }
    },
    [realm],
  );

  const onPinnedThreadEvent = React.useCallback(
    (event: PSMqttEvent) => {
      let payload: PSMqttPinnedThreadEventPayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttPinnedThreadEventPayload;
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onPinnedThreadEvent.parse', e);
        return;
      }

      if (payload && !event.retain) {
        try {
          const thread = PSThreadEntity.getFirstById(realm, payload.thread_id);
          if (thread) {
            realm.write(() => {
              thread.updatePinnedAt(payload!.pinned_at);
            });
          }
        } catch (e) {
          psLogger.error(
            'PSMqttClientProvider: onPinnedThreadEvent.updatePinnedAt',
            e,
          );
          return;
        }
      }
    },
    [realm],
  );

  const onReactMessageEvent = React.useCallback(
    (event: PSMqttEvent) => {
      let payload: PSMqttReactMessagePayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttReactMessagePayload;

        if (payload && !event.retain) {
          PSEventBus.getInstance().dispatch(
            PSBusEvent.USER_REACT,
            payload.ext_user_id,
          );
          try {
            const message =
              PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
                realm,
                payload.thread_id,
                payload!.message_id,
              );
            if (message) {
              const emoji = getEmojiByEmojiCode(payload.name);
              if (emoji) {
                realm.write(() => {
                  message.react(payload!.ext_user_id, emoji.name, emoji.emoji);
                });
              }
            }
          } catch (e) {
            psLogger.error(
              'PSMqttClientProvider: onPinnedThreadEvent.updatePinnedAt',
              e,
            );
            return;
          }
        }
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onReactMessageEvent.parse', e);
        return;
      }
    },
    [realm],
  );

  const onUnReactMessageEvent = React.useCallback(
    (event: PSMqttEvent) => {
      let payload: PSMqttReactMessagePayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttReactMessagePayload;

        if (payload && !event.retain) {
          PSEventBus.getInstance().dispatch(
            PSBusEvent.USER_UNREACT,
            payload.ext_user_id,
          );
          try {
            const message =
              PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
                realm,
                payload.thread_id,
                payload.message_id,
              );
            if (message) {
              realm.write(() => {
                message.unreact(payload!.ext_user_id, payload!.name);
              });
            }
          } catch (e) {
            psLogger.error(
              'PSMqttClientProvider: onPinnedThreadEvent.updatePinnedAt',
              e,
            );
            return;
          }
        }
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onReactMessageEvent.parse', e);
        return;
      }
    },
    [realm],
  );

  const onAddOptionPollMessageEvent = React.useCallback(
    (event: PSMqttEvent) => {
      let payload: PSMqttAddOptionPollMessagePayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttAddOptionPollMessagePayload;

        if (payload && !event.retain) {
          PSEventBus.getInstance().dispatch(
            PSBusEvent.USER_ADD_OPTION_VOTE,
            payload.poll.actor.ext_user_id,
          );
          try {
            const message =
              PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
                realm,
                payload.poll.thread_id,
                payload!.poll.message_id,
              );
            if (message) {
              realm.write(() => {
                message.addOptionPoll(
                  payload!.poll.option.id,
                  payload!.poll.option.text ?? '',
                );
              });
            }
          } catch (e) {
            psLogger.error(
              'PSMqttClientProvider: onAddOptionPollMessageEvent.addOptionPoll',
              e,
            );
            return;
          }
        }
      } catch (e) {
        psLogger.error(
          'PSMqttClientProvider: onAddOptionPollMessageEvent.parse',
          e,
        );
        return;
      }
    },
    [realm],
  );

  const onVoteMessageEvent = React.useCallback(
    (event: PSMqttEvent) => {
      let payload: PSMqttVoteMessagePayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttVoteMessagePayload;

        if (payload && !event.retain) {
          PSEventBus.getInstance().dispatch(
            PSBusEvent.USER_VOTE,
            payload.poll.actor.ext_user_id,
          );
          try {
            const message =
              PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
                realm,
                payload.poll.thread_id,
                payload!.poll.message_id,
              );
            if (message) {
              realm.write(() => {
                message.vote(
                  payload!.poll.actor.ext_user_id,
                  payload!.poll.option.id,
                  payload!.poll.actor.ext_user_id === chatApiClient?.userId,
                );
              });
            }
          } catch (e) {
            psLogger.error('PSMqttClientProvider: onVoteMessageEvent.vote', e);
            return;
          }
        }
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onVoteMessageEvent.parse', e);
        return;
      }
    },
    [chatApiClient?.userId, realm],
  );

  const onUnVoteMessageEvent = React.useCallback(
    (event: PSMqttEvent) => {
      let payload: PSMqttVoteMessagePayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttVoteMessagePayload;

        if (payload && !event.retain) {
          PSEventBus.getInstance().dispatch(
            PSBusEvent.USER_UNVOTE,
            payload.poll.actor.ext_user_id,
          );
          try {
            const message =
              PSMessageEntity.getFirstByThreadIdAndMessageIdAndSentStatus(
                realm,
                payload.poll.thread_id,
                payload.poll.message_id,
              );
            if (message) {
              realm.write(() => {
                message.unvote(
                  payload!.poll.actor.ext_user_id,
                  payload!.poll.option.id,
                  payload!.poll.actor.ext_user_id === chatApiClient?.userId,
                );
              });
            }
          } catch (e) {
            psLogger.error(
              'PSMqttClientProvider: onUnVoteMessageEvent.unVote',
              e,
            );
            return;
          }
        }
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onUnVoteMessageEvent.parse', e);
        return;
      }
    },
    [chatApiClient?.userId, realm],
  );

  const onLeaveThread = React.useCallback((event: PSMqttEvent) => {
    let payload: PSMqttLeaveThreadPayload | undefined;

    try {
      payload = JSON.parse(
        JSON.stringify(event.payload),
      ) as PSMqttLeaveThreadPayload;
      if (payload) {
        PSEventBus.getInstance().dispatch(
          PSBusEvent.LEAVE_THREAD,
          payload.thread_id,
        );
      }
    } catch (e) {
      psLogger.error('PSMqttClientProvider: onLeaveThread.parse', e);
      return;
    }
  }, []);

  const onDeleteSubthreadInMessageOrigin = React.useCallback(
    (parentId: string, originalMessageId: number) => {
      try {
        realm.write(() => {
          // xoá subthread trong message origin
          PSMessageEntity.getFirstByThreadIdAndMessageId(
            realm,
            parentId,
            originalMessageId,
          )?.updateMessageSubThreadId(undefined);
        });
      } catch (error) {
        psLogger.error(
          'PSMqttClientProvider: onDeleteSubthreadInMessageOrigin.parse',
          error,
        );
      }
    },
    [realm],
  );

  const onDeleteThreadBoth = React.useCallback(
    (event: PSMqttEvent) => {
      let payload: PSMqttLeaveThreadPayload | undefined;
      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttLeaveThreadPayload;
        if (payload) {
          // ở trường hợp xoá subthread cũng thuộc onDeleteThreadBoth
          // cần thực hiện xoá subthreadId của tin nhắn gốc.
          const thread = PSThreadEntity.getFirstById(realm, payload.thread_id!);

          if (thread?.parentId && thread.originalMessageId) {
            // kiểm tra đây có phải là 1 subthread không.
            onDeleteSubthreadInMessageOrigin(
              thread.parentId,
              thread.originalMessageId,
            );
          }

          // xử lý việc back ra ngoài màn hình ngoài cùng.
          PSEventBus.getInstance().dispatch(
            PSBusEvent.DELETE_THREAD_BOTH,
            payload.thread_id,
          );
          PSThreadEntity.deleteBothThread(realm, payload.thread_id);
        }
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onLeaveThread.parse', e);
        return;
      }
    },
    [realm, onDeleteSubthreadInMessageOrigin],
  );

  const onRatingSessionThread = React.useCallback((event: PSMqttEvent) => {
    let payload: PSMqttRatingSessionThreadEventPayload | undefined;

    try {
      payload = JSON.parse(
        JSON.stringify(event.payload),
      ) as PSMqttRatingSessionThreadEventPayload;
    } catch (e) {
      psLogger.error('PSMqttClientProvider: onRatingSessionThread.parse', e);
      return;
    }

    if (payload && !event.retain) {
      try {
        const thread = PSThreadEntity.getFirstById(realm, payload.thread_id);
        if (thread) {
          realm.write(() => {
            thread.updateRatingSession(
              payload!.session_id,
              payload!.is_rating_anytime,
              payload!.support_thread_id,
            );
          });
        }
      } catch (e) {
        psLogger.error(
          'PSMqttClientProvider: onRatingSessionThread.updateRatingSession',
          e,
        );
        return;
      }
    }
  }, []);

  const onAddToThreadList = React.useCallback(
    async (event: PSMqttEvent) => {
      let payload: PSMqttAddToThreadListEventPayload | undefined;

      try {
        payload = JSON.parse(
          JSON.stringify(event.payload),
        ) as PSMqttAddToThreadListEventPayload;
      } catch (e) {
        psLogger.error('PSMqttClientProvider: onAddToThreadList.parse', e);
        return;
      }

      if (payload && !event.retain) {
        if (!chatApiClient) return;
        try {
          if (payload.thread_id) {
            const response = await chatApiClient.threadApi.fetchThreadById(
              payload.thread_id,
            );
            const threadDto = response.data;
            if (threadDto) {
              const deviceId = PSDeviceEntity.get(realm);
              let threadEntity = PSThreadEntity.mapFromDto(
                deviceId,
                chatApiClient.userId,
                threadDto,
              );
              threadEntity = {
                ...threadEntity,
                lastMessage: PSLastMessageEntity.createLastMessageDefaultEntity(
                  threadEntity.id,
                ),
              } as PSThreadEntity;
              realm.write(() => {
                PSThreadEntity.createOrUpdate(realm, threadEntity);
              });
            }
          }
        } catch (e) {
          psLogger.error(
            'PSMqttClientProvider: onRatingSessionThread.updateRatingSession',
            e,
          );
          return;
        }
      }
    },
    [realm, chatApiClient],
  );

  React.useEffect(() => {
    const callback = (event: PSMqttEvent) => {
      psLogger.info(`PSMqttClientProvider: event = ${JSON.stringify(event)}`);
      if (event) {
        switch (event.event_type) {
          case PSMqttEventType.TYPING:
            onTypingEvent(event);
            break;
          case PSMqttEventType.CREATE_MESSAGE:
            onCreateMessageEvent(event);
            break;
          case PSMqttEventType.EDIT_MESSAGE:
            onEditMessageEvent(event);
            break;
          case PSMqttEventType.DELETE_MESSAGE:
            onDeleteMessageEvent(event);
            break;
          case PSMqttEventType.SEEN_MESSAGE:
            onSeenMessageEvent(event);
            break;
          case PSMqttEventType.TOGGLE_NOTIFY_THREAD:
            onToggleNotifyThreadEvent(event);
            break;
          case PSMqttEventType.PINNED_THREAD:
            onPinnedThreadEvent(event);
            break;
          case PSMqttEventType.REACT_MESSAGE:
            onReactMessageEvent(event);
            break;
          case PSMqttEventType.UNREACT_MESSAGE:
            onUnReactMessageEvent(event);
            break;
          case PSMqttEventType.ADD_OPTION_POLL_MESSAGE:
            onAddOptionPollMessageEvent(event);
            break;
          case PSMqttEventType.VOTE_MESSAGE:
            onVoteMessageEvent(event);
            break;
          case PSMqttEventType.UNVOTE_MESSAGE:
            onUnVoteMessageEvent(event);
            break;
          case PSMqttEventType.LEAVE_THREAD:
            onLeaveThread(event);
            break;
          case PSMqttEventType.LEAVE_THREAD_WITH_ME:
            onLeaveThread(event);
            break;

          // đối với trường hợp xoá 2 phía và giải tán nhóm cách xử lý MQTT giống hệt nhau
          case PSMqttEventType.DELETE_THREAD_BOTH:
            onDeleteThreadBoth(event);
            break;
          case PSMqttEventType.DISBAND_GROUP:
            onDeleteThreadBoth(event);
            break;
          case PSMqttEventType.RATING_SESSION_THREAD:
            onRatingSessionThread(event);
            break;
          case PSMqttEventType.ADD_TO_THREAD_LIST:
            onAddToThreadList(event);
            break;
        }
      }
    };

    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.MQTT_MESSAGE_RECEIVED,
      callback,
    );

    return () => listener.unsubscribe();
  }, [
    onTypingEvent,
    onCreateMessageEvent,
    onEditMessageEvent,
    onDeleteMessageEvent,
    onSeenMessageEvent,
    onToggleNotifyThreadEvent,
    onPinnedThreadEvent,
    onReactMessageEvent,
    onUnReactMessageEvent,
    onAddOptionPollMessageEvent,
    onVoteMessageEvent,
    onUnVoteMessageEvent,
    onLeaveThread,
    onDeleteThreadBoth,
  ]);

  React.useEffect(() => {
    const fetchSuperGroup = async () => {
      if (!chatApiClient || !mqttClient) {
        return;
      }
      try {
        const response =
          await chatApiClient.superGroupsApi.fetchSuperGroupsTopic();
        const topics = response.data;
        if (isMounted.current && topics && topics.length) {
          setSuperGroups(topics);
          for (const topic of topics) {
            mqttClient
              .subscribe(topic)
              .then(() => { })
              .catch(() => {
                /** ignore */
              });
          }
        }
      } catch (error) {
        psLogger.error('PSMqttClientProvider: fetchSuperGroup => ', error);
      }
    };
    const callback = async (connected: boolean) => {
      setConnected(connected);
      if (mqttClient) {
        mqttClient.subscribeDefaultTopic();
        fetchSuperGroup();
      }
    };
    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.MQTT_CONNECTED,
      callback,
    );
    return () => listener.unsubscribe();
  }, [chatApiClient, isMounted, mqttClient]);

  React.useEffect(() => {
    const callback = async (threadId: string) => {
      try {
        // hot fix error out group Khám phá => không nhìn thấy nhóm đó nữa.
        const thread = PSThreadEntity.getFirstById(realm, threadId);
        if (thread?.groupLevel === PSThreadGroupLevelType.PUBLIC_GROUP) {
          realm.write(() => {
            thread.isJoined = false;
          });
        } else {
          PSThreadEntity.deleteThread(realm, threadId);
        }
      } catch (error) {
        psLogger.error('PSMqttClientProvider: deleteThread ', error);
      }
      if (superGroups.length) {
        const topic = superGroups.filter(id => id.includes(threadId))[0];
        if (topic && mqttClient) {
          mqttClient
            .unsubscribe(topic)
            .then(() => {
              setSuperGroups(prev => prev.filter(id => !id.includes(threadId)));
            })
            .catch(() => {
              /** ignore */
            });
        }
      }
    };
    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.LEAVE_THREAD,
      callback,
    );
    return () => listener.unsubscribe();
  }, [realm, mqttClient, superGroups]);

  React.useEffect(() => {
    if (chatApiClient) {
      const token = chatApiClient.getJWT();
      console.log('DEBUG MQTT: chatApiClient ready, fetch JWT =', token ? 'EXISTS' : 'EMPTY');
      setJWT(token);
    } else {
      console.log('DEBUG MQTT: chatApiClient is undefined');
      setJWT(undefined);
    }
  }, [chatApiClient]);

  React.useEffect(() => {
    if (chatApiClient?.userId && jwt) {
      const init = async () => {
        console.log('DEBUG MQTT: Initializing MQTT with userId =', chatApiClient.userId, 'appId =', appId);
        try {
          const mqtt = await PSMqttClient.newInstance(
            appId,
            chatApiClient.userId,
            jwt,
          );
          console.log('DEBUG MQTT: MqttClient instance created successfully');
          if (isMounted.current) {
            setMqttClient(mqtt);
            console.log('DEBUG MQTT: Calling mqtt.connect()...');
            await mqtt.connect();
          }
        } catch (error) {
          // nếu connect lỗi sau 1s thử lại
          setJWT(undefined);
          setTimeout(() => {
            setJWT(chatApiClient?.getJWT());
          }, 500);
          psLogger.error('PSMqttClientProvider: init MQTT', error);
        }
      };

      init();
    }
    return () => {
      clearReconnect();
      setMqttClient(prev => {
        prev?.close();
        return undefined;
      });
    };
  }, [chatApiClient, chatApiClient?.userId, jwt, appId, isMounted]);

  const trackingContextValue = React.useMemo(
    () =>
      ({
        enterMessagesScreen: enterMessagesScreen,
        exitMessagesScreen: exitMessagesScreen,
      }) as PSMqttMessagesScreenTrackingContextValue,
    [enterMessagesScreen, exitMessagesScreen],
  );

  return (
    <PSMqttMessagesScreenTrackingContext.Provider value={trackingContextValue}>
      <PSMqttClientConnectedContext.Provider value={isConnected}>
        <PSMqttTypingUsersContext.Provider value={typingUsers}>
          {children}
        </PSMqttTypingUsersContext.Provider>
      </PSMqttClientConnectedContext.Provider>
    </PSMqttMessagesScreenTrackingContext.Provider>
  );
};

export const usePSMqttMessagesScreenTrackingContext = () =>
  React.useContext(PSMqttMessagesScreenTrackingContext);

export const usePSMqttClientConnectedContext = () =>
  React.useContext(PSMqttClientConnectedContext);

export const usePSMqttTypingUsersContext = () =>
  React.useContext(PSMqttTypingUsersContext);
