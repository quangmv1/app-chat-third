import {Realm} from '@realm/react';

export class PSPartitioningPathEntity extends Realm.Object {
  public primaryKey!: string;
  public id!: string;

  public static schema: Realm.ObjectSchema = {
    name: 'PSPartitioningPathEntity',
    primaryKey: 'primaryKey',
    properties: {
      primaryKey: 'string',
      id: 'string',
    },
  };

  static save = (realm: Realm, userId: string) => {
    realm.create<PSPartitioningPathEntity>(
      PSPartitioningPathEntity.schema.name,
      {
        primaryKey: 'PSPartitioningPathEntityPrimaryKey',
        id: userId,
      } as PSPartitioningPathEntity,
      Realm.UpdateMode.All,
    );
  };

  static get = (realm: Realm) => {
    let id = realm.objects<PSPartitioningPathEntity>(
      PSPartitioningPathEntity.schema.name,
    )[0]?.id;

    return id;
  };
}
