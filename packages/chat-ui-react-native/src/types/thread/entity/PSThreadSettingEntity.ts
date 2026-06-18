import {PSThreadSettingDto} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';
import {PSThreadPermissionsEntity} from './PSThreadPermissionsEntity';

export class PSThreadSettingEntity extends Realm.Object {
  public permissions!: Realm.List<PSThreadPermissionsEntity>;

  public static schema: Realm.ObjectSchema = {
    name: 'PSThreadSettingEntity',
    embedded: true,
    properties: {
      permissions: {
        type: 'list',
        objectType: 'PSThreadPermissionsEntity',
        default: [],
      },
    },
  };

  static mapFromDto = (dto?: PSThreadSettingDto) => {
    if (dto) {
      return {
        permissions: (dto.permissions?.map(item =>
          PSThreadPermissionsEntity.mapFromDto(item),
        ) ?? []) as unknown,
      } as PSThreadSettingEntity;
    } else {
      return undefined;
    }
  };

  static mapFromEntityToDto = (entity?: PSThreadSettingEntity) => {
    if (entity) {
      return {
        permissions: (entity.permissions?.map(item =>
          PSThreadPermissionsEntity.mapFromEntityToDto(item),
        ) ?? []) as unknown,
      } as PSThreadSettingDto;
    } else {
      return undefined;
    }
  };
}
