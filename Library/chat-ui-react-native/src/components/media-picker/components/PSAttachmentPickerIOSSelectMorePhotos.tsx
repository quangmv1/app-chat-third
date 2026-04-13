import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import isEqual from 'react-fast-compare';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {PSTextButton} from '../../PSTextButton';
import {usePSMessageManageAccessPhotosOverlayContext} from '../../messages';

export const PSAttachmentPickerIOSSelectMorePhotos = React.memo(
  () => {
    return (
      <View style={styles.container}>
        <MemoizeText />
        <MemoizeButton />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  () => {
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const textStyle = React.useMemo(() => {
      return [styles.text, typography.bodyMediumR, {color: colors.Neutral.n500}];
    }, [typography.bodyMediumR, colors.Neutral.n500]);

    return (
      <Text style={textStyle}>
        {translator('ps_gallery_limited_accessing_photos')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeButton = React.memo(
  () => {
    const {translator} = usePSTranslationContext();
    const {typography, colors} = usePSDesignSystemContext();

    const show = usePSMessageManageAccessPhotosOverlayContext();

    return (
      <PSTextButton
        text={translator('ps_gallery_manage')}
        textStyle={[typography.bodyMediumS, {color: colors.Primary.white}]}
        style={[styles.button, {backgroundColor: colors.Branding.b400}]}
        onPress={show}
      />
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: (8).px(),
    marginHorizontal: (16).px(),
  },
  text: {
    // marginHorizontal: (24).px(),
    // marginVertical: (8).px(),
    // textAlign: 'center',
    // flex: 1,
  },
  button: {
    paddingHorizontal: (12).px(),
    paddingVertical: (4).px(),
    marginStart: (10).px(),
  },
});
