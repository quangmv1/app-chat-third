import {
  PSCreateMessageBodyMetadataRequestDto,
  PSMessageMetadataDto,
  PSMessageMetadataType,
} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';
import {PSMessageSessionModel} from '../model/PSMessageSessionModel';

export class PSMessageSessionEntity extends Realm.Object {
  public type!: PSMessageMetadataType;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageSessionEntity',
    embedded: true,
    properties: {
      type: 'int',
    },
  };

  static mapFromDto = (dto?: PSMessageMetadataDto) => {
    if (dto && dto.type) {
      return {
        type: dto.type,
      } as PSMessageSessionEntity;
    } else {
      return undefined;
    }
  };

  static mapFromSessionModel = (model?: PSMessageSessionModel) => {
    if (model && model.type) {
      return {
        type: model.type,
      } as unknown as PSMessageSessionEntity;
    } else {
      return undefined;
    }
  };

  static mapToRequestDto = (entity?: PSMessageSessionEntity) => {
    if (entity) {
      return {
        type: entity.type,
      } as PSCreateMessageBodyMetadataRequestDto;
    } else {
      return undefined;
    }
  };
}
