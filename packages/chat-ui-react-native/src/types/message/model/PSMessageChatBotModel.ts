import {PSMessageMetadataChatBotButtonActionType} from '@communi/chat-api-client-typescript';
import {
  PSMessageChatBotQuickReplyEntity,
  PSMessageChatBotButtonActionEntity,
  PSMessageChatBotButtonEntity,
  PSMessageChatBotCardEntity,
  PSMessageChatBotMenuEntity,
} from '../entity/PSMessageChatBotEntity';

export type PSMessageChatBotQuickReplyModel = {
  buttons: PSMessageChatBotButtonModel[];
};

export type PSMessageChatBotCardModel = {
  title: string;
  subTitle: string;
  imageUrl: string;
  buttons: PSMessageChatBotButtonModel[];
};

export type PSMessageChatBotCarouselModel = {
  cards: PSMessageChatBotCardModel[];
};

export type PSMessageChatBotButtonModel = {
  imageUrl: string;
  label: string;
  action: PSMessageChatBotButtonActionModel;
};

export type PSMessageChatBotButtonActionModel = {
  type: PSMessageMetadataChatBotButtonActionType;
  payload: string;
};

export type PSMessageChatBotMenuModel = {
  label: string;
  chidren: PSMessageChatBotMenuModel[];
  action?: PSMessageChatBotButtonActionModel;
};

export const mapMessageChatBotQuickReplyEntityToModel = (
  entity?: PSMessageChatBotQuickReplyEntity,
) => {
  if (entity) {
    return {
      buttons: entity.buttons.map(button =>
        mapMessageChatBotButtonEntityToModel(button),
      ),
    } as PSMessageChatBotQuickReplyModel;
  } else {
    return undefined;
  }
};

export const mapPSMessageChatBotCardEntityToModel = (
  entity?: PSMessageChatBotCardEntity,
) => {
  if (entity) {
    return {
      title: entity.title,
      subTitle: entity.subTitle,
      imageUrl: entity.imageUrl,
      buttons: entity.buttons.map(button =>
        mapMessageChatBotButtonEntityToModel(button),
      ),
    } as PSMessageChatBotQuickReplyModel;
  } else {
    return undefined;
  }
};

export const mapMessageChatBotButtonEntityToModel = (
  entity: PSMessageChatBotButtonEntity,
) => {
  return {
    imageUrl: entity.imageUrl,
    label: entity.label,
    action: mapMessageChatBotButtonActionEntityToModel(entity.action),
  } as PSMessageChatBotButtonModel;
};

export const mapMessageChatBotButtonActionEntityToModel = (
  entity: PSMessageChatBotButtonActionEntity,
) => {
  return {
    type: entity.type,
    payload: entity.payload,
  } as PSMessageChatBotButtonActionModel;
};

export const mapMessageChatBotMenuEntitiesToModels = (
  entities: PSMessageChatBotMenuEntity[],
) => {
  const mapMessageChatBotMenuEntityToModel = (
    entity: PSMessageChatBotMenuEntity,
  ) => {
    return {
      label: entity.label,
      chidren: parseChildren(entity.childrenJson ?? ''),
      action: entity.action
        ? mapMessageChatBotButtonActionEntityToModel(entity.action)
        : undefined,
    } as PSMessageChatBotMenuModel;
  };

  const parseChildren = (json: string) => {
    const children: PSMessageChatBotMenuModel[] = [];
    if (json.length) {
      const list = JSON.parse(json);
      for (const item of list) {
        children.push(mapMessageChatBotMenuEntityToModel(item));
      }
    }
    return children;
  };

  return entities.map(e => {
    const children: PSMessageChatBotMenuModel[] = [];
    if (e.childrenJson && e.childrenJson.length) {
      const list = JSON.parse(e.childrenJson) as PSMessageChatBotMenuEntity[];
      for (let item of list) {
        children.push(mapMessageChatBotMenuEntityToModel(item));
      }
    }
    return {
      label: e.label,
      chidren: children,
      action: e.action
        ? mapMessageChatBotButtonActionEntityToModel(e.action)
        : undefined,
    } as PSMessageChatBotMenuModel;
  });
};
