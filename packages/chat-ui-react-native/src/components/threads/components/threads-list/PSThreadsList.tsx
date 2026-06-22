import React, {useCallback, useMemo} from 'react';
import {ActivityIndicator, Platform, StyleSheet, View} from 'react-native';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {usePSDesignSystemContext} from '../../../../context';
import {PSThreadModel} from '../../../../types';
import {PSMessageEmptyState} from '../../../PSMessageEmptyState';
import {usePSPaginatedThreadsContext} from '../../contexts';
import {PSThreadItem} from '../thread-item';
import DropDownPCL from './DropDownPCL';
import _ from 'lodash';
const ITEM_HEIGHT = 60;
export const PSThreadsList = React.memo(
  () => {
    const {colors, typography} = usePSDesignSystemContext();
    const {
      isFirstFetching,
      loadingMore,
      threads,
      nextPage,
      isRefresh,
      onRefresh,
    } = usePSPaginatedThreadsContext();

    const renderItem = useCallback(
      ({item}: {item: PSThreadModel}) => <PSThreadItem item={item} />,
      [],
    );

    const renderFooter = useMemo(() => {
      if (!loadingMore) {
        return <View style={{height: 1}} />;
      }
      return (
        <View
          style={{
            flex: 1,
            paddingVertical: 10,
          }}>
          <ActivityIndicator
            animating
            color={colors.Branding.b500}
            size={Platform.select({ios: 'small', android: 'large'})}
          />
        </View>
      );
    }, [loadingMore]);

    const keyExtractor = useCallback((item: PSThreadModel) => item.id, []);

    return (
      <FlatList
        data={threads}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl refreshing={isRefresh} onRefresh={onRefresh} />
        }
        contentContainerStyle={threads.length === 0 && styles.emptyList}
        ListHeaderComponent={<DropDownPCL />}
        stickyHeaderIndices={[0]}
        ListEmptyComponent={
          <PSMessageEmptyState
            isLoadingVisible={isFirstFetching}
            textStyle={[{color: colors.Primary.subText}, typography.bodyMediumR]}
          />
        }
        ListFooterComponent={renderFooter}
        initialNumToRender={11}
        maxToRenderPerBatch={25}
        windowSize={25}
        onEndReachedThreshold={Platform.select({ios: 0.3, android: 0.6})}
        onEndReached={nextPage}
        scrollEventThrottle={Platform.select({ios: 32, android: 8})}
        getItemLayout={(data, index) => ({
          length: data?.length || ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
    );
  },
  (prev, next) => _.isEqual(prev, next),
);

const styles = StyleSheet.create({
  emptyList: {flexGrow: 1},
});
