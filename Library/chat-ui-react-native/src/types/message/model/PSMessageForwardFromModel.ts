import {PSUserModel, mapUserEntityToModel} from '../../user';
import {PSMessageForwardFromEntity} from '../entity/PSMessageForwardFromEntity';

export type PSMessageForwardFromModel = {
  srcThreadId: string;
  srcMessageId: number;
  sender: PSUserModel;
};

export const mapMessageForwardFromEntityToModel = (
  entity?: PSMessageForwardFromEntity,
) => {
  if (entity) {
    return {
      srcThreadId: entity.srcThreadId,
      srcMessageId: entity.srcMessageId,
      sender: mapUserEntityToModel(entity.sender),
    } as PSMessageForwardFromModel;
  } else {
    return undefined;
  }
};
