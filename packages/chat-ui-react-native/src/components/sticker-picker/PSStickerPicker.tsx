import React, {PropsWithChildren} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import {FlatList} from 'react-native-gesture-handler';
import isEqual from 'react-fast-compare';
import {Dimensions, StyleSheet, useWindowDimensions} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSStickerPickerActionContext,
  usePSStickerPickerContext,
  usePSStickerPickerVisibleContext,
  useQuery,
  useRealm,
} from '../../context';

import {PSStickerList, PSStickerPackageItem} from './components';
import {psLogger} from '../../utils';
import {PSStickerEntity, PSStickerPackageEntity} from '../../types';
import {
  mapStickerPackageEntityToModel,
  PSStickerPackageModel,
} from '../../types/sticker/model/PSStickerPackageModel';

const {width} = Dimensions.get('window');
export const MARGIN_COLUMNS = (5).px();
export const NUMBER_OF_STICKER_COLUMNS = 4;
export const itemWidth =
  (width - MARGIN_COLUMNS * NUMBER_OF_STICKER_COLUMNS * 2) /
  NUMBER_OF_STICKER_COLUMNS;
export const RECENT_PACKAGE_ID = '0';

export const PSStickerPicker = React.memo(
  ({snapPoints}: {snapPoints: number[]}) => {
    const {colors} = usePSDesignSystemContext();

    const windowSize = useWindowDimensions();

    const realm = useRealm();

    const chatApiClient = usePSChatApiClientContext();

    const {bottomSheetRef} = usePSStickerPickerContext();

    const {closeStickerPicker} = usePSStickerPickerActionContext();

    const {isStickerPickerShown} = usePSStickerPickerVisibleContext();

    const [stickerPackages, setStickerPackages] = React.useState<
      PSStickerPackageModel[]
    >([]);

    // const [selectedPackageId, setSelectedPackageId] =
    //   React.useState(RECENT_PACKAGE_ID);
    const setSelectedPackageId = usePSStickerSetSelectedPackageIdContext();

    const cachedStickerPackages = useQuery(
      PSStickerPackageEntity,
      stickerPackagesQuery => {
        return stickerPackagesQuery;
      },
      [],
    );

    const fetchPackages = React.useCallback(async () => {
      if (chatApiClient) {
        try {
          const response = await chatApiClient.stickerApi.fetchPackages();

          const cachedPackages =
            PSStickerPackageEntity.getAllStickerPackages(realm);

          if (response.data && response.data.length > 0) {
            const cachedPackageIds = cachedPackages.map(item => item.id);
            const remotePackageIds = response.data.map(item => item.id) ?? [];

            const deletePackageIds = cachedPackageIds.filter(
              item => !remotePackageIds.includes(item),
            );
            const addPackageIds = remotePackageIds.filter(
              item => !cachedPackageIds.includes(item),
            );

            if (deletePackageIds.length > 0) {
              PSStickerPackageEntity.deletePackages(realm, deletePackageIds);
            }

            if (addPackageIds.length > 0) {
              const addPackagesRemote = response.data.filter(item =>
                addPackageIds.includes(item.id),
              );
              realm.write(() => {
                addPackagesRemote.forEach(item => {
                  PSStickerPackageEntity.createOrUpdate(
                    realm,
                    PSStickerPackageEntity.mapFromDto(item)!,
                  );
                });
              });
            }
          } else {
            realm.write(() => {
              realm.delete(realm.objects(PSStickerEntity.schema.name));
              realm.delete(realm.objects(PSStickerPackageEntity.schema.name));
            });
          }
        } catch (error) {
          psLogger.error('PSStickerPicker: fetchPackages', error);
        }
      }
    }, [chatApiClient, realm]);

    React.useEffect(() => {
      if (isStickerPickerShown && chatApiClient) {
        fetchPackages().finally(() => {
          const result = PSStickerEntity.getFirstByPickedAt(realm);
          if (result) {
            setSelectedPackageId(RECENT_PACKAGE_ID);
          } else {
            const cachedPackages =
              PSStickerPackageEntity.getAllStickerPackages(realm);
            setSelectedPackageId(cachedPackages[0]?.id ?? RECENT_PACKAGE_ID);
          }
        });
      } else {
        setSelectedPackageId(RECENT_PACKAGE_ID);
      }

      return () => {
        setSelectedPackageId(RECENT_PACKAGE_ID);
      };
    }, [realm, chatApiClient, fetchPackages, isStickerPickerShown]);

    React.useEffect(() => {
      if (isStickerPickerShown) {
        const stickerPackagesData: PSStickerPackageModel[] = [];
        const result = PSStickerEntity.getFirstByPickedAt(realm);
        if (result) {
          stickerPackagesData.push({
            id: RECENT_PACKAGE_ID,
            name: '',
            iconFileUrl: '',
          } as PSStickerPackageModel);
        }
        stickerPackagesData.push(
          ...cachedStickerPackages.map(item =>
            mapStickerPackageEntityToModel(item),
          ),
        );
        setStickerPackages(stickerPackagesData);
      } else {
        setStickerPackages([]);
      }
    }, [realm, isStickerPickerShown, cachedStickerPackages]);

    // const onPackageChange = React.useCallback((packageId: string) => {
    //   setSelectedPackageId(packageId);
    // }, []);

    const keyPackageExtractor = React.useCallback(
      (item: PSStickerPackageModel) => item.id,
      [],
    );

    const renderPackageItem = React.useCallback(
      ({item}: {item: PSStickerPackageModel}) => (
        <PSStickerPackageItem
          key={item.id}
          item={item}
          // selectedPackageId={selectedPackageId}
          colors={colors}
          // onChange={onPackageChange}
        />
      ),
      [colors],
    );

    const renderCustomHandle = React.useCallback(() => {
      return (
        <FlatList
          style={{backgroundColor: colors.Neutral.n50}}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={stickerPackages}
          bounces={false}
          contentContainerStyle={styles.handlePackagesContainer}
          keyExtractor={keyPackageExtractor}
          renderItem={renderPackageItem}
        />
      );
    }, [
      colors.Neutral.n50,
      keyPackageExtractor,
      renderPackageItem,
      stickerPackages,
    ]);

    return (
      <PSStickerSelectedPackageIdProvider>
        <BottomSheet
          backgroundStyle={{backgroundColor: colors.Primary.background}}
          ref={bottomSheetRef}
          containerHeight={windowSize.height}
          enablePanDownToClose={true}
          handleHeight={20}
          handleComponent={renderCustomHandle}
          index={-1}
          onClose={closeStickerPicker}
          snapPoints={snapPoints}>
          <PSStickerList />
        </BottomSheet>
      </PSStickerSelectedPackageIdProvider>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  handlePackagesContainer: {
    height: (36).px(),
    minWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: (10).px(),
    paddingTop: (6).px(),
    paddingBottom: (6).px(),
    borderTopStartRadius: (22).px(),
    borderTopEndRadius: (22).px(),
  },
});

const PSStickerSelectedPackageIdContext =
  React.createContext(RECENT_PACKAGE_ID);

const PSStickerSetSelectedPackageIdContext = React.createContext<
  React.Dispatch<React.SetStateAction<string>>
>(() => undefined);

export const PSStickerSelectedPackageIdProvider = ({
  children,
}: PropsWithChildren) => {
  const [selectedPackageId, setSelectedPackageId] =
    React.useState(RECENT_PACKAGE_ID);

  return (
    <PSStickerSelectedPackageIdContext.Provider value={selectedPackageId}>
      <PSStickerSetSelectedPackageIdContext.Provider
        value={setSelectedPackageId}>
        {children}
      </PSStickerSetSelectedPackageIdContext.Provider>
    </PSStickerSelectedPackageIdContext.Provider>
  );
};

export const usePSStickerSelectedPackageIdContext = () =>
  React.useContext(PSStickerSelectedPackageIdContext);

export const usePSStickerSetSelectedPackageIdContext = () =>
  React.useContext(PSStickerSetSelectedPackageIdContext);
