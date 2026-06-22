import {PSMessageActionNoteType} from '@communi/chat-api-client-typescript';
import {PSMessageActionNoteEntity} from '../entity/PSMessageActionNoteEntity';

export type PSMessageActionNoteModel = {
  type: PSMessageActionNoteType;
};

export const mapMessageActionNoteEntityToModel = (
  entity?: PSMessageActionNoteEntity,
) => {
  if (entity) {
    return {
      type: entity.type,
    } as PSMessageActionNoteModel;
  } else {
    return undefined;
  }
};

export const mapMessageActionNoteModeToEntity = (
  model?: PSMessageActionNoteModel,
) => {
  if (model) {
    return {
      type: model.type,
    } as PSMessageActionNoteEntity;
  } else {
    return undefined;
  }
};
