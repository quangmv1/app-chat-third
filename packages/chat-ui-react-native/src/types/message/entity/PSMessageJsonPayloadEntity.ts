import {
  PSCreateMessageBodyMetadataRequestDto,
  PSMessageMetadataDto,
  PSMessageMetadataType,
} from '@communi/chat-api-client-typescript';
import { Realm } from '@realm/react';

export class PSMessageJsonPayloadEntity extends Realm.Object {
  public json?: string;
  public customName?: string;
  public payload?: string;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageJsonPayloadEntity',
    embedded: true,
    properties: {
      json: 'string?',
      payload: 'string?',
      customName: 'string?',
    },
  };

  static mapFromDto = (dto?: PSMessageMetadataDto) => {
    if (dto && (dto.json || dto.payload)) {
      return {
        json: dto.json ?? dto.payload,
        payload: dto.json ?? dto.payload,
        customName: dto.custom_name,
      } as PSMessageJsonPayloadEntity;
    } else {
      return undefined;
    }
  };

  static mapFromJsonPayloadModel = (payload?: string, customName?: string) => {
    if (payload) {
      return {
        json: payload,
        payload: payload,
        customName: customName,
      } as unknown as PSMessageJsonPayloadEntity;
    } else {
      return undefined;
    }
  };

  static mapToRequestDto = (entity?: PSMessageJsonPayloadEntity) => {
    if (entity) {
      return {
        payload: entity.json ?? entity.payload,
        custom_name: entity.customName,
        type: PSMessageMetadataType.JSON,
      } as PSCreateMessageBodyMetadataRequestDto;
    } else {
      return undefined;
    }
  };
}
