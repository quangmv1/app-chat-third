import {Realm} from '@realm/react';
import {
  PSCreateMessageBodyMetadataRequestDto,
  PSMessageMetadataDto,
  PSMessageMetadataType,
  PSUploadRequestDto,
} from '@communi/chat-api-client-typescript';
import {PSMessageFileModel} from '../model/PSMessageFileModel';

export class PSMessageFileEntity extends Realm.Object {
  public id!: string;
  public name!: string;
  public srcUrl!: string;
  public size!: number;
  public path?: string;
  public bucket?: string;

  public static schema: Realm.ObjectSchema = {
    name: 'PSMessageFileEntity',
    embedded: true,
    properties: {
      id: 'string',
      name: 'string',
      srcUrl: 'string',
      size: 'int',
      path: 'string?',
      bucket: 'string?',
    },
  };

  static mapFromDto = (dto?: PSMessageMetadataDto) => {
    if (dto && dto.id && dto.src_url && dto.size) {
      return {
        id: dto.id,
        name: dto.name,
        srcUrl: dto.src_url,
        size: dto.size,
        path: dto.path,
        bucket: dto.bucket,
      } as PSMessageFileEntity;
    } else {
      return undefined;
    }
  };

  static mapFromModel = (model: PSMessageFileModel) => {
    return {
      id: model.id,
      name: model.name,
      srcUrl: model.srcUrl,
      size: model.size,
      path: model.path,
      bucket: model.bucket,
    } as PSMessageFileEntity;
  };

  static mapToRequestDto = (entity: PSMessageFileEntity) => {
    return {
      id: entity.id,
      name: entity.name,
      path: entity.path!,
      bucket: entity.bucket!,
      size: entity.size,
      type: PSMessageMetadataType.FILE,
    } as PSCreateMessageBodyMetadataRequestDto;
  };

  static mapToUploadRequestDto = (entity: PSMessageFileEntity) => {
    return {
      uri: entity.srcUrl,
      filename: entity.name,
      type: 'file',
      id: entity.id,
      size: entity.size,
    } as PSUploadRequestDto;
  };
}
