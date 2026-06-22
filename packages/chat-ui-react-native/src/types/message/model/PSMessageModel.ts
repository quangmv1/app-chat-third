import {
  PSDeleteMessageLevel,
  PSThreadType,
} from '@communi/chat-api-client-typescript';
import {
  MESSAGE_BORDER_RADIUS,
  MESSAGE_BOTTOM_OR_MIDDLE_MARGIN_TOP,
  MESSAGE_TOP_OR_NORMAL_MARGIN_TOP,
  processTextWithMentionFromBackEnd,
} from '../../../components';
import {PSUserModel, mapUserEntityToModel} from '../../user';
import {PSMessageEntity, PSMessageStatus} from '../entity/PSMessageEntity';
import {
  PSMessageBodyModel,
  mapMessageBodyEntityToModel,
} from './PSMessageBodyModel';
import {
  PSMessageReactionModel,
  mapMessageReactionEntityToModel,
} from './PSMessageReactionModel';
import {PSTranslator} from '../../../translations';

export enum PSMessagePosition {
  TOP,
  MIDDLE,
  BOTTOM,
  NORMAL,
}

export enum PSVisibility {
  VISIBLE,
  INVISIBLE,
  GONE,
}

export enum PSFormStatus {
  INVITATION,
  SUBMISSION,
  SKIP,
  FORM_RESPONSE,
}

export type PSMessageModel = {
  primaryKey: string;
  id: number;
  requestId: string;
  threadId: string;
  sender: PSUserModel;
  body?: PSMessageBodyModel;
  reactions: PSMessageReactionModel[];
  createdAt: number;
  editedAt: number;
  isMyMessage: boolean;
  status: PSMessageStatus;
  deleteLevel?: PSDeleteMessageLevel;
  seenUsers: PSUserModel[];
  position: PSMessagePosition;
  isAvatarOriginVisible: boolean;
  avatarVisibility: PSVisibility;
  isSenderNameVisible: boolean;
  isHeaderTimeVisible: boolean;
  isFirstUnread: boolean;
  isHideStatus: boolean;
  subThreadId?: string;
  messageSubThreadCount?: number;
  formStatus?: PSFormStatus;
};

export const mapMessageEntityToModel = (
  myUserId: string,
  message: PSMessageEntity,
  seenUsers: PSUserModel[] = [],
  position: PSMessagePosition = PSMessagePosition.NORMAL,
  isAvatarOriginVisible: boolean = false,
  avatarVisibility: PSVisibility = PSVisibility.GONE,
  isSenderNameVisible: boolean = true,
  isHeaderTimeVisible: boolean = false,
  isFirstUnread: boolean = false,
  isHideStatus: boolean = true,
  formStatus: PSFormStatus | undefined = undefined,
): PSMessageModel => {
  return {
    primaryKey: message.primaryKey,
    id: message.id,
    requestId: message.requestId,
    threadId: message.threadId,
    sender: mapUserEntityToModel(
      message.body?.originalSender ?? message.sender,
    ),
    body: mapMessageBodyEntityToModel(myUserId, message.body),
    reactions: message.reactions.map(reaction =>
      mapMessageReactionEntityToModel(reaction),
    ),
    createdAt: message.createdAt,
    editedAt: message.editedAt,
    isMyMessage: message.sender.extUserId === myUserId,
    status: message.status,
    deleteLevel: message.deleteLevel,
    seenUsers: seenUsers.filter(
      item => item.extUserId !== message.sender.extUserId, // không hiển thị seen message của chính mình
    ),
    position: position,
    isAvatarOriginVisible: isAvatarOriginVisible,
    avatarVisibility: avatarVisibility,
    isSenderNameVisible: isSenderNameVisible,
    isHeaderTimeVisible: isHeaderTimeVisible,
    isFirstUnread: isFirstUnread,
    isHideStatus: isHideStatus,
    subThreadId: message.subThreadId,
    messageSubThreadCount: message.messageSubThreadCount,
    formStatus: formStatus,
  } as PSMessageModel;
};

