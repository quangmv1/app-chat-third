import {Realm} from '@realm/react';
import {PSMessageEntity} from './PSMessageEntity';
import {PSBusEvent, PSEventBus} from '../../../utils';

export class PSPinnedMessagesEntity extends Realm.Object {
  public primaryKey!: string;
  public message!: PSMessageEntity;
  public pinnedAt!: number;

  public static schema: Realm.ObjectSchema = {
    name: 'PSPinnedMessagesEntity',
    primaryKey: 'primaryKey',
    properties: {
      primaryKey: 'string',
      message: 'PSMessageEntity',
      pinnedAt: 'int',
    },
  };

  static filteredByPrimaryKey = (primaryKey: string) =>
    `primaryKey == "${primaryKey}"`;

  static filteredByThreadId = (threadId: string) =>
    `message.threadId == "${threadId}"`;

  static sortedByPinnedAt: [string, boolean][] = [['pinnedAt', true]];

  static getFirstByPrimaryKey = (realm: Realm, primaryKey: string) =>
    realm
      .objects<PSPinnedMessagesEntity>(PSPinnedMessagesEntity.schema.name)
      .filtered(PSPinnedMessagesEntity.filteredByPrimaryKey(primaryKey))[0];

  static getByThreadId = (realm: Realm, threadId: string) =>
    realm
      .objects<PSPinnedMessagesEntity>(PSPinnedMessagesEntity.schema.name)
      .filtered(PSPinnedMessagesEntity.filteredByThreadId(threadId));

  static pinMessage = (realm: Realm, newMessage: PSMessageEntity) => {
    if (
      newMessage.body &&
      newMessage.body.pinOrUnpinMessage &&
      newMessage.body.actionNote
    ) {
      PSPinnedMessagesEntity.createOrUpdate(
        realm,
        newMessage.body.pinOrUnpinMessage,
        newMessage.createdAt,
      );
      PSEventBus.getInstance().dispatch(PSBusEvent.NEW_PIN_MESSAGE);
    }
  };

  static unpinMessage = (realm: Realm, newMessage: PSMessageEntity) => {
    if (
      newMessage.body &&
      newMessage.body.pinOrUnpinMessage &&
      newMessage.body.actionNote
    ) {
      const pinnedMessage = PSPinnedMessagesEntity.getFirstByPrimaryKey(
        realm,
        newMessage.body.pinOrUnpinMessage.primaryKey,
      );
      if (pinnedMessage?.isValid()) {
        realm.delete(pinnedMessage);
        PSEventBus.getInstance().dispatch(PSBusEvent.NEW_UNPIN_MESSAGE);
      }
    }
  };

  static createOrUpdate = (
    realm: Realm,
    message: PSMessageEntity,
    pinnedAt: number,
  ) => {
    return realm.create<PSPinnedMessagesEntity>(
      PSPinnedMessagesEntity.schema.name,
      {
        primaryKey: message.primaryKey,
        message: message,
        pinnedAt: pinnedAt,
      } as PSPinnedMessagesEntity,
      Realm.UpdateMode.All,
    );
  };
}
