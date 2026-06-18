import {Realm} from '@realm/react';

export class PSSearchThreadRecentlyEntity extends Realm.Object {
  public primaryKey!: string;
  public threadId?: string;
  public userId?: string;
  public searchAt!: number;

  public static schema: Realm.ObjectSchema = {
    name: 'PSSearchThreadRecentlyEntity',
    primaryKey: 'primaryKey',
    properties: {
      primaryKey: 'string',
      threadId: {type: 'string', default: ''},
      userId: {type: 'string', default: ''},
      searchAt: {type: 'int', default: 0, indexed: true},
    },
  };

  static sorted: [string, boolean][] = [['searchAt', true]];

  static filteredByThreadIdNotEmpty = () => `threadId != ""`;

  static filteredByUserIdNotEmpty = () => `userId != ""`;

  static createOrUpdate = (
    realm: Realm,
    entity: PSSearchThreadRecentlyEntity,
  ) => {
    return realm.create<PSSearchThreadRecentlyEntity>(
      PSSearchThreadRecentlyEntity.schema.name,
      entity,
      Realm.UpdateMode.All,
    );
  };
}
