import {PSPublicChatListDto} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';

export class PSThreadListPCLEntity extends Realm.Object {
  public id!: string;
  public name!: string;
  public type!: string;

  public static schema: Realm.ObjectSchema = {
    name: 'PSThreadListPCLEntity',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      type: 'string',
    },
  };

  static filteredByNameNotNull = () => 'name != null';

  static filteredByTypeString = (type: string) => `type == "${type}"`;

  static filteredByType = (realm: Realm, type: number) =>
    realm
      .objects<PSThreadListPCLEntity>(PSThreadListPCLEntity.schema.name)
      .filtered(`type == "${type}"`);

  static createThreadListPCL = (realm: Realm, dto: PSPublicChatListDto) => {
    PSThreadListPCLEntity.deleteAllThreadListPCL(realm);
    const data = this.mapFromDto(dto);
    return realm.write(() => {
      return data?.map(item => {
        PSThreadListPCLEntity.createOrUpdate(realm, {
          id: item.id.toString(),
          name: item.name,
          type: item.type.toString(),
        } as PSThreadListPCLEntity);
        return item;
      });
    });
  };

  static createOrUpdate = (realm: Realm, entity: PSThreadListPCLEntity) => {
    return realm.create<PSThreadListPCLEntity>(
      PSThreadListPCLEntity.schema.name,
      entity,
      Realm.UpdateMode.All,
    );
  };

  static getAll = (realm: Realm) => {
    return realm.objects<PSThreadListPCLEntity>(
      PSThreadListPCLEntity.schema.name,
    );
  };

  static deleteAllThreadListPCL = (realm: Realm) => {
    realm.write(() => {
      realm.delete(realm.objects(PSThreadListPCLEntity.schema.name));
    });
  };

  static mapFromDto = (dto?: PSPublicChatListDto) => {
    if (dto) {
      return dto.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
      })) as PSPublicChatListDto;
    }
    return undefined;
  };
}
