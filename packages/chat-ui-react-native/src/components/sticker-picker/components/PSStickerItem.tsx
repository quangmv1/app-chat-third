import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet} from 'react-native';
import {useRenderCounter} from '../../../hooks';
import {PSStickerEntity, PSStickerModel} from '../../../types';
import {PSImage} from '../../PSImage';
import {itemWidth, MARGIN_COLUMNS} from '../PSStickerPicker';
import {usePSMessageInputSendStickerContext} from '../../messages';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';
import {useRealm} from '../../../context';
import {psLogger} from '../../../utils';

export const PSStickerItem = React.memo(
  ({item}: {item: PSStickerModel}) => {
    useRenderCounter(`PSStickerItem ${item.filePath}`);
    const realm = useRealm();

    const onSendSticker = usePSMessageInputSendStickerContext();

    const onPress = () => {
      try {
        const cachedSticker = PSStickerEntity.getFirstById(realm, item.id);
        if (cachedSticker) {
          let now = new Date().getTime();
          realm.write(() => {
            cachedSticker.updatePickedAt(now);
          });
        }

        onSendSticker(item);
      } catch (error) {
        psLogger.error('PSStickerItem: onPress', error);
      }
    };

    return (
      <PSDebouncedPressable onPress={onPress}>
        <PSImage
          style={styles.stickersContainer}
          source={{
            uri: item.fileUrl,
          }}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  stickersContainer: {
    margin: MARGIN_COLUMNS,
    width: itemWidth,
    height: itemWidth,
  },
});
