import {
  PSMessageMetadataType,
  PSResponseError,
  PSThreadType,
  PSUserType,
} from '@communi/chat-api-client-typescript';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import React, {
  PropsWithChildren,
  RefObject,
  createContext,
  useContext,
} from 'react';
import isEqual from 'react-fast-compare';
import {
  Alert,
  Keyboard,
  Linking,
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
} from 'react-native';
import uuid from 'react-native-uuid';
import {
  usePSChatApiClientContext,
  usePSSaveAssetsPickerContext,
  usePSSendMessageContext,
  useRealm,
} from '../../../context';
import {
  usePSMediaPickerActionContext,
  usePSMediaPickerContext,
} from '../../../context/PSMediaPickerContext';
import { useDeepCompareMemoize } from '../../../hooks';
import {
  PSMessageFileModel,
  PSMessageMediaModel,
  PSStickerModel,
  PSThreadDraftEntity,
  PSUserModel,
  mapMessageFileModelFromDocument,
  mapMessageMediaModelFromAssetPicker,
  mapToMediaPickerAsset,
} from '../../../types';
import {
  DONT_HAVE_PERMISSION_CALL_API,
  PSBusEvent,
  PSEventBus,
  hapticHeavy,
  pickDocument,
  psLogger,
  takePhoto,
} from '../../../utils';
import {
  PSRichTextMentionProp,
  processTextWithMentionFromBackEnd,
  processTextWithMentionToBackend,
} from '../../PSRichText';
import { MediaPickerAsset } from '../../media-picker';
import {
  usePSEditMessageContext,
  usePSEditMessageSetIdContext,
} from './PSEditMessageContext';
import {
  usePSMessageCurrentThreadContext,
  usePSMessageCurrentThreadIdContext,
} from './PSMessageCurrentThreadContext';
import { usePSMessageCreatePollActionContext } from './PSMessagePollContext';
import {
  usePSMessagePreviewLinkActionContext,
  usePSMessagePreviewLinkContext,
} from './PSMessagePreviewLinkContext';
import { usePSMessageSetSuggestionMentionQueryContext } from './PSMessageSuggestionMentionsContext';
import {
  usePSReplyMessageContext,
  usePSReplyMessageSetIdContext,
  usePSReplyUserContext,
} from './PSReplyMessageContext';

import * as ImagePicker from 'react-native-image-picker';
import { lookup } from 'mime-types';

const MAX_FILE_TO_UPLOAD = 9;

type PSMessageInputSendContextValue = {
  isButtonSendEnabled: boolean;
  onSendMessagePress: () => void;
};

const PSMessageInputSendContext = createContext(
  {} as PSMessageInputSendContextValue,
);

const PSMessageInputCameraContext = createContext<() => void>(() => undefined);

type PSMessageInputMediaContextValue = {
  selectedMedia: PSMessageMediaModel[];
};

const PSMessageInputMediaContext =
  createContext<PSMessageInputMediaContextValue>(
    {} as PSMessageInputMediaContextValue,
  );

