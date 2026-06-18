import {Realm} from '@realm/react';
import {
  PSCreateMessageBodyMetadataRequestDto,
  PSMessageMetadataDto,
  PSMessageMetadataType,
  PSUploadRequestDto,
} from '@communi/chat-api-client-typescript';
import {PSMessageMediaModel} from '../model/PSMessageMediaModel';
import {Platform} from 'react-native';
import uuid from 'react-native-uuid';

export class PSMessageMediaEntity extends Realm.Object {
  public id!: string;
  public name!: string;
  public size!: number;
  public width!: number;
  public height!: number;
  public srcUrl!: string;
  public srcThumbUrl?: string;
  public type!: PSMessageMetadataType;
  public path?: string; // cho case sửa message
  public bucket?: string; // cho case sửa message
  public duration?: number;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageMediaEntity',
    embedded: true,
    properties: {
      id: 'string',
      name: 'string',
      size: 'int',
      width: 'int',
      height: 'int',
      srcUrl: 'string',
      srcThumbUrl: 'string?',
      type: 'int',
      path: 'string?',
      bucket: 'string?',
      duration: 'float?',
    },
  };

  static mapFromModel = (model: PSMessageMediaModel) => {
    return {
      id: uuid.v4().toString(), // đảm bảo khi save vào realm thì mỗi media có uniqueId
      name: model.name,
      size: model.size,
      width: model.width,
      height: model.height,
      srcUrl: model.srcUrl,
      srcThumbUrl: model.srcThumbUrl,
      type: model.type,
      path: model.path,
      bucket: model.bucket,
      duration: model.duration,
    } as PSMessageMediaEntity;
  };

  static mapFromDto = (dto?: PSMessageMetadataDto) => {
    if (dto && dto.id && dto.width && dto.height && dto.src_url) {
      return {
        id: dto.id,
        name: dto.name,
        size: dto.size,
        width: dto.width,
        height: dto.height,
        srcUrl: dto.src_url,
        srcThumbUrl: dto.src_thumb_url,
        type: dto.type,
        path: dto.path,
        bucket: dto.bucket,
        duration: dto.duration,
      } as PSMessageMediaEntity;
    } else {
      return undefined;
    }
  };

  static mapToUploadRequestDto = (entity: PSMessageMediaEntity) => {
    const uri = Platform.select({
      ios: entity.srcUrl.startsWith('ph://')
        ? 'ph-upload' + entity.srcUrl.substring(2)
        : entity.srcUrl,
      default: entity.srcUrl,
    });
    return {
      uri: uri,
      filename: entity.name,
      type: entity.type === PSMessageMetadataType.IMAGE ? 'image' : 'video',
      width: entity.width,
      height: entity.height,
      duration: entity.duration,
      id: entity.id,
      size: entity.size,
    } as PSUploadRequestDto;
  };

  static mapToRequestDto = (entity: PSMessageMediaEntity) => {
    return {
      id: entity.id,
      name: entity.name,
      path: entity.path!,
      bucket: entity.bucket!,
      size: entity.size,
      width: entity.width!,
      height: entity.height!,
      type: entity.type,
      duration: entity.duration,
    } as PSCreateMessageBodyMetadataRequestDto;
  };
}