export const mapMessagesEntityToModel = (
  myUserId: string,
  messages: PSMessageEntity[],
  messageSeenUsers: Record<number, PSUserModel[]>,
  isFirstUnreadMessageId?: number,
  threadType?: PSThreadType,
) => {
  return messages.mapWithPreviousAndNext<PSMessageModel>(
    (previous, current, _, next) => {
      const position = dealingWithPositionOfMessageGroupedByUser(
        current,
        previous,
        next,
      );

      const isMyMessage = current.sender.extUserId === myUserId;

      // nếu là chat 1-1 thì k có sender avatar
      const avatarVisibility =
        threadType === PSThreadType.DIRECT || isMyMessage
          ? PSVisibility.GONE
          : !isMyMessage &&
              (current.body?.quickReply != null ||
                current.body?.carousel != null ||
                position === PSMessagePosition.NORMAL ||
                position === PSMessagePosition.BOTTOM)
            ? PSVisibility.VISIBLE
            : PSVisibility.INVISIBLE;

      const isAvatarOriginVisible =
        !isMyMessage &&
        current.body?.originalSender != null &&
        (position === PSMessagePosition.NORMAL ||
          position === PSMessagePosition.TOP);

      const isSenderNameVisible =
        (threadType === PSThreadType.GROUP || isAvatarOriginVisible) &&
        !isMyMessage &&
        (position === PSMessagePosition.NORMAL ||
          position === PSMessagePosition.TOP);

      const isHeaderTimeVisible = current.isHeaderTimeVisible(
        next?.createdAt ?? 0,
      );

      const seenUsers =
        current.status === 'sent' ? messageSeenUsers[current.id] ?? [] : [];

      // Tìm max messageId có user seen
      const messageSeenUserIds = Object.keys(messageSeenUsers);
      const maxMessageSeenUserId =
        messageSeenUserIds.length > 0
          ? Math.max(
              ...messageSeenUserIds.map(messageId => parseInt(messageId)),
            )
          : PSMessageEntity.FIRST_MESSAGE_ID - 1;

      const messageFormStatus = !!current.body?.form
        ? !!current.editedAt && current.body.formSubmitted
          ? PSFormStatus.SUBMISSION
          : current.body.skip // &&  !!current.editedAt 
            ? PSFormStatus.SKIP
            : !current.editedAt && current.body.formSubmitted
              ? PSFormStatus.FORM_RESPONSE
              : PSFormStatus.INVITATION
        : undefined;

      return mapMessageEntityToModel(
        myUserId,
        current,
        seenUsers,
        position,
        isAvatarOriginVisible,
        avatarVisibility,
        isSenderNameVisible,
        isHeaderTimeVisible,
        isFirstUnreadMessageId === current.id && current.status === 'sent',
        maxMessageSeenUserId >= current.id && current.status === 'sent',
        messageFormStatus,
      );
    },
  );
};

export const isDeletedMessage = (
  isMyMessage: boolean,
  deleteLevel?: PSDeleteMessageLevel,
) => {
  if (deleteLevel) {
    if (deleteLevel === PSDeleteMessageLevel.ME && isMyMessage) {
      return true;
    } else {
      return deleteLevel === PSDeleteMessageLevel.ALL;
    }
  } else {
    return false;
  }
};

export const messagePositionToMarginVertical = (message: PSMessageModel) => {
  switch (message.position) {
    case PSMessagePosition.TOP:
      return {
        marginTop: MESSAGE_TOP_OR_NORMAL_MARGIN_TOP,
        marginBottom: 0,
      };
    case PSMessagePosition.MIDDLE:
      return {
        marginTop: MESSAGE_BOTTOM_OR_MIDDLE_MARGIN_TOP,
        marginBottom: 0,
      };
    case PSMessagePosition.BOTTOM:
      return {
        marginTop: MESSAGE_BOTTOM_OR_MIDDLE_MARGIN_TOP,
        marginBottom: 0,
      };
    default:
      return {
        marginTop: MESSAGE_TOP_OR_NORMAL_MARGIN_TOP,
        marginBottom: 0,
      };
  }
};

export const messagePositionToBorderRadius = (message: PSMessageModel) => {
  const borderTopStartRadius = MESSAGE_BORDER_RADIUS;
  const borderBottomStartRadius = MESSAGE_BORDER_RADIUS;

  let borderTopEndRadius = MESSAGE_BORDER_RADIUS;
  let borderBottomEndRadius = MESSAGE_BORDER_RADIUS;

  switch (message.position) {
    case PSMessagePosition.TOP:
      borderTopEndRadius = MESSAGE_BORDER_RADIUS;
      borderBottomEndRadius = MESSAGE_BORDER_RADIUS / 4;
      break;
    case PSMessagePosition.MIDDLE:
      borderTopEndRadius = MESSAGE_BORDER_RADIUS / 4;
      borderBottomEndRadius = MESSAGE_BORDER_RADIUS / 4;
      break;
    case PSMessagePosition.BOTTOM:
      borderTopEndRadius = MESSAGE_BORDER_RADIUS / 4;
      borderBottomEndRadius = MESSAGE_BORDER_RADIUS;
      break;
    case PSMessagePosition.NORMAL:
      borderTopEndRadius = MESSAGE_BORDER_RADIUS;
      borderBottomEndRadius = MESSAGE_BORDER_RADIUS;
      break;
  }

  return {
    borderTopStartRadius,
    borderTopEndRadius,
    borderBottomStartRadius,
    borderBottomEndRadius,
  };
};

