import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSMediaPickerContext,
} from '../../../context';
import {PSIcTick24} from '../../../icons';
import {Album} from '../../../utils';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';
import {PSImage} from '../../PSImage';

type Props = {
  item: Album;
  index: number;
  hideModalAlbums?: () => void;
};

const _PSAlbumsPickerItem = ({item, hideModalAlbums}: Props) => {
  const styles = usePSAlbumsPickerItemStyles();
  const colors = usePSDesignSystemContext().colors;
  const setGroupName = usePSMediaPickerContext().setGroupName;
  const groupName = usePSMediaPickerContext().groupName;

  const handleSelectAlbums = React.useCallback(() => {
    setGroupName(item.title);
    hideModalAlbums?.();
  }, [item]);

  return (
    <PSDebouncedPressable onPress={handleSelectAlbums} style={styles.row}>
      <PSImage source={{uri: item.image?.uri}} style={styles.styImage} />
      <View style={{flex: 1}}>
        <Text style={styles.styTxtTitle}>{item.title}</Text>
        <Text style={styles.styTxtCount}>{`(${item.count})`}</Text>
      </View>
      {groupName === item.title ? (
        <PSIcTick24 fill={colors.Branding.b400} />
      ) : null}
    </PSDebouncedPressable>
  );
};

export const PSAlbumsPickerItem = React.memo(
  _PSAlbumsPickerItem,
  (prev, next) => isEqual(prev, next),
);

const usePSAlbumsPickerItemStyles = () => {
  const {colors, typography} = usePSDesignSystemContext();
  return React.useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 0.5,
          borderBottomColor: colors.Neutral.n100,
          padding: (16).px(),
        },
        styTxtTitle: {
          ...typography.headingMediumM,
          color: colors.Neutral.n600,
          marginRight: (8).px(),
        },
        styTxtCount: {
          ...typography.bodyMediumM,
          color: colors.Neutral.n600,
        },
        styImage: {
          width: (50).px(),
          height: (50).px(),
          borderRadius: (8).px(),
          marginRight: (16).px(),
        },
      }),
    [colors, typography],
  );
};
