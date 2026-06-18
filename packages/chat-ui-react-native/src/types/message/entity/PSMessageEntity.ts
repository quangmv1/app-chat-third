import {Realm} from '@realm/react';
import {
  PSDeleteMessageLevel,
  PSMessageActionNoteType,
  PSMessageDto,
} from '@communi/chat-api-client-typescript';
import {PSMessageBodyEntity} from './PSMessageBodyEntity';
import {PSUserEntity} from '../../user';
import {PSMessageActionNoteEntity} from './PSMessageActionNoteEntity';
import {PSMessageReactionEntity} from './PSMessageReactionEntity';
import {PSMessagePollOptionEntity} from './PSMessagePollOptionEntity';
import {PSMessageRatingEntity} from './PSMessageRatingEntity';

export type PSMessageStatus = 'sending' | 'sent' | 'error';

export class PSMessageEntity extends Realm.Object {
  public primaryKey!: string;
  public requestId!: string;
  public id!: number;
  public sender!: PSUserEntity;
  public body?: PSMessageBodyEntity;
  public reactions!: Realm.List<PSMessageReactionEntity>;
  public createdAt!: number;
  public editedAt!: number;
  public threadId!: string;
  public status!: PSMessageStatus;
  public deleteLevel?: PSDeleteMessageLevel;
  public subThreadId?: string;
  public messageSubThreadCount?: number;

  isHeaderTimeVisible(nextCreateAt: number): boolean {
    return (
      // 10 tiếng
      this.createdAt - nextCreateAt >= 10 * 60 * 60 * 1000 &&
      this.isNormalMessage()
    );
  }

  isNormalMessage(): boolean {
    return (
      this.body?.actionNote == null &&
      this.body?.poll == null &&
      this.body?.quickReply == null &&
      this.body?.carousel == null
    );
  }

  static FIRST_MESSAGE_ID = 1;

