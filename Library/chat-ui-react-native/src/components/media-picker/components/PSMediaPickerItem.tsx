import React, {PropsWithChildren} from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  usePSConfigSettingsContext,
  usePSDesignSystemContext,
  usePSMediaPickerContext,
  usePSTranslationContext,
} from '../../../context';
import {formatFileSizeToText, formatVideoDuration} from '../../../utils';
import isEqual from 'react-fast-compare';
import {MediaPickerAsset} from '../types';
import {PSFlashMessage} from '../../flash-message';

export const PSMediaPickerItem = React.memo(
  ({item, size}: {item: MediaPickerAsset; size: number}) => {
    const {maxNumberOfFiles, selectedMedia, setSelectedMedia} =
      usePSMediaPickerContext();

    const maxUploadSize = usePSConfigSettingsContext().maxUploadSize;

    const {translator} = usePSTranslationContext();

    const selectedIndex = React.useMemo(
      () => selectedMedia.findIndex(media => media.uri === item.uri),
      [item, selectedMedia],
    );

    const durationLabel = React.useMemo(() => {
      if (item.type === 'video') {
        return formatVideoDuration(item.duration);
      } else {
        return undefined;
      }
    }, [item]);

    const onPress = React.useCallback(() => {
      if (selectedIndex > -1) {
        setSelectedMedia(files => files.filter(file => file.uri !== item.uri));
      } else {
        setSelectedMedia(files => {
          if (selectedMedia.length >= maxNumberOfFiles) {
            PSFlashMessage.show({
              text1: translator(
                'ps_maximum_pick_image',
                // @ts-ignore
                {
                  num: maxNumberOfFiles,
                },
              ),
              position: 'bottom',
              type: 'error',
            });
            return files;
          }
          if (maxUploadSize && item.size > maxUploadSize) {
            PSFlashMessage.show({
              text1: translator(
                'ps_max_upload_size',
                // @ts-ignore
                {
                  size: formatFileSizeToText(maxUploadSize),
                },
              ),
              position: 'bottom',
              type: 'error',
            });
            return files;
          }
          return [...files, item];
        });
      }
    }, [
      item,
      selectedIndex,
      selectedMedia.length,
      maxNumberOfFiles,
      maxUploadSize,
    ]);

    return (
      <Pressable
        onPress={onPress}
        style={{
          width: size - 5,
          height: size - 5,
        }}>
        <MemoizeImageBackground uri={item.uri} selectedIndex={selectedIndex}>
          <MemoizePositionText selectedIndex={selectedIndex} />
          <MemoizeDurationText durationLabel={durationLabel} />
        </MemoizeImageBackground>
      </Pressable>
    );
  },
  (prev: {item: MediaPickerAsset}, next: {item: MediaPickerAsset}) => {
    return isEqual(prev.item, next.item);
  },
);

const MemoizeImageBackground = React.memo(
  ({
    children,
    uri,
    selectedIndex,
  }: PropsWithChildren<{
    uri: string;
    selectedIndex: number;
  }>) => {
    const {colors} = usePSDesignSystemContext();

    return (
      <ImageBackground
        source={{uri: uri}}
        resizeMode="cover"
        borderRadius={5}
        progressiveRenderingEnabled
        imageStyle={{
          backgroundColor:
            selectedIndex > -1 ? `${colors.Neutral.n0}4f` : undefined,
          opacity: selectedIndex > -1 ? 0.7 : 1,
        }}
        style={[
          styles.image,
          {
            borderWidth: selectedIndex > -1 ? (1.5).px() : undefined,
            borderColor: selectedIndex > -1 ? colors.Branding.b600 : undefined,
          },
        ]}>
        {children}
      </ImageBackground>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizePositionText = React.memo(
  ({selectedIndex}: {selectedIndex: number}) => {
    const {typography, colors} = usePSDesignSystemContext();

    return selectedIndex > -1 ? (
      <View style={[styles.check, {backgroundColor: colors.Branding.b600}]}>
        <Text
          style={[
            typography.bodyMediumR,
            {
              color: colors.Neutral.n0,
            },
          ]}>
          {(selectedIndex + 1).toString()}
        </Text>
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeDurationText = React.memo(
  ({durationLabel}: {durationLabel?: string}) => {
    const {typography, colors} = usePSDesignSystemContext();

    return durationLabel ? (
      <View style={styles.videoView}>
        <Text
          style={[
            styles.durationText,
            typography.bodyMediumR,
            {color: colors.Neutral.n0},
          ]}>
          {durationLabel}
        </Text>
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: (8).px(),
  },
  check: {
    width: (24).px(),
    height: (24).px(),
    marginRight: (4).px(),
    marginTop: (4).px(),
    borderRadius: (12).px(),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  videoView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    right: (4).px(),
    bottom: (4).px(),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: (20).px(),
    paddingHorizontal: (6).px(),
  },
  durationText: {},
});
