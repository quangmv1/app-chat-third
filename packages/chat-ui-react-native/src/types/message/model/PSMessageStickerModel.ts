import {PSMessageMetadataFileType} from '@communi/chat-api-client-typescript';
import {PSMessageStickerEntity} from '../entity/PSMessageStickerEntity';

export type PSMessageStickerModel = {
  id: string;
  type: PSMessageMetadataFileType;
  srcUrl: string;
};

export const mapMessageStickerEntityToModel = (
  entity?: PSMessageStickerEntity,
) => {
  if (entity) {
    return {
      id: entity.id,
      type: entity.fileType,
      srcUrl: entity.srcUrl,
    } as PSMessageStickerModel;
  } else {
    return undefined;
  }
};
