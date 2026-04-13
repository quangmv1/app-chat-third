import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import React, {useReducer} from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import isEqual from 'react-fast-compare';
import {PSLabelDto, PSTagDto} from '@communi/chat-api-client-typescript';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  useRealm,
} from '../../../../context';
import {usePSMessageCurrentThreadIdContext} from '../../../messages';
import {
  usePSThreadDeskTagCategoriesActionContext,
  usePSThreadDeskTagCategoriesContext,
  usePSThreadDeskTagCategoriesVisibleContext,
} from '../contexts';
import {psLogger} from '../../../../utils';
import {PSTagPicker} from '../../../tags';
import {mapTagDtoToModel, PSThreadEntity} from '../../../../types';
import {PSFlashMessage} from '../../../flash-message';
import {
  initialState,
  setApiFail,
  setApiRequest,
  setApiSuccess,
  setListEnd,
  userReducers,
} from '../../../../hooks';

export const PSThreadDeskTagCategoriesOverlay = React.memo(
  () => {
    const {typography, colors} = usePSDesignSystemContext();

    const windowSize = useWindowDimensions();

    // const {translator} = usePSTranslationContext();

    const currentThreadId = usePSMessageCurrentThreadIdContext();

    const chatApiClient = usePSChatApiClientContext();

    const realm = useRealm();

    const [page, setPage] = React.useState(1);
    const [state, dispatch] = useReducer(userReducers, initialState);
    const {moreLoading, data, isListEnd} = state;

    const {bottomSheetRef} = usePSThreadDeskTagCategoriesContext();

    const {hide} = usePSThreadDeskTagCategoriesActionContext();

    const {
      isVisible,
      tags: tagsSelected,
      category,
    } = usePSThreadDeskTagCategoriesVisibleContext();

    const handleTagPress = React.useCallback(
      async (currentTag: PSTagDto) => {
        if (chatApiClient && currentThreadId) {
          try {
            const isTick =
              tagsSelected?.some(e => e.id === currentTag.id) ?? false;

            const thread = PSThreadEntity.getFirstById(realm, currentThreadId);

            if (!thread) {
              return;
            }

            if (isTick) {
              await chatApiClient.threadApi.actionTag(
                currentThreadId,
                [currentTag.id],
                false,
              );
              realm.write(() => {
                thread.removeTag(currentTag.id);
              });
            } else {
              await chatApiClient.threadApi.actionTag(
                currentThreadId,
                [currentTag.id],
                true,
              );
              realm.write(() => {
                thread.addTag(mapTagDtoToModel(currentTag));
              });
            }

            hide();
          } catch (error) {
            psLogger.error(
              'PSThreadDeskTagCategoriesOverlay: handleTagPress',
              error,
            );
            PSFlashMessage.show({
              type: 'error',
              position: 'bottom',
              text1: `${error}`,
            });
          }
        }
      },
      [chatApiClient, realm, currentThreadId, tagsSelected, hide],
    );

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
        psLogger.error('PSThreadDeskTagCategoriesOverlay: fetchTags', error);
      }
    };

    const fetchMoreData = () => {
      if (!isListEnd && !moreLoading) {
        setPage(page + 1);
      }
    };

    React.useEffect(() => {
      if (isVisible) {
        fetchTags();
      } else {
        setPage(1);
        dispatch(setApiRequest(1));
      }
    }, [isVisible, page]);

    const renderBackdrop = React.useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} />
      ),
      [],
    );

    const keyUserExtractor = React.useCallback((item: PSTagDto) => item.id, []);

    const renderTagItem = React.useCallback(
      ({index, item}: {index: number; item: PSTagDto}) => (
        <PSTagPicker
          index={index}
          tag={item}
          isTick={tagsSelected?.some(e => e.id === item.id)}
          onPress={handleTagPress}
        />
      ),
      [tagsSelected, handleTagPress],
    );

    const renderCustomHandle = React.useCallback(() => {
      return (
        <View style={styles.handleContainer}>
          <Text style={[{color: colors.Primary.subText}, typography.headingMediumS]}>
            {category?.name}
          </Text>
        </View>
      );
    }, [colors.Primary.subText, typography.headingMediumS, category?.name]);

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
        onClose={hide}
        snapPoints={['50%', '90%']}>
        <BottomSheetFlatList
          style={[styles.labelsContainer, {backgroundColor: colors.Primary.background}]}
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
  labelsContainer: {
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