type PSMessageInputFileContextValue = {
  selectedFiles: PSMessageFileModel[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<PSMessageFileModel[]>>;
  openFileManager: () => void;
};

const PSMessageInputFileContext = createContext<PSMessageInputFileContextValue>(
  {} as PSMessageInputFileContextValue,
);

type PSMessageInputPollContextValue = {
  openCreatePoll: () => void;
};

const PSMessageInputPollContext = createContext<PSMessageInputPollContextValue>(
  {} as PSMessageInputPollContextValue,
);

type PSMessageInputTextContextValue = {
  text: string;
  mentionIds: string[];
  onChangeText: (newText: string) => void;
  handleSelectionChange: (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => void;
};

const PSMessageInputTextContext = createContext(
  {} as PSMessageInputTextContextValue,
);

const PSMessageInputRefContext = createContext<RefObject<TextInput>>(
  React.createRef(),
);

const PSMessageInputReplyChatBotContext = createContext<
  (label: string, postback: string) => void
>(() => undefined);

const PSMessageInputSendStickerContext = createContext<
  (sticker: PSStickerModel) => void
>(() => undefined);

const PSMessageInputMentionUserPressContext = createContext<
  (user: PSUserModel) => void
>(() => undefined);

const PSMessageImagePickerContext = createContext<() => void>(() => undefined);


export const PSMessageInputProvider = ({ children }: PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const currentThread = usePSMessageCurrentThreadContext();

  const { sendMessage } = usePSSendMessageContext();

  const setMentionQuery = usePSMessageSetSuggestionMentionQueryContext();

  const {
    selectedMedia: selectedMediaFromMediaPicker,
    setSelectedMedia: setSelectedMediaFromMediaPicker,
  } = usePSMediaPickerContext();

  const [selectedMedia, setSelectedMedia] = React.useState<
    PSMessageMediaModel[]
  >([]);

  const { closeMediaPicker } = usePSMediaPickerActionContext();

  const [selectedFiles, setSelectedFiles] = React.useState<
    PSMessageFileModel[]
  >([]);

  const mediaFromCameraRef = React.useRef<PSMessageMediaModel | undefined>();

  const previewLink = usePSMessagePreviewLinkContext();

  const messageToReply = usePSReplyMessageContext();

  const userToReply = usePSReplyUserContext()?.userToReply;
  const setUserToReply = usePSReplyUserContext()?.setUserToReply;

  const replyMessage = usePSReplyMessageSetIdContext();

  const messageToEdit = usePSEditMessageContext();

  const editMessage = usePSEditMessageSetIdContext();

  const textInputRef = React.useRef<TextInput>(null);

  const [textInputValue, setTextInputValue] = React.useState('');

  const oldTextInputValueRef = React.useRef('');

  const textInputValueRef = React.useRef('');

  const realm = useRealm();

  const [isButtonSendEnabled, setButtonSendEnabled] = React.useState(true);

  const { setUrlsToFetchPreviewLink, setFetchPreviewLinkEnabled } =
    usePSMessagePreviewLinkActionContext();

  const setSelectedMediaPicker =
    usePSMediaPickerContext().setSelectedMedia;

  const selectionEnd = React.useRef(0);

  const [mentions, setMentions] = React.useState<
    PSRichTextMentionProp[] | undefined
  >(undefined);

  const { show: showCreatePoll } = usePSMessageCreatePollActionContext();

  const handleSelectionChange = React.useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      selectionEnd.current = e.nativeEvent.selection.end;
      // khi thay đổi vị trí cursor thì cần invoke lại
      if (selectionEnd.current < textInputValueRef.current.length - 1) {
        handleSuggestionsDebounced.current(textInputValueRef.current);
      }
    },
    [],
  );

  const handleSuggestions = async (text: string) => {
    if (!text) {
      setMentionQuery('');
      return;
    }

    const textByCursor = text.substring(0, selectionEnd.current);
    const lastIndexOfA = textByCursor.lastIndexOf('@');
    const mention = textByCursor.substring(lastIndexOfA, selectionEnd.current);

    if (mention.length) {
      if (mention === '@') {
        setMentionQuery('@');
      } else {
        const mentionTokenMatch = mention.match(
          /(?:\s|^)@([\S]{0,1}[^!\s@=#$%^&*(),.?":{}|<>]+)(\b|\r)$/g,
        );
        if (mentionTokenMatch && mentionTokenMatch.length) {
          const lastToken = mentionTokenMatch[mentionTokenMatch.length - 1];
          if (!lastToken || lastToken.length <= 0) {
            setMentionQuery('');
            return;
          }
          const actualToken = lastToken.slice(1);
          setMentionQuery(actualToken);
        } else {
          setMentionQuery('');
        }
      }
    } else {
      setMentionQuery('');
    }
  };

  const updateMentionsAfterTextChanged = (newText: string) => {
    if (!newText) {
      setMentions(undefined);
      return;
    }

    setMentions(prev => {
      if (!prev || !prev.length || selectionEnd.current === newText.length) {
        return prev;
      }
      let newMentions = cloneDeep<PSRichTextMentionProp[]>(prev);

      const lengthChanged =
        newText.length - oldTextInputValueRef.current.length;

      newMentions.forEach((item, index) => {
        // case thêm/bớt ký tự trước khoảng start-end mention
        if (
          selectionEnd.current - 1 <= item.start &&
          selectionEnd.current < newText.length - 1
        ) {
          item.start += lengthChanged;
          item.end += lengthChanged;
        }
      });
      newMentions = newMentions.filter(item => {
        // case thêm/bớt ký tự vào khoảng start-end mention
        const subText = newText.substring(item.start, item.end);
        return subText === item.name;
      });
      return isEqual(prev, newMentions) ? prev : newMentions;
    });
  };

  const handleSuggestionsDebounced = React.useRef(
    debounce(
      newText => {
        handleSuggestions(newText);
      },
      200,
      {
        leading: false,
        trailing: true,
      },
    ),
  );

  const handleTypingThrotte = React.useRef(
    throttle(
      (newText: string) => {
        const isConversationWithBot =
          currentThread?.partner?.type === PSUserType.BOT;
        if ((newText || isConversationWithBot) && chatApiClient && currentThreadId) {
          chatApiClient.threadApi
            .typing(
              currentThreadId,
              isConversationWithBot ? newText : undefined,
            )
            .then(
              _ => { },
              error => {
                if (
                  error &&
                  error instanceof PSResponseError &&
                  error.http_code === 403 &&
                  error.response?.data?.message_code ===
                  DONT_HAVE_PERMISSION_CALL_API
                ) {
                  PSEventBus.getInstance().dispatch(
                    PSBusEvent.LEAVE_THREAD,
                    currentThreadId,
                  );
                }
                psLogger.error(
                  'PSMessageInputProvider: handleTypingDebounced => ',
                  error,
                );
              },
            );
        }
      },
      1000,
      {
        leading: true,
        trailing: true,
      },
    ),
  );

  const handleClearDraftContent = React.useCallback(() => {
    if (!currentThreadId) return;
    const threadDraft = PSThreadDraftEntity.getFirstById(
      realm,
      currentThreadId,
    );
    if (threadDraft?.isValid()) {
      realm.write(() => {
        realm.delete(threadDraft);
      });
    }
  }, [realm, currentThreadId]);

  const onChangeText = React.useCallback((newText: string) => {
    setTextInputValue(prev => {
      oldTextInputValueRef.current = prev;
      textInputValueRef.current = newText;
      return newText;
    });
    updateMentionsAfterTextChanged(newText);
    handleSuggestionsDebounced.current(newText);
    handleTypingThrotte.current(newText);
  }, []);

  const onSuggestedMentionUserPress = React.useCallback((user: PSUserModel) => {
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMentionQuery('');

    const name = '@' + user.name;

    setTextInputValue(prevText => {
      const index = prevText.lastIndexOf('@', selectionEnd.current);

      if (index < 0) {
        return prevText;
      } else {
        const nextText =
          prevText.substring(0, index) +
          name +
          ' ' +
          prevText.substring(selectionEnd.current);

        setMentions(prev => {
          const prevMention = cloneDeep(prev ?? []);
          if (
            prevMention &&
            prevMention.length &&
            selectionEnd.current < prevText.length - 1
          ) {
            const lengthChanged = nextText.length - prevText.length;

            prevMention.forEach(item => {
              // case thêm mention trước khoảng start-end mention
              if (selectionEnd.current < item.start) {
                item.start += lengthChanged;
                item.end += lengthChanged;
              }
            });
          }
          return [
            ...prevMention.filter(
              item =>
                // case thêm mention trong khoảng start-end mention
                !(
                  selectionEnd.current > item.start &&
                  selectionEnd.current <= item.end
                ),
            ),
            {
              value: `[${name}:${user.extUserId}]`,
              name: name,
              mentionId: user.extUserId,
              start: index,
              end: index + name.length,
            },
          ].sort((a, b) => a.start - b.start);
        });
        return nextText;
      }
    });
  }, []);

  const onSendMessagePress = React.useCallback(async () => {
    if (!currentThreadId) {
      return;
    }
    const result = processTextWithMentionToBackend(
      textInputValueRef.current,
      mentions ?? [],
    );
    onChangeText('');
    handleClearDraftContent();
    setMentions(undefined);

    // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setButtonSendEnabled(false);

    const request = {
      threadId: currentThreadId,
      text: result.text.trim(),
      media: mediaFromCameraRef.current
        ? [cloneDeep(mediaFromCameraRef.current)]
        : cloneDeep(selectedMedia),
      files: cloneDeep(selectedFiles),
      messageIdToReply: messageToReply?.id,
      messageIdToEdit: messageToEdit?.id,
      previewLink: cloneDeep(previewLink),
      mentionIds: result.mentionIds,
    };

    if (
      !request.text &&
      !request.media.length &&
      !request.files.length &&
      !request.previewLink
    ) {
      return;
    }

    setSelectedMediaFromMediaPicker([]);
    setSelectedFiles([]);
    mediaFromCameraRef.current = undefined;
    replyMessage(undefined);
    editMessage(undefined);
    setUrlsToFetchPreviewLink([]);
    setFetchPreviewLinkEnabled(true);
    hapticHeavy();
    sendMessage(request);
  }, [
    currentThreadId,
    sendMessage,
    onChangeText,
    useDeepCompareMemoize(mentions),
    useDeepCompareMemoize(selectedMedia),
    useDeepCompareMemoize(selectedFiles),
    messageToReply?.id,
    messageToEdit?.id,
    useDeepCompareMemoize(previewLink),
    replyMessage,
    editMessage,
    handleClearDraftContent,
  ]);

  const onSendLikePress = React.useCallback(async () => {
    if (!currentThreadId) {
      return;
    }
    hapticHeavy();
    sendMessage({
      threadId: currentThreadId,
      text: '👍',
    });
  }, [currentThreadId, sendMessage]);

  const onReplyChatBot = React.useCallback(
    async (label: string, postback: string) => {
      if (!currentThreadId) {
        return;
      }
      sendMessage({ threadId: currentThreadId, text: label, postback: postback });
    },
    [currentThreadId, sendMessage],
  );

  const onSendSticker = React.useCallback(
    (sticker: PSStickerModel) => {
      if (!currentThreadId) {
        return;
      }
      sendMessage({
        threadId: currentThreadId,
        sticker: cloneDeep(sticker),
        messageIdToReply: messageToReply?.id,
      });
      replyMessage(undefined);
    },
    [currentThreadId, sendMessage, messageToReply?.id, replyMessage],
  );

  const getFileType = (uri: string) => {
    const name = uri.substring(uri.lastIndexOf('/') + 1);
    const contentType = lookup(name) || 'image/';
    return contentType.startsWith('image/') ? 'image' : 'video';
  };

  const onImagePickerPress = React.useCallback(async () => {
    Keyboard.dismiss();
    closeMediaPicker();

    await ImagePicker.launchImageLibrary({
      mediaType: 'mixed',
      maxHeight: 2000,
      maxWidth: 2000,
      selectionLimit: 50,

    }, (response) => {
      if (response.didCancel) {
        console.log('Image picker: CANCEL!');
      } else if (response.errorMessage) {
        console.log(`Image picker: ${response.errorMessage}`);
      } else {
        const assets = (response.assets ?? []).filter(item => item.fileName).map(item => {
          return {
            id: item.uri!.hashCode().toString(), // tránh bị re-render
            uri: item.uri,
            name: item.fileName,
            size: item.fileSize,
            width: item.width,
            height: item.height,
            type: getFileType(item.fileName!),
            duration: item.duration,
          } as MediaPickerAsset;
        });
        setSelectedMediaPicker(prevAssets => [...prevAssets, ...assets]);
      }
    });
  }, [closeMediaPicker]);

  const onOpenCameraPress = React.useCallback(async () => {
    Keyboard.dismiss();
    closeMediaPicker();
    const photo = await takePhoto({ compressImageQuality: 1 });

    if (photo?.askToOpenSettings) {
      Alert.alert(
        'Allow camera access in device settings',
        'Device camera is used to take photos or videos.',
        [
          { style: 'cancel', text: 'Cancel' },
          {
            onPress: () => Linking.openSettings(),
            style: 'default',
            text: 'Open Settings',
          },
        ],
      );
    }
    if (photo && !photo.cancelled) {
      psLogger.error(`onOpenCameraPress: result = ${JSON.stringify(photo)}`);
      mediaFromCameraRef.current = {
        id: uuid.v4().toString(),
        srcUrl: photo.uri,
        name: photo.name,
        size: photo.size,
        width: photo.width,
        height: photo.height,
        type: PSMessageMetadataType.IMAGE,
      } as PSMessageMediaModel;
      onSendMessagePress();
    }
  }, [onSendMessagePress, closeMediaPicker]);

  const onOpenFileManagerPress = React.useCallback(async () => {
    try {
      Keyboard.dismiss();
      closeMediaPicker();
      const result = await pickDocument();
      const assets = result.assets;
      if (assets) {
        setSelectedFiles(prev => {
          const newResults = [
            ...prev,
            ...assets.map(item => mapMessageFileModelFromDocument(item)),
          ];
          if (newResults.length > MAX_FILE_TO_UPLOAD) {
            Alert.alert('Maximum number of files reached');
            return newResults.slice(0, MAX_FILE_TO_UPLOAD);
          } else {
            return newResults;
          }
        });
        psLogger.error(
          `onOpenFileManagerPress: result = ${JSON.stringify(result)}`,
        );
      }
    } catch (e) {
      psLogger.error('error: onOpenFileManagerPress: ', JSON.stringify(e));
    }
  }, [closeMediaPicker]);

  const openCreatePollPress = React.useCallback(() => {
    Keyboard.dismiss();
    closeMediaPicker();
    showCreatePoll();
  }, [closeMediaPicker, showCreatePoll]);

  React.useEffect(() => {
    setSelectedMedia(
      selectedMediaFromMediaPicker.map(item =>
        mapMessageMediaModelFromAssetPicker(item),
      ),
    );
  }, [useDeepCompareMemoize(selectedMediaFromMediaPicker)]);

  const handleFillDraftContent = React.useCallback(() => {
    if (!currentThreadId) return;
    const threadDraft = PSThreadDraftEntity.getFirstById(
      realm,
      currentThreadId,
    );
    if (threadDraft && threadDraft.draftContent?.trim?.()) {
      const value = processTextWithMentionFromBackEnd(
        threadDraft.draftContent,
        [...threadDraft.mentionIds],
      );
      if (value) {
        // thêm space tránh case mention ở cuối text
        textInputValueRef.current = value.text;
        setTextInputValue(value.text + ' ');
        setMentions(value.mentions);
      }
    }
  }, [realm, currentThreadId]);

  React.useEffect(() => {
    handleFillDraftContent();
  }, []);

  const handleReplyQuick = React.useCallback(
    (user: PSUserModel) => {
      if (user?.name && user?.extUserId) {
        const mentionIds = mentions?.map(ite => ite.mentionId) || [];
        // Nếu người được trả lời đã được nhắc đến. thì không tự động thêm vào đầu nữa.
        if (mentionIds.includes(user.extUserId)) return;

        const { name, extUserId } = user;

        const result = processTextWithMentionToBackend(
          textInputValue,
          mentions ?? [],
        );
        result.mentionIds;
        const value = processTextWithMentionFromBackEnd(
          `[@${name}:${extUserId}] ${result.text}`,
          [extUserId, ...result.mentionIds],
        );

        if (value) {
          textInputValueRef.current = value.text;
          setTextInputValue(value.text);
          setMentions(value.mentions);
        }
      }
    },
    [mentions, textInputValue],
  );

  React.useEffect(() => {
    if (
      userToReply?.name &&
      userToReply?.extUserId &&
      currentThread?.type === PSThreadType.GROUP
    ) {
      // xử lý tag tên cho nhóm. khi trả lời tin nhắn
      handleReplyQuick(userToReply);
      setUserToReply?.(undefined);
    }
  }, [userToReply?.name, userToReply?.extUserId]);

  React.useEffect(() => {
    if (messageToEdit && messageToEdit.body) {
      const value = messageToEdit.body.text
        ? processTextWithMentionFromBackEnd(messageToEdit.body.text, [
          ...messageToEdit.body.mentionIds,
        ])
        : undefined;
      if (value) {
        // thêm space tránh case mention ở cuối text
        textInputValueRef.current = value.text;
        setTextInputValue(value.text + ' ');
        setMentions(value.mentions);
      }

      // nếu uri của message chưa được update link remote thì khi edit
      // vẫn giữ được các media đã selected
      setSelectedMediaFromMediaPicker(
        messageToEdit.body.media.map<MediaPickerAsset>(item =>
          mapToMediaPickerAsset(item),
        ),
      );

      setSelectedFiles(messageToEdit.body.files);
    } else {
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setButtonSendEnabled(false);
      // onChangeText('');

      setSelectedMediaFromMediaPicker([]);
    }
  }, [useDeepCompareMemoize(messageToEdit)]);

  React.useEffect(() => {
    setButtonSendEnabled(prev => {
      const next =
        (textInputValue && textInputValue.trim().length > 0) ||
        selectedMedia.length > 0 ||
        selectedFiles.length > 0;

      if (prev !== next) {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }

      return next;
    });
  }, [textInputValue, selectedMedia.length, selectedFiles.length]);

  const sendActionContextValue = React.useMemo<PSMessageInputSendContextValue>(
    () => ({
      isButtonSendEnabled: isButtonSendEnabled,
      onSendMessagePress: onSendMessagePress,
    }),
    [isButtonSendEnabled, onSendMessagePress],
  );

  const textContextValue = React.useMemo<PSMessageInputTextContextValue>(() => {
    const result = processTextWithMentionToBackend(
      textInputValue,
      mentions ?? [],
    );
    return {
      text: result.text,
      mentionIds: result.mentionIds,
      onChangeText: onChangeText,
      handleSelectionChange: handleSelectionChange,
    } as PSMessageInputTextContextValue;
  }, [
    textInputValue,
    useDeepCompareMemoize(mentions),
    onChangeText,
    handleSelectionChange,
  ]);

  const mediaContextValue =
    React.useMemo<PSMessageInputMediaContextValue>(() => {
      return {
        selectedMedia: selectedMedia,
      } as PSMessageInputMediaContextValue;
    }, [selectedMedia]);

  const fileContextValue = React.useMemo<PSMessageInputFileContextValue>(() => {
    return {
      selectedFiles: selectedFiles,
      setSelectedFiles: setSelectedFiles,
      openFileManager: onOpenFileManagerPress,
    } as PSMessageInputFileContextValue;
  }, [selectedFiles, onOpenFileManagerPress]);

  const pollContextValue = React.useMemo<PSMessageInputPollContextValue>(() => {
    return {
      openCreatePoll: openCreatePollPress,
    } as PSMessageInputPollContextValue;
  }, [openCreatePollPress]);

  return (
    <PSMessageInputRefContext.Provider value={textInputRef}>
      <PSMessageImagePickerContext.Provider value={onImagePickerPress}>
        <PSMessageInputCameraContext.Provider value={onOpenCameraPress}>
          <PSMessageInputMediaContext.Provider value={mediaContextValue}>
            <PSMessageInputFileContext.Provider value={fileContextValue}>
              <PSMessageInputPollContext.Provider value={pollContextValue}>
                <PSMessageInputTextContext.Provider value={textContextValue}>
                  <PSMessageInputSendContext.Provider
                    value={sendActionContextValue}>
                    <PSMessageInputReplyChatBotContext.Provider
                      value={onReplyChatBot}>
                      <PSMessageInputSendStickerContext.Provider
                        value={onSendSticker}>
                        <PSMessageInputMentionUserPressContext.Provider
                          value={onSuggestedMentionUserPress}>
                          {children}
                        </PSMessageInputMentionUserPressContext.Provider>
                      </PSMessageInputSendStickerContext.Provider>
                    </PSMessageInputReplyChatBotContext.Provider>
                  </PSMessageInputSendContext.Provider>
                </PSMessageInputTextContext.Provider>
              </PSMessageInputPollContext.Provider>
            </PSMessageInputFileContext.Provider>
          </PSMessageInputMediaContext.Provider>
        </PSMessageInputCameraContext.Provider>
      </PSMessageImagePickerContext.Provider>
    </PSMessageInputRefContext.Provider>
  );
};

export const usePSMessageInputRefContext = () =>
  useContext(PSMessageInputRefContext);

export const usePSMessageImagePickerContext = () =>
  useContext(PSMessageImagePickerContext);

export const usePSMessageInputCameraContext = () =>
  useContext(PSMessageInputCameraContext);

export const usePSMessageInputMediaContext = () =>
  useContext(PSMessageInputMediaContext);

export const usePSMessageInputFileContext = () =>
  useContext(PSMessageInputFileContext);

export const usePSMessageInputPollContext = () =>
  useContext(PSMessageInputPollContext);

export const usePSMessageInputTextContext = () =>
  useContext(PSMessageInputTextContext);

export const usePSMessageInputMentionUserPressContext = () =>
  useContext(PSMessageInputMentionUserPressContext);

export const usePSMessageInputSendContext = () =>
  useContext(PSMessageInputSendContext);

export const usePSMessageInputReplyChatBotContext = () =>
  useContext(PSMessageInputReplyChatBotContext);

export const usePSMessageInputSendStickerContext = () =>
  useContext(PSMessageInputSendStickerContext);
