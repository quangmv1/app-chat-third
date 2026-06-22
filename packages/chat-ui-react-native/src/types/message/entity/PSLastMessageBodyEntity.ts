import { Realm } from '@realm/react';
import { PSMessagePreviewLinkEntity } from './PSMessagePreviewLinkEntity';
import { PSMessageMediaEntity } from './PSMessageMediaEntity';
import { PSMessageActionNoteEntity } from './PSMessageActionNoteEntity';
import {
  PSLastMessageBodyDto,
  PSMessageMetadataType,
} from '@communi/chat-api-client-typescript';
import { PSMessageBodyEntity } from './PSMessageBodyEntity';
import { PSMessageParticipantsEntity } from './PSMessageParticipantsEntity';
import { PSMessageFileEntity } from './PSMessageFileEntity';
import {
  PSMessageChatBotCardEntity,
  PSMessageChatBotCarouselEntity,
  PSMessageChatBotQuickReplyEntity,
} from './PSMessageChatBotEntity';
import { PSMessageStickerEntity } from './PSMessageStickerEntity';

export class PSLastMessageBodyEntity extends Realm.Object {
  public text?: string;
  public plainText?: string;
  public isRtf!: boolean;
  public previewLink?: PSMessagePreviewLinkEntity;
  public media!: Realm.List<PSMessageMediaEntity>;
  public files!: Realm.List<PSMessageFileEntity>;
  public pollId?: string;
  public actionNote?: PSMessageActionNoteEntity;
  public mentionIds!: Realm.List<string>;
  public participants?: PSMessageParticipantsEntity;
  public quickReply?: PSMessageChatBotQuickReplyEntity;
  public carousel?: PSMessageChatBotCarouselEntity;
  public sticker?: PSMessageStickerEntity;
  public hasUnsupportedMetadata?: boolean;

  public static schema: Realm.ObjectSchema = {
    name: 'PSLastMessageBodyEntity',
    embedded: true,
    properties: {
      text: 'string?',
      plainText: 'string?',
      isRtf: { type: 'bool', default: false },
      previewLink: 'PSMessagePreviewLinkEntity?',
      media: { type: 'list', objectType: 'PSMessageMediaEntity', default: [] },
      files: { type: 'list', objectType: 'PSMessageFileEntity', default: [] },
      pollId: 'string?',
      actionNote: 'PSMessageActionNoteEntity?',
      mentionIds: { type: 'list', objectType: 'string', default: [] },
      participants: 'PSMessageParticipantsEntity?',
      quickReply: 'PSMessageChatBotQuickReplyEntity?',
      carousel: 'PSMessageChatBotCarouselEntity?',
      sticker: 'PSMessageStickerEntity?',
      hasUnsupportedMetadata: 'bool?',
    },
  };

  static mapFromMessageBodyEntity = (body?: PSMessageBodyEntity) => {
    if (body) {
      return {
        text: body.text,
        plainText: body.plainText,
        isRtf: body.isRtf,
        previewLink: body.previewLink,
        media: JSON.parse(JSON.stringify(body.media)),
        files: JSON.parse(JSON.stringify(body.files)),
        pollId: body.poll?.id,
        actionNote: JSON.parse(JSON.stringify(body.actionNote)), // trick để không bị lỗi pinned messsage
        mentionIds: body.mentionIds,
        participants: body.participants,
        quickReply: body.quickReply,
        carousel: body.carousel,
        sticker: body.sticker,
        hasUnsupportedMetadata: body.hasUnsupportedMetadata,
      } as PSLastMessageBodyEntity;
    } else {
      return undefined;
    }
  };

  static mapFromDto = (dto?: PSLastMessageBodyDto) => {
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
            item.type !== PSMessageMetadataType.MENU &&
            item.type !== PSMessageMetadataType.STICKER &&
            item.type !== PSMessageMetadataType.RATING &&
            item.type !== PSMessageMetadataType.START_SESSION &&
            item.type !== PSMessageMetadataType.END_SESSION &&
            item.type !== PSMessageMetadataType.PROMOTION,
        );
      }

      const previewLink = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.PREVIEW_LINK,
      )[0];

      const media = dto.metadata?.filter(
        item =>
          item.type === PSMessageMetadataType.IMAGE ||
          item.type === PSMessageMetadataType.VIDEO,
      );

      const files = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.FILE,
      );

      const participants =
        dto.ref_object && dto.ref_object.participants
          ? PSMessageParticipantsEntity.mapFromDto(dto.ref_object.participants)
          : undefined;

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

      const sticker = dto.metadata?.filter(
        item => item.type === PSMessageMetadataType.STICKER,
      )[0];

      return {
        text: dto.text,
        plainText: dto.plain_text,
        isRtf: dto.is_rtf,
        previewLink: PSMessagePreviewLinkEntity.mapFromDto(previewLink),
        media: (media?.mapNotNull(item =>
          PSMessageMediaEntity.mapFromDto(item),
        ) ?? []) as unknown,
        files: (files?.mapNotNull(item =>
          PSMessageFileEntity.mapFromDto(item),
        ) ?? []) as unknown,
        pollId: dto.poll_id,
        actionNote: PSMessageActionNoteEntity.mapFromDto(dto.action_note),
        mentionIds: (dto.mention_ids ?? []) as unknown,
        participants: participants,
        quickReply: quickReply,
        sticker: PSMessageStickerEntity.mapFromDto(sticker),
        carousel: carousel,
        hasUnsupportedMetadata: hasUnsupportedMetadata,
      } as PSLastMessageBodyEntity;
    } else {
      return undefined;
    }
  };
}
