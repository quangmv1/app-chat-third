import {
  PSMessageMetadataQuickReplyDto,
  PSMessageMetadataChatBotButtonActionType,
  PSMessageMetadataChatBotButtonDto,
  PSMessageMetadataChatBotButtonActionDto,
  PSMessageMetadataCardDto,
  PSMessageMetadataMenuDto,
} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';

export class PSMessageChatBotQuickReplyEntity extends Realm.Object {
  public buttons!: Realm.List<PSMessageChatBotButtonEntity>;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageChatBotQuickReplyEntity',
    embedded: true,
    properties: {
      buttons: {
        type: 'list',
        objectType: 'PSMessageChatBotButtonEntity',
        default: [],
      },
    },
  };

  static mapFromDto = (dto?: PSMessageMetadataQuickReplyDto) => {
    if (dto) {
      return {
        buttons: dto.items.map(item =>
          PSMessageChatBotButtonEntity.mapFromDto(item),
        ) as unknown,
      } as PSMessageChatBotQuickReplyEntity;
    } else {
      return undefined;
    }
  };
}

export class PSMessageChatBotCardEntity extends Realm.Object {
  public title!: string;
  public subTitle!: string;
  public imageUrl!: string;
  public buttons!: Realm.List<PSMessageChatBotButtonEntity>;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageChatBotCardEntity',
    embedded: true,
    properties: {
      title: 'string',
      subTitle: 'string',
      imageUrl: 'string',
      buttons: {
        type: 'list',
        objectType: 'PSMessageChatBotButtonEntity',
        default: [],
      },
    },
  };

  static mapFromDto = (dto?: PSMessageMetadataCardDto) => {
    if (dto) {
      return {
        title: dto.title,
        subTitle: dto.sub_title,
        imageUrl: dto.image_url,
        buttons: dto.buttons.map(button =>
          PSMessageChatBotButtonEntity.mapFromDto(button),
        ) as unknown,
      } as PSMessageChatBotCardEntity;
    } else {
      return undefined;
    }
  };
}

export class PSMessageChatBotCarouselEntity extends Realm.Object {
  public cards!: Realm.List<PSMessageChatBotCardEntity>;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageChatBotCarouselEntity',
    embedded: true,
    properties: {
      cards: {
        type: 'list',
        objectType: 'PSMessageChatBotCardEntity',
        default: [],
      },
    },
  };
}

export class PSMessageChatBotButtonEntity extends Realm.Object {
  public imageUrl!: string;
  public label!: string;
  public action!: PSMessageChatBotButtonActionEntity;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageChatBotButtonEntity',
    embedded: true,
    properties: {
      imageUrl: 'string',
      label: 'string',
      action: 'PSMessageChatBotButtonActionEntity',
    },
  };

  static mapFromDto = (dto: PSMessageMetadataChatBotButtonDto) => {
    return {
      imageUrl: dto.image_url,
      label: dto.label,
      action: PSMessageChatBotButtonActionEntity.mapFromDto(dto.action),
    } as PSMessageChatBotButtonEntity;
  };
}

export class PSMessageChatBotButtonActionEntity extends Realm.Object {
  public type!: PSMessageMetadataChatBotButtonActionType;
  public payload!: string;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageChatBotButtonActionEntity',
    embedded: true,
    properties: {
      type: 'int',
      payload: 'string',
    },
  };

  static mapFromDto = (dto: PSMessageMetadataChatBotButtonActionDto) => {
    return {
      type: dto.type,
      payload: dto.payload,
    } as PSMessageChatBotButtonActionEntity;
  };
}

export class PSMessageChatBotMenuEntity extends Realm.Object {
  public label!: string;
  // Cycles containing embedded objects are not currently supported: 'PSMessageChatBotMenuEntity.children'
  public childrenJson?: string;
  public action?: PSMessageChatBotButtonActionEntity;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageChatBotMenuEntity',
    embedded: true,
    properties: {
      label: 'string',
      childrenJson: 'string?',
      action: 'PSMessageChatBotButtonActionEntity',
    },
  };

  static mapFromDto = (
    dto: PSMessageMetadataMenuDto,
  ): PSMessageChatBotMenuEntity => {
    return {
      label: dto.label,
      childrenJson:
        dto.children && dto.children.length
          ? JSON.stringify(dto.children)
          : undefined,
      action: dto.action
        ? PSMessageChatBotButtonActionEntity.mapFromDto(dto.action)
        : undefined,
    } as PSMessageChatBotMenuEntity;
  };
}
