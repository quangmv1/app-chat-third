import React from 'react';
import {
  Linking,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import {psLogger} from '../../../utils';
import {
  usePSDesignSystemContext,
  usePSMediaPickerActionContext,
  usePSMediaPickerContext,
  usePSMediaPickerVisibleContext,
  usePSTranslationContext,
} from '../../../context';
import isEqual from 'react-fast-compare';

export const PSMediaPickerError = React.memo(
  ({height}: {height?: number}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const isMediaPickerShown =
      usePSMediaPickerVisibleContext().isMediaPickerShown;

    const setPhotoError = usePSMediaPickerContext().setPhotoError;

    const {closeMediaPicker} = usePSMediaPickerActionContext();

    const openSettings = React.useCallback(async () => {
      try {
        closeMediaPicker();
        setTimeout(() => {
          Linking.openSettings();
        }, 500);
      } catch (error) {
        psLogger.error('PSMediaPickerError', error);
      }
    }, [closeMediaPicker]);

    React.useEffect(() => {
      if (isMediaPickerShown) {
      } else {
        setPhotoError(false);
      }
    }, [isMediaPickerShown]);

    return (
      <View
        style={[
          styles.errorContainer,
          {
            height: height,
            backgroundColor: colors.Primary.background,
            borderTopColor: colors.Neutral.n200,
          },
        ]}>
        <MemoizeTitle
          textStyle={[
            styles.errorText,
            typography.bodyXLargeR,
            {color: colors.Primary.subText},
          ]}
        />
        <MemoizeMessage
          textStyle={[
            styles.errorButtonText,
            typography.bodyMediumS,
            {color: colors.Branding.b600},
          ]}
          openSettings={openSettings}
        />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeTitle = React.memo(
  ({textStyle}: {textStyle: StyleProp<TextStyle>}) => {
    const {translator} = usePSTranslationContext();
    return (
      <Text style={textStyle}>
        {translator('ps_gallery_permission_description')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeMessage = React.memo(
  ({
    textStyle,
    openSettings,
  }: {
    textStyle: StyleProp<TextStyle>;
    openSettings: () => void;
  }) => {
    const {translator} = usePSTranslationContext();
    return (
      <Text onPress={openSettings} style={textStyle} suppressHighlighting>
        {translator('ps_gallery_permission_allow')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 0.5,
  },
  errorButtonText: {
    marginHorizontal: (24).px(),
    marginTop: (16).px(),
    textAlign: 'center',
  },
  errorText: {
    marginHorizontal: (24).px(),
    marginTop: (16).px(),
    textAlign: 'center',
  },
});
