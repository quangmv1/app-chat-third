import {StyleProp, ViewStyle} from 'react-native';
import {
  IMQTTClient,
  MQTTOptions,
} from '@communi/mqtt-client-interface-typescript';

const fail = () => {
  throw Error(
    'Native handler chưa được đăng ký, bạn cần import @communi/chat-expo hoặc @communi/chat-react-native',
  );
};

export type Asset = {
  source: 'camera' | 'picker';
  filename: string | null;
  uri: string;
  height: number;
  width: number;
  fileSize: number;
  playableDuration: number;
};

export type Album = {
  title: string;
  count: number;
  type?: string;
  subtype?: string;
  image?: {
    filename: string | null;
    filepath: string | null;
    extension: string | null;
    uri: string;
    height: number;
    width: number;
    fileSize: number | null;
    playableDuration: number;
    orientation: number | null;
  };
};

export type FileAssetType = {
  name: string;
  mimeType?: string;
  size?: number | string;
  // The uri should be of type `string`. But is `string|undefined` because the same type is used for the response from Stream's Attachment. This shall be fixed.
  uri?: string;
};

export type DocumentResponse = {
  uri: string;
  size?: number | null;
  name?: string | null;
};

export type UnknownType = Record<string, unknown>;

export type ValueOf<T> = T[keyof T];

export type KeyboardListener = (height: number) => void;

type AddKeyboardListener = (callback: KeyboardListener) => void;
export let addKeyboardListener: AddKeyboardListener = fail;

type RemoveKeyboardListener = (callback: KeyboardListener) => void;
export let removeKeyboardListener: RemoveKeyboardListener = fail;

type SetWindowSoftInputAdjustNothing = () => void;
export let setWindowSoftInputAdjustNothing: SetWindowSoftInputAdjustNothing =
  fail;

type SetWindowSoftInputAdjustResize = () => void;
export let setWindowSoftInputAdjustResize: SetWindowSoftInputAdjustResize =
  fail;

type SetWindowSoftInputAdjustPan = () => void;
export let setWindowSoftInputAdjustPan: SetWindowSoftInputAdjustPan =
  fail;

type CreateMQTTClient = (options: MQTTOptions) => Promise<IMQTTClient>;
export let createMQTTClient: CreateMQTTClient = fail;

type CompressImage = ({
  compressImageQuality,
  height,
  uri,
  width,
}: {
  compressImageQuality: number;
  height: number;
  uri: string;
  width: number;
}) => Promise<string>;
export let compressImage: CompressImage = fail;

type DeleteFile = ({uri}: {uri: string}) => Promise<boolean>;
export let deleteFile: DeleteFile = fail;

type GetLocalAssetUri = (uriOrAssetId: string) => Promise<string | undefined>;
export let getLocalAssetUri: GetLocalAssetUri = fail;

type OniOS14LibrarySelectionChange = (callback: () => void) => {
  unsubscribe: () => void;
};
export let oniOS14GalleryLibrarySelectionChange: OniOS14LibrarySelectionChange =
  fail;

type iOS14RefreshGallerySelection = () => Promise<void>;
export let iOS14RefreshGallerySelection: iOS14RefreshGallerySelection = fail;

export type GroupTypes =
  | 'Album'
  | 'All'
  | 'Event'
  | 'Faces'
  | 'Library'
  | 'SmartAlbum'
  | 'PhotoStream'
  | 'SavedPhotos';

type GetPhotos = ({
  after,
  first,
  groupName,
}: {
  first: number;
  after?: string;
  groupName?: string;
  groupTypes?: GroupTypes;
}) => Promise<{
  assets: Asset[];
  endCursor?: string;
  hasNextPage: boolean;
  iOSLimited: boolean;
}>;
export let getPhotos: GetPhotos = fail;

type GetAlbums = ({
  albumType,
  assetType,
}: {
  albumType?: 'All' | 'Album' | 'SmartAlbum';
  assetType?: 'All' | 'Videos' | 'Photos';
}) => Promise<{Albums: Album[]}>;
export let getAlbums: GetAlbums = fail;

type IsExistFile = (filePath: string) => Promise<boolean>;
export let isExistFile: IsExistFile = fail;

