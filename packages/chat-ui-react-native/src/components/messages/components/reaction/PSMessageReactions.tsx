import React from 'react';
import {PSMessageReactionModel} from '../../../../types';
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  // FlatList,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {usePSMessageItemContext} from '../PSMessageItem';
import {PSMessageReaction} from './PSMessageReaction';
import {PS_MESSAGE_REACTION_ADD_ITEM_NAME} from '../../../../utils';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../hooks';

export const REACTION_ROW_DIVIDER_HEIGHT = (4).px();
export const REACTION_ROW_HEIGHT = (28).px();

export const PSMessageReactions = React.memo(
  ({
    messageId,
    reactions,
    containerStyle,
    onLayout,
  }: {
    messageId: number;
    reactions: PSMessageReactionModel[];
    containerStyle: StyleProp<ViewStyle>;
    onLayout?: ((event: LayoutChangeEvent) => void) | undefined;
  }) => {
    const {isOverlay} = usePSMessageItemContext();

    const keyExtractor = React.useCallback(
      (item: PSMessageReactionModel, index: number) =>
        item.name + index.toString(),
      [],
    );

    const renderItem = React.useCallback(
      ({item, index}: {item: PSMessageReactionModel; index: number}) => (
        <PSMessageReaction
          reaction={item}
          messageId={messageId}
          index={index}
        />
      ),
      [messageId],
    );

    const ItemSeparatorComponent = React.useCallback(
      () => <View style={styles.divider} />,
      [],
    );

    useRenderCounter('MessageReactions', !isOverlay && reactions.length > 0);

    const nameSet = new Set<string>();
    const distinct: PSMessageReactionModel[] = [];

    for (const result of reactions) {
      if (nameSet.add(result.name)) {
        distinct.push(result);
      }
    }

    const results = distinct.filter(
      item => item.name !== PS_MESSAGE_REACTION_ADD_ITEM_NAME,
    );

    results.push({
      name: PS_MESSAGE_REACTION_ADD_ITEM_NAME,
      emoji: '',
      userIds: [],
    } as PSMessageReactionModel);

    return !isOverlay && reactions.length ? (
      <FlatList
        contentContainerStyle={containerStyle}
        ItemSeparatorComponent={ItemSeparatorComponent}
        data={distinct}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={5}
        bounces={false}
        onLayout={onLayout}
      />
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  divider: {height: REACTION_ROW_DIVIDER_HEIGHT},
});
