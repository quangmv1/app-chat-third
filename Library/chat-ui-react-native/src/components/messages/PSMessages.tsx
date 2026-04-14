import React, { Fragment, PropsWithChildren } from 'react';
import isEqual from 'react-fast-compare';
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import {
  PSMediaPickerProvider,
  PSScreenStylesProvider,
  PSStickerPickerProvider,
  usePSDesignSystemContext,
  usePSPartitioningPathContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
} from '../../context';
import { PSMessageModel } from '../../types';
import { PSBusEvent, PSEventBus } from '../../utils';
import { PSAlbumsPicker } from '../media-picker';
import { PSNetInfoStatus } from '../PSNetInfoStatus';
import { PSTagsPickerOverlay, PSTagsPickerProvider } from '../tags';
import {
  PSBottomMessagesObjectView,
  PSBottomMessagesView,
  PSCustomerRating,
  PSMessageActionsOverlay,
  PSMessageActionsSelector,
  PSMessageChatBotAgainStarted,
  PSMessageChatBotCommandOverlay,
  PSMessageChatBotGetStarted,
  PSMessageCreatePoll,
  PSMessageEmojiPicker,
  PSMessageInput,
  PSMessageInputBlockUser,
  PSMessageInputWarn,
  PSMessageJoinGroup,
  PSMessagePermissionByCustomer,
  PSMessagePollAddOptionPopUp,
  PSMessagePollVotedUsersOverlay,
  PSMessageReactionsOverlay,
  PSMessagesActionBar,
  PSMessageSeenUsersOverlay,
  PSMessagesFloatingButtons,
  PSMessagesKeyboardHeightView,
  PSMessagesList,
  PSMessagesSuggestions,
  PSMessageStickerPicker,
  PSMessagesTypingIndicator,
  PSPinnedMessages
} from './components';
import {
  PSActiveUserCountInThreadProvider,
  PSCustomizedMessageItemFactoryProvider,
  PSDeleteMessageProvider,
  PSEditMessageProvider,
  PSFormProvider,
  PSHighlightMessageAfterScrollProvider,
  PSMessageActionsOverlayProvider,
  PSMessageChatBotCommandOverlayProvider,
  PSMessageCreateSubThreadProvider,
  PSMessageCurrentThreadProvider,
  PSMessageGetUserIdProvider,
  PSMessageHeaderTimeProvider,
  PSMessageInputAttachmentItem,
  PSMessageInputAttachmentProvider,
  PSMessageInputProvider,
  PSMessageKeyboardAreaProvider,
  PSMessageManageAccessPhotosOverlayProvider,
  PSMessageMediaViewerProvider,
  PSMessageModeProvider,
  PSMessageNavigationContextValue,
  PSMessageNavigationProvider,
  PSMessageObjectProvider,
  PSMessagePermissionByCustomerProvider,
  PSMessagePermissionProvider,
  PSMessagePollOverlayProvider,
  PSMessagePollProvider,
  PSMessagePreviewLinkProvider,
  PSMessageReactionProvider,
  PSMessageReactionsOverlayProvider,
  PSMessageSeenUserOverlayProvider,
  PSMessageSeenUserProvider,
  PSMessageSuggestionMentionsContextProvider,
  PSMessageUserBlockProvider,
  PSMessageUserDeActivatedProvider,
  PSPaginatedMessagesProvider,
  PSPinnedMessagesProvider,
  PSRatingProvider,
  PSReplyMessageProvider,
  PSSelectMessageProvider,
  usePSMessageAgainStartedChatBotContext,
  usePSMessageCurrentThreadIdContext,
  usePSMessageGetStartedChatBotContext,
  usePSMessageIsNotMemberOfPublicThreadContext,
  usePSMessageNavigationContext,
  usePSMessagePermissionByCustomerContext,
  usePSMessagePermissionSendCommentContext,
  usePSMessagePermissionSendMessageContext,
  usePSMessageUserBlockContext,
  usePSMessageUserDeActivatedContext,
  usePSScrollToMessageContext,
  usePSSelectMessageIsEnabledContext
} from './contexts';
import { PSMessagesStyles } from './PSMessagesStyles';