type PickDocument = (maxNumberOfFiles?: number) => Promise<{
  cancelled: boolean;
  assets?: DocumentResponse[];
}>;

export let pickDocument: PickDocument = fail;

export type DownloadProgressData = {
  jobId: number; // The download job ID, required if one wishes to cancel the download. See `stopDownload`.
  contentLength: number; // The total size in bytes of the download resource
  bytesWritten: number; // The number of bytes written to the file so far
};
type SaveFileOptions = {
  fileName: string;
  fromUrl: string;
  onProgress?: (data: DownloadProgressData) => void;
};
type SaveFile = (options: SaveFileOptions) => Promise<string>;
export let saveFile: SaveFile = fail;

type SetClipboardString = (text: string) => void;
export let setClipboardString: SetClipboardString = fail;

type ShareOptions = {
  type?: string;
  url?: string;
};
type ShareImage = (options: ShareOptions) => Promise<boolean> | never;
export let shareImage: ShareImage = fail;

type ShareTextOptions = {
  text?: string;
};
type ShareText = (options: ShareTextOptions) => Promise<boolean> | never;
export let shareText: ShareText = fail;

type Photo =
  | {
      width: number;
      height: number;
      // source: string;
      name: string;
      size: number;
      uri: string;
      source: 'camera';
      cancelled: false;
      askToOpenSettings?: boolean;
    }
  | undefined;

type TakePhoto = (options: {
  compressImageQuality?: number;
  cropping?: boolean;
}) => Promise<Photo>;
export let takePhoto: TakePhoto = fail;

type PickPhoto = (options: {
  compressImageQuality?: number;
  cropping?: boolean;
}) => Promise<Photo>;
export let pickPhoto: PickPhoto = fail;

type HapticFeedbackMethod =
  | 'impactHeavy'
  | 'impactLight'
  | 'impactMedium'
  | 'notificationError'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'selection';
type TriggerHaptic = (method: HapticFeedbackMethod) => void;
export let triggerHaptic: TriggerHaptic = fail;

export type PlaybackStatus = {
  didJustFinish: boolean;
  durationMillis: number;
  error: string;
  isBuffering: boolean;
  isLoaded: boolean;
  isLooping: boolean;
  isPlaying: boolean;
  positionMillis: number;
};

export type AVPlaybackStatusToSet = {
  isLooping: boolean;
  isMuted: boolean;
  positionMillis: number;
  progressUpdateIntervalMillis: number;
  rate: number;
  shouldCorrectPitch: boolean;
  shouldPlay: boolean;
  volume: number;
};

export let SDK: string;

export type SoundOptions = {
  basePathOrCallback?: string;
  callback?: () => void;
  filenameOrFile?: string;
  initialStatus?: Partial<AVPlaybackStatusToSet>;
  onPlaybackStatusUpdate?: (playbackStatus: PlaybackStatus) => void;
  source?: {uri: string};
};

export type VideoProgressData = {
  currentTime: number;
  seekableDuration: number;
  playableDuration?: number;
};

export type VideoPayloadData = {
  duration: number;
  audioTracks?: {
    index: number;
    language: string;
    title: string;
    type: string;
  }[];
  currentPosition?: number;
  naturalSize?: {
    height: number;
    orientation: 'portrait' | 'landscape';
    width: number;
  };
  textTracks?: {index: number; language: string; title: string; type: string}[];
  videoTracks?: {
    bitrate: number;
    codecs: string;
    height: number;
    trackId: number;
    width: number;
  }[];
};

export type VideoType = {
  paused: boolean;
  uri: string;
  videoRef: React.RefObject<VideoType>;
  onBuffer?: (props: {isBuffering: boolean}) => void;
  onEnd?: () => void;
  onLoad?: (payload: VideoPayloadData) => void;
  onLoadStart?: () => void;
  onPlaybackStatusUpdate?: (playbackStatus: PlaybackStatus) => void;
  onProgress?: (data: VideoProgressData) => void;
  onReadyForDisplay?: () => void;
  repeat?: boolean;
  replayAsync?: () => void;
  resizeMode?: string;
  seek?: (progress: number) => void;
  setPositionAsync?: (position: number) => void;
  style?: StyleProp<ViewStyle>;
};

export let Video: React.ComponentType<VideoType>;

