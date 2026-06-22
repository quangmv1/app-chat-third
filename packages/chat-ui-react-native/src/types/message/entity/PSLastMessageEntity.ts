import {Realm} from '@realm/react';
import {PSUserEntity} from '../../user';
import {PSLastMessageBodyEntity} from './PSLastMessageBodyEntity';
import {
  PSDeleteMessageLevel,
  PSLastMessageDto,
} from '@communi/chat-api-client-typescript';
import {PSMessageEntity, PSMessageStatus} from './PSMessageEntity';

export class PSLastMessageEntity extends Realm.Object {
  public primaryKey!: string;
  public requestId!: string;
  public id!: number;
  public sender!: PSUserEntity;
  public body?: PSLastMessageBodyEntity;
  public createdAt!: number;
  public editedAt!: number;
  public status!: PSMessageStatus;
  public threadId!: string;
  public deleteLevel?: PSDeleteMessageLevel;

  public static schema: Realm.ObjectSchema = {
    name: 'PSLastMessageEntity',
    embedded: true,
    properties: {
      primaryKey: 'string',
      requestId: 'string',
      id: 'int',
      sender: 'PSUserEntity',
      body: 'PSLastMessageBodyEntity?',
      createdAt: 'int',
      editedAt: {type: 'int', default: 0},
      status: {type: 'string'},
      threadId: {type: 'string'},
      deleteLevel: 'int?',
    },
  };

  static mapFromMessageEntity = (message: PSMessageEntity) => {
    return {
      primaryKey: message.primaryKey,
      requestId: message.requestId,
      id: message.id,
      sender: message.sender,
      body: PSLastMessageBodyEntity.mapFromMessageBodyEntity(message.body),
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      deleteLevel: message.deleteLevel,
      status: message.status,
      threadId: message.threadId,
    } as PSLastMessageEntity;
  };

  static mapFromDto = (
    deviceId: string,
    myUserId: string,
    threadId: string,
    dto: PSLastMessageDto,
  ) => {
    if (dto.id === 0 || dto.created_at === 0 || !dto.sender) {
      return undefined;
    } else {
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
        id: dto.id,
        sender: PSUserEntity.mapFromDto(dto.sender),
        body: PSLastMessageBodyEntity.mapFromDto(dto.body),
        createdAt: dto.created_at,
        editedAt: dto.edited_at ?? 0,
        deleteLevel: dto.delete_level,
        status: 'sent',
        threadId: threadId,
      } as PSLastMessageEntity;
    }
  };

  // PSLastMessageBodyEntity default cho case k có last message
  static createLastMessageDefaultEntity = (threadId: string) => {
    return {
      primaryKey: '0',
      requestId: '0',
      id: 0,
      sender: {
        extUserId: '0',
        userId: '0',
        name: 'System',
        avatar: '',
        // type: 0,
        // verified: false,
        // status: 0,
      } as PSUserEntity,
      body: undefined,
      createdAt: 0,
      editedAt: 0,
      status: 'sent',
      threadId: threadId,
    } as PSLastMessageEntity;
  };
}