export type PSMessagesProps = PSMessageNavigationContextValue & {
  targetThreadId?: string;
  targetUserId?: string;
  targetMessageId?: number;
  screenContext?: string;
  startCommand?: string;
  messagesStyles?: PSMessagesStyles;
  isExportUserId?: boolean;
  customizedMessageItemFactory?:
  | null
  | ((message: PSMessageModel) => React.JSX.Element | null);
  customizedMessageInputAttachment?: PSMessageInputAttachmentItem[];
};

const PSMessagesProviders = ({
  targetThreadId,
  targetUserId,
  targetMessageId,
  screenContext,
  startCommand,
  isExportUserId,
  messagesStyles,
  customizedMessageItemFactory,
  onBackPress,
  onCompleteLeaveThread,
  onThreadProfilePress,
  onThreadDeskProfilePress,
  onUrlPress,
  onPhoneNumberPress,
  onEmailPress,
  onForwardMessage,
  onMessagesPinnedPress,
  onViewFilePress,
  onUserPress,
  onShareMessagePress,
  onChatBotActionPress,
  onCommentPress,
  onSearchMessagePress,
  onParentThreadPress,
  onViewFileUrlPress,
  children,
  customizedMessageInputAttachment,
}: PropsWithChildren<PSMessagesProps>) => {
  if (!targetThreadId && !targetUserId) {
    throw Error('targetThreadId và targetUserId không thể cùng null');
  }
  return (
    <PSMessageNavigationProvider
      onBackPress={onBackPress}
      onCompleteLeaveThread={onCompleteLeaveThread}
      onThreadProfilePress={onThreadProfilePress}
      onThreadDeskProfilePress={onThreadDeskProfilePress}
      onUrlPress={onUrlPress}
      onPhoneNumberPress={onPhoneNumberPress}
      onEmailPress={onEmailPress}
      onForwardMessage={onForwardMessage}
      onMessagesPinnedPress={onMessagesPinnedPress}
      onViewFilePress={onViewFilePress}
      onUserPress={onUserPress}
      onShareMessagePress={onShareMessagePress}
      onChatBotActionPress={onChatBotActionPress}
      onCommentPress={onCommentPress}
      onSearchMessagePress={onSearchMessagePress}
      onParentThreadPress={onParentThreadPress}
      onViewFileUrlPress={onViewFileUrlPress}>
      <PSScreenStylesProvider styles={messagesStyles}>
        <PSCustomizedMessageItemFactoryProvider
          customizedMessageItemFactory={customizedMessageItemFactory}>
          <PSMessageCurrentThreadProvider
            targetThreadId={targetThreadId}
            targetUserId={targetUserId}
            screenContext={screenContext}
            startCommand={startCommand}>
            <PSActiveUserCountInThreadProvider>
              <PSMessageInputAttachmentProvider items={customizedMessageInputAttachment}>
                <PSMessagePermissionProvider>
                  <PSMessagePermissionByCustomerProvider>
                    <PSMessageGetUserIdProvider isExportUserId={isExportUserId}>
                      <PSMessageUserBlockProvider>
                        <PSMessageUserDeActivatedProvider>
                          <PSMessageSeenUserProvider>
                            <PSMessageModeProvider>
                              <PSSelectMessageProvider>
                                <PSReplyMessageProvider>
                                  <PSEditMessageProvider>
                                    <PSDeleteMessageProvider>
                                      <PSPinnedMessagesProvider>
                                        <PSHighlightMessageAfterScrollProvider>
                                          <PSPaginatedMessagesProvider
                                            targetThreadId={targetThreadId}
                                            targetUserId={targetUserId}
                                            targetMessageId={targetMessageId}>
                                            <PSMessageKeyboardAreaProvider>
                                              <PSMediaPickerProvider
                                                maxNumberOfFiles={
                                                  messagesStyles?.attachment
                                                    ?.maxNumberOfMedia
                                                }>
                                                <PSTagsPickerProvider>
                                                  <PSStickerPickerProvider>
                                                    <PSMessageReactionProvider>
                                                      <PSMessageSuggestionMentionsContextProvider>
                                                        <PSMessagePreviewLinkProvider>
                                                          <PSMessagePollProvider>
                                                            <PSMessageInputProvider>
                                                              {/* <PSMessageJsonPayloadProvider> */}
                                                              <PSMessageObjectProvider>
                                                                <PSMessageChatBotCommandOverlayProvider
                                                                  startCommand={
                                                                    startCommand
                                                                  }>
                                                                  <PSMessageSeenUserOverlayProvider>
                                                                    <PSMessagePollOverlayProvider>
                                                                      <PSMessageReactionsOverlayProvider>
                                                                        <PSMessageActionsOverlayProvider>
                                                                          <PSMessageMediaViewerProvider>
                                                                            <PSMessageHeaderTimeProvider>
                                                                              <PSMessageCreateSubThreadProvider>
                                                                                <PSFormProvider>
                                                                                  <PSRatingProvider>
                                                                                    <PSMessageManageAccessPhotosOverlayProvider>
                                                                                      {
                                                                                        children
                                                                                      }
                                                                                    </PSMessageManageAccessPhotosOverlayProvider>
                                                                                  </PSRatingProvider>
                                                                                </PSFormProvider>
                                                                              </PSMessageCreateSubThreadProvider>
                                                                            </PSMessageHeaderTimeProvider>
                                                                          </PSMessageMediaViewerProvider>
                                                                        </PSMessageActionsOverlayProvider>
                                                                      </PSMessageReactionsOverlayProvider>
                                                                    </PSMessagePollOverlayProvider>
                                                                  </PSMessageSeenUserOverlayProvider>
                                                                </PSMessageChatBotCommandOverlayProvider>
                                                              </PSMessageObjectProvider>
                                                              {/* </PSMessageJsonPayloadProvider> */}
                                                            </PSMessageInputProvider>
                                                          </PSMessagePollProvider>
                                                        </PSMessagePreviewLinkProvider>
                                                      </PSMessageSuggestionMentionsContextProvider>
                                                    </PSMessageReactionProvider>
                                                  </PSStickerPickerProvider>
                                                </PSTagsPickerProvider>
                                              </PSMediaPickerProvider>
                                            </PSMessageKeyboardAreaProvider>
                                          </PSPaginatedMessagesProvider>
                                        </PSHighlightMessageAfterScrollProvider>
                                      </PSPinnedMessagesProvider>
                                    </PSDeleteMessageProvider>
                                  </PSEditMessageProvider>
                                </PSReplyMessageProvider>
                              </PSSelectMessageProvider>
                            </PSMessageModeProvider>
                          </PSMessageSeenUserProvider>
                        </PSMessageUserDeActivatedProvider>
                      </PSMessageUserBlockProvider>
                    </PSMessageGetUserIdProvider>
                  </PSMessagePermissionByCustomerProvider>
                </PSMessagePermissionProvider>
              </PSMessageInputAttachmentProvider>
            </PSActiveUserCountInThreadProvider>
          </PSMessageCurrentThreadProvider>
        </PSCustomizedMessageItemFactoryProvider>
      </PSScreenStylesProvider>
    </PSMessageNavigationProvider >
  );
};

