import {
  PSDeleteMessageLevel,
  PSRoleThreadType,
  PSThreadType,
  PSUserType,
} from '@communi/chat-api-client-typescript';
import React, {useMemo} from 'react';
import isEqual from 'react-fast-compare';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSScreenStylesContext,
  usePSSendMessageContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../../context';
import {useDeepCompareMemoize} from '../../../../../hooks';
import {
  IcLine152Square,
  IcLine15ArrowShapeTurnLeft,
  IcLine15ArrowShapeTurnRight,
  IcLine15BubbleEllipse3DotCheckMark,
  IcLine15CircleArrow,
  IcLine15Pencil,
  IcLine15Pin,
  IcLine15Trash,
  IconProps,
  PSIcComment24,
  PSIcCopyLink24,
  PSIcReport24,
  PSIcShare24,
} from '../../../../../icons';
import {PSMessageModel, PSThreadEntity} from '../../../../../types';
import {
  hapticHeavy,
  psLogger,
  setClipboardString,
  shareFile,
  shareImage,
  shareText,
} from '../../../../../utils';
import {processTextWithMentionFromBackEnd} from '../../../../PSRichText';
import {PSFlashMessage} from '../../../../flash-message';
import {PSMessagesStyles} from '../../../PSMessagesStyles';
import {
  usePSDeleteMessageContext,
  usePSEditMessageSetIdContext,
  usePSMessageActionsOverlayContext,
  usePSMessageActionsOverlayModeContext,
  usePSMessageCreateSubThreadContext,
  usePSMessageCurrentThreadIdContext,
  usePSMessageInputRefContext,
  usePSMessageIsSubthreadContext,
  usePSMessageNavigationContext,
  usePSMessagePermissionByCustomerContext,
  usePSMessageUserBlockContext,
  usePSPinMessageActionContext,
  usePSReplyMessageSetIdContext,
  usePSSelectMessageActionContext,
} from '../../../contexts';
import {
  MESSAGE_AVATAR_SENDER_SIZE,
  MESSAGE_BORDER_RADIUS,
  MESSAGE_CONTENT_MARGIN_AVATAR,
} from '../../PSMessageItem';

export enum PSMessageAction {
  RESEND = 'resend',
  COMMENT = 'comment',
  REPLY = 'reply',
  FORWARD = 'forward',
  EDIT = 'edit',
  PIN = 'pin',
  UNPIN = 'unpin',
  COPY = 'copy',
  COPY_MESSAGE_LINK = 'copy_message_link',
  SHARE = 'share',
  SELECT = 'select',
  REPORT = 'report',
  DELETE = 'delete',
  DELETE_ME = 'delete_me',
  DELETE_ALL = 'delete_all',
}

function isPSMessageAction(value: string): value is PSMessageAction {
  return Object.values(PSMessageAction).includes(value as PSMessageAction);
}

export type MessageActionItem = {
  id: string;
  text: string;
  icon: React.FC<IconProps>;
  color?: string;
  positionInMenuOptions?: number;
  onPress?: null | ((message: PSMessageModel) => void) | undefined;
};

