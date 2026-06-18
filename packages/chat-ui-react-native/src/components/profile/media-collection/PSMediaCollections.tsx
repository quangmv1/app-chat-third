import {PSMessageMetadataType} from '@communi/chat-api-client-typescript';
import React, {useCallback, useEffect, useReducer, useState} from 'react';
import {ActivityIndicator, Dimensions, FlatList} from 'react-native';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  PSScreenStylesProvider,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {IcFill3DotHorizontal} from '../../../icons';
import {
  mapMediaCollectionsDtoToModel,
  PSMediaCollectionModel,
} from '../../../types';
import {formatVideoDuration, generateThumbUrl} from '../../../utils';
import {
  PSMessageMediaViewerProvider,
  usePSMessageMediaViewerContext,
} from '../../messages';
import {
  initialState,
  setApiFail,
  setApiRequest,
  setApiSuccess,
  setListEnd,
  userReducers,
} from '../../../hooks';
import {
  PSMediaCollectionFileItem,
  PSMediaCollectionLinkItem,
} from '../components';
import {
  PSMediaCollectionActionsOverlayProvider,
  PSMediaCollectionNavigationProvider,
  usePSMediaCollectionActionsOverlayContext,
  usePSMediaCollectionNavigationContext,
} from '../contexts';
import {PSMediaCollectionsStyles} from './PSMediaCollectionsStyles';
import {PSActionBar} from '../../PSActionBar';
import {PSImage} from '../../PSImage';
import {PSCommonEmptyState} from '../../PSCommonEmptyState';
import {PSTranslator} from '../../../translations';

type PSMediaCollectionsProps = {
  threadId: string;
  type: PSMessageMetadataType;
  mediaCollectionsStyles?: PSMediaCollectionsStyles;
  onBackPress?: null | (() => void);
  onViewMessage?: null | ((messageId: number) => void);
  onUrlPress?: null | ((url: string) => void);
  onViewFilePress?: null | ((filePath: string) => void);
  onViewFileUrlPress?: null | ((fileUrl: string) => void);
};

const getTitleActionBar = (
  type: PSMessageMetadataType,
  translator: PSTranslator,
) => {
  switch (type) {
    case PSMessageMetadataType.IMAGE:
      return translator('ps_images');
    case PSMessageMetadataType.VIDEO:
      return translator('ps_videos');
    case PSMessageMetadataType.FILE:
      return translator('ps_files');
    case PSMessageMetadataType.PREVIEW_LINK:
      return translator('ps_links');
    default:
      return '';
  }
};

const NUM_COLUMNS = 3;
const MARGIN_COLUMNS = (5).px();
const {width} = Dimensions.get('window');
const itemWidth = (width - MARGIN_COLUMNS * NUM_COLUMNS * 2) / NUM_COLUMNS;

export const PSMediaCollections = ({
  threadId,
  type,
  mediaCollectionsStyles,
  onBackPress,
  onViewMessage,
  onUrlPress,
  onViewFilePress,
  onViewFileUrlPress,
}: PSMediaCollectionsProps) => {
  return (
    <PSScreenStylesProvider styles={mediaCollectionsStyles}>
      <PSMediaCollectionNavigationProvider
        onBackPress={onBackPress}
        onUrlPress={onUrlPress}
        onViewMessage={onViewMessage}
        onViewFilePress={onViewFilePress}
        onViewFileUrlPress={onViewFileUrlPress}>
        <PSMediaCollectionActionsOverlayProvider>
          <PSMessageMediaViewerProvider>
            <PSMediaCollectionsScreenUI threadId={threadId} type={type} />
          </PSMessageMediaViewerProvider>
        </PSMediaCollectionActionsOverlayProvider>
      </PSMediaCollectionNavigationProvider>
    </PSScreenStylesProvider>
  );
};

