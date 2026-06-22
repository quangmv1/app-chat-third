import {Realm} from '@realm/react';

export class PSFolderEntity extends Realm.Object {
  public id!: string;
  public name!: string;

  static ALL = 'all';

  static UNREAD = 'unread';

  static PUBLIC_GROUP = 'public_group';

  static SHARED_INBOX = '4';

  static PCL = '5';

  public static schema: Realm.ObjectSchema = {
    name: 'PSFolderEntity',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
    },
  };

  static filteredByAlias = (alias: string) => `id == "${alias}"`;

  static createDefaultFolders = (realm: Realm) => {
    realm.create<PSFolderEntity>(
      PSFolderEntity.schema.name,
      {
        id: PSFolderEntity.ALL,
        name: 'Tất cả',
      },
      Realm.UpdateMode.All,
    );
    realm.create<PSFolderEntity>(
      PSFolderEntity.schema.name,
      {
        id: PSFolderEntity.UNREAD,
        name: 'Chưa đọc',
      },
      Realm.UpdateMode.All,
    );
    realm.create<PSFolderEntity>(
      PSFolderEntity.schema.name,
      {
        id: PSFolderEntity.SHARED_INBOX,
        name: 'shared inbox',
      },
      Realm.UpdateMode.All,
    );
    realm.create<PSFolderEntity>(
      PSFolderEntity.schema.name,
      {
        id: PSFolderEntity.PCL,
        name: 'public chat list',
      },
      Realm.UpdateMode.All,
    );
  };

  static getFolderAll = (realm: Realm) => {
    return realm
      .objects<PSFolderEntity>(PSFolderEntity.schema.name)
      .filtered(PSFolderEntity.filteredByAlias(PSFolderEntity.ALL))[0];
  };
}
