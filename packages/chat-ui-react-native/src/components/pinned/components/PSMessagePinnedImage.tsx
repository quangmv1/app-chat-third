import React from 'react';
import {StyleSheet, View} from 'react-native';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../hooks';
import {PSImage} from '../../../components';
import {generateThumbUrl} from '../../../utils';
import {PSMessageFileModel, PSMessageMediaModel} from '../../../types';
import {IcLine15Pin} from '../../../icons';
import {usePSDesignSystemContext} from '../../../context';
import {lookup} from 'mime-types';
import {mimeTypeToIcon} from '../../../utils';

const PinnedMessageImage = ({
  file,
  media,
  isDeleted,
}: {
  file?: PSMessageFileModel;
  media?: PSMessageMediaModel;
  isDeleted: boolean;
}) => {
  const {colors} = usePSDesignSystemContext();

  const uri = React.useMemo(() => {
    if (!media?.srcUrl) {
      return undefined;
    }
    return generateThumbUrl({
      srcUrl: media.srcUrl,
      srcThumbUrl: media.srcThumbUrl,
      width: 256,
      height: 256,
    });
  }, [media?.srcUrl, media?.srcThumbUrl]);

  const mimeType = React.useMemo(() => {
    if (!file?.name) {
      return undefined;
    }
    const result = lookup(file.name);
    if (typeof result === 'string') {
      return result;
    } else {
      return undefined;
    }
  }, [file?.name]);

  const IconType = React.useMemo(() => mimeTypeToIcon(mimeType), [mimeType]);

  useRenderCounter('PinnedMessageImage', !isDeleted && uri !== undefined);

  return !isDeleted && uri ? (
    <PSImage
      source={{
        uri: uri,
      }}
      style={styles.image}
      resizeMode="contain"
    />
  ) : !isDeleted && file && IconType ? (
    <IconType width={(36).px()} height={(36).px()} style={styles.image} />
  ) : (
    <View
      style={[styles.image, {alignItems: 'center', justifyContent: 'center'}]}>
      <IcLine15Pin width={24} height={24} fill={colors.Primary.subText} />
    </View>
  );
};

export const PSMessagePinnedImage = React.memo(
  PinnedMessageImage,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  image: {
    width: 36,
    height: 36,
    borderRadius: 4,
    marginStart: 8,
    borderColor: 'silver',
    borderWidth: 0.25,
  },
});
