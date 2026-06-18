import {PSMessageMetadataPromotionDto} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';
import {PSMessageChatBotButtonEntity} from './PSMessageChatBotEntity';

export class PSMessagePromotionEntity extends Realm.Object {
  public label!: string;
  public title!: string;
  public description!: string;
  public imageUrl!: string;
  public buttons!: Realm.List<PSMessageChatBotButtonEntity>;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessagePromotionEntity',
    embedded: true,
    properties: {
      label: 'string',
      title: 'string',
      description: 'string',
      imageUrl: 'string',
      buttons: {
        type: 'list',
        objectType: 'PSMessageChatBotButtonEntity',
        default: [],
      },
    },
  };

  static mapFromDto = (dto?: PSMessageMetadataPromotionDto) => {
    if (dto) {
      return {
        label: dto.label,
        title: dto.title,
        description: dto.description,
        imageUrl: dto.image_url,
        buttons: dto.buttons.map(button =>
          PSMessageChatBotButtonEntity.mapFromDto(button),
        ) as unknown,
      } as PSMessagePromotionEntity;
    } else {
      return undefined;
    }
  };
}
