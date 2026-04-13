import {
  PSCreateMessageBodyMetadataRequestDto,
  PSMessageMetadataDto,
  PSMessageMetadataType,
} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';

export class PSMessagePreviewLinkEntity extends Realm.Object {
  public url!: string;
  public title?: string;
  public sitename?: string;
  public description?: string;
  public image?: string;
  public width?: number;
  public height?: number;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessagePreviewLinkEntity',
    embedded: true,
    properties: {
      url: 'string',
      title: 'string?',
      sitename: 'string?',
      description: 'string?',
      image: 'string?',
      width: 'int?',
      height: 'int?',
    },
  };

  static mapToRequestDto = (entity?: PSMessagePreviewLinkEntity) => {
    if (entity) {
      return {
        title: entity.title,
        description: entity.description,
        sitename: entity.sitename,
        src_url: entity.url,
        src_thumb_url: entity.image,
        width: entity.width,
        height: entity.height,
        type: PSMessageMetadataType.PREVIEW_LINK,
      } as PSCreateMessageBodyMetadataRequestDto;
    } else {
      return undefined;
    }
  };

  static mapFromDto = (dto?: PSMessageMetadataDto) => {
    if (dto) {
      return {
        title: dto.title,
        description: dto.description,
        sitename: dto.sitename,
        url: dto.src_url,
        image: dto.src_thumb_url,
        width: dto.width,
        height: dto.height,
      } as PSMessagePreviewLinkEntity;
    } else {
      return undefined;
    }
  };
}
