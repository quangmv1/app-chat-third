import {PSMessagePollOptionEntity} from '../entity/PSMessagePollOptionEntity';

export type PSMessagePollOptionModel = {
  id: string;
  text: string;
  voteCount: number;
  partialVoters: string[];
};

export const mapMessagePollOptionEntityToModel = (
  entity?: PSMessagePollOptionEntity,
) => {
  if (entity && entity.text) {
    return {
      id: entity.id,
      text: entity.text,
      voteCount: entity.voteCount,
      partialVoters: [...entity.partialVoters],
    } as PSMessagePollOptionModel;
  } else {
    return undefined;
  }
};
