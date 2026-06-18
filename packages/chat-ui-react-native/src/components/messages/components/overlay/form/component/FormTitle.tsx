import React from 'react';
import isEqual from 'react-fast-compare';
import {Text, View, StyleSheet} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../../context';
import {PSIcClose24, PSIcForm} from '../../../../../../icons';
import {PSDebouncedPressable} from '../../../../../PSDebouncedPressable';

export const FormTitle = React.memo(
  ({title, hide}: {title?: string; hide: () => void}) => {
    const {colors, typography} = usePSDesignSystemContext();
    return (
      <View
        style={[
          styles.container,
          {backgroundColor: colors.Primary.bgBranding},
        ]}>
        <PSIcForm
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.branding}
        />
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[
            styles.title,
            typography.headingXLargeS,
            {color: colors.Primary.mainText},
          ]}>
          {title ?? ''}
        </Text>
        <PSDebouncedPressable onPress={hide}>
          <PSIcClose24
            width={(24).px()}
            height={(24).px()}
            fill={colors.Primary.placeHolder}
          />
        </PSDebouncedPressable>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: (16).px(),
    // alignItems: 'flex-start',
    alignItems: 'center',
    // backgroundColor: 'white',
  },
  title: {
    flex: 1,
    marginHorizontal: (8).px(),
  },
});