const PSMessagesContainer = (props: PropsWithChildren) => {
  const messageStyles = usePSScreenStylesContext<PSMessagesStyles>();

  const { colors } = usePSDesignSystemContext();
  const { isScrolling } = usePSScrollToMessageContext();

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      { backgroundColor: colors.Primary.background },
      messageStyles.container,
    ];
  }, [colors.Neutral.n0, messageStyles.container]);

  return (
    <View style={containerStyles} pointerEvents={isScrolling ? 'none' : 'auto'}>
      {props.children}
      {isScrolling ? (
        <ActivityIndicator
          size={(32).px()}
          color={colors.Branding.b800}
          style={styles.activityIndicator}
        />
      ) : null}
    </View>
  );
};

const PSMessagesInternetStatus = () => {
  const { translator } = usePSTranslationContext();

  const { typography, colors } = usePSDesignSystemContext();

  return (
    <PSNetInfoStatus
      offlineText={translator('ps_no_internet_connection')}
      offlineTextStyle={[
        typography.bodyXLargeR,
        { color: colors.Primary.subText },
      ]}
      offlineBackgroundColor={colors.Neutral.n50}
      style={styles.netInfo}
    />
  );
};

const PSMessagesListFloatingWrapper = () => {
  const [visible, setVisible] = React.useState(false);

  React.useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 1000);
    return () => {
      clearTimeout(timeout);
      setVisible(false);
    };
  }, []);

  return visible ? <PSMessagesList /> : null;
};

