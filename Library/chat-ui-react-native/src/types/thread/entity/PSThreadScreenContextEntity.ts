import {Realm} from '@realm/react';
import {PSThreadMetadataDto} from '@communi/chat-api-client-typescript';

export class PSThreadScreenContextEntity extends Realm.Object {
  public threadId!: string;
  public screenContext?: string;

  public static schema: Realm.ObjectSchema = {
    name: 'PSThreadScreenContextEntity',
    primaryKey: 'threadId',
    properties: {
      threadId: 'string',
      screenContext: 'string?',
    },
  };

  static filteredById = (threadId: string) => `threadId == "${threadId}"`;

  static getFirstById = (realm: Realm, threadId: string) =>
    realm
      .objects<PSThreadScreenContextEntity>(
        PSThreadScreenContextEntity.schema.name,
      )
      .filtered(PSThreadScreenContextEntity.filteredById(threadId))[0];

  static createOrUpdate = (
    realm: Realm,
    entity: PSThreadScreenContextEntity,
  ) => {
    return realm.create<PSThreadScreenContextEntity>(
      PSThreadScreenContextEntity.schema.name,
      entity,
      Realm.UpdateMode.All,
    );
  };

  static mapFromDto = (threadId: string, dto?: PSThreadMetadataDto) => {
    if (dto && dto.context) {
      return {
        threadId: threadId,
        screenContext: dto.context,
      } as PSThreadScreenContextEntity;
    } else {
      return undefined;
    }
  };
}
