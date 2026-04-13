import React from 'react';
import isEqual from 'react-fast-compare';
import {View} from 'react-native';
import {StyleSheet, Text} from 'react-native';
import {PSMessageReactionModel} from '../../../../../types';
import {usePSMessageReactionsOverlayContext} from '../../../contexts';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../../context';

const MemoizeReactionWithCount = React.memo(
  ({emoji, count}: {emoji: string; count: number}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.countText,
        typography.bodyXLargeR,
        {
          color: colors.Primary.subText,
        },
      ];
    }, [colors.Primary.subText, typography.bodyXLargeR]);

    return (
      <View style={styles.rowContainer}>
        <Text style={styles.emojiText}>{emoji}</Text>
        <Text style={textStyles}>{count}</Text>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeUnderLine = React.memo(
  ({selected}: {selected: boolean}) => {
    const {colors} = usePSDesignSystemContext();

    const lineStyles = React.useMemo(() => {
      return [
        styles.line,
        {
          backgroundColor: selected ? colors.Branding.b600 : 'transparent',
        },
      ];
    }, [colors.Branding.b600, selected]);

    return <View style={lineStyles} />;
  },
  (prev, next) => prev.selected === next.selected,
);

export const PSMessageReactionsOverlayReactionItem = React.memo(
  ({index, reaction}: {index: number; reaction: PSMessageReactionModel}) => {
    const {selectedIndex, setSelectedIndex} =
      usePSMessageReactionsOverlayContext();

    const onPress = () => {
      setSelectedIndex(index);
    };

    return (
      <PSDebouncedPressable style={styles.container} onPress={onPress}>
        <MemoizeReactionWithCount
          emoji={reaction.emoji}
          count={reaction.userIds.length}
        />
        <MemoizeUnderLine selected={selectedIndex === index} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginHorizontal: (12).px(),
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: (14).px(),
    color: '#000',
  },
  countText: {
    marginStart: (4).px(),
  },
  line: {
    marginTop: (6).px(),
    height: (1).px(),
    minWidth: (44).px(),
  },
});
