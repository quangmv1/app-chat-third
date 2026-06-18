import {Realm} from '@realm/react';
import {
  PSCreateMessageBodyMetadataRequestDto,
  PSMessageMetadataDto,
  PSMessageMetadataFileType,
  PSMessageMetadataType,
} from '@communi/chat-api-client-typescript';
import {PSStickerModel} from '../../sticker';

export class PSMessageStickerEntity extends Realm.Object {
  public id!: string;
  public fileType!: PSMessageMetadataFileType;
  public srcUrl!: string;
  public path?: string;
  public bucket?: string;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageStickerEntity',
    primaryKey: 'id',
    properties: {
      id: 'string',
      fileType: 'string',
      srcUrl: 'string',
      path: 'string?',
      bucket: 'string?',
    },
  };

  static mapFromDto = (dto?: PSMessageMetadataDto) => {
    if (
      dto &&
      dto.id &&
      dto.file_type &&
      (Object.values(PSMessageMetadataFileType) as string[]).includes(
        dto.file_type,
      ) &&
      dto.src_url
    ) {
      return {
        id: dto.id,
        fileType: dto.file_type,
        srcUrl: dto.src_url,
        path: dto.path,
        bucket: dto.bucket,
      } as PSMessageStickerEntity;
    } else {
      return undefined;
    }
  };

  static mapFromStickerModel = (model?: PSStickerModel) => {
    if (
      model &&
      model.fileType &&
      (Object.values(PSMessageMetadataFileType) as string[]).includes(
        model.fileType,
      ) &&
      model.fileUrl
    ) {
      return {
        id: model.id,
        fileType: model.fileType,
        srcUrl: model.fileUrl,
        path: model.filePath,
        bucket: model.fileBucket,
      } as unknown as PSMessageStickerEntity;
    } else {
      return undefined;
    }
  };

  static mapToRequestDto = (entity?: PSMessageStickerEntity) => {
    if (entity) {
      return {
        id: entity.id,
        file_type: entity.fileType,
        path: entity.path,
        bucket: entity.bucket,
        type: PSMessageMetadataType.STICKER,
      } as PSCreateMessageBodyMetadataRequestDto;
    } else {
      return undefined;
    }
  };
}
