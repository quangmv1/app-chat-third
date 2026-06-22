import {PSMessageMetadataType} from '@communi/chat-api-client-typescript';
import {PSMessageSessionEntity} from '../entity/PSMessageSessionEntity';

export type PSMessageSessionModel = {
  type: PSMessageMetadataType;
};

export const mapMessageSessionEntityToModel = (
  entity?: PSMessageSessionEntity,
) => {
  if (entity) {
    return {
      type: entity.type,
    } as PSMessageSessionModel;
  } else {
    return undefined;
  }
};

export const mapMessageSessionModeToEntity = (
  model?: PSMessageSessionModel,
) => {
  if (model) {
    return {
      type: model.type,
    } as PSMessageSessionEntity;
  } else {
    return undefined;
  }
};
