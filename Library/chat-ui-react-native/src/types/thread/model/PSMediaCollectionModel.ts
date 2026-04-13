import {PSMediaCollectionDto} from '@communi/chat-api-client-typescript';
import {PSMessageMediaModel} from '../../message';

export type PSMediaCollectionModel = {
  id: string;
  messageId: number;
  content: PSMessageMediaModel;
  createdAt: number;
  duration?: number;
  name?: string;
  titleLink?: string;
  descriptionLink?: string;
};

export const mapMediaCollectionDtoToModel = (
  mediaDto: PSMediaCollectionDto,
) => {
  return {
    id: mediaDto.id,
    messageId: mediaDto.message_id,
    createdAt: mediaDto.created_at,
    content: {
      id: mediaDto.content.id,
      srcUrl: mediaDto.content.src_url,
      srcThumbUrl: mediaDto.content.src_thumb_url,
      width: mediaDto.content.width,
      height: mediaDto.content.height,
      type: mediaDto.content.type,
      size: mediaDto.content.size,
      path: mediaDto.content.path,
      bucket: mediaDto.content.bucket,
    } as PSMessageMediaModel,
    duration: mediaDto.content.duration,
    name: mediaDto.content.name,
    titleLink: mediaDto.content.title,
    descriptionLink: mediaDto.content.description,
  } as PSMediaCollectionModel;
};

export const mapMediaCollectionsDtoToModel = (
  mediaDto: PSMediaCollectionDto[],
) => {
  return mediaDto.map(dto => mapMediaCollectionDtoToModel(dto));
};
