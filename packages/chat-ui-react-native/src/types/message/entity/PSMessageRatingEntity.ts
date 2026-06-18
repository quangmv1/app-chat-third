import {PSMessageMetadataRatingDto} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';

export class PSMessageRatingEntity extends Realm.Object {
  public title!: string;
  public value!: number;
  public comment!: string;
  public sessionId!: string;
  public supportThreadId!: string;
  public lockComment!: boolean;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageRatingEntity',
    embedded: true,
    properties: {
      title: 'string',
      value: 'int',
      comment: 'string',
      sessionId: 'string',
      supportThreadId: 'string',
      lockComment: 'bool',
    },
  };

  static mapFromDto = (dto?: PSMessageMetadataRatingDto) => {
    if (dto) {
      return {
        title: dto.title,
        value: dto.value,
        comment: dto.comment,
        sessionId: dto.session_id,
        supportThreadId: dto.support_thread_id,
        lockComment: dto.lock_comment,
      } as PSMessageRatingEntity;
    } else {
      return undefined;
    }
  };
}