export const PSMessageActionsOverlayActions = React.memo(
  ({message, isPinned}: {message: PSMessageModel; isPinned: boolean}) => {
    const {translator} = usePSTranslationContext();

    const {colors} = usePSDesignSystemContext();

    const realm = useRealm();

    const currentThreadId = usePSMessageCurrentThreadIdContext();

    const {mode} = usePSMessageActionsOverlayModeContext();

    const messageStyles = usePSScreenStylesContext<PSMessagesStyles>();

    const {isBlockedByMe, isBlockedByPartner} = usePSMessageUserBlockContext();

    const canChatPermissionByCustomer =
      usePSMessagePermissionByCustomerContext();

    const thread = useMemo(() => {
      if (!currentThreadId) {
        return null;
      }
      const currentThread = PSThreadEntity.getFirstById(realm, currentThreadId);
      return currentThread;
    }, [realm, currentThreadId]);

    const isSubThread = usePSMessageIsSubthreadContext();

    const setting = useMemo(() => {
      return thread?.setting?.permissions?.filter(
        ite => ite.userRole === thread?.role,
      )?.[0];
    }, [useDeepCompareMemoize(thread?.setting?.permissions)]);

    const isHasPermissionToDeleteMessageOthers = React.useMemo(() => {
      if (
        thread?.type === PSThreadType.GROUP &&
        (thread?.role === PSRoleThreadType.ADMIN ||
          thread?.role === PSRoleThreadType.OWNER)
      ) {
        return true;
      } else {
        return false;
      }
    }, [thread?.type, thread?.role]);

    const isHasPermissionToPin = React.useMemo(() => {
      if (isBlockedByMe || isBlockedByPartner || !canChatPermissionByCustomer)
        return false;
      if (isSubThread) return false;
      if (thread?.partner?.type === PSUserType.BOT) return false;
      if (
        thread?.type === PSThreadType.GROUP &&
        (thread?.role === PSRoleThreadType.OWNER ||
          setting?.permission?.pinMessage)
      ) {
        return true;
      } else if (thread?.type === PSThreadType.DIRECT) {
        return true;
      } else {
        return false;
      }
    }, [thread?.type, thread?.role, setting]);

    const isHasPermissionToUnPin = React.useMemo(() => {
      if (isBlockedByMe || isBlockedByPartner || !canChatPermissionByCustomer)
        return false;
      if (isSubThread) return false;
      if (thread?.partner?.type === PSUserType.BOT) return false;
      if (
        thread?.type === PSThreadType.GROUP &&
        (thread?.role === PSRoleThreadType.OWNER ||
          setting?.permission?.unpinMessage)
      ) {
        return true;
      } else if (thread?.type === PSThreadType.DIRECT) {
        return true;
      } else {
        return false;
      }
    }, [thread?.type, thread?.role, setting]);

    const isHasPermissionComment = React.useMemo(() => {
      if (
        thread?.type === PSThreadType.GROUP &&
        (thread?.role === PSRoleThreadType.OWNER ||
          setting?.permission?.sendComment) &&
        !isSubThread
      ) {
        return true;
      } else {
        return false;
      }
    }, [
      thread?.partner?.type,
      thread?.type,
      setting?.permission?.sendComment,
      isSubThread,
    ]);

    const messageActions: MessageActionItem[] = React.useMemo(() => {
      if (!currentThreadId) {
        return [];
      }
      let array: MessageActionItem[] = [];
      if (mode === 'delete') {
        const thread = PSThreadEntity.getFirstById(realm, currentThreadId);
        if (thread && message.status === 'sent') {
          array.push({
            id: PSMessageAction.DELETE_ALL,
            text:
              thread.type === PSThreadType.DIRECT && thread.partner
                ? translator(
                    'ps_message_action_delete_all_direct_thread',
                    // @ts-ignore
                    {
                      name: thread.partner.name,
                    },
                  )
                : translator('ps_message_action_delete_all_group_thread'),
            icon: IcLine15Trash,
            color: colors.Negative.normal,
          });
        }

        if (message.isMyMessage && thread?.partner?.type !== PSUserType.BOT) {
          array.push({
            id: PSMessageAction.DELETE_ME,
            text: translator('ps_message_action_delete_me'),
            icon: IcLine15Trash,
            color: colors.Negative.normal,
          });
        }
      } else if (message.status === 'sent') {
        if (isHasPermissionComment) {
          array.push({
            id: PSMessageAction.COMMENT,
            text: translator('ps_message_action_comment'),
            icon: PSIcComment24,
          });
        }

        array.push({
          id: PSMessageAction.REPLY,
          text: translator('ps_message_action_reply'),
          icon: IcLine15ArrowShapeTurnLeft,
        });

        if (!message.body?.poll) {
          array.push({
            id: PSMessageAction.FORWARD,
            text: translator('ps_message_action_forward'),
            icon: IcLine15ArrowShapeTurnRight,
          });
        }

        if (message.body?.text && !message.body?.sticker) {
          array.push({
            id: PSMessageAction.COPY,
            text: translator('ps_message_action_copy_message'),
            icon: IcLine152Square,
          });
        }
        if (messageStyles.messageActions?.domainLinkMessage) {
          array.push({
            id: PSMessageAction.COPY_MESSAGE_LINK,
            text: translator('ps_message_action_copy_message_link'),
            icon: PSIcCopyLink24,
          });
        }

        if (
          (message.body?.media?.length &&
            message.body?.media?.length === 1 &&
            message.body?.media?.[0]?.srcUrl.startsWith('http')) ||
          (message.body?.files?.length &&
            message.body?.files?.length === 1 &&
            message.body?.files?.[0]?.srcUrl.startsWith('http')) ||
          message.body?.text
        ) {
          array.push({
            id: PSMessageAction.SHARE,
            text: translator('ps_message_action_share'),
            icon: PSIcShare24,
          });
        }

        if (
          message.isMyMessage &&
          !message.body?.poll &&
          !message.body?.sticker &&
          !message.body?.media?.length &&
          thread?.partner?.type !== PSUserType.BOT
        ) {
          array.push({
            id: PSMessageAction.EDIT,
            text: translator('ps_message_action_edit'),
            icon: IcLine15Pencil,
          });
        }

        if (isPinned && isHasPermissionToUnPin) {
          array.push({
            id: PSMessageAction.UNPIN,
            text: translator('ps_message_action_unpin'),
            icon: IcLine15Pin,
          });
        }

        if (!isPinned && isHasPermissionToPin) {
          array.push({
            id: PSMessageAction.PIN,
            text: translator('ps_message_action_pin'),
            icon: IcLine15Pin,
          });
        }

        if (!message.body?.poll) {
          array.push({
            id: PSMessageAction.SELECT,
            text: translator('ps_message_action_select'),
            icon: IcLine15BubbleEllipse3DotCheckMark,
          });
        }

        if (messageStyles.messageActions?.isShowReportAction) {
          array.push({
            id: PSMessageAction.REPORT,
            text: translator('ps_message_action_report'),
            icon: PSIcReport24,
          });
        }

        if (message.isMyMessage || isHasPermissionToDeleteMessageOthers) {
          if (thread?.partner?.type !== PSUserType.BOT)
            array.push({
              id: PSMessageAction.DELETE,
              text: translator('ps_message_action_delete'),
              icon: IcLine15Trash,
              color: 'red',
            });
        }
      } else if (message.isMyMessage) {
        array.push({
          id: PSMessageAction.RESEND,
          text: translator('ps_message_action_resend'),
          icon: IcLine15CircleArrow,
        });

        array.push({
          id: PSMessageAction.DELETE,
          text: translator('ps_message_action_delete'),
          icon: IcLine15Trash,
          color: 'red',
        });
      }

      if (messageStyles.messageActions?.allowedActions) {
        array = array.filter(
          action =>
            isPSMessageAction(action.id) &&
            messageStyles.messageActions?.allowedActions?.includes(action.id),
        );
      }

      if (messageStyles.messageActions?.renderMessageMenuOptions) {
        messageStyles.messageActions?.renderMessageMenuOptions.forEach(
          option => {
            array.splice(option.positionInMenuOptions ?? 0, 0, option);
          },
        );
      }

      return array;
    }, [
      currentThreadId,
      mode,
      realm,
      message.status,
      message.body?.poll,
      message.body?.text,
      message.body?.sticker,
      message.isMyMessage,
      translator,
      colors.Negative.normal,
      isPinned,
      messageStyles.messageActions?.isShowReportAction,
      messageStyles.messageActions?.allowedActions,
      isHasPermissionToDeleteMessageOthers,
    ]);

    const [containerWidth, setContainerWidth] = React.useState<
      number | undefined
    >(undefined);

    const onContainerLayout = React.useCallback(
      (event: LayoutChangeEvent) => {
        const {width} = event.nativeEvent.layout;
        if (containerWidth && width > containerWidth) return;
        setContainerWidth(width);
      },
      [containerWidth],
    );

    const containerStyles = React.useMemo(() => {
      return [
        styles.actionList,
        {
          width: containerWidth,
        },
        {
          backgroundColor: colors.Primary.white,
          borderColor: colors.Primary.linerBorder,
          marginStart: message.isMyMessage
            ? undefined
            : MESSAGE_AVATAR_SENDER_SIZE + MESSAGE_CONTENT_MARGIN_AVATAR,
        },
      ];
    }, [colors.Primary.white, message.isMyMessage]);

    return (
      <View style={containerStyles} onLayout={onContainerLayout}>
        {messageActions.map(item => (
          <ActionItem
            key={`${item.id}_${containerWidth}`}
            item={item}
            message={message}
            containerWidth={containerWidth}
          />
        ))}
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const ActionItem = React.memo(
  ({
    item,
    message,
    containerWidth,
  }: {
    item: MessageActionItem;
    message: PSMessageModel;
    containerWidth?: number;
  }) => {
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const domainLinkMessage =
      usePSScreenStylesContext<PSMessagesStyles>().messageActions
        ?.domainLinkMessage;

    const {createSubThread} = usePSMessageCreateSubThreadContext();

    const {retrySendMessage} = usePSSendMessageContext();

    const replyMessage = usePSReplyMessageSetIdContext();

    const {pinMessage, unpinMessage} = usePSPinMessageActionContext();

    const editMessage = usePSEditMessageSetIdContext();

    const deleteMessage = usePSDeleteMessageContext();

    const {onForwardMessage, onShareMessagePress} =
      usePSMessageNavigationContext();

    const {hide} = usePSMessageActionsOverlayContext();

    const {setMode} = usePSMessageActionsOverlayModeContext();

    const {selectMessage} = usePSSelectMessageActionContext();

    const textInputRef = usePSMessageInputRefContext();

    const IconActionType = item.icon;

    const onPress = () => {
      if (item.id !== PSMessageAction.DELETE) {
        hapticHeavy();
        hide();
      }
      switch (item.id) {
        case PSMessageAction.COMMENT:
          createSubThread(message.id);
          break;
        case PSMessageAction.RESEND:
          retrySendMessage(message.threadId, message.primaryKey);
          break;
        case PSMessageAction.REPLY:
          replyMessage(message.id);
          setTimeout(() => textInputRef.current?.focus(), 300);
          break;
        case PSMessageAction.FORWARD:
          onForwardMessage?.(message.threadId, [message.id]);
          break;
        case PSMessageAction.EDIT:
          editMessage(message.id);
          setTimeout(() => textInputRef.current?.focus(), 300);
          break;
        case PSMessageAction.PIN:
          pinMessage(message.id);
          break;
        case PSMessageAction.UNPIN:
          unpinMessage(message.id);
          break;
        case PSMessageAction.COPY:
          const text = message.body?.isRtf
            ? message.body?.plainText
            : processTextWithMentionFromBackEnd(
                message.body?.text ?? '',
                message.body?.mentionIds ?? [],
              )?.text;
          if (text) {
            setClipboardString(text);
            PSFlashMessage.show({
              type: 'success',
              text1: translator('ps_message_action_copied'),
              position: 'bottom',
              visibilityTime: 2000,
            });
          }
          break;
        case PSMessageAction.COPY_MESSAGE_LINK:
          if (!domainLinkMessage) {
            PSFlashMessage.show({
              type: 'error',
              text1: 'domainLinkMessage not configured',
              position: 'bottom',
              visibilityTime: 2000,
            });
            return;
          }
          setClipboardString(
            `${domainLinkMessage}/${message.threadId}/${message.id}`,
          );
          PSFlashMessage.show({
            type: 'success',
            text1: translator('ps_message_action_message_link_copied'),
            position: 'bottom',
            visibilityTime: 2000,
          });
          break;
        case PSMessageAction.SHARE:
          setTimeout(() => {
            // return onShareMessagePress?.(message);
            if (message.body?.media?.length) {
              shareFile(message.body?.media[0]!.srcUrl);
            } else if (message.body?.files?.length) {
              shareFile(message.body?.files[0]!.srcUrl);
            } else if (message.body?.text) {
              shareText({
                text: processTextWithMentionFromBackEnd(
                  message.body?.text ?? '',
                  message.body?.mentionIds ?? [],
                ).text,
              });
            }
          }, 300);
          break;
        case PSMessageAction.SELECT:
          selectMessage(message.id);
          break;
        case PSMessageAction.REPORT:
          PSFlashMessage.show({
            type: 'success',
            text1: 'Submitted successfully',
            position: 'bottom',
            visibilityTime: 2000,
          });
          break;
        case PSMessageAction.DELETE:
          setMode('delete');
          break;
        case PSMessageAction.DELETE_ME:
          deleteMessage(
            message.threadId,
            message.primaryKey,
            PSDeleteMessageLevel.ME,
          );
          break;
        case PSMessageAction.DELETE_ALL:
          deleteMessage(
            message.threadId,
            message.primaryKey,
            PSDeleteMessageLevel.ALL,
          );
          break;
        default:
          item.onPress?.(message);
          break;
      }
    };

    const textStyles = React.useMemo(() => {
      return [
        typography.bodyXLargeR,
        {
          color: item.color ?? colors.Primary.mainText,
        },
        {marginStart: 8, flex: containerWidth ? 1 : undefined},
      ];
    }, [colors.Primary.mainText, item.color, typography.bodyXLargeR]);

    return (
      <Pressable
        onPress={onPress}
        style={({pressed}) => [
          styles.actionItem,
          {
            backgroundColor: pressed
              ? colors.Primary.background
              : colors.Primary.white,
            opacity: pressed ? 0.6 : 1,
            maxWidth: containerWidth,
          },
        ]}>
        <IconActionType
          width={24}
          height={24}
          fill={item.color ?? colors.Primary.branding}
        />
        <Text style={textStyles}>{item.text}</Text>
        {/* <View style={styles.iconContainer}>
          <IconActionType
            width={(24).px()}
            height={(24).px()}
            fill={item.color ?? colors.Primary.branding}
          />
        </View> */}
      </Pressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  actionList: {
    borderRadius: MESSAGE_BORDER_RADIUS,
    // width: (195).px(),
    marginTop: (12).px(),
    gap: (0.5).px(),
    overflow: 'hidden',
    borderWidth: 1,
    padding: 4,
  },
  actionItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: (8).px(),
    paddingHorizontal: (12).px(),
    alignSelf: 'flex-start',
  },
  iconContainer: {alignItems: 'flex-end'},
});
