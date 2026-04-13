import {Realm} from '@realm/react';

import {PSMessageMediaEntity} from './PSMessageMediaEntity';
import {PSMessagePreviewLinkEntity} from './PSMessagePreviewLinkEntity';
import {PSMessageActionNoteEntity} from './PSMessageActionNoteEntity';
import {PSMessageEntity} from './PSMessageEntity';
import {
  PSMessageBodyDto,
  PSMessageMetadataType,
} from '@communi/chat-api-client-typescript';
import {PSMessageForwardFromEntity} from './PSMessageForwardFromEntity';
import {PSMessageParticipantsEntity} from './PSMessageParticipantsEntity';
import {PSMessageJsonPayloadEntity} from './PSMessageJsonPayloadEntity';
import {PSMessageFileEntity} from './PSMessageFileEntity';
import {PSMessagePollEntity} from './PSMessagePollEntity';
import {
  PSMessageChatBotCardEntity,
  PSMessageChatBotCarouselEntity,
  PSMessageChatBotMenuEntity,
  PSMessageChatBotQuickReplyEntity,
} from './PSMessageChatBotEntity';
import {PSMessageStickerEntity} from './PSMessageStickerEntity';
import {PSMessageSessionEntity} from './PSMessageSessionEntity';
import {PSMessagePromotionEntity} from './PSMessagePromotionEntity';
import {PSUserEntity} from '../../user';
import {PSMessageRatingEntity} from './PSMessageRatingEntity';

