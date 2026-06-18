import React from 'react';
import isEqual from 'react-fast-compare';
import {DeviceEventEmitter, StyleSheet, Text} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {IcFillCamera} from '../../../icons';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';

const _PSEmptyMediaPicker = () => {
  const styles = useStylePSHeaderMediaPicker();
  const {colors} = usePSDesignSystemContext();
  const {translator} = usePSTranslationContext();

  const handleSelectAlbums = React.useCallback(() => {
    DeviceEventEmitter.emit('PS_SELECT_OPEN_ALBUMS');
  }, []);

  return (
    <PSDebouncedPressable style={styles.contain} onPress={handleSelectAlbums}>
      <IcFillCamera width={32} height={32} fill={colors.Neutral.n300} />
      <Text style={styles.styTxt}>{translator('ps_albums_empty')}</Text>
    </PSDebouncedPressable>
  );
};

export const PSEmptyMediaPicker = React.memo(
  _PSEmptyMediaPicker,
  (prev, next) => isEqual(prev, next),
);

const useStylePSHeaderMediaPicker = () => {
  const {colors, typography} = usePSDesignSystemContext();

  return React.useMemo(
    () =>
      StyleSheet.create({
        contain: {
          marginTop: (100).px(),
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: (8).px(),
          paddingHorizontal: (16).px(),
        },
        styTxt: {
          ...typography.bodyXLargeR,
          color: colors.Neutral.n300,
        },
      }),
    [colors, typography],
  );
};
