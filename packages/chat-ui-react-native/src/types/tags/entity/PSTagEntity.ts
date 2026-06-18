import {PSTagDto} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';
import {PSTagModel} from '../model/PSTagModel';

export class PSTagEntity extends Realm.Object {
  public id!: string;
  public name!: string;
  public description!: string;
  public colorCode!: string;
  public categoryId!: string;
  public isPredefined!: boolean;

  public static schema: Realm.ObjectSchema = {
    name: 'PSTagEntity',
    embedded: true,
    properties: {
      id: {type: 'string', default: ''},
      name: {type: 'string', default: ''},
      description: {type: 'string', default: ''},
      colorCode: {type: 'string', default: ''},
      categoryId: {type: 'string', default: ''},
      isPredefined: {type: 'bool', default: false},
    },
  };

  static mapFromDto = (dto?: PSTagDto) => {
    if (dto) {
      return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        colorCode: dto.color_code,
        categoryId: dto.category_id,
        isPredefined: dto.is_predefined,
      } as PSTagEntity;
    } else {
      return undefined;
    }
  };

  static mapFromModel = (model: PSTagModel) => {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      colorCode: model.colorCode,
      categoryId: model.categoryId,
      isPredefined: model.isPredefined,
    } as PSTagEntity;
  };
}
