import React from 'react';
import {StyleSheet, View} from 'react-native';
import {usePSThreadNavigationContext} from '../../contexts';
import {PSMessageEntity, PSThreadModel} from '../../../../types';
import {PSThreadItemAvatar} from './avatar';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../context';
import {
  PSThreadPublicGroupDescriptionItem,
  PSThreadPublicGroupSubTitleItem,
  PSThreadPublicGroupTitleItem,
} from './public-group';

type PSThreadPublicGroupItemContentProps = {
  item: PSThreadModel;
};

export const PSThreadPublicGroupItemContent = React.memo(
  ({item}: PSThreadPublicGroupItemContentProps) => {
    return <PSThreadPublicGroupItemInfo item={item} />;
  },
  (prev, next) => isEqual(prev, next),
);

const PSThreadPublicGroupItemInfo = React.memo(
  ({item}: {item: PSThreadModel}) => {
    const {onPressThread} = usePSThreadNavigationContext();

    const onPress = () => {
      onPressThread?.(
        item.id,
        Math.max(
          item.lastMessage.id - item.unreadCount,
          PSMessageEntity.FIRST_MESSAGE_ID,
        ),
      );
    };

    const {colors} = usePSDesignSystemContext();

    return (
      <PSDebouncedPressable
        // @ts-ignore
        style={({pressed}) => [
          styles.container,
          {
            backgroundColor: pressed ? colors.Primary.background
            : colors.Primary.white,
            opacity: pressed ? 0.6 : 1,
          },
        ]}
        onPress={onPress}>
        <PSThreadItemAvatar
          avatar={item.avatar}
          name={item.name}
          isOnline={item.isOnline}
          isPublicGroup={true}
        />
        <View style={styles.textContainer}>
          <PSThreadPublicGroupTitleItem name={item.name} />

          <PSThreadPublicGroupSubTitleItem memberCount={item.memberCount} />

          <PSThreadPublicGroupDescriptionItem description={item.description} />
        </View>
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: (8).px(),
    paddingHorizontal: (16).px(),
  },
  textContainer: {
    marginLeft: (16).px(),
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