const PSMessagesUI = () => {
  const messageStyles = usePSScreenStylesContext<PSMessagesStyles>();

  const { colors } = usePSDesignSystemContext();

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const { onBackPress, onCompleteLeaveThread } = usePSMessageNavigationContext();

  React.useEffect(() => {
    // Lắng nghe sự kiện xoá cuộc hội thoại 2 chiều.
    // Nếu đang ở màn hình chat của cuộc hội thoại đó thì thực hiện onBackPress
    const listener = PSEventBus.getInstance().subscribe(
      PSBusEvent.DELETE_THREAD_BOTH,
      threadId => {
        if (currentThreadId === threadId) {
          // default rời khỏi nhóm onBackPress 2màn hình
          onBackPress?.();
          typeof onCompleteLeaveThread === 'function'
            ? onCompleteLeaveThread()
            : onBackPress?.();
        }
      },
    );
    return () => listener.unsubscribe();
  }, [onCompleteLeaveThread, onBackPress, currentThreadId]);

  const backgroundStyles = React.useMemo(() => {
    return [
      styles.backgroundContainer,
      { backgroundColor: colors.Primary.bgBranding },
      messageStyles.background?.style,
    ];
  }, [colors.Primary.bgBranding, messageStyles.background?.style]);

  return (
    <Fragment>
      <PSMessagesContainer>
        <PSMessagesActionBar />
        <PSMessagesInternetStatus />
        {/* @ts-ignore */}
        <ImageBackground
          style={backgroundStyles}
          {...(messageStyles.background?.imageProps ?? {})}>
          {messageStyles.isFloating ? (
            <PSMessagesListFloatingWrapper />
          ) : (
            <PSMessagesList />
          )}
          <PSPinnedMessages />
          <PSCustomerRating />
          <PSMessagesFloatingButtons />
          <PSMessagesTypingIndicator />
          <PSMessagesSuggestions />
        </ImageBackground>
        <PSBottomMessagesView />
        <PSBottomMessagesObjectView />
        <PSMessagesBottomBar />
        <PSMessagesKeyboardHeightView />
      </PSMessagesContainer>
      <PSMessageStickerPicker />
      {/* <PSMessageMediaPicker /> */}
      <PSAlbumsPicker />
      <PSMessageEmojiPicker />
      <PSMessageReactionsOverlay />
      <PSMessageSeenUsersOverlay />
      <PSMessageActionsOverlay />
      <PSMessageCreatePoll />
      <PSMessagePollAddOptionPopUp />
      <PSMessagePollVotedUsersOverlay />
      <PSMessageChatBotCommandOverlay />
      <PSTagsPickerOverlay />
    </Fragment>
  );
};

