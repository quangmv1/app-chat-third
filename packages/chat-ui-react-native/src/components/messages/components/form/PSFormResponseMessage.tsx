import React from 'react';
import isEqual from 'react-fast-compare';
import {View, Text, StyleSheet} from 'react-native';
import {PSMessageFormModel} from '../../../../types';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSIcProfile} from '../../../../icons';

export const PSFormResponseMessage = React.memo(
  ({form}: {form?: PSMessageFormModel}) => {
    const {colors, typography} = usePSDesignSystemContext();
    return (
      <View style={{width: 256, padding: 8}}>
        <View
          style={[styles.container, {borderColor: colors.Primary.linerBorder}]}>
          <Title />
          <View style={{paddingHorizontal: 12, paddingVertical: 8}}>
            {form?.blocks.map((item, index) => {
              return <ItemBlock title={item.form?.label} value={item.value} />;
            })}
          </View>
        </View>
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const Title = React.memo(
  () => {
    const {colors, typography} = usePSDesignSystemContext();
    const {translator} = usePSTranslationContext();
    return (
      <View
        style={[
          styles.container_title,
          {backgroundColor: colors.Branding.b50},
        ]}>
        <PSIcProfile width={20} height={20} fill={colors.Primary.branding} />
        <Text
          style={[
            styles.text_title,
            typography.bodyMediumM,
            {color: colors.Primary.branding},
          ]}>
          {translator('ps_form_feed_back')}
        </Text>
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const ItemBlock = React.memo(
  ({title, value}: {title: string; value: string}) => {
    const {colors, typography} = usePSDesignSystemContext();
    return (
      <View style={{marginBottom: 12}}>
        <Text style={[typography.bodyMediumM, {color: colors.Primary.subText}]}>
          {title}
        </Text>
        <Text
          style={[typography.bodyXLargeR, {color: colors.Primary.mainText}]}>
          {value}
        </Text>
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
  },
  container_title: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text_title: {marginStart: 4},
});