export const PSMediaCollectionsScreenUI = ({
  threadId,
  type,
}: {
  threadId: string;
  type: PSMessageMetadataType;
}) => {
  const {translator} = usePSTranslationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const {onBackPress, onUrlPress} = usePSMediaCollectionNavigationContext();
  const chatApiClient = usePSChatApiClientContext();
  const [page, setPage] = useState(1);
  const [state, dispatch] = useReducer(userReducers, initialState);

  const {loading, moreLoading, data, isListEnd} = state;

  const fetchMediaCollections = async () => {
    if (!chatApiClient) {
      return;
    }
    dispatch(setApiRequest(page));

    const lastId = page === 1 ? 0 : data[page * 20 - 21].id;

    try {
      const response = await chatApiClient.threadApi.fetchMediaCollections(
        threadId,
        type,
        20,
        lastId,
      );
      const medias = mapMediaCollectionsDtoToModel(response.data ?? []);

      if (medias && medias.length > 0) {
        dispatch(setApiSuccess(medias));
        if (medias.length < 20) {
          dispatch(setListEnd());
        }
      } else {
        dispatch(setListEnd());
      }
    } catch (error) {
      dispatch(setApiFail());
    }
  };

  useEffect(() => {
    fetchMediaCollections();
  }, [page]);

  const showImagesViewer = usePSMessageMediaViewerContext();

  const {show} = usePSMediaCollectionActionsOverlayContext();

  const onItemPress = React.useCallback(
    (index: number) => {
      if (type === PSMessageMetadataType.PREVIEW_LINK) {
        const url = (data as PSMediaCollectionModel[])[index]?.content.srcUrl;
        url && onUrlPress?.(url);
      } else {
        showImagesViewer(
          index,
          (data as PSMediaCollectionModel[]).map(media => media.content),
        );
      }
    },
    [data, onUrlPress, showImagesViewer, type],
  );

  const onItemMorePress = React.useCallback(
    (media: PSMediaCollectionModel) => {
      show(media);
    },
    [show],
  );

  const renderItemMedia = useCallback(
    ({item, index}: {item: PSMediaCollectionModel; index: number}) => {
      return (
        <MediaItem
          type={type}
          item={item}
          index={index}
          onItemPress={onItemPress}
          onItemMorePress={onItemMorePress}
        />
      );
    },
    [onItemMorePress, onItemPress, type],
  );

  const renderFooter = () => (
    <View style={styles.footerText}>
      {moreLoading && <ActivityIndicator />}
      {/* {isListEnd && <Text>No more . Het rooi !!!</Text>} */}
    </View>
  );

  const fetchMoreData = () => {
    if (!isListEnd && !moreLoading) {
      setPage(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <PSActionBar
        titleText={getTitleActionBar(type, translator)}
        onBackPress={onBackPress}
      />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{flexGrow: 1}}
          data={data}
          keyExtractor={(item, index) => item.id + '' + index}
          numColumns={
            type === PSMessageMetadataType.IMAGE ||
            type === PSMessageMetadataType.VIDEO
              ? NUM_COLUMNS
              : undefined
          }
          renderItem={({item, index}) => renderItemMedia({item, index})}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <PSCommonEmptyState
              textStyle={[
                {color: colors.Primary.subText},
                typography.bodyMediumR,
              ]}
            />
          }
          keyboardDismissMode={'on-drag'}
          keyboardShouldPersistTaps={'handled'}
          onEndReachedThreshold={0.2}
          onEndReached={fetchMoreData}
        />
      )}
    </View>
  );
};

const MediaItem = React.memo(
  ({
    type,
    item,
    index,
    onItemPress,
    onItemMorePress,
  }: {
    type: PSMessageMetadataType;
    item: PSMediaCollectionModel;
    index: number;
    onItemPress: (index: number) => void;
    onItemMorePress: (media: PSMediaCollectionModel) => void;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();
    if (type === PSMessageMetadataType.PREVIEW_LINK) {
      return (
        <PSMediaCollectionLinkItem
          index={index}
          item={item}
          onItemMorePress={onItemMorePress}
          onItemPress={onItemPress}
        />
      );
    } else if (type === PSMessageMetadataType.FILE) {
      return (
        <PSMediaCollectionFileItem
          item={item}
          onItemMorePress={onItemMorePress}
        />
      );
    } else {
      return (
        <Pressable
          style={{
            margin: MARGIN_COLUMNS,
            width: itemWidth,
            height: itemWidth,
          }}
          onPress={() => {
            onItemPress(index);
          }}>
          <PSImage
            source={{
              uri: generateThumbUrl({
                srcUrl: item.content.srcUrl,
                srcThumbUrl: item.content.srcThumbUrl,
                width: 256,
                height: 256,
              }),
            }}
            style={styles.image}
            resizeMode="cover"
          />
          {type === PSMessageMetadataType.VIDEO && (
            <View style={styles.duration}>
              <Text style={[{color: colors.Neutral.n0}, typography.bodySmallR]}>
                {formatVideoDuration(item.duration)}
              </Text>
            </View>
          )}
          <Pressable
            style={[styles.more, {backgroundColor: colors.Primary.background}]}
            onPress={() => {
              onItemMorePress(item);
            }}>
            <IcFill3DotHorizontal
              width={(30).px()}
              height={(30).px()}
              fill={colors.Neutral.n400}
            />
          </Pressable>
        </Pressable>
      );
    }
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  emptyText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 3,
    borderRadius: 25,
  },
  more: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: 'rgba(52, 52, 52, 0.3)',
    padding: 1,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: (8).px(),
  },
});
