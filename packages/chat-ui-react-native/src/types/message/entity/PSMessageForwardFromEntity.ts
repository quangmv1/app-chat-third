import {Realm} from '@realm/react';
import {PSUserEntity} from '../../user';
import {PSMessageForwardFromDto} from '@communi/chat-api-client-typescript';

export class PSMessageForwardFromEntity extends Realm.Object {
  public srcThreadId!: string;
  public srcMessageId!: number;
  public sender!: PSUserEntity;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageForwardFromEntity',
    embedded: true,
    properties: {
      srcThreadId: 'string',
      srcMessageId: 'int',
      sender: 'PSUserEntity',
    },
  };

  static mapFromDto = (dto?: PSMessageForwardFromDto) => {
    if (dto) {
      return {
        srcThreadId: dto.src_thread_id,
        srcMessageId: dto.src_msg_id,
        sender: PSUserEntity.mapFromDto(dto.sender),
      } as PSMessageForwardFromEntity;
    } else {
      return undefined;
    }
  };
}
