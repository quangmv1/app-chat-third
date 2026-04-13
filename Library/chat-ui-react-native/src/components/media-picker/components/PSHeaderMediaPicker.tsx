import React from 'react';
import isEqual from 'react-fast-compare';
import {DeviceEventEmitter, StyleSheet, Text} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSMediaPickerContext,
  usePSTranslationContext,
} from '../../../context';
import {PSIcDropDown24} from '../../../icons';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';

const _PSHeaderMediaPicker = () => {
  const styles = useStylePSHeaderMediaPicker();
  const {colors} = usePSDesignSystemContext();
  const {translator} = usePSTranslationContext();

  const groupName = usePSMediaPickerContext().groupName;

  const handleSelectAlbums = React.useCallback(() => {
    DeviceEventEmitter.emit('PS_SELECT_OPEN_ALBUMS');
  }, []);

  return (
    <PSDebouncedPressable style={styles.contain} onPress={handleSelectAlbums}>
      <Text style={styles.styTxt}>
        {groupName ?? `${translator('ps_choose')} Album`}
      </Text>
      <PSIcDropDown24 width={32} height={32} fill={colors.Neutral.n500} />
    </PSDebouncedPressable>
  );
};

export const PSHeaderMediaPicker = React.memo(
  _PSHeaderMediaPicker,
  (prev, next) => isEqual(prev, next),
);

const useStylePSHeaderMediaPicker = () => {
  const {colors, typography} = usePSDesignSystemContext();

  return React.useMemo(
    () =>
      StyleSheet.create({
        contain: {
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginVertical: (8).px(),
          paddingHorizontal: (16).px(),
          flexDirection: 'row',
          borderWidth: 0.3,
          borderRadius: (20).px(),
          borderColor: colors.Neutral.n500,
          backgroundColor: colors.Primary.background,

          shadowColor: colors.Neutral.n100,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          elevation: 5,
        },
        styTxt: {
          ...typography.bodyXLargeR,
          color: colors.Neutral.n700,
        },
      }),
    [colors, typography],
  );
};
