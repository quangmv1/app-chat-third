import {Realm} from '@realm/react';
import uuid from 'react-native-uuid';
import {psLogger} from '../../utils';

export class PSDeviceEntity extends Realm.Object {
  public primaryKey!: string;
  public id!: string;

  public static schema: Realm.ObjectSchema = {
    name: 'PSDeviceEntity',
    primaryKey: 'primaryKey',
    properties: {
      primaryKey: 'string',
      id: 'string',
    },
  };

  static save = (realm: Realm, deviceId: string) => {
    realm.create<PSDeviceEntity>(
      PSDeviceEntity.schema.name,
      {primaryKey: 'PSDeviceEntityPrimaryKey', id: deviceId} as PSDeviceEntity,
      Realm.UpdateMode.All,
    );
  };

  static get = (realm: Realm) => {
    let id = realm.objects<PSDeviceEntity>(PSDeviceEntity.schema.name)[0]?.id;
    if (!id) {
      id = uuid.v4().toString();
      try {
        realm.write(() => {
          if (id) {
            PSDeviceEntity.save(realm, id);
          }
        });
      } catch (error) {
        psLogger.error('PSDeviceEntity: createDeviceId', error);
      }
    }
    return id;
  };
}
