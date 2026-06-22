import {Alert} from 'react-native';
import {psLogger} from './logger';
import {DownloadProgressData, getLocalAssetUri, saveFile} from './native';

export const downloadImageOrVideo = async (url: string) => {
  try {
    const index = url.lastIndexOf('/');
    const filePath = await saveFile({
      fromUrl: url,
      fileName: url.substring(index + 1),
    });
    await getLocalAssetUri(filePath).then(_res => {
      Alert.alert('Download Successfully.');
    });
  } catch (error) {
    psLogger.error(error);
    Alert.alert(`${error}`);
  }
};

export const downloadFile = async (
  url: string,
  fileName: string,
  progress?: (res: DownloadProgressData) => void,
) => {
  try {
    return await saveFile({
      fromUrl: url,
      fileName: fileName,
      onProgress: progress,
    });
  } catch (error) {
    psLogger.error(error);
    return undefined;
  }
};