export const messageMediaPositionToBorderRadius = (message: PSMessageModel) => {
  const hasContentAbove =
    message.body &&
    (message.body.forwardFrom ||
      message.body.repliedMessage ||
      message.isSenderNameVisible);
  const hasContentBelow =
    message.body &&
    ((message.body.text && message.body.text.length) ||
      message.body.previewLink);

  const isEdited = message.editedAt > 0;

  let borderTopStartRadius = MESSAGE_BORDER_RADIUS;
  let borderBottomStartRadius = MESSAGE_BORDER_RADIUS;

  let borderTopEndRadius = MESSAGE_BORDER_RADIUS;
  let borderBottomEndRadius = MESSAGE_BORDER_RADIUS;

  switch (message.position) {
    case PSMessagePosition.TOP:
      borderTopEndRadius = MESSAGE_BORDER_RADIUS;
      if (hasContentAbove) {
        borderTopStartRadius = 0;
        borderTopEndRadius = 0;
      }
      if (hasContentBelow) {
        borderBottomEndRadius = 0;
        borderBottomStartRadius = 0;
      } else if (isEdited) {
        borderBottomEndRadius = 0;
        borderBottomStartRadius = 0;
      } else {
        borderBottomEndRadius = MESSAGE_BORDER_RADIUS / 4;
      }
      break;
    case PSMessagePosition.MIDDLE:
      if (hasContentAbove) {
        borderTopStartRadius = 0;
        borderTopEndRadius = 0;
      } else {
        borderTopEndRadius = MESSAGE_BORDER_RADIUS / 4;
      }
      if (hasContentBelow) {
        borderBottomEndRadius = 0;
        borderBottomStartRadius = 0;
      } else if (isEdited) {
        borderBottomEndRadius = 0;
        borderBottomStartRadius = 0;
      } else {
        borderBottomEndRadius = MESSAGE_BORDER_RADIUS / 4;
      }
      break;
    case PSMessagePosition.BOTTOM:
      if (hasContentAbove) {
        borderTopStartRadius = 0;
        borderTopEndRadius = 0;
      } else {
        borderTopEndRadius = MESSAGE_BORDER_RADIUS / 4;
      }
      if (hasContentBelow) {
        borderBottomEndRadius = 0;
        borderBottomStartRadius = 0;
      } else if (isEdited) {
        borderBottomEndRadius = 0;
        borderBottomStartRadius = 0;
      } else {
        borderBottomEndRadius = MESSAGE_BORDER_RADIUS;
      }
      break;
    case PSMessagePosition.NORMAL:
      if (hasContentAbove) {
        borderTopStartRadius = 0;
        borderTopEndRadius = 0;
      } else {
        borderTopEndRadius = MESSAGE_BORDER_RADIUS;
      }
      if (hasContentBelow) {
        borderBottomEndRadius = 0;
        borderBottomStartRadius = 0;
      } else if (isEdited) {
        borderBottomEndRadius = 0;
        borderBottomStartRadius = 0;
      } else {
        borderBottomEndRadius = MESSAGE_BORDER_RADIUS;
      }
      break;
  }

  return {
    borderTopStartRadius,
    borderTopEndRadius,
    borderBottomStartRadius,
    borderBottomEndRadius,
  };
};

