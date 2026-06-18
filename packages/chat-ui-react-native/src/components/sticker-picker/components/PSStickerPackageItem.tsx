import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet} from 'react-native';
import {useRenderCounter} from '../../../hooks';
import {PSIcRecent24} from '../../../icons';
import {PSColors} from '../../../themes';
import {PSStickerPackageModel} from '../../../types';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';
import {PSImage} from '../../PSImage';
import {RECENT_PACKAGE_ID, usePSStickerSelectedPackageIdContext, usePSStickerSetSelectedPackageIdContext} from '../PSStickerPicker';

export const PSStickerPackageItem = React.memo(
  ({
    item,
    // selectedPackageId,
    colors,
    // onChange,
  }: {
    item: PSStickerPackageModel;
    // selectedPackageId: string;
    colors: PSColors;
    // onChange: (packageId: string) => void;
  }) => {
    useRenderCounter('PSStickerPackageItem');
    const selectedPackageId = usePSStickerSelectedPackageIdContext();
    const onChange = usePSStickerSetSelectedPackageIdContext();

    return (
      <PSDebouncedPressable
        style={[
          styles.container,
          {
            backgroundColor:
              item.id === selectedPackageId
                ? colors.Neutral.n200
                : colors.Neutral.n50,
          },
        ]}
        onPress={() => {
          onChange(item.id);
        }}>
        {item.id === RECENT_PACKAGE_ID ? (
          <PSIcRecent24
            width={(24).px()}
            height={(24).px()}
            fill={colors.Neutral.n400}
          />
        ) : (
          <PSImage
            style={styles.image}
            source={{
              uri: item.iconFileUrl,
            }}
          />
        )}
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: (6).px(),
    width: (32).px(),
    height: (32).px(),
    borderRadius: (6).px(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: (24).px(),
    height: (24).px(),
  },
});
