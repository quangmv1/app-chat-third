import React from 'react';
import isEqual from 'react-fast-compare';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {PSMediaCollectionModel} from '../../../../types';
import {lookup} from 'mime-types';
import {formatFileSizeToText, mimeTypeToIcon} from '../../../../utils';
import {PSMediaCollectionsStyles} from '../../../../components';
import {IcFill3DotHorizontal, IcLine15CloudArrowDown} from '../../../../icons';
import * as Progress from 'react-native-progress';
import {
  usePSDesignSystemContext,
  usePSMessageFileSavedContext,
  usePSMessageFileSavedDownloadProgressContext,
} from '../../../../context';
import {
  useDeepCompareMemoize,
  useIsMountedRef,
  useRenderCounter,
} from '../../../../hooks';
import {usePSMediaCollectionNavigationContext} from '../../../profile';

const MediaCollectionFileItem = ({
  item,
  onItemMorePress,
}: {
  item: PSMediaCollectionModel;
  onItemMorePress: (media: PSMediaCollectionModel) => void;
}) => {
  const isMounted = useIsMountedRef();

  const fileSize = React.useMemo(() => {
    return item.content.size ? formatFileSizeToText(item.content.size) : null;
  }, [item.content.size]);

  const mimeType = React.useMemo(() => {
    const result = item.name ? lookup(item.name) : item.name;
    if (typeof result === 'string') {
      return result;
    } else {
      return undefined;
    }
  }, [item.name]);

  const [percent, setPercent] = React.useState<number | undefined>();
  const {downloadProgress} = usePSMessageFileSavedDownloadProgressContext();
  const {downloadMessageFile, isMessageFileExisted, getPathFromFileId} =
    usePSMessageFileSavedContext();
  const [downloadVisible, setDownloadVisible] = React.useState(false);

  const checkExist = async () => {
    const result = await isMessageFileExisted(item.content.id);
    if (isMounted.current) {
      setDownloadVisible(!result);
    }
  };

  const onDownloadPressed = React.useCallback(async () => {
    setDownloadVisible(false);
    await downloadMessageFile(
      item.content.id,
      item.content.srcUrl,
      item.name ?? '',
    );
    await checkExist();
  }, [item.content.id, item.content.srcUrl, item.name, downloadMessageFile]);

  const {onViewFilePress, onViewFileUrlPress} =
    usePSMediaCollectionNavigationContext();

  const onFileItemPressed = React.useCallback(async () => {
    if (onViewFileUrlPress) {
      onViewFileUrlPress(item.content.srcUrl);
      return;
    }

    const result = await isMessageFileExisted(item.content.id);
    if (result) {
      const filePath = getPathFromFileId(item.content.id);
      filePath && onViewFilePress?.(filePath);
    } else {
      onDownloadPressed();
    }
  }, []);

  React.useEffect(() => {
    setPercent(downloadProgress[item.content.id]);
  }, [item.content.id, useDeepCompareMemoize(downloadProgress)]);

  React.useEffect(() => {
    checkExist();
  }, []);

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        onFileItemPressed();
      }}>
      <MemoizeTypeIcon mimeType={mimeType} />

      <View style={styles.contentItem}>
        <MemoizeNameText name={item.name ?? ''} />

        <View style={styles.container_sub}>
          <MemoizeLeftIcon
            percent={percent}
            downloadVisible={downloadVisible}
          />
          <MemoizeSubText fileSizeText={fileSize ?? ''} />
        </View>
      </View>

      <MemoizeRightIcons item={item} onItemMorePress={onItemMorePress} />
    </Pressable>
  );
};

const MemoizeTypeIcon = React.memo(
  ({mimeType}: {mimeType?: string}) => {
    useRenderCounter('PSMediaCollectionFileItem.MemoizeTypeIcon');

    const IconType = React.useMemo(() => mimeTypeToIcon(mimeType), [mimeType]);

    return IconType ? <IconType width={46} height={46} /> : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeNameText = React.memo(
  ({name}: {name: string}) => {
    const {colors} = usePSDesignSystemContext();

    useRenderCounter('PSMediaCollectionFileItem.MemoizeNameText');

    return (
      <Text
        style={[styles.title, {color: colors.Primary.subText}]}
        numberOfLines={2}
        ellipsizeMode="tail">
        {name}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeSubText = React.memo(
  ({fileSizeText}: {fileSizeText: string}) => {
    const {colors} = usePSDesignSystemContext();
    return (
      <Text
        style={[styles.size, {color: colors.Neutral.n400}]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {fileSizeText}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeRightIcons = React.memo(
  ({
    item,
    onItemMorePress,
  }: {
    item: PSMediaCollectionModel;
    onItemMorePress: (media: PSMediaCollectionModel) => void;
  }) => {
    return (
      <Pressable
        style={styles.right_icon}
        onPress={() => {
          onItemMorePress(item);
        }}>
        <IcFill3DotHorizontal width={24} height={24} fill={'gray'} />
      </Pressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeDownloadButton = React.memo(
  () => {
    const {colors} = usePSDesignSystemContext();

    return (
      <IcLine15CloudArrowDown
        style={styles.icon_sub}
        width={14}
        height={14}
        fill={colors.Primary.subText}
      />
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeProgressCircle = React.memo(
  ({percent}: {percent: number}) => {
    const {colors} = usePSDesignSystemContext();

    return (
      <View style={styles.icon_sub}>
        {/* @ts-ignore */}
        <Progress.Circle
          size={15}
          thickness={1}
          color={colors.Active.normal}
          unfilledColor={colors.Neutral.n0}
          borderColor={colors.Active.normal}
          borderWidth={1}
          // textStyle={{color: colors.Branding.b600}}
          progress={percent / 100}
          animated
          showsText={false}
          // formatText={() => {
          //   return `${percent}%`;
          // }}
        />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeLeftIcon = React.memo(
  ({
    percent,
    downloadVisible,
  }: {
    percent?: number;
    downloadVisible: boolean;
  }) => {
    const onViewFileUrlPress =
      usePSMediaCollectionNavigationContext().onViewFileUrlPress;

    if (onViewFileUrlPress) {
      return null;
    }

    return percent && percent < 100 ? (
      <MemoizeProgressCircle percent={percent} />
    ) : downloadVisible ? (
      <MemoizeDownloadButton />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMediaCollectionFileItem = React.memo(
  MediaCollectionFileItem,
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  contentItem: {
    marginHorizontal: 12,
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
  },
  size: {
    flex: 1,
  },
  container_sub: {flexDirection: 'row', alignItems: 'center'},
  icon_sub: {marginRight: 5},
  right_icon: {alignSelf: 'center'},
});
