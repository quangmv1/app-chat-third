import {
  PSCreateMessageBodyMetadataRequestDto,
  PSMessageMetadataDto,
  PSMessageMetadataType,
} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';
import {PSMessagePollModel} from '../model/PSMessagePollModel';
import {PSMessagePollOptionEntity} from './PSMessagePollOptionEntity';

export class PSMessagePollEntity extends Realm.Object {
  public id!: string;
  public title!: string;
  public allowAddingOption!: boolean;
  public allowMultipleVotes!: boolean;
  public incognitoMode!: boolean;
  public closeAt!: number;
  public options!: Realm.List<PSMessagePollOptionEntity>;
  public myVotes!: Realm.Set<string>;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessagePollEntity',
    embedded: true,
    properties: {
      id: 'string',
      title: 'string',
      allowAddingOption: 'bool',
      allowMultipleVotes: 'bool',
      incognitoMode: 'bool',
      closeAt: 'int',
      options: {
        type: 'list',
        objectType: 'PSMessagePollOptionEntity',
        default: [],
      },
      myVotes: {type: 'set', objectType: 'string', default: []},
    },
  };

  static mapToRequestDto = (entity?: PSMessagePollEntity) => {
    if (entity) {
      return {
        id: entity.id,
        title: entity.title,
        allow_user_suggestion: entity.allowAddingOption ? 1 : 2, // 1 true, 2 false
        allow_multiple_votes: entity.allowMultipleVotes ? 1 : 2, // 1 true, 2 false
        incognito_mode: entity.incognitoMode ? 1 : 2, // 1 true, 2 false
        close_at: entity.closeAt,
        options: entity.options.map(option =>
          PSMessagePollOptionEntity.mapToRequestDto(option),
        ),
        type: PSMessageMetadataType.POLL,
      } as PSCreateMessageBodyMetadataRequestDto;
    } else {
      return undefined;
    }
  };

  static mapFromModel = (model?: PSMessagePollModel) => {
    if (model) {
      return {
        id: model.id,
        title: model.title,
        allowAddingOption: model.allowAddingOption,
        allowMultipleVotes: model.allowMultipleVotes,
        incognitoMode: model.incognitoMode,
        closeAt: model.closeAt,
        options: model.options.map(option =>
          PSMessagePollOptionEntity.mapFromModel(option),
        ) as unknown,
        myVotes: model.myVotes as unknown,
      } as PSMessagePollEntity;
    } else {
      return undefined;
    }
  };

  static mapFromDto = (dto?: PSMessageMetadataDto) => {
    if (
      dto &&
      dto.id &&
      dto.title &&
      dto.allow_user_suggestion &&
      dto.allow_multiple_votes &&
      dto.incognito_mode &&
      dto.close_at
    ) {
      return {
        id: dto.id,
        title: dto.title,
        allowAddingOption: dto.allow_user_suggestion === 1, // 1 true, 2 false
        allowMultipleVotes: dto.allow_multiple_votes === 1, // 1 true, 2 false
        incognitoMode: dto.incognito_mode === 1, // 1 true, 2 false
        closeAt: dto.close_at,
        options: (dto.options?.map(optionDto =>
          PSMessagePollOptionEntity.mapFromDto(optionDto),
        ) ?? []) as unknown,
        myVotes: (dto.my_votes ?? []) as unknown,
      } as PSMessagePollEntity;
    } else {
      return undefined;
    }
  };
}
