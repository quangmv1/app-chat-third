type MediaPickerAssetType = 'image' | 'video';

export type MediaPickerAsset = {
  id: string;
  uri: string;
  name: string;
  size: number;
  height: number;
  width: number;
  type: MediaPickerAssetType;
  duration?: number;
  path?: string; // cho case sửa message
  bucket?: string; // cho case sửa message
};
