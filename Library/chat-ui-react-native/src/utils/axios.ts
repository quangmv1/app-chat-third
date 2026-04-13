import {PSUploadRequestDto} from '@communi/chat-api-client-typescript';
import FormData from 'form-data';
import {lookup} from 'mime-types';

export const createFormData = (
  key: 'image' | 'video' | 'file',
  files: PSUploadRequestDto[],
): FormData => {
  let formData = new FormData();
  files.forEach(item => {
    formData.append(key, {
      uri: item.uri,
      name: item.filename,
      type: lookup(item.filename),
    });
  });
  return formData;
};
