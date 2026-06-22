import {Realm} from '@realm/react';

export class PSThreadDraftEntity extends Realm.Object {
  public threadId!: string;
  public draftContent?: string;
  public mentionIds!: Realm.List<string>;

  public static schema: Realm.ObjectSchema = {
    name: 'PSThreadDraftEntity',
    primaryKey: 'threadId',
    properties: {
      threadId: 'string',
      draftContent: 'string?',
      mentionIds: {type: 'list', objectType: 'string', default: []},
    },
  };

  static filteredById = (threadId: string) => `threadId == "${threadId}"`;

  static getFirstById = (realm: Realm, threadId: string) =>
    realm
      .objects<PSThreadDraftEntity>(PSThreadDraftEntity.schema.name)
      .filtered(PSThreadDraftEntity.filteredById(threadId))[0];

  static createOrUpdate = (realm: Realm, entity: PSThreadDraftEntity) => {
    return realm.create<PSThreadDraftEntity>(
      PSThreadDraftEntity.schema.name,
      entity,
      Realm.UpdateMode.All,
    );
  };

  static mapToEntity = (
    threadId: string,
    draftContent?: string,
    mentionIds?: string[],
  ) => {
    return {
      threadId,
      draftContent,
      mentionIds: (mentionIds ?? []) as unknown,
    } as PSThreadDraftEntity;
  };
}
