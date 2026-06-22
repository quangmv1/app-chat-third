import {PSMessageMetadataType} from '@communi/chat-api-client-typescript';
import React, {PropsWithChildren} from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {
  PSIcFile24,
  PSIcImage24,
  PSIcLink24,
  PSIcVideo24,
} from '../../../../icons';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSThreadProfileNavigationContext} from '../../contexts';

const CollectionItem = ({
  children,
  title,
  onPress,
}: PropsWithChildren<{
  title: string;
  onPress?: null | (() => void);
}>) => {
  const {colors, typography} = usePSDesignSystemContext();
  return (
    <PSDebouncedPressable onPress={onPress} style={styles.text_container}>
      {children}
      <Text style={[styles.text, {color: colors.Primary.subText}, typography.bodyMediumS]}>
        {title}
      </Text>
    </PSDebouncedPressable>
  );
};

const MediaCollections = () => {
  const {translator} = usePSTranslationContext();
  const {onMediaCollectionPress: onPressMediaCollection} = usePSThreadProfileNavigationContext();
  const {colors} = usePSDesignSystemContext();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.Primary.white,
          // shadowColor: colors.Primary.subText,
        },
      ]}>
      <CollectionItem
        title={translator('ps_images')}
        onPress={() => {
          onPressMediaCollection?.(PSMessageMetadataType.IMAGE);
        }}>
        <PSIcImage24
          width={(28).px()}
          height={(28).px()}
          fill={colors.Branding.b400}
        />
      </CollectionItem>
      <CollectionItem
        title={translator('ps_videos')}
        onPress={() => {
          onPressMediaCollection?.(PSMessageMetadataType.VIDEO);
        }}>
        <PSIcVideo24
          width={(28).px()}
          height={(28).px()}
          fill={colors.Branding.b400}
        />
      </CollectionItem>
      <CollectionItem
        title={translator('ps_files')}
        onPress={() => {
          onPressMediaCollection?.(PSMessageMetadataType.FILE);
        }}>
        <PSIcFile24
          width={(28).px()}
          height={(28).px()}
          fill={colors.Branding.b400}
        />
      </CollectionItem>
      <CollectionItem
        title={translator('ps_links')}
        onPress={() => {
          onPressMediaCollection?.(PSMessageMetadataType.PREVIEW_LINK);
        }}>
        <PSIcLink24
          width={(28).px()}
          height={(28).px()}
          fill={colors.Branding.b400}
        />
      </CollectionItem>
    </View>
  );
};

export const PSThreadProfileMediaCollections = React.memo(
  MediaCollections,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: (76).px(),
    borderRadius: (12).px(),
    marginBottom: (16).px(),
    // shadowOffset: {width: 0, height: 2},
    // shadowRadius: 6,
    // shadowOpacity: 0.26,
    // elevation: 8,
  },
  text_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {marginTop: (8).px()},
});
