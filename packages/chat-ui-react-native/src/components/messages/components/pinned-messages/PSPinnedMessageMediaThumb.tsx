import React from 'react';
import {PSMessageMediaModel} from '../../../../types';
import {StyleSheet} from 'react-native';
import isEqual from 'react-fast-compare';
import {generateThumbUrl} from '../../../../utils';
import {useRenderCounter} from '../../../../hooks';
import {PSImage} from '../../../PSImage';

export const PSPinnedMessageMediaThumb = React.memo(
  ({media}: {media?: PSMessageMediaModel}) => {
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

    useRenderCounter('PinnedMessageMediaThumb', uri !== undefined);

    return uri ? (
      <PSImage
        source={{
          uri: uri,
        }}
        style={styles.image}
        resizeMode="contain"
      />
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  image: {
    width: (40).px(),
    height: (40).px(),
    borderRadius: (12).px(),
    marginStart: (12).px(),
    borderColor: 'silver',
    borderWidth: (0.25).px(),
  },
});
