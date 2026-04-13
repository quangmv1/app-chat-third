import {
  PSRoleThreadType,
  PSThreadPermissionsDto,
} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';
import {PSThreadPermissionEntity} from './PSThreadPermissionEntity';

export class PSThreadPermissionsEntity extends Realm.Object {
  public userRole!: PSRoleThreadType;
  public permission!: PSThreadPermissionEntity;

  public static schema: Realm.ObjectSchema = {
    name: 'PSThreadPermissionsEntity',
    embedded: true,
    properties: {
      userRole: 'int',
      permission: 'PSThreadPermissionEntity',
    },
  };

  static mapFromDto = (dto?: PSThreadPermissionsDto) => {
    if (dto) {
      return {
        userRole: dto.user_role,
        permission: PSThreadPermissionEntity.mapFromDto(dto.permission),
      } as PSThreadPermissionsEntity;
    } else {
      return undefined;
    }
  };

  static mapFromEntityToDto = (entity?: PSThreadPermissionsEntity) => {
    if (entity) {
      return {
        user_role: entity.userRole,
        permission: PSThreadPermissionEntity.mapFromEntityToDto(
          entity.permission,
        ),
      } as PSThreadPermissionsDto;
    } else {
      return undefined;
    }
  };
}
