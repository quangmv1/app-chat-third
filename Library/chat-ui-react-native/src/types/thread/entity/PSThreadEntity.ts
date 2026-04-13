import {Realm} from '@realm/react';
import {PSMqttThreadPayload} from '../../../mqtt';
import {
  MEMBER_STATUS,
  PSRoleThreadType,
  PSThreadDto,
  PSThreadGroupLevelType,
  PSThreadType,
  PSUserBlockStatus,
  PSUserStatus,
  PSUserType,
} from '@communi/chat-api-client-typescript';
import {PSUserEntity} from '../../user';
import {
  PSLastMessageEntity,
  PSMessageEntity,
  PSMessageSeenUsersEntity,
  PSPinnedMessagesEntity,
} from '../../message';
import {PSThreadSettingEntity} from './PSThreadSettingEntity';
import {PSThreadPermissionEntity} from './PSThreadPermissionEntity';
import {PSTagModel} from '../../tags/model/PSTagModel';
import {PSTagCategoryEntity, PSTagEntity} from '../../tags';
import {PSThreadScreenContextEntity} from './PSThreadScreenContextEntity';
import {PSThreadDraftEntity} from './PSThreadDraftEntity';

export class PSThreadEntity extends Realm.Object {
  public id!: string;
  public name?: string;
  public avatar?: string;
  public description?: string;
  public type!: PSThreadType;
  public groupLevel?: PSThreadGroupLevelType;
  public isJoined!: boolean;
  public pinnedAt!: number;
  public isMute!: boolean;
  public messageCount!: number;
  public messageViewedCount!: number;
  public memberCount!: number;
  public role!: PSRoleThreadType;
  public setting?: PSThreadSettingEntity;
  public partner?: PSUserEntity;
  public lastMessage?: PSLastMessageEntity;
  public mentionedMessageIds!: Realm.Set<number>;
  public tags!: Realm.List<PSTagEntity>;
  public tagCategories!: Realm.List<PSTagCategoryEntity>;
  public screenContext?: PSThreadScreenContextEntity;
  public extUserIdChatWithBot?: string;
  public userType?: string;
  public targetIdUserType?: string;
  public status?: MEMBER_STATUS;
  public parentId?: string;
  public originalMessageId?: number;
  public isRatingAnytime!: boolean;
  public sessionId?: string;
  public supportThreadId?: string;
  public blockStatus!: PSUserBlockStatus;