export class PSMessageBodyEntity extends Realm.Object {
  public text?: string;
  public plainText?: string;
  public isRtf!: boolean;
  public previewLink?: PSMessagePreviewLinkEntity;
  public poll?: PSMessagePollEntity;
  public media!: Realm.List<PSMessageMediaEntity>;
  public files!: Realm.List<PSMessageFileEntity>;
  public repliedMessage?: PSMessageEntity;
  public pinOrUnpinMessage?: PSMessageEntity;
  public actionNote?: PSMessageActionNoteEntity;
  public mentionIds!: Realm.List<string>;
  public forwardFrom?: PSMessageForwardFromEntity;
  public participants?: PSMessageParticipantsEntity;
  public jsonPayload?: PSMessageJsonPayloadEntity;
  public quickReply?: PSMessageChatBotQuickReplyEntity;
  public carousel?: PSMessageChatBotCarouselEntity;
  public menu!: Realm.List<PSMessageChatBotMenuEntity>;
  public sticker?: PSMessageStickerEntity;
  public session?: PSMessageSessionEntity;
  public hasUnsupportedMetadata?: boolean;
  public postback?: string; // reply chat-bot
  public promotion?: PSMessagePromotionEntity;
  public originalSender?: PSUserEntity;
  public rating?: PSMessageRatingEntity;
  public skip?: boolean;
  public formSubmitted?: boolean;
  public form?: string;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageBodyEntity',
    embedded: true,
    properties: {
      text: 'string?',
      plainText: 'string?',
      isRtf: {type: 'bool', default: false},
      previewLink: 'PSMessagePreviewLinkEntity?',
      poll: 'PSMessagePollEntity?',
      media: {type: 'list', objectType: 'PSMessageMediaEntity', default: []},
      files: {type: 'list', objectType: 'PSMessageFileEntity', default: []},
      repliedMessage: 'PSMessageEntity?',
      pinOrUnpinMessage: 'PSMessageEntity?',
      actionNote: 'PSMessageActionNoteEntity?',
      mentionIds: {type: 'list', objectType: 'string', default: []},
      forwardFrom: 'PSMessageForwardFromEntity?',
      participants: 'PSMessageParticipantsEntity?',
      jsonPayload: 'PSMessageJsonPayloadEntity?',
      quickReply: 'PSMessageChatBotQuickReplyEntity?',
      carousel: 'PSMessageChatBotCarouselEntity?',
      menu: {
        type: 'list',
        objectType: 'PSMessageChatBotMenuEntity',
        default: [],
      },
      sticker: 'PSMessageStickerEntity?',
      session: 'PSMessageSessionEntity?',
      hasUnsupportedMetadata: 'bool?',
      postback: 'string?',
      promotion: 'PSMessagePromotionEntity?',
      originalSender: 'PSUserEntity?',
      rating: 'PSMessageRatingEntity?',
      skip: 'bool?',
      formSubmitted: 'bool?',
      form: 'string?',
    },
  };

  static mapMessageBodyDtoToEntity = (
    deviceId: string,
    myUserId: string,
    threadId: string,
    dto?: PSMessageBodyDto,
  ): PSMessageBodyEntity | undefined => {
    if (dto) {
      let hasUnsupportedMetadata: boolean | undefined;

      if (dto.metadata) {
        hasUnsupportedMetadata = dto.metadata.some(
          item =>
            item.type !== PSMessageMetadataType.TEXT &&
            item.type !== PSMessageMetadataType.PREVIEW_LINK &&
            item.type !== PSMessageMetadataType.IMAGE &&
            item.type !== PSMessageMetadataType.VIDEO &&
            item.type !== PSMessageMetadataType.FILE &&
            item.type !== PSMessageMetadataType.POLL &&
            item.type !== PSMessageMetadataType.JSON &&
            item.type !== PSMessageMetadataType.QUICK_REPLY &&
            item.type !== PSMessageMetadataType.CAROUSEL &&
            item.type !== PSMessageMetadataType.STICKER &&
            item.type !== PSMessageMetadataType.START_SESSION &&
            item.type !== PSMessageMetadataType.END_SESSION &&
            item.type !== PSMessageMetadataType.MENU &&
            item.type !== PSMessageMetadataType.PROMOTION &&
            item.type !== PSMessageMetadataType.RATING &&
            item.type !== PSMessageMetadataType.FORM,
        );
      }

      const previewLink = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.PREVIEW_LINK,
      )[0];

      const poll = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.POLL,
      )[0];

      const media = dto.metadata?.filter(
        item =>
          item.type === PSMessageMetadataType.IMAGE ||
          item.type === PSMessageMetadataType.VIDEO,
      );

      const files = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.FILE,
      );

      const repliedMessage =
        dto.reply_to_msg_id &&
        dto.ref_object &&
        dto.ref_object.messages &&
        dto.ref_object.messages.length
          ? PSMessageEntity.mapFromDto(
              deviceId,
              myUserId,
              threadId,
              dto.ref_object.messages.find(
                item => item.id === dto.reply_to_msg_id,
              ),
            )
          : undefined;

      const pinOrUnpinMessage =
        dto.ref_object &&
        dto.ref_object.messages &&
        dto.ref_object.messages.length &&
        dto.action_note &&
        dto.action_note.ref_ids &&
        dto.action_note.ref_ids.length
          ? PSMessageEntity.mapFromDto(
              deviceId,
              myUserId,
              threadId,
              dto.ref_object.messages.find(
                item => item.id === dto.action_note!.ref_ids![0],
              ),
            )
          : undefined;

      const participants =
        dto.ref_object && dto.ref_object.participants
          ? PSMessageParticipantsEntity.mapFromDto(dto.ref_object.participants)
          : undefined;

      const jsonPayload = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.JSON,
      )[0];

      const quickReply = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.QUICK_REPLY,
      )[0]?.quick_reply;

      const cards = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.CAROUSEL,
      )[0]?.cards;

      let carousel: PSMessageChatBotCarouselEntity | undefined;

      if (cards) {
        carousel = {
          cards: cards.mapNotNull(card =>
            PSMessageChatBotCardEntity.mapFromDto(card),
          ) as unknown,
        } as PSMessageChatBotCarouselEntity;
      }

      const menu = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.MENU,
      )[0]?.menu;

      const sticker = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.STICKER,
      )[0];

      const session = dto.metadata?.filter(
        item =>
          item.type === PSMessageMetadataType.START_SESSION ||
          item.type === PSMessageMetadataType.END_SESSION,
      )[0];

      const promotion = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.PROMOTION,
      )[0]?.promotion;

      const rating = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.RATING,
      )[0]?.rating;

      const skip = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.FORM,
      )[0]?.skip;
      const formSubmitted = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.FORM,
      )[0]?.form_submitted;
      const form = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.FORM,
      )[0]?.form;

      return {
        text: dto.text,
        plainText: dto.plain_text,
        isRtf: dto.is_rtf,
        previewLink: PSMessagePreviewLinkEntity.mapFromDto(previewLink),
        poll: PSMessagePollEntity.mapFromDto(poll),
        media: (media?.mapNotNull(item =>
          PSMessageMediaEntity.mapFromDto(item),
        ) ?? []) as unknown,
        files: (files?.mapNotNull(item =>
          PSMessageFileEntity.mapFromDto(item),
        ) ?? []) as unknown,
        repliedMessage: repliedMessage,
        pinOrUnpinMessage: pinOrUnpinMessage,
        actionNote: PSMessageActionNoteEntity.mapFromDto(dto.action_note),
        mentionIds: (dto.mention_ids ?? []) as unknown,
        forwardFrom: PSMessageForwardFromEntity.mapFromDto(dto.forward_from),
        participants: participants,
        jsonPayload: PSMessageJsonPayloadEntity.mapFromDto(jsonPayload),
        quickReply: PSMessageChatBotQuickReplyEntity.mapFromDto(quickReply),
        sticker: PSMessageStickerEntity.mapFromDto(sticker),
        session: PSMessageSessionEntity.mapFromDto(session),
        carousel: carousel,
        menu: (menu?.mapNotNull(item =>
          PSMessageChatBotMenuEntity.mapFromDto(item),
        ) ?? []) as unknown,
        hasUnsupportedMetadata: hasUnsupportedMetadata,
        promotion: PSMessagePromotionEntity.mapFromDto(promotion),
        originalSender: PSUserEntity.mapFromDto(dto.original_sender),
        rating: PSMessageRatingEntity.mapFromDto(rating),
        skip: skip,
        formSubmitted: formSubmitted,
        form: form,
      } as PSMessageBodyEntity;
    } else {
      return undefined;
    }
  };
}
