import {Realm} from '@realm/react';

export class PSMessageFileSavedEntity extends Realm.Object {
  public fileId!: string;
  public filePathSaved!: string;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageFileSavedEntity',
    primaryKey: 'fileId',
    properties: {
      fileId: 'string',
      filePathSaved: 'string',
    },
  };

  static filteredByFileId = (fileId: string) => `fileId == "${fileId}"`;

  static createOrUpdate = (realm: Realm, entity: PSMessageFileSavedEntity) => {
    return realm.create<PSMessageFileSavedEntity>(
      PSMessageFileSavedEntity.schema.name,
      entity,
      Realm.UpdateMode.All,
    );
  };

  static getFirstById = (realm: Realm, fileId: string) =>
    realm
      .objects<PSMessageFileSavedEntity>(PSMessageFileSavedEntity.schema.name)
      .filtered(PSMessageFileSavedEntity.filteredByFileId(fileId))[0];
}
