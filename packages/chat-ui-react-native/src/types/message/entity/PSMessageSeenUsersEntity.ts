import {Realm} from '@realm/react';
import {PSUserEntity, PSUserModel, mapUserModelToEntity} from '../../user';

export class PSMessageSeenUsersEntity extends Realm.Object {
  public primaryKey!: string;
  public threadId!: string;
  public messageId!: number;
  public user!: PSUserEntity;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageSeenUsersEntity',
    primaryKey: 'primaryKey',
    properties: {
      primaryKey: 'string',
      threadId: {type: 'string', indexed: true},
      messageId: 'int',
      user: 'PSUserEntity',
    },
  };

  static generatePrimaryKey = (threadId: string, userId: string) =>
    `${threadId}_${userId}`;

  static filteredByPrimaryKey = (primaryKey: string) =>
    `primaryKey == "${primaryKey}"`;

  static filteredByThreadId = (threadId: string) => `threadId == "${threadId}"`;

  static getFirstByPrimaryKey = (
    realm: Realm,
    threadId: string,
    userId: string,
  ) => {
    return realm
      .objects<PSMessageSeenUsersEntity>(PSMessageSeenUsersEntity.schema.name)
      .filtered(
        PSMessageSeenUsersEntity.filteredByPrimaryKey(
          PSMessageSeenUsersEntity.generatePrimaryKey(threadId, userId),
        ),
      )[0];
  };

  static getByThreadId = (realm: Realm, threadId: string) => {
    return realm
      .objects<PSMessageSeenUsersEntity>(PSMessageSeenUsersEntity.schema.name)
      .filtered(PSMessageSeenUsersEntity.filteredByThreadId(threadId));
  };

  static createOrUpdate = (realm: Realm, entity: PSMessageSeenUsersEntity) => {
    return realm.create<PSMessageSeenUsersEntity>(
      PSMessageSeenUsersEntity.schema.name,
      entity,
      Realm.UpdateMode.All,
    );
  };

  static markSeen = (
    realm: Realm,
    threadId: string,
    cachedMessageSeenUsers: Realm.Results<PSMessageSeenUsersEntity>,
    remoteMessageSeenUsers: {
      messageId: number;
      users: PSUserModel[];
    }[],
  ) => {
    for (const messageSeenUser of remoteMessageSeenUsers) {
      for (const user of messageSeenUser.users) {
        const result = cachedMessageSeenUsers.filtered(
          PSMessageSeenUsersEntity.filteredByPrimaryKey(
            PSMessageSeenUsersEntity.generatePrimaryKey(
              threadId,
              user.extUserId,
            ),
          ),
        )[0];
        if (result) {
          result.threadId = threadId;
          result.messageId = messageSeenUser.messageId;
        } else {
          PSMessageSeenUsersEntity.createOrUpdate(realm, {
            primaryKey: PSMessageSeenUsersEntity.generatePrimaryKey(
              threadId,
              user.extUserId,
            ),
            threadId: threadId,
            messageId: messageSeenUser.messageId,
            user: mapUserModelToEntity(user),
          } as PSMessageSeenUsersEntity);
        }
      }
    }
    return cachedMessageSeenUsers
      .filter(item => !item.user.name)
      .map(item => item.user.extUserId);
  };
}
