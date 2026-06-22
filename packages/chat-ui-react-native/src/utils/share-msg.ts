import {lookup} from 'mime-types';
import {deleteFile, saveFile, shareImage} from './native';
import {psLogger} from './logger';
import {Alert} from 'react-native';

export const shareFile = async (url: string) => {
  try {
    const index = url.lastIndexOf('/');
    // const extension = photo.mime_type?.split('/')[1] || 'jpg';
    const localFile = await saveFile({
      fromUrl: url,
      fileName: url.substring(index + 1),
    });

    let mimeType = lookup(url.substring(index + 1));

    // `image/jpeg` is added for the case where the mime_type isn't available for a file/image
    await shareImage({
      type: mimeType || 'image/jpeg',
      url: localFile,
    });
    await deleteFile({uri: localFile});
  } catch (error) {
    psLogger.error(error);
    Alert.alert(`${error}`);
  }
  //   try {
  //     const index = url.lastIndexOf('/');
  //     const filePath = await saveFile({
  //       fromUrl: url,
  //       fileName: url.substring(index + 1),
  //     });
  //     await getLocalAssetUri(filePath).then(_res => {
  //       Alert.alert('Download Successfully.');
  //     });
  //   } catch (error) {
  //     psLogger.error(error);
  //     Alert.alert(`${error}`);
  //   }
};
