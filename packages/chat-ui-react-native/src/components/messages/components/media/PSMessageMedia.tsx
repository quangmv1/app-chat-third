import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import {PSIcPlayCircle40} from '../../../../icons';
import isEqual from 'react-fast-compare';
import {PSMessageMetadataType} from '@communi/chat-api-client-typescript';
import {usePSMessageMediaViewerContext} from '../../contexts';
import {PSMessageMediaModel} from '../../../../types';
import {generateThumbUrl} from '../../../../utils';
import {useRenderCounter, useDeepCompareMemoize} from '../../../../hooks';
import * as Progress from 'react-native-progress';
import {
  usePSDesignSystemContext,
  usePSSendMessageUploadProgressContext,
} from '../../../../context';
import {PSImage} from '../../../PSImage';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {MESSAGE_BORDER_WIDTH, usePSMessageItemContext} from '../PSMessageItem';

const GAP = MESSAGE_BORDER_WIDTH;

type MessageMediaItemProps = {
  media?: PSMessageMediaModel[];
  maxWidth: number;
  containerStyle?: StyleProp<ViewStyle>;
};

export const PSMessageMedia = React.memo(
  ({media, maxWidth, containerStyle}: MessageMediaItemProps) => {
    const {isOverlay, onMessageLongPress} = usePSMessageItemContext();

    const showImagesViewer = usePSMessageMediaViewerContext();

    const onItemPress = React.useCallback(
      (index: number) => {
        if (!isOverlay && media && media.length) {
          showImagesViewer(index, media);
        }
      },
      [isOverlay, media, showImagesViewer],
    );

    const props = {
      media: media,
      maxWidth: maxWidth,
      onItemPress: onItemPress,
      onLongPress: onMessageLongPress,
    } as MediaLayoutProps;

    const component = React.useMemo(() => {
      if (!media?.length) {
        return null;
      }
      switch (media.length) {
        case 0:
          return null;
        case 1:
          return <SingleMedia props={props} />;
        case 2:
          return <TwoMedia props={props} />;
        case 3:
          return <ThreeMedia props={props} />;
        case 4:
          return <FourMedia props={props} />;
        default:
          return <GreaterThanFour props={props} />;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [media?.length, useDeepCompareMemoize(props)]);

    useRenderCounter('MessageMediaItem', component !== undefined);

    const containerStyles = React.useMemo(() => {
      return {
        width: media?.length === 1 ? '100%' : maxWidth,
      } as ViewStyle;
    }, [maxWidth, media?.length]);

    return component ? (
      <View style={[containerStyle, containerStyles]}>{component}</View>
    ) : null;
  },
  (prev: MessageMediaItemProps, next: MessageMediaItemProps) => {
    return isEqual(prev, next);
  },
);

type MediaLayoutProps = {
  media: PSMessageMediaModel[];
  maxWidth: number;
  onItemPress: (index: number) => void;
  onLongPress: () => void;
  borderTopStartRadius?: number;
  borderTopEndRadius?: number;
  borderBottomStartRadius?: number;
  borderBottomEndRadius?: number;
};

const SingleMedia = React.memo(({props}: {props: MediaLayoutProps}) => {
  const windowSize = useWindowDimensions();
  const media = props.media[0]!;

  const {width, height} = React.useMemo(() => {
    const mediaWidth = media.width;
    const mediaHeight = media.height;
    const isSquare = mediaWidth === mediaHeight;
    const maxWidth = props.maxWidth;
    const maxHeight = windowSize.height / 2;

    let expectWidth = Math.min(mediaWidth, maxWidth);

    let expectHeight = (expectWidth * mediaHeight) / mediaWidth;

    if (expectHeight > maxHeight) {
      expectHeight = maxHeight;
      expectWidth = (expectHeight * mediaWidth) / mediaHeight;
    }

    return {
      width: isSquare ? (256).px() : (expectWidth * 2) / 3,
      height: isSquare ? (256).px() : (expectHeight * 2) / 3,
    };
  }, [props.maxWidth, media, windowSize]);

  const containerStyles = React.useMemo(() => {
    return [
      styles.singleContainer,
      {
        minWidth: width ?? (props.maxWidth * 2) / 3,
        ...props,
      },
    ];
  }, [props, width]);

  const mediaContainerStyles = React.useMemo(() => {
    return [
      styles.singleMedia,
      {
        width: width,
        height: height,
      },
    ];
  }, [height, width]);

  return (
    <View style={containerStyles}>
      <Media
        index={0}
        media={media}
        containerStyle={mediaContainerStyles}
        onLongPress={props.onLongPress}
        onItemPress={props.onItemPress}
      />
    </View>
  );
});

const TwoMedia = React.memo(({props}: {props: MediaLayoutProps}) => {
  const containerStyles = React.useMemo(() => {
    return [
      styles.multipleContainer,
      {
        ...props,
        gap: (1.5).px(),
      },
    ];
  }, [props]);

  return (
    <View style={containerStyles}>
      {props.media.map((item, index) => {
        return (
          <Media
            key={item.id}
            index={index}
            media={item}
            containerStyle={[styles.twoMedia]}
            onLongPress={props.onLongPress}
            onItemPress={props.onItemPress}
          />
        );
      })}
    </View>
  );
});

const ThreeMedia = React.memo(({props}: {props: MediaLayoutProps}) => {
  const containerStyles = React.useMemo(() => {
    return [
      styles.multipleContainer,
      {
        ...props,
        gap: GAP,
      },
    ];
  }, [props]);

  return (
    <View style={containerStyles}>
      {props.media.map((item, index) => {
        return (
          <Media
            key={item.id}
            index={index}
            media={item}
            containerStyle={styles.threeMedia}
            onLongPress={props.onLongPress}
            onItemPress={props.onItemPress}
          />
        );
      })}
    </View>
  );
});

const FourMedia = React.memo(({props}: {props: MediaLayoutProps}) => {
  const firstChildProps = React.useMemo(() => {
    return {
      ...props,
      borderBottomStartRadius: 0,
      borderBottomEndRadius: 0,
      media: props.media.slice(0, 2),
      onItemPress: (index: number) => {
        props.onItemPress(index);
      },
    };
  }, [props]);

  const secondChildProps = React.useMemo(() => {
    return {
      ...props,
      borderTopStartRadius: 0,
      borderTopEndRadius: 0,
      media: props.media.slice(2, 4),
      onItemPress: (index: number) => {
        props.onItemPress(index + 2);
      },
    };
  }, [props]);

  const containerStyles = React.useMemo(() => {
    return [
      styles.multipleContainer,
      styles.fourMedia,
      {
        ...props,
        gap: GAP,
      },
    ];
  }, [props]);

  return (
    <View style={containerStyles}>
      <TwoMedia key={0} props={firstChildProps} />
      <TwoMedia key={1} props={secondChildProps} />
    </View>
  );
});

const GreaterThanFour = React.memo(({props}: {props: MediaLayoutProps}) => {
  const result = React.useMemo(() => {
    const list: PSMessageMediaModel[][] = [];
    for (let i = 0; i < Math.ceil(props.media.length / 3); i++) {
      list.push(props.media.slice(i * 3, i * 3 + 3));
    }
    return list;
  }, [props.media]);

  const containerStyles = React.useMemo(() => {
    return [
      styles.multipleContainer,
      styles.greaterThanFourMedia,
      {
        ...props,
        gap: GAP,
      },
    ];
  }, [props]);

  return (
    <View style={containerStyles}>
      {result.map((item, index) => {
        const childProps = {
          ...props,
          borderTopStartRadius: index === 0 ? props.borderTopStartRadius : 0,
          borderTopEndRadius: index === 0 ? props.borderTopEndRadius : 0,
          borderBottomStartRadius:
            index === result.length - 1 ? props.borderBottomStartRadius : 0,
          borderBottomEndRadius:
            index === result.length - 1 ? props.borderBottomEndRadius : 0,
          media: item,
          onItemPress: (indexPressed: number) => {
            props.onItemPress(index * 3 + indexPressed);
          },
        };
        return <ThreeMedia key={index} props={childProps} />;
      })}
    </View>
  );
});

type MediaProps = {
  index: number;
  media: PSMessageMediaModel;
  containerStyle: StyleProp<ViewStyle>;
  onItemPress: (index: number) => void;
  onLongPress: () => void;
};

const Media = React.memo(
  ({index, media, containerStyle, onItemPress, onLongPress}: MediaProps) => {
    useRenderCounter('PSMessageMedia.MediaItem');
    const {colors} = usePSDesignSystemContext();

    const thumbUrl = React.useMemo(() => {
      return generateThumbUrl({
        srcUrl: media.srcUrl,
        srcThumbUrl: media.srcThumbUrl,
        width: media.width / 1.5,
        height: media.height / 1.5,
      });
    }, [media.srcUrl, media.srcThumbUrl, media.width, media.height]);

    const onPress = () => {
      onItemPress(index);
    };

    const containerStyles = React.useMemo(() => {
      return [
        containerStyle,
        styles.mediaContainer,
        {backgroundColor: colors.Neutral.n50},
      ];
    }, [colors.Neutral.n50, containerStyle]);

    return (
      <PSDebouncedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={containerStyles}>
        <MediaImage thumbUrl={thumbUrl} />
        <ProgressOverlay id={media.id} />
        <PlayIcon type={media.type} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const MediaImage = React.memo(
  ({thumbUrl}: {thumbUrl: string}) => {
    return (
      <PSImage
        style={styles.mediaImage}
        resizeMode="cover"
        source={{
          uri: thumbUrl,
        }}
      />
    );
  },
  (prev, next) => isEqual(prev, next),
);

const PlayIcon = React.memo(
  ({type}: {type: PSMessageMetadataType}) => {
    return type === PSMessageMetadataType.VIDEO ? (
      <PSIcPlayCircle40 width={40} height={40} style={styles.playIcon} />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const ProgressOverlay = React.memo(
  ({id}: {id: string}) => {
    const {uploadProgress} = usePSSendMessageUploadProgressContext();

    const percent = uploadProgress[id];

    return percent && percent < 100 ? (
      <View style={styles.progressOverlayContainer}>
        <ProgressCircle percent={percent} />
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const ProgressCircle = React.memo(
  ({percent}: {percent: number}) => {
    const {colors} = usePSDesignSystemContext();

    return (
      // @ts-ignore
      <Progress.Circle
        size={(40).px()}
        thickness={(2).px()}
        color={colors.Neutral.n0}
        unfilledColor={colors.Branding.b600}
        borderColor={colors.Neutral.n0}
        borderWidth={(1).px()}
        textStyle={{color: colors.Neutral.n0}}
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

const styles = StyleSheet.create({
  singleContainer: {
    width: '100%',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  multipleContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },
  mediaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    alignSelf: 'center',
  },
  progressOverlayContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000080',
  },
  singleMedia: {
    alignSelf: 'center',
  },
  twoMedia: {
    flex: 1,
    aspectRatio: 1,
  },
  threeMedia: {
    flex: 1,
    aspectRatio: 1,
  },
  fourMedia: {flexDirection: 'column'},
  greaterThanFourMedia: {flexDirection: 'column'},
});
