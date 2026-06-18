import {PSTagDto} from '@communi/chat-api-client-typescript';
import {PSTagEntity} from '../entity/PSTagEntity';

export type PSTagModel = {
  id: string;
  name: string;
  description: string;
  colorCode: string;
  categoryId: string;
  isPredefined: boolean;
};

export const mapTagEntityToModel = (entity: PSTagEntity) => {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    colorCode: entity.colorCode,
    categoryId: entity.categoryId,
    isPredefined: entity.isPredefined,
  } as PSTagModel;
};

export const mapTagDtoToModel = (dto: PSTagDto) => {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    colorCode: dto.color_code,
    categoryId: dto.category_id,
    isPredefined: dto.is_predefined,
  } as PSTagModel;
};