  static MENTION_ALL_ID = '0';

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageEntity',
    primaryKey: 'primaryKey',
    properties: {
      primaryKey: 'string',
      requestId: {type: 'string', indexed: true},
      id: {type: 'int', indexed: true},
      sender: 'PSUserEntity',
      body: 'PSMessageBodyEntity?',
      reactions: {
        type: 'list',
        objectType: 'PSMessageReactionEntity',
        default: [],
      },
      createdAt: {type: 'int', indexed: true},
      editedAt: {type: 'int', default: 0},
      threadId: {type: 'string', indexed: true},
      status: {type: 'string', indexed: true},
      deleteLevel: 'int?',
      subThreadId: 'string?',
      messageSubThreadCount: 'int?',
    },
  };

  editText(text: string, editedAt: number) {
    if (this.body) {
      this.body.text = text;
      this.editedAt = editedAt;
    }
  }

  editFormSkip(skip: boolean) {
    if (this.body) {
      this.body.skip = skip;
    }
  }

  updateMessageSubThreadCount(count?: number) {
    this.messageSubThreadCount = count;
  }

  updateMessageSubThreadId(subThreadId?: string) {
    this.subThreadId = subThreadId;
  }

  react(userId: string, emojiName: string, emoji: string) {
    const reaction = this.reactions.find(item => item.name === emojiName);
    if (reaction) {
      reaction.userIds.add(userId);
    } else {
      this.reactions.push({
        name: emojiName,
        emoji: emoji,
        userIds: [userId] as unknown,
      } as PSMessageReactionEntity);
    }
  }

  unreact(userId: string, emojiName: string) {
    const indexOfReaction = this.reactions.findIndex(
      item => item.name === emojiName,
    );
    if (indexOfReaction > -1) {
      const reaction = this.reactions[indexOfReaction];
      if (reaction) {
        reaction.userIds.delete(userId);
        if (!reaction.userIds.size) {
          this.reactions.splice(indexOfReaction, 1);
        }
      }
    }
  }

  vote(userId: string, optionId: string, isMe: boolean) {
    // nếu là mình mà đã vote r thì return (case mqtt)
    if (isMe && this.body?.poll?.myVotes.has(optionId)) {
      return;
    }

    const option = this.body?.poll?.options.find(item => item.id === optionId);

    if (option) {
      if (
        !option.partialVoters.includes(userId) &&
        option.partialVoters.add(userId)
      ) {
        option.voteCount = option.voteCount + 1;
        if (isMe) {
          this.body?.poll?.myVotes.add(optionId);
        }
      }
    }
  }

  unvote(userId: string, optionId: string, isMe: boolean) {
    // nếu là mình mà đã unvote r thì return (case mqtt)
    if (isMe && !this.body?.poll?.myVotes.has(optionId)) {
      return;
    }

    const option = this.body?.poll?.options.find(item => item.id === optionId);

    if (option) {
      if (
        option.partialVoters.includes(userId) &&
        option.partialVoters.delete(userId)
      ) {
        option.voteCount = Math.max(option.voteCount - 1, 0);
        if (isMe) {
          this.body?.poll?.myVotes.delete(optionId);
        }
      }
    }
  }

  addOptionPoll(
    optionId: string,
    textOption: string,
    voteCount?: number,
    partialVoters?: string[],
  ) {
    const option = this.body?.poll?.options.find(item => item.id === optionId);
    if (!option) {
      this.body?.poll?.options.push({
        id: optionId,
        text: textOption,
        voteCount: voteCount ?? 0,
        partialVoters: (partialVoters ?? []) as unknown,
      } as PSMessagePollOptionEntity);
    }
  }

  updateRating(rating: PSMessageRatingEntity) {
    if (this.body) {
      this.body.rating = rating;
    }
  }

  static createRequestId = (deviceId: string) =>
    deviceId + '_' + new Date().getTime().toString();

  static generatePrimaryKey = (
    deviceId: string,
    myUserId: string,
    threadId: string,
    messageId: number,
    senderId: string,
    requestId: string,
  ) => {
    if (requestId.startsWith(deviceId) && myUserId === senderId) {
      return `${threadId}_${requestId}`;
    } else {
      return `${threadId}_${messageId}`;
    }
  };

  static filteredByThreadId = (threadId: string) => `threadId == "${threadId}"`;

  static filteredByPrimaryKey = (primaryKey: string) =>
    `primaryKey == "${primaryKey}"`;

  static filteredByThreadIdAndPrimaryKey = (
    threadId: string,
    primaryKey: string,
  ) => `threadId == "${threadId}" && primaryKey == "${primaryKey}"`;

  static filteredByThreadIdAndMessageId = (
    threadId: string,
    messageId: number,
  ) => `threadId == "${threadId}" && id == "${messageId}"`;

  static filteredByThreadIdAndMessageIdAndStatus = (
    threadId: string,
    messageId: number,
    status: PSMessageStatus,
  ) =>
    `threadId == "${threadId}" && id == "${messageId}" && status == "${status}"`;

  static filteredByMessageIdAndStatus = (
    messageId: number,
    status: PSMessageStatus,
  ) => `id == "${messageId}" && status == "${status}"`;

  static sorted: [string, boolean][] = [
    ['id', true],
    ['createdAt', true],
  ];

  static getFirstByPrimaryKey = (realm: Realm, primaryKey: string) => {
    return realm
      .objects<PSMessageEntity>(PSMessageEntity.schema.name)
      .filtered(PSMessageEntity.filteredByPrimaryKey(primaryKey))[0];
  };

  static getByThreadId = (realm: Realm, threadId: string) => {
    return realm
      .objects<PSMessageEntity>(PSMessageEntity.schema.name)
      .filtered(PSMessageEntity.filteredByThreadId(threadId));
  };

  static getFirstByThreadIdAndPrimaryKey = (
    realm: Realm,
    threadId: string,
    primaryKey: string,
  ) => {
    return realm
      .objects<PSMessageEntity>(PSMessageEntity.schema.name)
      .filtered(
        PSMessageEntity.filteredByThreadIdAndPrimaryKey(threadId, primaryKey),
      )[0];
  };

  static getFirstByThreadIdAndMessageId = (
    realm: Realm,
    threadId: string,
    messageId: number,
  ) => {
    return realm
      .objects<PSMessageEntity>(PSMessageEntity.schema.name)
      .filtered(
        PSMessageEntity.filteredByThreadIdAndMessageId(threadId, messageId),
      )[0];
  };

  static getFirstByThreadIdAndMessageIdAndSentStatus = (
    realm: Realm,
    threadId: string,
    messageId: number,
  ) => {
    return realm
      .objects<PSMessageEntity>(PSMessageEntity.schema.name)
      .filtered(
        PSMessageEntity.filteredByThreadIdAndMessageIdAndStatus(
          threadId,
          messageId,
          'sent',
        ),
      )[0];
  };

  static createFirstMessageInGroupThread = (
    deviceId: string,
    myUserId: string,
    realm: Realm,
    threadId: string,
    sender: PSUserEntity,
  ) => {
    return PSMessageEntity.createOrUpdate(realm, {
      primaryKey: PSMessageEntity.generatePrimaryKey(
        deviceId,
        myUserId,
        threadId,
        PSMessageEntity.FIRST_MESSAGE_ID,
        sender.extUserId,
        '',
      ),
      requestId: '',
      id: PSMessageEntity.FIRST_MESSAGE_ID,
      threadId: threadId,
      sender: sender,
      body: {
        actionNote: {
          type: PSMessageActionNoteType.CREATE_GROUP,
        } as PSMessageActionNoteEntity,
      } as PSMessageBodyEntity,
      createdAt: new Date().getTime(),
      status: 'sent',
    } as PSMessageEntity);
  };

  static createOrUpdate = (realm: Realm, message: PSMessageEntity) => {
    return realm.create<PSMessageEntity>(
      PSMessageEntity.schema.name,
      message,
      Realm.UpdateMode.All,
    );
  };

  static mapFromDto = (
    deviceId: string,
    myUserId: string,
    threadId: string,
    dto?: PSMessageDto,
  ): PSMessageEntity | undefined => {
    if (dto) {
      const reactions = (dto.reactions ?? []).mapNotNull(reaction =>
        PSMessageReactionEntity.mapFromDto(reaction),
      );
      return {
        primaryKey: PSMessageEntity.generatePrimaryKey(
          deviceId,
          myUserId,
          threadId,
          dto.id,
          dto.sender.ext_user_id,
          dto.request_id,
        ),
        requestId: dto.request_id,
        threadId: threadId,
        id: dto.id,
        sender: PSUserEntity.mapFromDto(dto.sender),
        body: PSMessageBodyEntity.mapMessageBodyDtoToEntity(
          deviceId,
          myUserId,
          threadId,
          dto.body,
        ),
        reactions: reactions as unknown,
        createdAt: dto.created_at,
        editedAt: dto.edited_at ?? 0,
        status: 'sent',
        deleteLevel: dto.delete_level,
        subThreadId: dto?.subthread?.id,
        messageSubThreadCount: dto?.subthread?.message_count ?? 0,
      } as PSMessageEntity;
    } else {
      return undefined;
    }
  };
}
