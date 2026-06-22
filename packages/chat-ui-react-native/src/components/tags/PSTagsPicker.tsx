import React, {useReducer} from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import isEqual from 'react-fast-compare';
import {
  Dimensions,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../context';

import {mapTagDtoToModel, PSThreadEntity} from '../../types';
import {
  usePSTagsPickerActionContext,
  usePSTagsPickerContext,
  usePSTagsPickerVisibleContext,
} from './context/PSTagsPickerContext';
import {psLogger} from '../../utils';
import {PSTagDto} from '@communi/chat-api-client-typescript';
import {PSTagPicker} from './PSTagPicker';
import {usePSMessageCurrentThreadIdContext} from '../messages';
import {
  initialState,
  setApiFail,
  setApiRequest,
  setApiSuccess,
  setListEnd,
  userReducers,
} from '../../hooks';

const {width} = Dimensions.get('window');
export const MARGIN_COLUMNS = (5).px();
export const NUMBER_OF_STICKER_COLUMNS = 4;
export const itemWidth =
  (width - MARGIN_COLUMNS * NUMBER_OF_STICKER_COLUMNS * 2) /
  NUMBER_OF_STICKER_COLUMNS;
export const RECENT_PACKAGE_ID = '0';

export const PSTagsPicker = React.memo(
  ({snapPoints}: {snapPoints: string[]}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const windowSize = useWindowDimensions();

    const {translator} = usePSTranslationContext();

    const currentThreadId = usePSMessageCurrentThreadIdContext();

    const chatApiClient = usePSChatApiClientContext();

    const realm = useRealm();

    const [page, setPage] = React.useState(1);
    const [state, dispatch] = useReducer(userReducers, initialState);
    const {moreLoading, data, isListEnd} = state;

    const {bottomSheetRef} = usePSTagsPickerContext();

    const {closeTagsPicker} = usePSTagsPickerActionContext();

    const {isTagsPickerShown, tag, category} = usePSTagsPickerVisibleContext();

    const fetchTags = async () => {
      if (!chatApiClient || !category?.id) {
        return;
      }

      dispatch(setApiRequest(page));

      const lastTagId = page === 1 ? '0' : data[page * 20 - 21];

      try {
        const response = await chatApiClient.tagApi.fetchTagsByCategory(
          category.id,
          lastTagId,
          20,
        );

        if (response.data && response.data.length > 0) {
          dispatch(setApiSuccess(response.data));
          if (response.data.length < 20) {
            dispatch(setListEnd());
          }
        } else {
          dispatch(setListEnd());
        }
      } catch (error) {
        dispatch(setApiFail());
        psLogger.error('PSTagsPicker: fetchTags', error);
      }
    };

    const fetchMoreData = () => {
      if (!isListEnd && !moreLoading) {
        setPage(page + 1);
      }
    };

    React.useEffect(() => {
      if (isTagsPickerShown) {
        fetchTags();
      } else {
        setPage(1);
        dispatch(setApiRequest(1));
      }
    }, [isTagsPickerShown, page]);

    const renderBackdrop = React.useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} />
      ),
      [],
    );

    const handleTagPress = React.useCallback(
      async (currentTag: PSTagDto) => {
        if (chatApiClient && currentThreadId && tag) {
          try {
            if (currentTag.id === tag.id) {
              return;
            }

            const thread = PSThreadEntity.getFirstById(realm, currentThreadId);

            if (!thread) {
              return;
            }

            await chatApiClient.threadApi.actionTag(
              currentThreadId,
              [tag.id],
              false,
            );
            realm.write(() => {
              thread.removeTag(tag.id);
            });

            await chatApiClient.threadApi.actionTag(
              currentThreadId,
              [currentTag.id],
              true,
            );
            realm.write(() => {
              thread.addTag(mapTagDtoToModel(currentTag));
            });

            closeTagsPicker();
          } catch (error) {
            psLogger.error('PSTagsPicker: handleTagPress', error);
          }
        }
      },
      [chatApiClient, closeTagsPicker, currentThreadId, realm, tag],
    );

    const keyUserExtractor = React.useCallback((item: PSTagDto) => item.id, []);

    const renderTagItem = React.useCallback(
      ({index, item}: {index: number; item: PSTagDto}) => (
        <PSTagPicker
          index={index}
          tag={item}
          isTick={tag?.id === item.id}
          onPress={handleTagPress}
        />
      ),
      [tag?.id, handleTagPress],
    );

    const renderCustomHandle = React.useCallback(() => {
      return (
        <View style={styles.handleContainer}>
          <Text style={[{color: colors.Primary.subText}, typography.headingMediumS]}>
            {category?.name ?? translator('ps_status')}
          </Text>
        </View>
      );
    }, [colors.Primary.subText, category?.name, translator, typography.headingMediumS]);

    const renderSeparator = React.useCallback(() => {
      return (
        <View style={[styles.separator, {backgroundColor: colors.Neutral.n50}]} />
      );
    }, [colors.Neutral.n50]);

    return (
      <BottomSheet
        backdropComponent={renderBackdrop}
        backgroundStyle={{backgroundColor: colors.Primary.background}}
        ref={bottomSheetRef}
        containerHeight={windowSize.height}
        enablePanDownToClose={true}
        handleHeight={20}
        handleComponent={renderCustomHandle}
        index={-1}
        onClose={closeTagsPicker}
        snapPoints={snapPoints}>
        <BottomSheetFlatList
          style={[styles.tagsContainer, {backgroundColor: colors.Primary.background}]}
          data={data}
          keyExtractor={keyUserExtractor}
          renderItem={renderTagItem}
          ItemSeparatorComponent={renderSeparator}
          onEndReachedThreshold={0.2}
          onEndReached={fetchMoreData}
        />
      </BottomSheet>
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
  tagsContainer: {
    flex: 1,
    paddingBottom: (12).px(),
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: (16).px(),
    paddingVertical: (12).px(),
    borderTopStartRadius: (22).px(),
    borderTopEndRadius: (22).px(),
  },
  separator: {
    height: (0.5).px(),
  },
});
