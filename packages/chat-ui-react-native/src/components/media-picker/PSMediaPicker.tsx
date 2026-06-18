import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
} from '@gorhom/bottom-sheet';
import { lookup } from 'mime-types';
import React from 'react';
import isEqual from 'react-fast-compare';
import {
  DeviceEventEmitter,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSMediaPickerActionContext,
  usePSMediaPickerContext,
  usePSMediaPickerVisibleContext,
  usePSSaveAssetsPickerContext,
  usePSTranslationContext,
} from '../../context';
import {
  getPhotos,
  oniOS14GalleryLibrarySelectionChange,
  psLogger,
} from '../../utils';
import { PSDebouncedPressable } from '../PSDebouncedPressable';
import {
  PSAttachmentPickerIOSSelectMorePhotos,
  PSMediaPickerError,
  PSMediaPickerItem,
} from './components';
import { MediaPickerAsset } from './types';
// import {PSHeaderMediaPicker} from './components/PSHeaderMediaPicker';
import { PSIcDown } from '../../icons';
import { PSEmptyMediaPicker } from './components/PSEmptyMediaPicker';

const NUMBER_OF_MEDIA_COLUMNS = 3;

const GAP = (5).px();

const getFileType = (uri: string) => {
  const name = uri.substring(uri.lastIndexOf('/') + 1);
  const contentType = lookup(name) || 'image/';
  return contentType.startsWith('image/') ? 'image' : 'video';
};

