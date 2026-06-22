import {PSMessageReactionDto} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';
import {getEmojiByEmojiCode} from '../../../utils';

export class PSMessageReactionEntity extends Realm.Object {
  public name!: string;
  public emoji!: string;
  public userIds!: Realm.Set<string>;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageReactionEntity',
    embedded: true,
    properties: {
      name: 'string',
      emoji: 'string',
      userIds: {type: 'set', objectType: 'string', default: []},
    },
  };

  static mapFromDto = (dto: PSMessageReactionDto) => {
    const emoji = getEmojiByEmojiCode(dto.name);
    if (emoji) {
      return {
        name: dto.name,
        emoji: emoji.emoji,
        userIds: dto.ext_user_ids as unknown,
      } as PSMessageReactionEntity;
    } else {
      return undefined;
    }
  };
}
