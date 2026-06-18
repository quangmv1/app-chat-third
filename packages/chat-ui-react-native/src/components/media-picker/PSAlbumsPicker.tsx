import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import React, {useEffect} from 'react';
import {DeviceEventEmitter, View} from 'react-native';
import {usePSDesignSystemContext, usePSMediaPickerContext} from '../../context';
import {Album, getAlbums, psLogger} from '../../utils';
import {PSAlbumsPickerItem} from './components/PSAlbumsPickerItem';
import {PSEmptyMediaPicker} from './components/PSEmptyMediaPicker';

export const PSAlbumsPicker = () => {
  const initSnapPoints = usePSMediaPickerContext().initSnapPoints ?? [];
  const [albums, setAlbums] = React.useState<Album[]>([]);

  const {colors} = usePSDesignSystemContext();

  // ref
  const bottomSheetModalRef = usePSMediaPickerContext().bottomSheetModalRef;

  const bottomSheetRef = usePSMediaPickerContext().bottomSheetRef;

  // callbacks
  const getDataAlbums = React.useCallback(async () => {
    try {
      const albums = await getAlbums({});
      setAlbums(albums.Albums);
    } catch (error) {
      psLogger.error('PSMediaPicker: getDataAlbums ', error);
    }
  }, []);

  const handlePresentModalPress = React.useCallback(() => {
    getDataAlbums();
    bottomSheetModalRef.current?.present();
  }, []);

  const hideModalAlbums = React.useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const onChange = React.useCallback((index: number) => {
    if (index === 1) {
      bottomSheetRef.current?.expand({duration: 350});
    }
    if (index === 0) {
      bottomSheetRef.current?.collapse({duration: 350});
    }
  }, []);

  const handleComponent = React.useCallback(() => {
    return (
      <View
        style={[
          {
            backgroundColor: colors.Primary.subText,
            width: (48).px(),
            height: (4).px(),
            marginTop: (8).px(),
            borderRadius: (12).px(),
            alignSelf: 'center',
          },
        ]}
      />
    );
  }, []);

  const renderItem = React.useCallback(
    (props: any) => {
      return (
        <PSAlbumsPickerItem {...props} hideModalAlbums={hideModalAlbums} />
      );
    },
    [hideModalAlbums],
  );

  React.useEffect(() => {
    DeviceEventEmitter.addListener(
      'PS_SELECT_OPEN_ALBUMS',
      handlePresentModalPress,
    );
  }, [handlePresentModalPress]);

  // renders
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={[initSnapPoints[1]!, initSnapPoints[1]!]}
        handleComponent={handleComponent}
        backgroundStyle={{backgroundColor: colors.Primary.background}}
        onChange={onChange}>
        <BottomSheetFlatList
          contentContainerStyle={{paddingHorizontal: (8).px()}}
          data={albums}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<PSEmptyMediaPicker />}
        />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};
