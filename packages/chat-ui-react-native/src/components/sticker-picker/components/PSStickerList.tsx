import React from 'react';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {PSStickerItem} from './PSStickerItem';
import {
  NUMBER_OF_STICKER_COLUMNS,
  RECENT_PACKAGE_ID,
  usePSStickerSelectedPackageIdContext,
} from '../PSStickerPicker';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSStickerPickerVisibleContext,
  usePSTranslationContext,
  useQuery,
  useRealm,
} from '../../../context';
import {
  mapStickerEntityToModel,
  PSStickerEntity,
  PSStickerModel,
  PSStickerPackageEntity,
} from '../../../types';
import {psLogger} from '../../../utils';
import {PSStickerFileType} from '@communi/chat-api-client-typescript';

export const PSStickerList = React.memo(
  () => {
    const {colors} = usePSDesignSystemContext();

    const realm = useRealm();

    const {translator} = usePSTranslationContext();

    const chatApiClient = usePSChatApiClientContext();

    const {isStickerPickerShown} = usePSStickerPickerVisibleContext();

    const [stickerPackageName, setStickerPackageName] = React.useState('');

    const [stickersData, setStickersData] = React.useState<PSStickerModel[]>(
      [],
    );

    const selectedPackageId = usePSStickerSelectedPackageIdContext();

    const cachedStickerPackages = useQuery(
      PSStickerPackageEntity,
      stickerPackagesQuery => {
        return stickerPackagesQuery;
      },
      [],
    );

    const stickerPackage = React.useMemo(() => {
      try {
        if (!selectedPackageId || selectedPackageId === RECENT_PACKAGE_ID) {
          return undefined;
        }
        let query = PSStickerPackageEntity.filteredById(selectedPackageId);
        return cachedStickerPackages.filtered(query)[0];
      } catch (error) {
        psLogger.error('PSStickerList: stickerPackage', error);
        return undefined;
      }
    }, [selectedPackageId, cachedStickerPackages]);

    const fetchPackageById = React.useCallback(async () => {
      if (chatApiClient && selectedPackageId) {
        try {
          const response =
            await chatApiClient.stickerApi.fetchPackageById(selectedPackageId);
          const stickers = response.data?.stickers
            ?.filter(
              sticker =>
                sticker !== undefined &&
                (Object.values(PSStickerFileType) as string[]).includes(
                  sticker.file_type,
                ),
            )
            .map(sticker => PSStickerEntity.mapFromDto(sticker)!);
          const cachedStickerPackage = PSStickerPackageEntity.getFirstById(
            realm,
            selectedPackageId,
          );
          realm.write(() => {
            if (cachedStickerPackage && stickers) {
              cachedStickerPackage.updateStickers(stickers);
            }
          });
        } catch (error) {
          psLogger.error('PSStickerList: fetchPackageById', error);
        }
      }
    }, [chatApiClient, realm, selectedPackageId]);

    React.useEffect(() => {
      if (
        isStickerPickerShown &&
        chatApiClient &&
        selectedPackageId &&
        selectedPackageId !== RECENT_PACKAGE_ID &&
        (stickerPackage?.stickers === undefined ||
          stickerPackage?.stickers?.length === 0)
      ) {
        fetchPackageById();
      }
    }, [
      chatApiClient,
      isStickerPickerShown,
      stickerPackage,
      fetchPackageById,
      selectedPackageId,
    ]);

    React.useEffect(() => {
      if (isStickerPickerShown) {
        if (!stickerPackage && selectedPackageId === RECENT_PACKAGE_ID) {
          const result = PSStickerEntity.getAllStickerPicked(realm);
          setStickersData(
            result
              .sorted(PSStickerEntity.sorted)
              .slice(0, 20)
              .map(item => mapStickerEntityToModel(item)) ?? [],
          );
          setStickerPackageName(translator('ps_recently'));
        } else {
          setStickersData(
            stickerPackage?.stickers?.map(item =>
              mapStickerEntityToModel(item),
            ) ?? [],
          );
          setStickerPackageName(stickerPackage?.name ?? '');
        }
      } else {
        setStickersData([]);
        setStickerPackageName('');
      }
    }, [
      stickerPackage,
      isStickerPickerShown,
      translator,
      realm,
      selectedPackageId,
    ]);

    const keyStickerExtractor = React.useCallback(
      (item: PSStickerModel) => item.id,
      [],
    );

    const renderStickerItem = React.useCallback(
      ({item}: {item: PSStickerModel}) => {
        return <PSStickerItem item={item} />;
      },
      [],
    );

    return (
      <View style={styles.container}>
        <PackageName name={stickerPackageName} />
        <BottomSheetFlatList
          style={[styles.stickerList, {backgroundColor: colors.Primary.background}]}
          numColumns={NUMBER_OF_STICKER_COLUMNS}
          data={stickersData}
          keyExtractor={keyStickerExtractor}
          renderItem={renderStickerItem}
        />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const PackageName = React.memo(
  ({name}: {name: string}) => {
    const {typography, colors} = usePSDesignSystemContext();

    return (
      <Text style={[styles.text, {color: colors.Neutral.n400}, typography.bodyMediumS]}>
        {name}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {flex: 1},
  text: {
    marginHorizontal: (16).px(),
  },
  stickerList: {
    flex: 1,
    paddingBottom: (12).px(),
  },
});
