import React, {useCallback} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {PSActionBar} from '../PSActionBar';
import {
  PSScreenStylesProvider,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../context';
import {PSMessageModel} from '../../types';
import {
  PSMessageCurrentThreadProvider,
  PSPinnedMessagesProvider,
  usePSPinnedMessagesContext,
} from '../messages';
import {PSMessagePinnedItem} from './components';
import {PSMessagesPinnedStyles} from './PSMessagesPinnedStyles';

type PSMessagesPinnedProps = {
  threadId: string;
  messagesPinnedStyles?: PSMessagesPinnedStyles;
  onBackPress?: null | (() => void);
  onViewMessage?: null | ((messageId: number) => void);
};

export const PSMessagesPinned = ({
  threadId,
  messagesPinnedStyles,
  onBackPress,
  onViewMessage,
}: PSMessagesPinnedProps) => {
  return (
    <PSScreenStylesProvider styles={messagesPinnedStyles}>
      <PSMessageCurrentThreadProvider
        targetThreadId={threadId}
        targetUserId={undefined}>
        <PSPinnedMessagesProvider>
          <PSMessagesPinnedScreenUI
            onBackPress={onBackPress}
            onViewMessage={onViewMessage}
          />
        </PSPinnedMessagesProvider>
      </PSMessageCurrentThreadProvider>
    </PSScreenStylesProvider>
  );
};

const PSMessagesPinnedScreenUI = ({
  onBackPress,
  onViewMessage,
}: {
  onBackPress?: null | (() => void);
  onViewMessage?: null | ((messageId: number) => void);
}) => {
  const {translator} = usePSTranslationContext();
  const {colors} = usePSDesignSystemContext();
  const {pinnedMessages} = usePSPinnedMessagesContext();

  const handleItemPress = React.useCallback(
    (message: PSMessageModel) => {
      onViewMessage?.(message.id);
    },
    [onViewMessage],
  );

  const renderItem = useCallback(
    ({item}: {item: PSMessageModel; index: number}) => {
      return <PSMessagePinnedItem item={item} onItemPress={handleItemPress} />;
    },
    [handleItemPress],
  );

  const renderSeparator = useCallback(
    () => (
      <View style={[styles.divider, {backgroundColor: colors.Neutral.n400}]} />
    ),
    [colors.Neutral.n400],
  );

  return (
    <View style={styles.container}>
      <PSActionBar
        titleText={translator('ps_pinned_header')}
        subtitleText={translator(
          'ps_pinned_total_message_pinned',
          // @ts-ignore
          {
            total: `${pinnedMessages?.length}`,
          },
        )}
        onBackPress={onBackPress}
      />

      <FlatList
        contentContainerStyle={{flexGrow: 1}}
        data={pinnedMessages}
        keyExtractor={item => item.primaryKey}
        renderItem={({item, index}) => renderItem({item, index})}
        ItemSeparatorComponent={renderSeparator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    height: (1).px(),
  },
});
