import React, {useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  // FlatList,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {
  usePSMessageInputMentionUserPressContext,
  usePSMessageSuggestionMentionsContext,
} from '../../contexts';
import {PSUserModel} from '../../../../types';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {PSAvatarImage} from '../../../PSAvatarImage';
import {usePSDesignSystemContext} from '../../../../context';
import {PSIcVerified} from '../../../../icons';

const MemoizeName = React.memo(
  ({name, verified}: {name: string; verified?: boolean}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [styles.itemNameText, typography.bodyXLargeR, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.bodyXLargeR]);

    return (
      <View style={styles.row}>
        <Text style={textStyles}>{name}</Text>
        {verified ? <PSIcVerified style={{marginLeft: (4).px()}} /> : null}
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeMessageSuggestion = React.memo(
  ({item}: {item: PSUserModel}) => {
    const onSuggestedMentionUserPress =
      usePSMessageInputMentionUserPressContext();

    const onPress = () => {
      onSuggestedMentionUserPress(item);
    };

    return (
      <PSDebouncedPressable style={styles.itemContainer} onPress={onPress}>
        <PSAvatarImage displayName={item.name} size={40} url={item.avatar} />
        <MemoizeName name={item.name} verified={!!item.verified} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessagesSuggestions = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const {suggestedMentionUsers, fetchMoreData} =
    usePSMessageSuggestionMentionsContext();

  const keyExtractor = useCallback(
    (item: PSUserModel) => item.extUserId.toString(),
    [],
  );

  const renderItem = useCallback(
    ({item}: {item: PSUserModel}) => <MemoizeMessageSuggestion item={item} />,
    [],
  );

  const containerStyles = React.useMemo(() => {
    return [
      styles.listContainer,
      {
        backgroundColor: colors.Primary.white,
      },
    ];
  }, [colors.Primary.linerBorder]);

  return suggestedMentionUsers.length ? (
    <View style={containerStyles}>
      <FlatList
        data={suggestedMentionUsers}
        keyboardShouldPersistTaps="always"
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReachedThreshold={0.2}
        onEndReached={fetchMoreData}
      />
    </View>
  ) : null;
});

const styles = StyleSheet.create({
  listContainer: {
    maxHeight: (300).px(),
    right: 0,
    left: 0,
    borderTopStartRadius: (22).px(),
    borderTopEndRadius: (22).px(),
    position: 'absolute',
    bottom: 0,
    paddingTop: (16).px(),
  },
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: (16).px(),
    paddingVertical: (8).px(),
    alignItems: 'center',
  },
  itemNameText: {
    marginStart: (16).px(),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
