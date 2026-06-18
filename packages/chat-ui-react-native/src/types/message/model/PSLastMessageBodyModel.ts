import { PSLastMessageBodyEntity } from '../entity/PSLastMessageBodyEntity';
import {
  PSMessageActionNoteModel,
  mapMessageActionNoteEntityToModel,
} from './PSMessageActionNoteModel';
import {
  PSMessageFileModel,
  mapMessageFileEntityToModel,
} from './PSMessageFileModel';
import {
  PSMessageMediaModel,
  mapMessageMediaEntityToModel,
} from './PSMessageMediaModel';
import {
  PSMessageParticipantsModel,
  mapMessageParticipantsEntityToModel,
} from './PSMessageParticipantsModel';
import {
  PSMessagePreviewLinkModel,
  mapMessagePreviewLinkEntityToModel,
} from './PSMessagePreviewLinkModel';
import {
  PSMessageStickerModel,
  mapMessageStickerEntityToModel,
} from './PSMessageStickerModel';

export type PSLastMessageBodyModel = {
  text: string;
  media: PSMessageMediaModel[];
  files: PSMessageFileModel[];
  previewLink?: PSMessagePreviewLinkModel;
  pollId?: string;
  actionNote?: PSMessageActionNoteModel;
  mentionIds: string[];
  participants?: PSMessageParticipantsModel;
  sticker?: PSMessageStickerModel;
  hasUnsupportedMetadata?: boolean;
};

export const mapLastMessageBodyEntityToModel = (
  entity?: PSLastMessageBodyEntity,
) => {
  if (entity) {
    return {
      text: entity.text,
      plainText: entity.plainText,
      isRtf: entity.isRtf,
      media: entity.media.map<PSMessageMediaModel>(media =>
        mapMessageMediaEntityToModel(media),
      ),
      files: entity.files.map<PSMessageFileModel>(file =>
        mapMessageFileEntityToModel(file),
      ),
      previewLink: mapMessagePreviewLinkEntityToModel(entity.previewLink),
      pollId: entity.pollId,
      actionNote: mapMessageActionNoteEntityToModel(entity.actionNote),
      mentionIds: [...entity.mentionIds],
      participants: mapMessageParticipantsEntityToModel(entity.participants),
      sticker: mapMessageStickerEntityToModel(entity.sticker),
      hasUnsupportedMetadata: entity.hasUnsupportedMetadata,
    } as PSLastMessageBodyModel;
  } else {
    return undefined;
  }
};
