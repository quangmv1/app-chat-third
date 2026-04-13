import {PSTagCategoryDto} from '@communi/chat-api-client-typescript';
import {PSTagCategoryEntity} from '../entity/PSTagCategoryEntity';

export type PSTagCategoryModel = {
  id: string;
  name: string;
  description: string;
  isPredefined: boolean;
};

export const mapTagCategoryEntityToModel = (entity: PSTagCategoryEntity) => {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    isPredefined: entity.isPredefined,
  } as PSTagCategoryModel;
};

export const mapTagCategoryDtoToModel = (dto: PSTagCategoryDto) => {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    isPredefined: dto.is_predefined,
  } as PSTagCategoryModel;
};
