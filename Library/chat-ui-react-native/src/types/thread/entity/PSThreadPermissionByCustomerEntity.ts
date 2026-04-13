import {Realm} from '@realm/react';

export class PSThreadPermissionByCustomerEntity extends Realm.Object {
  public threadId!: string;
  public canChat!: boolean;

  public static schema: Realm.ObjectSchema = {
    name: 'PSThreadPermissionByCustomerEntity',
    primaryKey: 'threadId',
    properties: {
      threadId: 'string',
      canChat: {type: 'bool', default: true},
    },
  };

  static filteredById = (threadId: string) => `threadId == "${threadId}"`;

  static getFirstById = (realm: Realm, threadId: string) =>
    realm
      .objects<PSThreadPermissionByCustomerEntity>(
        PSThreadPermissionByCustomerEntity.schema.name,
      )
      .filtered(PSThreadPermissionByCustomerEntity.filteredById(threadId))[0];

  static createOrUpdate = (
    realm: Realm,
    entity: PSThreadPermissionByCustomerEntity,
  ) => {
    return realm.create<PSThreadPermissionByCustomerEntity>(
      PSThreadPermissionByCustomerEntity.schema.name,
      entity,
      Realm.UpdateMode.All,
    );
  };
}
