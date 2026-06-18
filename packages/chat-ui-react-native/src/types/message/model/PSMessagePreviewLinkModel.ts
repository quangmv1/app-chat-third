import {PSMessagePreviewLinkEntity} from '../entity/PSMessagePreviewLinkEntity';

export interface PSMessagePreviewLinkModel {
  url: string;
  title?: string;
  sitename?: string;
  description?: string;
  image?: string;
  width?: number;
  height?: number;
  isLoading?: boolean;
}

export const mapMessagePreviewLinkEntityToModel = (
  entity?: PSMessagePreviewLinkEntity,
) => {
  if (entity) {
    return {
      url: entity.url,
      title: entity.title,
      description: entity.description,
      image: entity.image,
      width: entity.width,
      height: entity.height,
    } as PSMessagePreviewLinkModel;
  } else {
    return undefined;
  }
};

export const mapMessagePreviewLinkModelToEntity = (
  model?: PSMessagePreviewLinkModel,
) => {
  if (model) {
    if (!model.title && !model.sitename && !model.description && !model.image) {
      return undefined;
    } else {
      return {
        url: model.url,
        title: model.title,
        sitename: model.sitename,
        description: model.description,
        image: model.image,
        width: model.width,
        height: model.height,
      } as PSMessagePreviewLinkEntity;
    }
  } else {
    return undefined;
  }
};
