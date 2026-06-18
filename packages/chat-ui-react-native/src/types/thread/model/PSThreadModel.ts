import {
  PSMessageActionNoteType,
  PSRoleThreadType,
  PSThreadGroupLevelType,
  PSThreadType,
  PSUserType,
} from '@communi/chat-api-client-typescript';
import {
  processTextWithMentionFromBackEnd,
  removeMarkdown,
} from '../../../components';
import {
  DETERMINE_RECENT_OFFLINE_TIME,
  PSThreadPartnerOnlineTime,
} from '../../../context';
import { PSTranslator } from '../../../translations';
import {
  PSLastMessageEntity,
  PSLastMessageModel,
  mapLastMessageEntityToModel,
} from '../../message';
import { PSUserModel } from '../../user';
import { PSThreadEntity } from '../entity/PSThreadEntity';
import {
  mapThreadPermissionEntityToModel,
  PSThreadPermissionModel,
} from './PSThreadPermissionModel';
import { mapTagEntityToModel, PSTagModel } from '../../tags/model/PSTagModel';
import { mapTagCategoryEntityToModel, PSTagCategoryModel } from '../../tags';

export type PSThreadModel = {
  id: string;
  name: string;
  avatar: string;
  pinnedAt: number;
  isMute: boolean;
  description: string;
  contentLastMessage: string;
  lastMessage: PSLastMessageModel;
  unreadCount: number;
  unreadMentionedCount: number;
  type: PSThreadType;
  groupLevel?: PSThreadGroupLevelType;
  isJoined: boolean;
  memberCount: number;
  role: PSRoleThreadType;
  permission?: PSThreadPermissionModel;
  tags: PSTagModel[];
  tagCategories: PSTagCategoryModel[];
  typingUsers: PSUserModel[];
  isOnline: boolean;
  isBot: boolean;
  isAgent: boolean;
  verified: boolean;
  parentId: string;
  originalMessageId: number;
};

export const getPreviewContentLastMessage = (
  translator: PSTranslator,
  myUserId: string,
  lastMessage?: PSLastMessageEntity,
  threadType?: PSThreadType,
) => {
  if (!lastMessage || !lastMessage.sender) {
    return '';
  }

  // Case thread k có last message
  if (lastMessage.sender.userId === '0') {
    return lastMessage.sender.name;
  }

  let name =
    lastMessage.sender.extUserId === myUserId
      ? translator('ps_you')
      : lastMessage.sender.name;

  let content = '';

  if (lastMessage.body) {
    if (lastMessage.body.hasUnsupportedMetadata) {
      content = `: ${translator('ps_message_unsupported')}`;
    } else if (lastMessage.body.actionNote) {
      switch (lastMessage.body.actionNote.type) {
        case PSMessageActionNoteType.CREATE_GROUP:
          content = translator('ps_message_action_note_create_group');
          break;
        case PSMessageActionNoteType.ADD_MEMBER:
          content = translator('ps_message_action_note_add_member');
          break;
        case PSMessageActionNoteType.MEMBER_ADDED_BY_SYSTEM:
          name = translator('ps_system');
          content = translator('ps_message_action_note_add_member');
          break;
        case PSMessageActionNoteType.REMOVE_MEMBER:
          content = translator('ps_message_action_note_remove_member');
          break;
        case PSMessageActionNoteType.MEMBER_REMOVED_BY_SYSTEM:
          name = translator('ps_system');
          content = translator('ps_message_action_note_remove_member');
          break;
        case PSMessageActionNoteType.JOIN_GROUP:
          content = translator('ps_message_action_note_join_group');
          break;
        case PSMessageActionNoteType.LEAVE_GROUP:
          content = translator('ps_message_action_note_leave_group');
          break;
        case PSMessageActionNoteType.PIN:
          content = translator('ps_message_action_note_pin_message');
          break;
        case PSMessageActionNoteType.UNPIN:
          content = translator('ps_message_action_note_unpin_message');
          break;
        case PSMessageActionNoteType.GROUP_NAME_UPDATED:
          content = translator('ps_message_action_note_group_name_updated');
          break;
        case PSMessageActionNoteType.GROUP_AVATAR_UPDATED:
          content = translator('ps_message_action_note_group_avatar_updated');
          break;
        case PSMessageActionNoteType.GROUP_DESCRIPTION_UPDATED:
          content = translator(
            'ps_message_action_note_group_description_updated',
          );
          break;
        case PSMessageActionNoteType.JOIN_PUBLIC_GROUP:
          content = translator('ps_message_action_note_join_public_group');
          break;
        case PSMessageActionNoteType.BLOCK_MEMBER:
          content = translator('ps_message_action_note_block_member');
          break;
        case PSMessageActionNoteType.UN_BLOCK_MEMBER:
          content = translator('ps_message_action_note_un_block_member');
          break;
      }
    } else if (lastMessage.body.media.length) {
      content = `${translator('ps_message_action_note_sent')} ${lastMessage.body.media.length
        } media`;
    } else if (lastMessage.body.files.length) {
      content = `${translator('ps_message_action_note_sent')} ${lastMessage.body.files.length
        } files`;
    } else if (lastMessage.body.pollId) {
      content = ` ${translator('ps_message_poll_created_a_poll')}`;
    } else if (lastMessage.body.sticker) {
      content = `${translator('ps_message_action_note_sent')} sticker`;
    } else if (lastMessage.body.carousel) {
      const firstCard = lastMessage.body.carousel.cards[0];
      if (firstCard) {
        content = `: ${firstCard.title ?? firstCard.subTitle}`;
      } else {
        content = '';
      }
    } else {
      let lastMessageBodyText = lastMessage.body.isRtf ? lastMessage.body.plainText : lastMessage.body.text;

      if (lastMessageBodyText && lastMessage.body.isRtf) {
        // can xu ly removeMarkdown
        lastMessageBodyText = removeMarkdown(lastMessageBodyText, {
          stripListLeaders: true, // strip list leaders (default: true)
          listUnicodeChar: '', // char to insert instead of stripped list leaders (default: '')
          gfm: true, // support GitHub-Flavored Markdown (default: true)
          useImgAltText: true, // replace images with alt-text, if present (default: true)
        });
      }

      const textMentionValue =
        lastMessage.body && lastMessageBodyText
          ? processTextWithMentionFromBackEnd(lastMessageBodyText, [
            ...lastMessage.body.mentionIds,
          ])
          : undefined;
      if (textMentionValue) {
        if (threadType === PSThreadType.DIRECT) {
          name = '';
          content = textMentionValue.text;
        } else {
          content = ': ' + textMentionValue.text;
        }
      } else {
        content = ` ${translator('ps_message_metadata_default')}`;
      }
    }
  } else {
    content = `${translator('ps_message_action_note_deleted_message')}`;
  }

  return name + content;
};

