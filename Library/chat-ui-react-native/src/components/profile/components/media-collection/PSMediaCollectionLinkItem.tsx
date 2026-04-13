import React from 'react';
import isEqual from 'react-fast-compare';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {PSAvatarImage} from '../../../../components';
import {IcFill3DotHorizontal} from '../../../../icons';
import {PSMediaCollectionModel} from '../../../../types';
import {usePSDesignSystemContext} from '../../../../context';

const LinkItem = ({
  index,
  item,
  onItemMorePress,
  onItemPress,
}: {
  index: number;
  item: PSMediaCollectionModel;
  onItemMorePress: (media: PSMediaCollectionModel) => void;
  onItemPress: (index: number) => void;
}) => {
  const {colors, typography} = usePSDesignSystemContext();
  return (
    <Pressable
      style={styles.containerLinkItem}
      onPress={() => {
        onItemPress(index);
      }}>
      <PSAvatarImage
        url={item.content.srcThumbUrl}
        displayName={item.name}
        size={(56).px()}
        borderRadius={(10).px()}
      />

      <View style={styles.contentLinkItem}>
        <Text
          style={[
            styles.titleLinkItem,
            {color: colors.Primary.subText},
            typography.bodyMediumS,
          ]}
          numberOfLines={2}
          ellipsizeMode="tail">
          {item.titleLink}
        </Text>
        <Text
          style={[
            styles.desLinkItem,
            {color: colors.Neutral.n400},
            typography.bodySmallR,
          ]}
          numberOfLines={3}
          ellipsizeMode="tail">
          {item.descriptionLink}
        </Text>
        <Text
          style={[styles.desLinkItem, {color: '#0CA2FF'}, typography.bodySmallR]}
          numberOfLines={2}
          ellipsizeMode="tail">
          {item.content.srcUrl}
        </Text>
      </View>

      <Pressable
        style={{alignSelf: 'center'}}
        onPress={() => {
          onItemMorePress(item);
        }}>
        <IcFill3DotHorizontal width={24} height={24} fill={'gray'} />
      </Pressable>
    </Pressable>
  );
};

export const PSMediaCollectionLinkItem = React.memo(LinkItem, (prev, next) =>
  isEqual(prev, next),
);

const styles = StyleSheet.create({
  containerLinkItem: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  contentLinkItem: {
    marginHorizontal: 12,
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  titleLinkItem: {
    flex: 1,
  },
  desLinkItem: {
    flex: 1,
  },
});
