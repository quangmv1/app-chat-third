import {
  PSMessageActionNoteDto,
  PSMessageActionNoteType,
} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';

export class PSMessageActionNoteEntity extends Realm.Object {
  public type!: PSMessageActionNoteType;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageActionNoteEntity',
    embedded: true,
    properties: {
      type: 'int',
    },
  };

  static mapFromDto = (dto?: PSMessageActionNoteDto) => {
    if (dto) {
      return {
        type: dto.type,
      } as PSMessageActionNoteEntity;
    } else {
      return undefined;
    }
  };
}
