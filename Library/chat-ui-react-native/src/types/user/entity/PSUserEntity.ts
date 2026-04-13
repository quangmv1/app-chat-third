import {
  PSRoleThreadType,
  PSUserDto,
  PSUserStatus,
  PSUserType,
} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';

export class PSUserEntity extends Realm.Object {
  public extUserId!: string;
  public userId!: string;
  public name!: string;
  public avatar?: string;
  public type!: PSUserType;
  public alias?: string;
  public verified?: boolean;
  public status?: PSUserStatus;
  public role?: PSRoleThreadType;

  public static schema: Realm.ObjectSchema = {
    name: 'PSUserEntity',
    primaryKey: 'extUserId',
    properties: {
      extUserId: 'string',
      userId: {type: 'string', default: ''},
      name: {type: 'string', default: ''},
      type: {type: 'int', default: PSUserType.USER},
      avatar: 'string?',
      alias: {type: 'string', default: ''},
      verified: {type: 'bool', default: false},
      status: 'int?',
      role: 'int?',
    },
  };

  static filteredByExtUserId = (extUserId: string) =>
    `extUserId == "${extUserId}"`;

  static filteredByExtUserIds = (extUserIds: string[]) =>
    extUserIds.map(extUserId => `extUserId == "${extUserId}"`).join(' || ');

  static getByExtUserIds = (realm: Realm, userIds: string[]) =>
    realm
      .objects<PSUserEntity>(PSUserEntity.schema.name)
      .filtered(PSUserEntity.filteredByExtUserIds(userIds));

  static getFirstByExtUserId = (realm: Realm, extUserId: string) =>
    realm
      .objects<PSUserEntity>(PSUserEntity.schema.name)
      .filtered(PSUserEntity.filteredByExtUserId(extUserId))[0];

  static createOrUpdate = (realm: Realm, user: PSUserEntity) => {
    return realm.create<PSUserEntity>(
      PSUserEntity.schema.name,
      user,
      Realm.UpdateMode.All,
    );
  };

  static mapFromDto = (user?: PSUserDto) => {
    if (user) {
      return {
        extUserId: user.ext_user_id,
        userId: user.user_id,
        name: user.display_name,
        avatar: user.avatar_url,
        type: user?.type ?? PSUserType.USER,
        alias: user?.alias,
        verified: user?.verified,
        status: user?.status,
        role: user?.role,
      } as PSUserEntity;
    } else {
      return undefined;
    }
  };
}
