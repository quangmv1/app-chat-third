import React from 'react';
import {ActivityIndicator, StyleSheet, View, ViewStyle} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {
  usePSDesignSystemContext,
  usePSMediaPickerActionContext,
  usePSScreenStylesContext,
  usePSStickerPickerActionContext,
} from '../../../../context';
import {PSMessageModel} from '../../../../types';
import {PSMessageEmptyState} from '../../../PSMessageEmptyState';
import {
  PAGING_SIZE,
  VIEW_AREA_COVERAGE_PERCENT_THRESHOLD,
  usePSCurrentThreadHasPinnedMessagesContext,
  usePSMessageAgainStartedChatBotContext,
  usePSMessageCurrentThreadContext,
  usePSMessageIsSubthreadContext,
  usePSPaginatedMessagesAutoScrollToTopContext,
  usePSPaginatedMessagesContext,
  usePSPaginatedMessagesFetchingContext,
} from '../../contexts';
import {PSMessageItem} from '../PSMessageItem';
import {PSMessageOriginSubThread} from './PSMessageOriginSubThread';
import {PSMessagesStyles} from '../../PSMessagesStyles';
import {PSThreadType} from '@communi/chat-api-client-typescript';

export const PSMessagesList = React.memo(() => {
  const {colors, typography} = usePSDesignSystemContext();

  const currentThread = usePSMessageCurrentThreadContext();

  const messageStyles = usePSScreenStylesContext<PSMessagesStyles>();

  const {closeMediaPicker} = usePSMediaPickerActionContext();

  const {closeStickerPicker} = usePSStickerPickerActionContext();

  const {
    isFirstFetching,
    messages,
    onScrollBeginDrag,
    onMomentumScrollEnd,
    handleScroll,
    flatListRef,
    onScrollToIndexFailedRef,
    viewabilityConfigCallbackPairsRef,
  } = usePSPaginatedMessagesContext();

  const autoScrollToTop = usePSPaginatedMessagesAutoScrollToTopContext();

  const isSubThread = usePSMessageIsSubthreadContext();

  const keyExtractor = React.useCallback(
    (item: PSMessageModel) => item.primaryKey,
    [],
  );

  const renderItem = React.useCallback(
    ({item}: {item: PSMessageModel}) => (
      <PSMessageItem message={item} isOverlay={false} />
    ),
    [],
  );
  const renderHeader = React.useCallback(() => {
    if (isSubThread && !messages.length) return <PSMessageOriginSubThread />;
    return messages.length === 0 ? undefined : <PSMessagesListHeader />;
  }, [isSubThread, messages.length]);

  const renderFooter = React.useCallback(() => {
    if (isSubThread && messages.length) return <PSMessageOriginSubThread />;
    return messages.length === 0 ? undefined : <PSMessagesListFooter />;
  }, [isSubThread, messages.length]);

  const renderEmpty = React.useCallback(() => {
    if (
      currentThread?.type === PSThreadType.DIRECT &&
      currentThread?.partner?.userId &&
      typeof messageStyles?.renderEmptyMessages === 'function'
    ) {
      return messageStyles.renderEmptyMessages?.(currentThread.partner.userId);
    }
    return (
      <PSMessageEmptyState
        isLoadingVisible={isFirstFetching}
        textStyle={[{color: colors.Neutral.n600}, typography.bodyXLargeR]}
      />
    );
  }, [
    currentThread?.type,
    currentThread?.partner?.userId,
    messageStyles?.renderEmptyMessages,
    isFirstFetching,
    colors.Neutral.n600,
    typography.bodyXLargeR,
  ]);

  const onTouchEnd = React.useCallback(() => {
    closeMediaPicker();
    closeStickerPicker();
  }, [closeMediaPicker, closeStickerPicker]);

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      bounces={false}
      inverted={messages.length > 0}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={PAGING_SIZE / 2}
      windowSize={PAGING_SIZE + 1}
      maxToRenderPerBatch={PAGING_SIZE / 2}
      updateCellsBatchingPeriod={PAGING_SIZE * 2}
      scrollEventThrottle={16}
      removeClippedSubviews
      contentContainerStyle={
        (messages.length === 0 || isSubThread) && styles.emptyList
      }
      ListEmptyComponent={renderEmpty}
      ListHeaderComponent={renderHeader}
      ListHeaderComponentStyle={
        messages.length > 0 && styles.headerComponentStyle
      }
      ListFooterComponent={renderFooter}
      onTouchEnd={onTouchEnd}
      keyboardShouldPersistTaps={'handled'}
      onScroll={handleScroll}
      viewabilityConfigCallbackPairs={
        viewabilityConfigCallbackPairsRef.current!
      }
      viewabilityConfig={{
        viewAreaCoveragePercentThreshold: VIEW_AREA_COVERAGE_PERCENT_THRESHOLD,
      }}
      onScrollBeginDrag={onScrollBeginDrag}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScrollToIndexFailed={onScrollToIndexFailedRef.current!}
      onEndReached={null}
      // https://github.com/GetStream/flat-list-mvcp
      // https://github.com/steuerbot/react-native-bidirectional-flatlist/blob/main/src/FlatList.tsx
      // https://github.com/sendbird/sendbird-uikit-react-native/blob/main/packages/uikit-react-native/src/components/ChatFlatList.tsx#L87
      // FIXME: maintainVisibleContentPosition is not working on Android {@link https://github.com/facebook/react-native/issues/25239}
      maintainVisibleContentPosition={{
        autoscrollToTopThreshold: autoScrollToTop ? 20 : undefined,
        minIndexForVisible: 0, // minIndexForVisible = 1 gây ra scroll lạ trên ios ở những tin nhắn đầu tiên
      }}
    />
  );
});

const PSMessagesListHeader = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const isStartReachedFetching =
    usePSPaginatedMessagesFetchingContext()?.isStartReachedFetching;
  const isAgainStartedChatBot = usePSMessageAgainStartedChatBotContext();

  return isStartReachedFetching ? (
    <ActivityIndicator size={(32).px()} color={colors.Branding.b800} />
  ) : isAgainStartedChatBot ? (
    <View style={{height: (60).px()}} />
  ) : null;
});

const PSMessagesListFooter = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const hasPinnedMessages = usePSCurrentThreadHasPinnedMessagesContext();

  const {isEndReachedFetching} = usePSPaginatedMessagesFetchingContext();

  const marginTop = React.useMemo(() => {
    return {marginTop: hasPinnedMessages ? (70).px() : (4).px()} as ViewStyle;
  }, [hasPinnedMessages]);

  const height = React.useMemo(() => {
    return {height: hasPinnedMessages ? (70).px() : (4).px()} as ViewStyle;
  }, [hasPinnedMessages]);

  return isEndReachedFetching ? (
    <ActivityIndicator
      size={(32).px()}
      style={marginTop}
      color={colors.Branding.b800}
    />
  ) : (
    <View style={height} />
  );
});

const styles = StyleSheet.create({
  emptyList: {flexGrow: 1},
  headerComponentStyle: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: (8).px(),
  },
  footerComponentStyle: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: (8).px(),
  },
});