  public static schema: Realm.ObjectSchema = {
    name: 'PSThreadEntity',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string?',
      avatar: 'string?',
      description: 'string?',
      type: 'int',
      groupLevel: 'int?',
      isJoined: {type: 'bool', default: true},
      pinnedAt: {type: 'int', indexed: true, default: 0},
      isMute: {type: 'bool', default: false},
      messageCount: {type: 'int', default: 0},
      messageViewedCount: {type: 'int', default: 0},
      memberCount: {type: 'int', default: 0},
      role: {type: 'int', default: PSRoleThreadType.MEMBER},
      setting: 'PSThreadSettingEntity?',
      partner: 'PSUserEntity?',
      lastMessage: 'PSLastMessageEntity?',
      mentionedMessageIds: {type: 'set', objectType: 'int', default: []},
      tags: {type: 'list', objectType: 'PSTagEntity', default: []},
      tagCategories: {
        type: 'list',
        objectType: 'PSTagCategoryEntity',
        default: [],
      },
      screenContext: 'PSThreadScreenContextEntity?',
      extUserIdChatWithBot: {type: 'string', default: ''},
      userType: {type: 'string', default: ''},
      targetIdUserType: {type: 'string', default: ''},
      status: {type: 'int', default: MEMBER_STATUS.ACTIVE},
      parentId: 'string?',
      originalMessageId: 'int?',
      isRatingAnytime: {type: 'bool', default: false},
      sessionId: 'string?',
      supportThreadId: 'string?',
      blockStatus: {type: 'int', default: PSUserBlockStatus.NO_BLOCK},
    },
  };

  handleDeleteMessage(message: PSMessageEntity) {
    const copiedMessage = JSON.parse(JSON.stringify(message));
    copiedMessage.sender = message.sender;
    copiedMessage.body = undefined;
    this.updateLastMessage(copiedMessage);
    if (
      this.mentionedMessageIds.length &&
      this.mentionedMessageIds.includes(message.id)
    ) {
      // @ts-ignore
      this.mentionedMessageIds = this.mentionedMessageIds.filter(
        id => id !== message.id,
      );
    }
  }

  updateLastMessage(message: PSMessageEntity) {
    if (!this.lastMessage || message.id >= this.lastMessage.id) {
      this.lastMessage = PSLastMessageEntity.mapFromMessageEntity(message);
    }
  }

  deleteLastMessage() {
    this.lastMessage = undefined;
  }

  checkLastMessageContainsMentionMe(userId: string) {
    const lastMessage = this.lastMessage;
    if (
      lastMessage &&
      lastMessage.body &&
      (lastMessage.body.mentionIds.includes(userId) ||
        lastMessage.body.mentionIds.includes(PSMessageEntity.MENTION_ALL_ID)) &&
      lastMessage.id > this.messageViewedCount
    ) {
      this.mentionedMessageIds.add(lastMessage.id);
    }
  }

  markSeen(messageId: number) {
    if (messageId > this.messageViewedCount) {
      this.messageViewedCount = messageId;
    }
    if (this.mentionedMessageIds.length) {
      // @ts-ignore
      this.mentionedMessageIds = this.mentionedMessageIds.filter(
        id => id > messageId,
      );
    }
  }

  updateMute(isMute: boolean) {
    this.isMute = isMute;
  }

  updatePinnedAt(pinnedAt: number) {
    this.pinnedAt = pinnedAt;
  }

  changeInfoThread({name, avatar}: {name?: string; avatar?: string}) {
    if (name) {
      this.name = name;
    }
    if (avatar) {
      this.avatar = avatar;
    }
  }

  updateIsJoined(isJoined: boolean) {
    this.isJoined = isJoined;
  }

  updateMemberCount(num: number) {
    this.memberCount = num;
  }

  updateRole(role: PSRoleThreadType) {
    this.role = role;
  }

  updateParentId(parentId: string, originalMessageId: number) {
    this.parentId = parentId;
    this.originalMessageId = originalMessageId;
  }

  updateSetting(setting: PSThreadSettingEntity) {
    this.setting = setting;
  }

  updateRatingSession(
    sessionId: string,
    isRatingAnytime: boolean,
    supportThreadId: string,
  ) {
    this.sessionId = sessionId;
    this.isRatingAnytime = isRatingAnytime;
    this.supportThreadId = supportThreadId;
  }

  getUnreadCount() {
    if (!this.lastMessage && !this.messageCount && !this.messageViewedCount) {
      return 0;
    }
    return Math.max(
      0,
      Math.max(
        this.messageCount,
        this.lastMessage?.id ?? PSMessageEntity.FIRST_MESSAGE_ID,
      ) - this.messageViewedCount,
    );
  }

  getPermissionByRole() {
    if (this.role === PSRoleThreadType.OWNER) {
      return {
        addMember: true,
        sendMessage: true,
        removeMember: true,
      } as PSThreadPermissionEntity;
    } else {
      return this.setting?.permissions.filter(
        permission => permission.userRole === this.role,
      )[0]?.permission;
    }
  }

  isUserDeActivated() {
    return this.partner?.status === PSUserStatus.DEACTIVATED;
  }

  isUserMute() {
    return this.status === MEMBER_STATUS.MUTED;
  }

  isPublic() {
    if (this.groupLevel === PSThreadGroupLevelType.PUBLIC_GROUP) {
      return true;
    } else {
      return false;
    }
  }

  isSubThread() {
    if (this.parentId && this.parentId !== '0') {
      return true;
    } else {
      return false;
    }
  }

  isBlocked() {
    return (
      this.blockStatus === PSUserBlockStatus.BLOCKED_BY_ME ||
      this.blockStatus === PSUserBlockStatus.BLOCKED_BY_PARTNER
    );
  }

  addTag(tag: PSTagModel) {
    this.tags.push(PSTagEntity.mapFromModel(tag));
  }

  removeTag(tagId: string) {
    const indexOfTag = this.tags.findIndex(item => item.id === tagId);
    if (indexOfTag > -1) {
      this.tags.remove(indexOfTag);
    }
  }

  updateBlockStatus(blockStatus: PSUserBlockStatus) {
    this.blockStatus = blockStatus;
  }

  static THREAD_ID_NOT_FOUND = '-1';

  static filteredById = (threadId: string) => `id == "${threadId}"`;

  static filteredByIds = (threadIds: string[]) =>
    threadIds.map(threadId => `id == "${threadId}"`).join(' || ');

  static filteredByPartnerId = (userId: string) =>
    'partner.' + PSUserEntity.filteredByExtUserId(userId);

  static filteredByPartnerIds = (userIds: string[]) =>
    userIds
      .map(userId => 'partner.' + PSUserEntity.filteredByExtUserId(userId))
      .join(' || ');

  static filteredByLastMessageNotNull = () => 'lastMessage != null';

  static filteredByLastMessageNotNullAndThreadNotDeleted = () =>
    'lastMessage != null && lastMessage.deleteLevel != 3';

  static filteredByFolderAll = () => 'isJoined == true';

  static filteredByUnRead = () =>
    'lastMessage.id - messageViewedCount > 0 && isJoined == true';

  static filteredByPublicGroup = () =>
    `groupLevel == "${PSThreadGroupLevelType.PUBLIC_GROUP}"`;

  static filteredByPublicGroupUserType = (userType: string) =>
    `groupLevel == "${PSThreadGroupLevelType.PUBLIC_GROUP}" && userType == "${userType}"`;

  static filteredByPCL = (userType: string, targetIdUserType?: string) =>
    `groupLevel == "${PSThreadGroupLevelType.PUBLIC_GROUP}" && userType == "${userType}" && targetIdUserType == "${targetIdUserType}"`;

  static filteredDirectThread = () =>
    `type == "${PSThreadType.DIRECT}" && partner != null && partner.type != "${PSUserType.BOT}"`;

  static filteredByMute = (isMute: boolean) => `isMute == ${isMute}`;

  static filteredByMuteAndHasMention = () => `isMute == false || mentionedMessageIds.@count > 0`;

  static filteredByNotJoined = () => 'isJoined == false';

  static sorted: [string, boolean][] = [['pinnedAt', true]];

  static getFirstById = (realm: Realm, threadId: string) =>
    realm
      .objects<PSThreadEntity>(PSThreadEntity.schema.name)
      .filtered(PSThreadEntity.filteredById(threadId))[0];

  static getByIds = (realm: Realm, threadIds: string[]) =>
    realm
      .objects<PSThreadEntity>(PSThreadEntity.schema.name)
      .filtered(PSThreadEntity.filteredByIds(threadIds));

  static getFirstByPartnerId = (realm: Realm, userId: string) =>
    realm
      .objects<PSThreadEntity>(PSThreadEntity.schema.name)
      .filtered(PSThreadEntity.filteredByPartnerId(userId))[0];

  static getByPartnerIds = (realm: Realm, userIds: string[]) =>
    realm
      .objects<PSThreadEntity>(PSThreadEntity.schema.name)
      .filtered(PSThreadEntity.filteredByPartnerIds(userIds));

  static createGroupThread = (
    realm: Realm,
    threadId: string,
    threadName: string,
    memberCount: number,
    message: PSMessageEntity,
  ) => {
    return PSThreadEntity.createOrUpdate(realm, {
      id: threadId,
      name: threadName,
      type: PSThreadType.GROUP,
      memberCount: memberCount,
      lastMessage: PSLastMessageEntity.mapFromMessageEntity(message),
      messageViewedCount: PSMessageEntity.FIRST_MESSAGE_ID, // mặc định tin nhắn đầu tiên là action note create group
    } as PSThreadEntity);
  };

  static createGroupSubThread = (
    realm: Realm,
    threadId: string,
    threadName: string,
    parentId: string,
    originalMessageId: number,
  ) => {
    return PSThreadEntity.createOrUpdate(realm, {
      id: threadId,
      name: threadName,
      type: PSThreadType.GROUP,
      parentId: parentId,
      originalMessageId: originalMessageId,

      lastMessage: undefined,
      messageViewedCount: 0,
    } as PSThreadEntity);
  };

  static deleteBothThread = (realm: Realm, threadId: string) => {
    const thread = PSThreadEntity.getFirstById(realm, threadId);
    const messages = PSMessageEntity.getByThreadId(realm, threadId);
    const pinnedMessages = PSPinnedMessagesEntity.getByThreadId(
      realm,
      threadId,
    );
    const draftMessages = PSThreadDraftEntity.getFirstById(realm, threadId);
    const messageSeenUsers = PSMessageSeenUsersEntity.getByThreadId(
      realm,
      threadId,
    );
    realm.write(() => {
      if (thread?.isValid()) {
        // xoá last message để bộ lọc tất cả sẽ không hiển thị thread này. còn trong cache vẫn có.
        thread.deleteLastMessage();
      }
      if (pinnedMessages?.isValid()) {
        realm.delete(pinnedMessages);
      }
      if (messageSeenUsers?.isValid()) {
        realm.delete(messageSeenUsers);
      }
      if (messages?.isValid()) {
        realm.delete(messages);
      }
      if (draftMessages?.isValid()) {
        realm.delete(draftMessages);
      }
    });
  };
  // deleteBothThread và deleteThread có thể cân nhắc dùng chung vì logic tương tự 99%
  static deleteThread = (realm: Realm, threadId: string) => {
    const thread = PSThreadEntity.getFirstById(realm, threadId);
    const messages = PSMessageEntity.getByThreadId(realm, threadId);
    const pinnedMessages = PSPinnedMessagesEntity.getByThreadId(
      realm,
      threadId,
    );
    const draftMessages = PSThreadDraftEntity.getFirstById(realm, threadId);
    const messageSeenUsers = PSMessageSeenUsersEntity.getByThreadId(
      realm,
      threadId,
    );
    realm.write(() => {
      if (thread?.isValid()) {
        // xoá last message để bộ lọc tất cả sẽ không hiển thị thread này. còn trong cache vẫn có.
        thread.deleteLastMessage();
        // 1s sau mới thực hiện xoá cache để phòng các trường hợp crash app do truy vấn thread đã xoá
        setTimeout(() => {
          if (thread?.isValid())
            realm.write(() => {
              realm.delete(thread);
            });
        }, 350);
      }
      if (pinnedMessages?.isValid()) {
        realm.delete(pinnedMessages);
      }
      if (messageSeenUsers?.isValid()) {
        realm.delete(messageSeenUsers);
      }
      if (messages?.isValid()) {
        realm.delete(messages);
      }
      if (draftMessages?.isValid()) {
        realm.delete(draftMessages);
      }
    });
  };

  static deleteThreadImprove = (realm: Realm, threadId: string) => {
    const thread = PSThreadEntity.getFirstById(realm, threadId);
    const messages = PSMessageEntity.getByThreadId(realm, threadId);
    const pinnedMessages = PSPinnedMessagesEntity.getByThreadId(
      realm,
      threadId,
    );
    const draftMessages = PSThreadDraftEntity.getFirstById(realm, threadId);
    const messageSeenUsers = PSMessageSeenUsersEntity.getByThreadId(
      realm,
      threadId,
    );

    if (thread?.isValid()) {
      // Xóa last message để bộ lọc tất cả sẽ không hiển thị thread này. còn trong cache vẫn có.
      thread.deleteLastMessage();
      // Đánh dấu để xóa sau 350ms
      setTimeout(() => {
        if (thread?.isValid()) {
          realm.write(() => {
            realm.delete(thread);
          });
        }
      }, 350);
    }
    if (pinnedMessages?.isValid()) {
      realm.delete(pinnedMessages);
    }
    if (messageSeenUsers?.isValid()) {
      realm.delete(messageSeenUsers);
    }
    if (messages?.isValid()) {
      realm.delete(messages);
    }
    if (draftMessages?.isValid()) {
      realm.delete(draftMessages);
    }
  };

  static createOrUpdate = (realm: Realm, entity: PSThreadEntity) => {
    return realm.create<PSThreadEntity>(
      PSThreadEntity.schema.name,
      entity,
      Realm.UpdateMode.All,
    );
  };

  static mapFromDto = (
    deviceId: string,
    myUserId: string,
    dto: PSThreadDto,
  ) => {
    if (
      dto.type === PSThreadType.DIRECT &&
      dto.partner &&
      !dto.last_message.sender
    ) {
      dto.last_message.sender = dto.partner;
    }
    return {
      id: dto.id,
      name: dto.name,
      avatar: dto.avatar_url,
      description: dto.description,
      type: dto.type,
      groupLevel: dto.group_level,
      isJoined: dto.is_joinned,
      pinnedAt: dto.pinned_at,
      isMute: !dto.enable_notify,
      messageCount: dto.message_count,
      messageViewedCount: dto.message_viewed_count,
      memberCount: dto.member_count,
      role: dto.role,
      setting: PSThreadSettingEntity.mapFromDto(dto.setting),
      partner: PSUserEntity.mapFromDto(dto.partner),
      lastMessage: PSLastMessageEntity.mapFromDto(
        deviceId,
        myUserId,
        dto.id,
        dto.last_message,
      ),
      mentionedMessageIds: (dto.mentioned_message_ids ?? []) as unknown,
      tags: (dto.tags?.map(item => PSTagEntity.mapFromDto(item)) ??
        []) as unknown,
      tagCategories: (dto.tag_categories?.map(item =>
        PSTagCategoryEntity.mapFromDto(item),
      ) ?? []) as unknown,
      screenContext: PSThreadScreenContextEntity.mapFromDto(
        dto.id,
        dto.metadata,
      ),
      extUserIdChatWithBot: dto.metadata?.ext_user_id,
      userType: dto.userType,
      targetIdUserType: dto.targetIdUserType,
      status: dto.status,
      parentId: dto.parent_id,
      originalMessageId: dto.original_message_id,
      isRatingAnytime: dto.metadata?.rating?.is_rating_anytime,
      sessionId: dto.metadata?.rating?.session_id,
      supportThreadId: dto.metadata?.rating?.support_thread_id,
      blockStatus: dto.partner?.block_status ?? PSUserBlockStatus.NO_BLOCK,
    } as PSThreadEntity;
  };

  static mapFromMqtt = (payload: PSMqttThreadPayload) => {
    return {
      id: payload.id,
      name: payload.name,
      avatar: payload.avatar_url,
      type: payload.type,
    } as PSThreadEntity;
  };
}