export const PSMediaPicker = React.memo(
  ({ errorHeight }: { errorHeight: number }) => {
    const { colors } = usePSDesignSystemContext();

    const windowSize = useWindowDimensions();

    const [state, setState] = React.useState(-1);

    const { isMediaPickerShown } = usePSMediaPickerVisibleContext();

    const photoError = usePSMediaPickerContext().photoError;

    const bottomSheetRef = usePSMediaPickerContext().bottomSheetRef;

    const bottomSheetModalRef = usePSMediaPickerContext().bottomSheetModalRef;

    const initSnapPoints = usePSMediaPickerContext().initSnapPoints;

    const { closeMediaPicker } = usePSMediaPickerActionContext();

    React.useEffect(() => {
      if (isMediaPickerShown) {
      } else {
        setState(-1);
      }
    }, [isMediaPickerShown]);

    const onChange = React.useCallback((index: number) => {
      if (index === 1) {
        bottomSheetModalRef.current?.expand({ duration: 250 });
      }
      if (index === 0) {
        bottomSheetModalRef.current?.collapse({ duration: 250 });
      }
      setState(index);
    }, []);

    const renderCustomHandle = React.useCallback(() => {
      return photoError ? null : <Handle index={state} />;
    }, [photoError, state]);

    return (
      <BottomSheet
        backgroundStyle={{ backgroundColor: colors.Primary.background }}
        ref={bottomSheetRef}
        containerHeight={windowSize.height}
        enablePanDownToClose={true}
        handleHeight={(20).px()}
        handleComponent={renderCustomHandle}
        index={isMediaPickerShown ? 0 : -1}
        onChange={onChange}
        onClose={closeMediaPicker}
        snapPoints={
          photoError ? [initSnapPoints[0]!, initSnapPoints[0]!] : initSnapPoints
        }>
        {photoError ? (
          <PSMediaPickerError height={errorHeight} />
        ) : (
          <List state={state} />
        )}
      </BottomSheet>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const HandleTextButton = React.memo(
  ({
    text,
    textStyle,
    onPress,
  }: {
    text: string;
    textStyle: StyleProp<TextStyle>;
    onPress?: () => void;
  }) => {
    const { closeMediaPicker } = usePSMediaPickerActionContext();
    return (
      <PSDebouncedPressable
        onPress={typeof onPress === 'function' ? onPress : closeMediaPicker}
        style={styles.handleButtonContainer}>
        <Text style={textStyle}>{text}</Text>
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const Handle = React.memo(
  ({ index }: { index: number }) => {
    const { typography, colors } = usePSDesignSystemContext();
    const { translator } = usePSTranslationContext();
    const groupName = usePSMediaPickerContext().groupName;
    const setSelectedMedia = usePSMediaPickerContext().setSelectedMedia;

    const handleSelectAlbums = React.useCallback(() => {
      DeviceEventEmitter.emit('PS_SELECT_OPEN_ALBUMS');
    }, []);

    return (
      <View style={[styles.handleContainer, { backgroundColor: colors.Primary.background }]}>
        {index === 1 ? (
          <View>
            <HandleTextButton
              text={translator('ps_un_select')}
              textStyle={[
                styles.handleLeftText,
                typography.bodyMediumS,
                { color: colors.Branding.b400 },
              ]}
              onPress={() => setSelectedMedia([])}
            />
          </View>
        ) : null}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View
            style={[
              styles.handle,
              {
                backgroundColor: colors.Primary.subText,
              },
            ]}
          />
          {index === 1 ? (
            <PSDebouncedPressable
              style={styles.row}
              onPress={handleSelectAlbums}>
              <Text
                style={[
                  {
                    ...typography.headingMediumS,
                    color: colors.Primary.subText,
                    marginRight: (8).px(),
                  },
                ]}>
                {groupName ?? 'Albums'}
              </Text>
              <PSIcDown fill={colors.Neutral.n1000} />
            </PSDebouncedPressable>
          ) : null}
        </View>
        {index === 1 ? (
          <View>
            <HandleTextButton
              text={translator('ps_done')}
              textStyle={[
                styles.handleRightText,
                typography.bodyMediumS,
                { color: colors.Branding.b400 },
              ]}
            />
          </View>
        ) : null}
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const List = React.memo(
  ({ state }: { state: number }) => {
    const { colors } = usePSDesignSystemContext();
    const windowSize = useWindowDimensions();

    const { isMediaPickerShown } = usePSMediaPickerVisibleContext();

    const groupName = usePSMediaPickerContext().groupName;

    const photoError = usePSMediaPickerContext().photoError;

    const { setPhotoError } = usePSMediaPickerContext();

    const [iOSLimited, setIosLimited] = React.useState(false);

    const endCursorRef = React.useRef<string>();
    const hasNextPageRef = React.useRef(true);
    const loadingPhotosRef = React.useRef(false);
    const { assets, setAssets } = usePSSaveAssetsPickerContext();
    // const [assets, setAssets] = React.useState<MediaPickerAsset[]>([]);
    const attemptedToLoadPhotosOnOpenRef = React.useRef(false);
    const refBottomSheetFlatList =
      React.useRef<BottomSheetFlatListMethods>(null);

    const getMorePhotos = React.useCallback(async () => {
      // chỗ này đang ktra assets.length > 0 để suy ra granted quyền, cần tối ưu là ktra quyền thực sự chỗ này
      // android thi check dc,ios co the dung react-native-permissions

      if (
        !loadingPhotosRef.current &&
        hasNextPageRef.current &&
        (state > -1 || assets.length > 0)
      ) {
        setPhotoError(false);
        loadingPhotosRef.current = true;
        const endCursor = endCursorRef.current;
        try {
          const results = await getPhotos({
            after: endCursor,
            first: 40,
            groupName,
            groupTypes: groupName ? 'SmartAlbum' : 'All',
          });
          endCursorRef.current = results.endCursor;
          const newAssets = results.assets
            .filter(item => item.filename)
            .map(item => {
              return {
                id: item.uri.hashCode().toString(), // tránh bị re-render
                uri: item.uri,
                name: item.filename!,
                size: item.fileSize,
                width: item.width,
                height: item.height,
                type: getFileType(item.filename!),
                duration: item.playableDuration,
              } as MediaPickerAsset;
            });

          setAssets(prevAssets =>
            endCursor ? [...prevAssets, ...newAssets] : newAssets,
          );
          setIosLimited(results.iOSLimited);
          hasNextPageRef.current = !!results.hasNextPage;

          psLogger.error(
            `endCursor = ${results.endCursor}, hasNextPage = ${results.hasNextPage}`,
          );
        } catch (error) {
          psLogger.error('PSMediaPicker: getMorePhotos ', error);
          setPhotoError(true);
        }
        loadingPhotosRef.current = false;
      }
    }, [state, assets, groupName]);

    // we need to use ref here to avoid running effect when getMorePhotos changes
    const getMorePhotosRef = React.useRef(getMorePhotos);
    getMorePhotosRef.current = getMorePhotos;

    React.useEffect(() => {
      endCursorRef.current = undefined;
      loadingPhotosRef.current = false;
      hasNextPageRef.current = true;
      refBottomSheetFlatList.current?.scrollToOffset?.({
        offset: 0,
        animated: false,
      });
      getMorePhotos();
    }, [groupName]);

    React.useEffect(() => {
      if (state < 0) return;
      // ios 14 library selection change event is fired when user reselects the images that are permitted to be readable by the app
      const { unsubscribe } = oniOS14GalleryLibrarySelectionChange(() => {
        psLogger.error(`oniOS14GalleryLibrarySelectionChange`);
        // we reset the cursor and has next page to true to facilitate fetching of the first page of photos again
        hasNextPageRef.current = true;
        endCursorRef.current = undefined;
        loadingPhotosRef.current = false;
        // fetch the first page of photos again
        getMorePhotosRef.current();
      });
      return unsubscribe;
    }, [state]);

    React.useEffect(() => {
      if (isMediaPickerShown) {
        if (!attemptedToLoadPhotosOnOpenRef.current && state > -1) {
          // we do this only once on open for avoiding to request permissions in rationale dialog again and again on Android
          attemptedToLoadPhotosOnOpenRef.current = true;
          getMorePhotosRef.current();
        }
      } else {
        endCursorRef.current = undefined;
        hasNextPageRef.current = true;
        attemptedToLoadPhotosOnOpenRef.current = false;
        setPhotoError(false);
      }
    }, [isMediaPickerShown, state]);

    const keyExtractor = React.useCallback(
      (item: MediaPickerAsset) => item.id,
      [],
    );

    const renderItem = React.useCallback(
      ({ item }: { item: MediaPickerAsset }) => {
        const size = (windowSize.width - 5 * 2) / NUMBER_OF_MEDIA_COLUMNS;
        return <PSMediaPickerItem item={item} size={size} />;
      },
      [windowSize.width],
    );

    const renderEmpty = React.useCallback(() => {
      return null;
      // return <PSEmptyMediaPicker />;
    }, []);

    return (
      <>
        {iOSLimited && <PSAttachmentPickerIOSSelectMorePhotos />}
        <BottomSheetFlatList
          ref={refBottomSheetFlatList}
          columnWrapperStyle={[
            styles.listColumnWrapperStyle,
            { backgroundColor: colors.Primary.background },
          ]}
          contentContainerStyle={[
            styles.listContentContainerStyle,
            { backgroundColor: colors.Primary.background },
          ]}
          data={assets}
          keyExtractor={keyExtractor}
          numColumns={NUMBER_OF_MEDIA_COLUMNS}
          onEndReached={photoError ? undefined : getMorePhotos}
          renderItem={renderItem}
          // ListHeaderComponent={assets?.length ? <PSHeaderMediaPicker /> : null}
          ListEmptyComponent={renderEmpty}
        // stickyHeaderIndices={[0]}
        />
      </>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  listColumnWrapperStyle: {
    gap: GAP,
    marginHorizontal: 8,
  },
  listContentContainerStyle: {
    flexGrow: 1,
    gap: GAP,
  },
  handleContainer: {
    padding: (12).px(),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: (48).px(),
    height: (4).px(),
    borderRadius: (12).px(),
  },
  handleButtonContainer: { flex: 1 },
  handleLeftText: { textAlign: 'left' },
  handleRightText: { textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: (4).px(),
  },
});
