import React, {PropsWithChildren} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {usePSDesignSystemContext} from '../../../../context';
import {PSIcQuickRight24} from '../../../../icons';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

export const PSThreadProfileRowItem = ({
  children,
  title,
  subTitle,
  colorTitle,
  colorSubTitle,
  showIconRight = true,
  onPress,
}: PropsWithChildren<{
  title: string;
  subTitle?: string;
  colorTitle?: string;
  colorSubTitle?: string;
  showIconRight?: boolean;
  onPress?: null | (() => void);
}>) => {
  const {typography} = usePSDesignSystemContext();
  return (
    <PSDebouncedPressable onPress={onPress} style={styles.container_row}>
      {children}
      <View style={styles.container_text}>
        <Text
          style={[
            {
              color: colorTitle ?? '#18202A',
            },
            typography.bodyXLargeR,
          ]}>
          {title}
        </Text>
        {subTitle && (
          <Text
            style={[
              {
                color: colorSubTitle ?? '#73787E',
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {subTitle.workAroundTextOneLineContainsNewLineIOS()}
          </Text>
        )}
      </View>
      {showIconRight && (
        <PSIcQuickRight24
          width={(28).px()}
          height={(28).px()}
          fill={colorTitle}
        />
      )}
    </PSDebouncedPressable>
  );
};

// export const PSThreadProfileRowItem = React.memo(
//   ThreadProfileRowItem,
//   (prev, next) => {
//     return isEqual(prev, next);
//   },
// );

const styles = StyleSheet.create({
  container_row: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    padding: (12).px(),
  },
  container_text: {
    flexDirection: 'column',
    flex: 1,
    marginHorizontal: (12).px(),
  },
});
