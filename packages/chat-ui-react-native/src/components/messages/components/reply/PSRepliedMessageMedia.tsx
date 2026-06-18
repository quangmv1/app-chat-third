import React from 'react';
import {PSMessageMediaModel} from '../../../../types';
import {useRenderCounter} from '../../../../hooks';
import {ImageStyle, StyleProp, StyleSheet} from 'react-native';
import isEqual from 'react-fast-compare';
import {generateThumbUrl} from '../../../../utils';
import {PSImage} from '../../../PSImage';
import {usePSDesignSystemContext} from '../../../../context';

export const PSRepliedMessageMedia = React.memo(
  ({
    media,
    isDeleted,
    imageStyle,
  }: {
    media?: PSMessageMediaModel;
    isDeleted: boolean;
    imageStyle?: StyleProp<ImageStyle>;
  }) => {
    useRenderCounter('RepliedMessageMedia', !isDeleted && media !== undefined);

    const {colors} = usePSDesignSystemContext();

    const imageStyles = React.useMemo(() => {
      return [imageStyle, styles.imagePreview, {borderColor: colors.Primary.subText}];
    }, [colors.Primary.subText, imageStyle]);

    return !isDeleted && media ? (
      <PSImage
        style={imageStyles}
        source={{
          uri: generateThumbUrl({
            srcUrl: media.srcUrl,
            srcThumbUrl: media.srcThumbUrl,
            width: 256,
            height: 256,
          }),
        }}
        resizeMode="cover"
      />
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  imagePreview: {
    borderWidth: (0.25).px(),
    borderRadius: (8).px(),
    width: (48).px(),
    height: (48).px(),
  },
});
