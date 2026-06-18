import { PSMessageModel, mapMessageEntityToModel } from './PSMessageModel';
import {
  PSMessageActionNoteModel,
  mapMessageActionNoteEntityToModel,
} from './PSMessageActionNoteModel';
import {
  PSMessageMediaModel,
  mapMessageMediaEntityToModel,
} from './PSMessageMediaModel';
import {
  PSMessagePreviewLinkModel,
  mapMessagePreviewLinkEntityToModel,
} from './PSMessagePreviewLinkModel';
import { PSMessageBodyEntity } from '../entity/PSMessageBodyEntity';
import {
  PSMessageForwardFromModel,
  mapMessageForwardFromEntityToModel,
} from './PSMessageForwardFromModel';
import {
  PSMessageParticipantsModel,
  mapMessageParticipantsEntityToModel,
} from './PSMessageParticipantsModel';
import {
  PSMessageFileModel,
  mapMessageFileEntityToModel,
} from './PSMessageFileModel';
import {
  mapMessagePollEntityToModel,
  PSMessagePollModel,
} from './PSMessagePollModel';
import {
  PSMessageChatBotCarouselModel,
  PSMessageChatBotQuickReplyModel,
  mapMessageChatBotQuickReplyEntityToModel,
  mapPSMessageChatBotCardEntityToModel,
  PSMessageChatBotMenuModel,
  mapMessageChatBotMenuEntitiesToModels,
} from './PSMessageChatBotModel';
import {
  PSMessageStickerModel,
  mapMessageStickerEntityToModel,
} from './PSMessageStickerModel';
import {
  mapMessageSessionEntityToModel,
  PSMessageSessionModel,
} from './PSMessageSessionModel';
import {
  mapPSMessagePromotionEntityToModel,
  PSMessagePromotionModel,
} from './PSMessagePromotionModel';
import { PSUserModel, mapUserEntityToModel } from '../../user';
import {
  PSMessageRatingModel,
  mapPSMessageRatingEntityToModel,
} from './PSMessageRatingModel';
import {
  PSMessageFormModel,
  mapPSMessageFormEntityToModel,
} from './PSMessageFormModel';

export type PSMessageBodyModel = {
  text: string;
  plainText: string;
  isRtf: boolean;
  media: PSMessageMediaModel[];
  files: PSMessageFileModel[];
  repliedMessage?: PSMessageModel;
  pinOrUnpinMessage?: PSMessageModel;
  previewLink?: PSMessagePreviewLinkModel;
  poll?: PSMessagePollModel;
  actionNote?: PSMessageActionNoteModel;
  mentionIds: string[];
  forwardFrom?: PSMessageForwardFromModel;
  participants?: PSMessageParticipantsModel;
  jsonPayload?: string;
  customName?: string;
  quickReply?: PSMessageChatBotQuickReplyModel;
  carousel?: PSMessageChatBotCarouselModel;
  menu: PSMessageChatBotMenuModel[];
  sticker?: PSMessageStickerModel;
  session?: PSMessageSessionModel;
  hasUnsupportedMetadata?: boolean;
  promotion?: PSMessagePromotionModel;
  originalSender?: PSUserModel;
  rating?: PSMessageRatingModel;
  skip?: boolean;
  formSubmitted?: boolean;
  form?: PSMessageFormModel;
};

export const mapMessageBodyEntityToModel = (
  myUserId: string,
  entity?: PSMessageBodyEntity,
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
      poll: mapMessagePollEntityToModel(entity.poll),
      repliedMessage: entity.repliedMessage
        ? mapMessageEntityToModel(myUserId, entity.repliedMessage)
        : undefined,
      pinOrUnpinMessage: entity.pinOrUnpinMessage
        ? mapMessageEntityToModel(myUserId, entity.pinOrUnpinMessage)
        : undefined,
      actionNote: mapMessageActionNoteEntityToModel(entity.actionNote),
      mentionIds: [...entity.mentionIds],
      forwardFrom: mapMessageForwardFromEntityToModel(entity.forwardFrom),
      participants: mapMessageParticipantsEntityToModel(entity.participants),
      jsonPayload: entity.jsonPayload?.json,
      customName: entity.jsonPayload?.customName,
      quickReply: mapMessageChatBotQuickReplyEntityToModel(entity.quickReply),
      carousel: entity.carousel
        ? ({
          cards: entity.carousel.cards.map(card =>
            mapPSMessageChatBotCardEntityToModel(card),
          ),
        } as PSMessageChatBotCarouselModel)
        : undefined,
      menu: mapMessageChatBotMenuEntitiesToModels([...entity.menu]),
      sticker: mapMessageStickerEntityToModel(entity.sticker),
      session: mapMessageSessionEntityToModel(entity.session),
      hasUnsupportedMetadata: entity.hasUnsupportedMetadata,
      promotion: mapPSMessagePromotionEntityToModel(entity.promotion),
      originalSender: mapUserEntityToModel(entity.originalSender),
      rating: mapPSMessageRatingEntityToModel(entity.rating),
      skip: entity.skip,
      formSubmitted: entity.formSubmitted,
      form: mapPSMessageFormEntityToModel(entity.form),
    } as PSMessageBodyModel;
  } else {
    return undefined;
  }
};
