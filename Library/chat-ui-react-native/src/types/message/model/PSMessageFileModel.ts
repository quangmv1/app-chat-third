import {PSMessageFileEntity} from '../entity/PSMessageFileEntity';
import uuid from 'react-native-uuid';
import {DocumentResponse} from '../../../utils';

export type PSMessageFileModel = {
  id: string;
  srcUrl: string;
  size: number;
  name: string;
  path?: string;
  bucket?: string;
};

export const mapMessageFileEntityToModel = (entity: PSMessageFileEntity) => {
  return {
    id: entity.id,
    srcUrl: entity.srcUrl,
    size: entity.size,
    name: entity.name,
    path: entity.path,
    bucket: entity.bucket,
  } as PSMessageFileModel;
};

export const mapMessageFileModelFromDocument = (document: DocumentResponse) => {
  return {
    id: uuid.v4().toString(),
    srcUrl: document.uri,
    size: document.size,
    name: document.name,
  } as PSMessageFileModel;
};