const PSMessagesBottomBar = () => {
  const isNotMemberOfPublicThread =
    usePSMessageIsNotMemberOfPublicThreadContext();

  const canChatPermissionByCustomer = usePSMessagePermissionByCustomerContext();

  const { isBlockedByMe, isBlockedByPartner } = usePSMessageUserBlockContext();

  const isUserDeActivated = usePSMessageUserDeActivatedContext();

  const isHasSendMessagePermission = usePSMessagePermissionSendMessageContext();

  const isHasSendCommentPermission = usePSMessagePermissionSendCommentContext();

  const isSelectMessageEnabled = usePSSelectMessageIsEnabledContext();

  const isGetStartedChatBot = usePSMessageGetStartedChatBotContext();

  const isAgainStartedChatBot = usePSMessageAgainStartedChatBotContext();

  const { translator } = usePSTranslationContext();

  return !canChatPermissionByCustomer ? (
    <PSMessagePermissionByCustomer />
  ) : isBlockedByMe ? (
    <PSMessageInputBlockUser isBlockedByMe={true} />
  ) : isBlockedByPartner ? (
    <PSMessageInputBlockUser isBlockedByPartner={true} />
  ) : isUserDeActivated ? (
    <PSMessageInputWarn
      text={translator('ps_message_not_send_message_user_disabled')}
    />
  ) : isNotMemberOfPublicThread ? (
    <PSMessageJoinGroup />
  ) : !isHasSendMessagePermission ? (
    <PSMessageInputWarn
      text={translator('ps_message_not_send_message_permission_description')}
    />
  ) : isSelectMessageEnabled ? (
    <PSMessageActionsSelector />
  ) : isGetStartedChatBot ? (
    <PSMessageChatBotGetStarted />
  ) : !isHasSendCommentPermission ? (
    <PSMessageInputWarn
      text={translator('ps_message_not_send_comment_permission_description')}
    />
  ) : (
    <View>
      {isAgainStartedChatBot ? <PSMessageChatBotAgainStarted /> : null}
      <PSMessageInput />
    </View>
  );
};

export const PSMessages = React.memo(
  ({
    targetThreadId,
    targetUserId,
    targetMessageId,
    screenContext,
    startCommand,
    isExportUserId,
    messagesStyles,
    customizedMessageItemFactory,
    onBackPress,
    onCompleteLeaveThread,
    onThreadProfilePress,
    onThreadDeskProfilePress,
    onUrlPress,
    onPhoneNumberPress,
    onEmailPress,
    onForwardMessage,
    onMessagesPinnedPress,
    onViewFilePress,
    onUserPress,
    onShareMessagePress,
    onChatBotActionPress,
    onCommentPress,
    onSearchMessagePress,
    onParentThreadPress,
    onViewFileUrlPress,
    customizedMessageInputAttachment,
  }: PSMessagesProps) => {
    const pathDB = usePSPartitioningPathContext();

    console.log('trolll')

    return (
      <Fragment key={pathDB}>
        <PSMessagesProviders
          targetThreadId={targetThreadId}
          targetUserId={targetUserId}
          targetMessageId={targetMessageId}
          screenContext={screenContext}
          startCommand={startCommand}
          messagesStyles={messagesStyles}
          isExportUserId={isExportUserId}
          customizedMessageItemFactory={customizedMessageItemFactory}
          onBackPress={onBackPress}
          onCompleteLeaveThread={onCompleteLeaveThread}
          onThreadProfilePress={onThreadProfilePress}
          onThreadDeskProfilePress={onThreadDeskProfilePress}
          onUrlPress={onUrlPress}
          onPhoneNumberPress={onPhoneNumberPress}
          onEmailPress={onEmailPress}
          onForwardMessage={onForwardMessage}
          onMessagesPinnedPress={onMessagesPinnedPress}
          onViewFilePress={onViewFilePress}
          onUserPress={onUserPress}
          onShareMessagePress={onShareMessagePress}
          onChatBotActionPress={onChatBotActionPress}
          onCommentPress={onCommentPress}
          onSearchMessagePress={onSearchMessagePress}
          onParentThreadPress={onParentThreadPress}
          onViewFileUrlPress={onViewFileUrlPress}
          customizedMessageInputAttachment={customizedMessageInputAttachment}
        >
          <PSMessagesUI />
        </PSMessagesProviders>
      </Fragment>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    flex: 1,
  },
  activityIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  netInfo: {
    marginHorizontal: (12).px(),
    borderRadius: (12).px(),
    marginTop: (8).px(),
  },
});
