import {PSStickerFileType} from '@communi/chat-api-client-typescript';
import {PSStickerEntity} from '../entity';

export type PSStickerModel = {
  id: string;
  fileUrl: string;
  fileType: PSStickerFileType;
  filePath?: string;
  fileBucket?: string;
};

export const mapStickerEntityToModel = (sticker: PSStickerEntity) => {
  return {
    id: sticker.id,
    fileUrl: sticker.fileUrl,
    fileType: sticker.fileType,
    filePath: sticker.filePath,
    fileBucket: sticker.fileBucket,
  } as PSStickerModel;
};

export const mapStickersEntityToModel = (stickers: PSStickerEntity[]) => {
  return stickers.map<PSStickerModel>(sticker => {
    return mapStickerEntityToModel(sticker);
  });
};