export type DatePickerType = {
  modal?: boolean;
  open?: boolean;
  date: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: string;
  onConfirm?: (date: Date) => void;
  onCancel?: () => void;
};

export let DatePicker: React.ComponentType<DatePickerType>;

type Handlers = {
  addKeyboardListener: AddKeyboardListener;
  removeKeyboardListener: RemoveKeyboardListener;
  setWindowSoftInputAdjustNothing: SetWindowSoftInputAdjustNothing;
  setWindowSoftInputAdjustResize: SetWindowSoftInputAdjustResize;
  setWindowSoftInputAdjustPan: SetWindowSoftInputAdjustPan;
  createMQTTClient: CreateMQTTClient;
  deleteFile?: DeleteFile;
  getLocalAssetUri?: GetLocalAssetUri;
  getPhotos?: GetPhotos;
  iOS14RefreshGallerySelection?: iOS14RefreshGallerySelection;
  getAlbums?: GetAlbums;
  isExistFile?: IsExistFile;
  oniOS14GalleryLibrarySelectionChange?: OniOS14LibrarySelectionChange;
  pickDocument?: PickDocument;
  saveFile?: SaveFile;
  setClipboardString?: SetClipboardString;
  shareImage?: ShareImage;
  shareText?: ShareText;
  takePhoto?: TakePhoto;
  pickPhoto?: PickPhoto;
  triggerHaptic?: TriggerHaptic;
  Video?: React.ComponentType<VideoType>;
  DatePicker?: React.ComponentType<DatePickerType>;
};

export const registerNativeHandlers = (handlers: Handlers) => {
  if (handlers.addKeyboardListener) {
    addKeyboardListener = handlers.addKeyboardListener;
  }

  if (handlers.removeKeyboardListener) {
    removeKeyboardListener = handlers.removeKeyboardListener;
  }

  if (handlers.setWindowSoftInputAdjustNothing) {
    setWindowSoftInputAdjustNothing = handlers.setWindowSoftInputAdjustNothing;
  }

  if (handlers.setWindowSoftInputAdjustResize) {
    setWindowSoftInputAdjustResize = handlers.setWindowSoftInputAdjustResize;
  }

  if(handlers.setWindowSoftInputAdjustPan) {
    setWindowSoftInputAdjustPan = handlers.setWindowSoftInputAdjustPan;
  }

  if (handlers.createMQTTClient) {
    createMQTTClient = handlers.createMQTTClient;
  }

  if (handlers.deleteFile) {
    deleteFile = handlers.deleteFile;
  }

  if (handlers.getLocalAssetUri) {
    getLocalAssetUri = handlers.getLocalAssetUri;
  }

  if (handlers.getPhotos) {
    getPhotos = handlers.getPhotos;
  }

  if (handlers.iOS14RefreshGallerySelection) {
    iOS14RefreshGallerySelection = handlers.iOS14RefreshGallerySelection;
  }

  if (handlers.getAlbums) {
    getAlbums = handlers.getAlbums;
  }

  if (handlers.isExistFile) {
    isExistFile = handlers.isExistFile;
  }

  if (handlers.oniOS14GalleryLibrarySelectionChange) {
    oniOS14GalleryLibrarySelectionChange =
      handlers.oniOS14GalleryLibrarySelectionChange;
  }

  if (handlers.pickDocument !== undefined) {
    pickDocument = handlers.pickDocument;
  }

  if (handlers.saveFile) {
    saveFile = handlers.saveFile;
  }

  if (handlers.shareImage !== undefined) {
    shareImage = handlers.shareImage;
  }

  if (handlers.shareText !== undefined) {
    shareText = handlers.shareText;
  }

  if (handlers.takePhoto) {
    takePhoto = handlers.takePhoto;
  }

  if (handlers.pickPhoto) {
    pickPhoto = handlers.pickPhoto;
  }

  if (handlers.triggerHaptic) {
    triggerHaptic = handlers.triggerHaptic;
  }

  if (handlers.Video) {
    Video = handlers.Video;
  }

  if (handlers.DatePicker) {
    DatePicker = handlers.DatePicker;
  }

  if (handlers.setClipboardString !== undefined) {
    setClipboardString = handlers.setClipboardString;
  }
};
