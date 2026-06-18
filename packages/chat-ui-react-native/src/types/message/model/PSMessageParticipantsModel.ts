import {PSUserModel, mapUserEntityToModel} from '../../user';
import {PSMessageParticipantsEntity} from '../entity/PSMessageParticipantsEntity';

export type PSMessageParticipantsModel = {
  member: PSUserModel;
  memberCount: number;
};

export const mapMessageParticipantsEntityToModel = (
  entity?: PSMessageParticipantsEntity,
) => {
  if (entity) {
    return {
      member: mapUserEntityToModel(entity.member)!,
      memberCount: entity.memberCount,
    } as PSMessageParticipantsModel;
  } else {
    return undefined;
  }
};
