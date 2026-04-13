import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {PSMessageFileModel} from '../../../../types';
import {
  useDeepCompareMemoize,
  useIsMountedRef,
  useRenderCounter,
} from '../../../../hooks';
import {formatFileSizeToText, mimeTypeToIcon} from '../../../../utils';
import isEqual from 'react-fast-compare';
import {lookup} from 'mime-types';
import {PSIcDownload24} from '../../../../icons';
import {
  usePSDesignSystemContext,
  usePSMessageFileSavedContext,
  usePSMessageFileSavedDownloadProgressContext,
  usePSSendMessageUploadProgressContext,
  usePSTranslationContext,
} from '../../../../context';
import * as Progress from 'react-native-progress';
import {usePSMessageItemContext} from '../PSMessageItem';
import {usePSMessageNavigationContext} from '../../contexts';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

const MemoizeDownloadButton = React.memo(
  ({onDownloadPressed}: {onDownloadPressed: () => void}) => {
    const {colors} = usePSDesignSystemContext();

    const {isMyMessage} = usePSMessageItemContext();

    return (
      <PSDebouncedPressable
        style={styles.fileItemDownloadButton}
        onPress={onDownloadPressed}>
        <PSIcDownload24
          width={(40).px()}
          height={(40).px()}
          fill={isMyMessage ? colors.Primary.mainText : colors.Primary.subText}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeProgressCircle = React.memo(
  ({percent}: {percent: number}) => {
    const {colors} = usePSDesignSystemContext();

    const {isMyMessage} = usePSMessageItemContext();

    return (
      // @ts-ignore
      <Progress.Circle
        size={(40).px()}
        thickness={(2).px()}
        color={isMyMessage ? colors.Primary.mainText : colors.Branding.b600}
        unfilledColor={
          isMyMessage ? colors.Branding.b600 : colors.Primary.mainText
        }
        borderColor={
          isMyMessage ? colors.Primary.mainText : colors.Branding.b600
        }
        borderWidth={(1).px()}
        textStyle={{
          color: isMyMessage ? colors.Primary.mainText : colors.Primary.subText,
        }}
        progress={percent / 100}
        animated
        showsText
        formatText={() => {
          return `${percent}%`;
        }}
      />
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeRightIcon = React.memo(
  ({
    percent,
    downloadVisible,
    onDownloadPressed,
  }: {
    percent?: number;
    downloadVisible: boolean;
    onDownloadPressed: () => void;
  }) => {
    const onViewFileUrlPress =
      usePSMessageNavigationContext().onViewFileUrlPress;

    if (onViewFileUrlPress) {
      return null;
    }

    return percent && percent < 100 ? (
      <MemoizeProgressCircle percent={percent} />
    ) : downloadVisible ? (
      <MemoizeDownloadButton onDownloadPressed={onDownloadPressed} />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeTypeIcon = React.memo(
  ({mimeType}: {mimeType?: string}) => {
    useRenderCounter('PSMessageFiles.MemoizeTypeIcon');

    const IconType = React.useMemo(() => mimeTypeToIcon(mimeType), [mimeType]);

    return IconType ? <IconType width={40} height={40} /> : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeNameText = React.memo(
  ({name}: {name: string}) => {
    const {isMyMessage} = usePSMessageItemContext();

    const {typography, colors} = usePSDesignSystemContext();

    useRenderCounter('PSMessageFiles.MemoizeNameText');

    const textStyles = React.useMemo(() => {
      return [
        styles.fileItemNameText,
        typography.bodyMediumM,
        {color: isMyMessage ? colors.Primary.mainText : colors.Primary.subText},
      ];
    }, [
      colors.Primary.subText,
      colors.Primary.mainText,
      isMyMessage,
      typography.bodyMediumM,
    ]);

    return (
      <Text numberOfLines={1} ellipsizeMode="middle" style={textStyles}>
        {name.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeSizeText = React.memo(
  ({
    size,
    percent,
    isRemoteUrl,
  }: {
    size: number;
    percent?: number;
    isRemoteUrl: boolean;
  }) => {
    useRenderCounter('PSMessageFiles.MemoizeSizeText');

    const {isMyMessage} = usePSMessageItemContext();

    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const fileSize = React.useMemo(() => {
      if (size) {
        if (percent && percent < 100) {
          return `${translator(
            isRemoteUrl
              ? 'ps_message_file_downloaded'
              : 'ps_message_file_uploaded',
          )} ${formatFileSizeToText(
            Math.ceil((percent * size) / 100),
          )}/${formatFileSizeToText(size)}`;
        } else {
          return formatFileSizeToText(size);
        }
      } else {
        return undefined;
      }
    }, [translator, percent, size, isRemoteUrl]);

    const textStyles = React.useMemo(() => {
      return [
        styles.fileItemSizeText,
        typography.bodyMediumM,
        {
          color: isMyMessage ? colors.Primary.subText : colors.Neutral.n500,
        },
      ];
    }, [
      colors.Neutral.n500,
      colors.Primary.subText,
      isMyMessage,
      typography.bodyMediumM,
    ]);

    return fileSize ? (
      <Text numberOfLines={1} style={textStyles}>
        {fileSize}
      </Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeFileItem = React.memo(
  ({item}: {item: PSMessageFileModel}) => {
    // useRenderCounter('PSMessageFiles.MemoizeFileItem');
    const isMounted = useIsMountedRef();

    const {isOverlay, onMessageLongPress} = usePSMessageItemContext();

    const {onViewFilePress, onViewFileUrlPress} =
      usePSMessageNavigationContext();

    const [downloadVisible, setDownloadVisible] = React.useState(false);

    const [percent, setPercent] = React.useState<number | undefined>();

    const {downloadMessageFile, getPathFromFileId, isMessageFileExisted} =
      usePSMessageFileSavedContext();

    const {downloadProgress} = usePSMessageFileSavedDownloadProgressContext();

    const {uploadProgress} = usePSSendMessageUploadProgressContext();

    const checkExist = async () => {
      const result = await isMessageFileExisted(item.id);
      if (isMounted.current) {
        setDownloadVisible(!result);
      }
    };

    const onDownloadPressed = React.useCallback(async () => {
      if (isOverlay) {
        return;
      }
      setDownloadVisible(false);
      await downloadMessageFile(item.id, item.srcUrl, item.name);
      await checkExist();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOverlay, item.id, item.srcUrl, item.name, downloadMessageFile]);

    const onViewFilePressed = React.useCallback(() => {
      if (isOverlay) {
        return;
      }

      if (onViewFileUrlPress) {
        onViewFileUrlPress(item.srcUrl);
        return;
      }

      const path = getPathFromFileId(item.id);
      if (path) {
        onViewFilePress?.(path);
      } else {
        onDownloadPressed();
      }
    }, [
      isOverlay,
      item.id,
      item.srcUrl,
      getPathFromFileId,
      onViewFilePress,
      onDownloadPressed,
      onViewFileUrlPress,
    ]);

    const isRemoteUrl = item.srcUrl.startsWith('http');

    React.useEffect(() => {
      if (!isRemoteUrl) {
        setPercent(uploadProgress[item.id]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id, useDeepCompareMemoize(uploadProgress)]);

    React.useEffect(() => {
      if (isRemoteUrl) {
        setPercent(downloadProgress[item.id]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id, useDeepCompareMemoize(downloadProgress)]);

    React.useEffect(() => {
      if (isRemoteUrl) {
        checkExist();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id, item.srcUrl]);

    const mimeType = React.useMemo(() => {
      const result = lookup(item.name);
      if (typeof result === 'string') {
        return result;
      } else {
        return undefined;
      }
    }, [item.name]);

    return (
      <PSDebouncedPressable
        onPress={onViewFilePressed}
        onLongPress={onMessageLongPress}
        style={styles.fileItemContainer}>
        <MemoizeTypeIcon mimeType={mimeType} />
        <View style={[styles.fileItemTextContainer]}>
          <MemoizeNameText name={item.name} />
          <MemoizeSizeText
            size={item.size}
            percent={percent}
            isRemoteUrl={isRemoteUrl}
          />
        </View>
        <MemoizeRightIcon
          percent={percent}
          downloadVisible={downloadVisible}
          onDownloadPressed={onDownloadPressed}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessageFiles = React.memo(
  ({
    files,
    containerStyle,
  }: {
    files?: PSMessageFileModel[];
    containerStyle: StyleProp<ViewStyle>;
  }) => {
    return files && files.length ? (
      <View style={[styles.container, containerStyle]}>
        {files.map(item => (
          <MemoizeFileItem key={item.id} item={item} />
        ))}
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: (16).px(),
    minWidth: '100%',
    alignSelf: 'center',
  },
  fileItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileItemTextContainer: {
    flexDirection: 'column',
    marginHorizontal: (8).px(),
    flex: 1,
  },
  fileItemNameText: {
    width: '100%',
  },
  fileItemSizeText: {
    marginTop: (2).px(),
    width: '100%',
  },
  fileItemDownloadButton: {
    width: (40).px(),
    height: (40).px(),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
