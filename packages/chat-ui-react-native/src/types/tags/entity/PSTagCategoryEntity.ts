import {PSTagCategoryDto} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';
import {PSTagCategoryModel} from '../model/PSTagCategoryModel';

export class PSTagCategoryEntity extends Realm.Object {
  public id!: string;
  public name!: string;
  public description!: string;
  public isPredefined!: boolean;

  public static schema: Realm.ObjectSchema = {
    name: 'PSTagCategoryEntity',
    embedded: true,
    properties: {
      id: {type: 'string', default: ''},
      name: {type: 'string', default: ''},
      description: {type: 'string', default: ''},
      isPredefined: {type: 'bool', default: false},
    },
  };

  static mapFromDto = (dto?: PSTagCategoryDto) => {
    if (dto) {
      return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        isPredefined: dto.is_predefined,
      } as PSTagCategoryEntity;
    } else {
      return undefined;
    }
  };

  static mapFromModel = (model: PSTagCategoryModel) => {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      isPredefined: model.isPredefined,
    } as PSTagCategoryEntity;
  };
}
