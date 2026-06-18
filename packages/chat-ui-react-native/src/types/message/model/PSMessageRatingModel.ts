import {PSMessageRatingEntity} from '../entity/PSMessageRatingEntity';

export type PSMessageRatingModel = {
  title: string;
  value: number;
  comment: string;
  sessionId: string;
  supportThreadId: string;
  lockComment: boolean;
};

export const mapPSMessageRatingEntityToModel = (
  entity?: PSMessageRatingEntity,
) => {
  if (entity) {
    return {
      title: entity.title,
      value: entity.value,
      comment: entity.comment,
      sessionId: entity.sessionId,
      supportThreadId: entity.supportThreadId,
      lockComment: entity.lockComment,
    } as PSMessageRatingModel;
  } else {
    return undefined;
  }
};
