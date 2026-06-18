import React from 'react';
import {
  View,
  StyleSheet,
  // FlatList
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {generateThumbUrl} from '../../../../utils';
import {PSIcClose14, PSIcPlayCircle40} from '../../../../icons';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../hooks';
import {usePSMessageInputMediaContext} from '../../contexts';
import {
  usePSDesignSystemContext,
  usePSMediaPickerContext,
} from '../../../../context';
import {PSMessageMediaModel} from '../../../../types';
import {PSMessageMetadataType} from '@communi/chat-api-client-typescript';
import {PSImage} from '../../../PSImage';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

const MemoizePlayIcon = React.memo(
  ({type}: {type: PSMessageMetadataType}) => {
    useRenderCounter(
      'PSMessageInputMediaUploadPreview.PlayIcon',
      type === PSMessageMetadataType.VIDEO,
    );

    return type === PSMessageMetadataType.VIDEO ? (
      <PSIcPlayCircle40
        style={styles.mediaItemIconPlay}
        width={(24).px()}
        height={(24).px()}
      />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeMediaImage = React.memo(
  ({uri}: {uri: string}) => {
    const {colors} = usePSDesignSystemContext();

    useRenderCounter('PSMessageInputMediaUploadPreview.MediaImage');

    const imageStyles = React.useMemo(() => {
      return [
        styles.mediaItem,
        {
          borderColor: colors.Neutral.n400,
        },
      ];
    }, [colors.Neutral.n400]);

    return (
      <PSImage
        style={imageStyles}
        resizeMode="cover"
        source={{
          uri: generateThumbUrl({
            srcUrl: uri,
            srcThumbUrl: uri,
            width: 256,
            height: 256,
          }),
        }}
      />
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MediaUploadPreviewItem = React.memo(
  ({
    item,
    onPress,
  }: {
    item: PSMessageMediaModel;
    onPress: (uri: string) => void;
  }) => {
    useRenderCounter('MediaUploadPreviewItem');

    const onClosePressed = () => {
      onPress(item.srcUrl);
    };

    return (
      <View style={styles.mediaItemContainer}>
        <MemoizeMediaImage uri={item.srcUrl} />
        <PSDebouncedPressable
          style={styles.mediaItemCloseButton}
          onPress={onClosePressed}>
          <PSIcClose14 width={20} height={20} />
        </PSDebouncedPressable>
        <MemoizePlayIcon type={item.type} />
      </View>
    );
  },
  (prev: {item: PSMessageMediaModel}, next: {item: PSMessageMediaModel}) => {
    return isEqual(prev.item, next.item);
  },
);

export const PSMessageInputMediaUploadPreview = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const flatListRef = React.useRef<FlatList>(null);

  const {selectedMedia} = usePSMessageInputMediaContext();

  const {setSelectedMedia} = usePSMediaPickerContext();

  const deleteRef = React.useRef(false);

  const onPress = React.useCallback((uri: string) => {
    deleteRef.current = true;
    setSelectedMedia(media => media.filter(item => item.uri !== uri));
  }, []);

  const keyExtractor = React.useCallback(
    (item: PSMessageMediaModel, index: number) => item.id + index.toString(),
    [],
  );

  const renderItem = React.useCallback(
    ({item}: {item: PSMessageMediaModel}) => (
      <MediaUploadPreviewItem item={item} onPress={onPress} />
    ),
    [onPress],
  );

  const renderSeparator = React.useCallback(
    () => <View style={styles.sperator} />,
    [],
  );

  const onContentSizeChange = React.useCallback(() => {
    if (deleteRef.current) {
      deleteRef.current = false;
    } else {
      flatListRef.current?.scrollToEnd({animated: true});
    }
  }, []);

  useRenderCounter(
    'PSMessageInputMediaUploadPreview',
    selectedMedia.length > 0,
  );

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.white,
        borderBottomColor: colors.Neutral.n200,
      },
    ];
  }, [colors.Primary.linerBorder, colors.Neutral.n200]);

  return selectedMedia.length ? (
    <View style={containerStyles}>
      <FlatList
        ref={flatListRef}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={selectedMedia}
        bounces={false}
        onContentSizeChange={onContentSizeChange}
        contentContainerStyle={styles.mediaListContainer}
        ItemSeparatorComponent={renderSeparator}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </View>
  ) : null;
});

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    borderBottomWidth: (0.5).px(),
  },
  mediaListContainer: {
    paddingHorizontal: (12).px(),
    paddingVertical: (8).px(),
  },
  sperator: {width: (12).px()},
  mediaItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaItem: {
    borderWidth: (0.33).px(),
    borderRadius: (13.76).px(),
    height: (64).px(),
    width: (64).px(),
  },
  mediaItemCloseButton: {
    position: 'absolute',
    right: (-5).px(),
    top: (-5).px(),
  },
  mediaItemIconPlay: {position: 'absolute', alignSelf: 'center'},
});
