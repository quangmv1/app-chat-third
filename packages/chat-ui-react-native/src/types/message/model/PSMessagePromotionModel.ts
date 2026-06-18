import {PSMessagePromotionEntity} from '../entity/PSMessagePromotionEntity';
import {
  mapMessageChatBotButtonEntityToModel,
  PSMessageChatBotButtonModel,
} from './PSMessageChatBotModel';

export type PSMessagePromotionModel = {
  label: string;
  title: string;
  description: string;
  imageUrl: string;
  buttons: PSMessageChatBotButtonModel[];
};

export const mapPSMessagePromotionEntityToModel = (
  entity?: PSMessagePromotionEntity,
) => {
  if (entity) {
    return {
      label: entity.label,
      title: entity.title,
      description: entity.description,
      imageUrl: entity.imageUrl,
      buttons: entity.buttons.map(button =>
        mapMessageChatBotButtonEntityToModel(button),
      ),
    } as PSMessagePromotionModel;
  } else {
    return undefined;
  }
};