const dealingWithPositionOfMessageGroupedByUser = (
  current: PSMessageEntity,
  previous?: PSMessageEntity,
  next?: PSMessageEntity,
) => {
  const currentSenderExtUserId =
    current.body?.originalSender?.extUserId ?? current.sender.extUserId;
  if (previous && next) {
    const previousSenderExtUserId =
      previous.body?.originalSender?.extUserId ?? previous.sender.extUserId;
    const nextSenderExtUserId =
      next.body?.originalSender?.extUserId ?? next.sender.extUserId;
    if (
      previousSenderExtUserId === currentSenderExtUserId &&
      nextSenderExtUserId === currentSenderExtUserId
    ) {
      // phần tử trước và tiếp theo là của mình
      if (previous.isNormalMessage() && next.isNormalMessage()) {
        if (current.isHeaderTimeVisible(next.createdAt)) {
          if (previous.isHeaderTimeVisible(current.createdAt)) {
            return PSMessagePosition.NORMAL;
          } else {
            return PSMessagePosition.TOP;
          }
        } else {
          if (previous.isHeaderTimeVisible(current.createdAt)) {
            return PSMessagePosition.BOTTOM;
          } else {
            return PSMessagePosition.MIDDLE;
          }
        }
      } else if (!previous.isNormalMessage() && next.isNormalMessage()) {
        if (current.isHeaderTimeVisible(next.createdAt)) {
          return PSMessagePosition.NORMAL;
        } else {
          return PSMessagePosition.BOTTOM;
        }
      } else if (previous.isNormalMessage() && !next.isNormalMessage()) {
        if (previous.isHeaderTimeVisible(current.createdAt)) {
          return PSMessagePosition.NORMAL;
        } else {
          return PSMessagePosition.TOP;
        }
      } else {
        return PSMessagePosition.NORMAL;
      }
    } else if (
      previousSenderExtUserId !== currentSenderExtUserId &&
      nextSenderExtUserId === currentSenderExtUserId &&
      next.isNormalMessage()
    ) {
      // phần tử tiếp theo là của mình
      // vì FlatList.reverse = true nên là BOTTOM
      if (current.isHeaderTimeVisible(next.createdAt)) {
        return PSMessagePosition.NORMAL;
      } else {
        return PSMessagePosition.BOTTOM;
      }
    } else if (
      previousSenderExtUserId === currentSenderExtUserId &&
      nextSenderExtUserId !== currentSenderExtUserId &&
      previous.isNormalMessage()
    ) {
      // hiện tại là phần tử cuối cùng của mình
      // vì FlatList.reverse = true nên là TOP
      if (previous.isHeaderTimeVisible(current.createdAt)) {
        return PSMessagePosition.NORMAL;
      } else {
        return PSMessagePosition.TOP;
      }
    } else {
      // hiện tại là phần tử cuối cùng của mình
      return PSMessagePosition.NORMAL;
    }
  } else if (!previous && next) {
    const nextSenderExtUserId =
      next.body?.originalSender?.extUserId ?? next.sender.extUserId;
    if (
      nextSenderExtUserId === currentSenderExtUserId &&
      next.isNormalMessage()
    ) {
      // phần tử đầu tiên là của mình
      // vì FlatList.reverse = true nên là BOTTOM
      if (current.isHeaderTimeVisible(next.createdAt)) {
        return PSMessagePosition.NORMAL;
      } else {
        return PSMessagePosition.BOTTOM;
      }
    } else {
      // phần tử tiếp theo không phải là của mình
      return PSMessagePosition.NORMAL;
    }
  } else if (previous && !next) {
    const previousSenderExtUserId =
      previous.body?.originalSender?.extUserId ?? previous.sender.extUserId;
    if (
      previousSenderExtUserId === currentSenderExtUserId &&
      previous.isNormalMessage()
    ) {
      // hiện tại là phần tử cuối cùng của mình
      // vì FlatList.reverse = true nên là TOP
      if (previous.isHeaderTimeVisible(current.createdAt)) {
        return PSMessagePosition.NORMAL;
      } else {
        return PSMessagePosition.TOP;
      }
    } else {
      // hiện tại là phần tử cuối cùng của mình
      return PSMessagePosition.NORMAL;
    }
  } else {
    // list chỉ có 1 phần tử
    return PSMessagePosition.NORMAL;
  }
};

export const getPreviewSubThreadName = (
  message: PSMessageModel,
  translations: PSTranslator,
) => {
  let content = '';
  const body = message.body;
  if (body != null) {
    if (body.hasUnsupportedMetadata == true) {
      content = translations('ps_message_unsupported');
    } else if (body.media.length) {
      content = `[Media${body.media.length > 1 ? 's' : ''}]`;
    } else if (body.files.length) {
      content = `[File${body.files.length > 1 ? 's' : ''}]`;
    } else if (body.poll != null) {
      content = '[Poll]';
    } else if (body.sticker != null) {
      content = '[Sticker]';
    } else if (body.carousel != null) {
      const firstCard = body.carousel!.cards?.[0];
      if (firstCard != null) {
        content = firstCard.title;
      } else {
        content = '';
      }
    } else {
      const text = body.text;
      const result =
        text != null
          ? processTextWithMentionFromBackEnd(text, body.mentionIds)
          : null;

      if (result != null) {
        content = result.text;
      }
    }
  } else {
    content = translations('ps_message_action_note_deleted_message');
  }

  return content.length > 100 ? `${content.slice(0, 100)}...` : content;
};