export const mapThreadEntityToModel = (
  translator: PSTranslator,
  myUserId: string,
  thread: PSThreadEntity,
  isOnline: boolean = false,
  typingUsers?: PSUserModel[],
) => {
  return {
    id: thread.id,
    name: thread.name,
    avatar: thread.avatar,
    pinnedAt: thread.pinnedAt,
    isMute: thread.isMute,
    description: thread.description,
    contentLastMessage: getPreviewContentLastMessage(
      translator,
      myUserId,
      thread.lastMessage,
      thread.type,
    ),
    lastMessage: mapLastMessageEntityToModel(myUserId, thread.lastMessage!), // non-null vì đã filter khi query từ realm
    // non-null vì đã filter khi query từ realm
    unreadCount: thread.getUnreadCount(),
    unreadMentionedCount: thread.mentionedMessageIds.length,
    type: thread.type,
    groupLevel: thread.groupLevel,
    isJoined: thread.isJoined,
    memberCount: thread.memberCount,
    role: thread.role,
    permission: mapThreadPermissionEntityToModel(thread.getPermissionByRole()),
    tags: thread.tags.map<PSTagModel>(tag => mapTagEntityToModel(tag)),
    tagCategories: thread.tagCategories.map<PSTagCategoryModel>(tagCategory =>
      mapTagCategoryEntityToModel(tagCategory),
    ),
    typingUsers: typingUsers,
    isOnline: isOnline,
    isBot: thread.partner?.type === PSUserType.BOT,
    isAgent: thread.partner?.type === PSUserType.CS_AGENT,
    verified: !!thread.partner?.verified,
    parentId: thread.parentId,
    originalMessageId: thread.originalMessageId,
  } as PSThreadModel;
};

export const mapThreadsEntityToModel = (
  myUserId: string,
  threads: PSThreadEntity[],
  typingUsersThreads: Record<string, PSUserModel[]>,
  threadPartnerOnlineTime: PSThreadPartnerOnlineTime[],
  translator: PSTranslator,
) => {
  return threads.map<PSThreadModel>(thread => {
    const isOnline =
      thread.type === PSThreadType.DIRECT &&
      !thread.isBlocked() &&
      isThreadPartnerOnline(thread.id, threadPartnerOnlineTime);

    return mapThreadEntityToModel(
      translator,
      myUserId,
      thread,
      isOnline,
      typingUsersThreads[thread.id],
    );
  });
};

const isThreadPartnerOnline = (
  threadId: string,
  threadPartnerOnlineTime: PSThreadPartnerOnlineTime[],
) => {
  const lastOnlineTime = threadPartnerOnlineTime.find(
    item => item.threadId === threadId,
  )?.lastOnlineTime;
  if (lastOnlineTime) {
    const now = new Date().getTime() / 1000;
    const subSecond = Math.max(0, now - lastOnlineTime);
    if (subSecond < DETERMINE_RECENT_OFFLINE_TIME) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
