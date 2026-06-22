import {PSMessageMetadataType} from '@communi/chat-api-client-typescript';
import {PSMessageMediaEntity} from '../entity/PSMessageMediaEntity';
import {MediaPickerAsset} from '../../../components';

export type PSMessageMediaModel = {
  id: string;
  srcUrl: string;
  srcThumbUrl?: string;
  width: number;
  height: number;
  type: PSMessageMetadataType;
  size: number;
  name: string;
  duration?: number;
  path?: string;
  bucket?: string;
};

export const mapToMediaPickerAsset = (entity: PSMessageMediaModel) => {
  return {
    id: entity.id,
    uri: entity.srcUrl,
    width: entity.width,
    height: entity.height,
    size: entity.size,
    name: entity.name,
    type: entity.type === PSMessageMetadataType.IMAGE ? 'image' : 'video',
    path: entity.path,
    bucket: entity.bucket,
    duration: entity.duration,
  } as MediaPickerAsset;
};

export const mapMessageMediaModelFromAssetPicker = (
  asset: MediaPickerAsset,
) => {
  return {
    id: asset.id,
    srcUrl: asset.uri,
    width: asset.width,
    height: asset.height,
    type:
      asset.type === 'image'
        ? PSMessageMetadataType.IMAGE
        : PSMessageMetadataType.VIDEO,
    size: asset.size,
    name: asset.name,
    path: asset.path,
    bucket: asset.bucket,
    duration: asset.duration,
  } as PSMessageMediaModel;
};

export const mapMessageMediaEntityToModel = (entity: PSMessageMediaEntity) => {
  return {
    id: entity.id,
    srcUrl: entity.srcUrl,
    srcThumbUrl: entity.srcThumbUrl,
    width: entity.width,
    height: entity.height,
    type: entity.type,
    size: entity.size,
    name: entity.name,
    duration: entity.duration,
    path: entity.path,
    bucket: entity.bucket,
  } as PSMessageMediaModel;
};
