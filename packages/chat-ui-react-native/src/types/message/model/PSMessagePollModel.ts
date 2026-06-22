import {PSMessagePollEntity} from '../entity/PSMessagePollEntity';
import {
  mapMessagePollOptionEntityToModel,
  PSMessagePollOptionModel,
} from './PSMessagePollOptionModel';

export interface PSMessagePollModel {
  id: string;
  title: string;
  allowAddingOption: boolean;
  allowMultipleVotes: boolean;
  incognitoMode: boolean;
  closeAt: number;
  options: PSMessagePollOptionModel[];
  myVotes: string[];
}

export const mapMessagePollEntityToModel = (entity?: PSMessagePollEntity) => {
  if (entity) {
    return {
      id: entity.id,
      title: entity.title,
      allowAddingOption: entity.allowAddingOption,
      allowMultipleVotes: entity.allowMultipleVotes,
      incognitoMode: entity.incognitoMode,
      closeAt: entity.closeAt,
      options: entity.options.map(option =>
        mapMessagePollOptionEntityToModel(option),
      ),
      myVotes: [...entity.myVotes],
    } as PSMessagePollModel;
  } else {
    return undefined;
  }
};
