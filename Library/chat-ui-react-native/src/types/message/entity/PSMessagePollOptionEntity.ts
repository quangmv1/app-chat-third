import {
  PSCreateMessageBodyMetadataOptionRequestDto,
  PSMessageMetadataOptionDto,
} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';
import {PSMessagePollOptionModel} from '../model/PSMessagePollOptionModel';

export class PSMessagePollOptionEntity extends Realm.Object {
  public id!: string;
  public text!: string;
  public voteCount!: number;
  public partialVoters!: Realm.Set<string>;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessagePollOptionEntity',
    embedded: true,
    properties: {
      id: 'string',
      text: 'string',
      voteCount: 'int',
      partialVoters: {type: 'set', objectType: 'string', default: []},
    },
  };

  static mapToRequestDto = (entity?: PSMessagePollOptionEntity) => {
    if (entity) {
      return {
        text: entity.text,
      } as PSCreateMessageBodyMetadataOptionRequestDto;
    } else {
      return undefined;
    }
  };

  static mapFromModel = (model: PSMessagePollOptionModel) => {
    return {
      id: model.id,
      text: model.text,
      voteCount: model.voteCount,
      partialVoters: model.partialVoters as unknown,
    } as PSMessagePollOptionEntity;
  };

  static mapFromDto = (dto: PSMessageMetadataOptionDto) => {
    return {
      id: dto.id,
      text: dto.text,
      voteCount: dto.vote_count ?? 0,
      partialVoters: (dto.partial_voter_list ?? []) as unknown,
    } as PSMessagePollOptionEntity;
  };
}
