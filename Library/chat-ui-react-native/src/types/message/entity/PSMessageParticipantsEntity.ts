import {Realm} from '@realm/react';
import {PSUserEntity} from '../../user';
import {PSMessageParticipantsDto} from '@communi/chat-api-client-typescript';

export class PSMessageParticipantsEntity extends Realm.Object {
  public member!: PSUserEntity;
  public memberCount!: number;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageParticipantsEntity',
    embedded: true,
    properties: {
      member: 'PSUserEntity',
      memberCount: {type: 'int', default: 0},
    },
  };

  static mapFromDto = (dto?: PSMessageParticipantsDto) => {
    if (dto) {
      return {
        member: PSUserEntity.mapFromDto(dto.member)!,
        memberCount: dto.member_count ?? 0,
      } as PSMessageParticipantsEntity;
    } else {
      return undefined;
    }
  };
}
