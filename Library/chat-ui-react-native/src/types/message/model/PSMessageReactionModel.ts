import {PSMessageReactionEntity} from '../entity/PSMessageReactionEntity';

export type PSMessageReactionModel = {
  name: string;
  emoji: string;
  userIds: string[];
};

export const mapMessageReactionEntityToModel = (
  entity: PSMessageReactionEntity,
) => {
  return {
    name: entity.name,
    emoji: entity.emoji,
    userIds: [...entity.userIds],
  } as PSMessageReactionModel;
};
