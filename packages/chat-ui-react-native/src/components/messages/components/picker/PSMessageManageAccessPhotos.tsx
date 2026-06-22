import React, {PropsWithChildren} from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import isEqual from 'react-fast-compare';
import {iOS14RefreshGallerySelection, psLogger} from '../../../../utils';

const ActionItem = React.memo(
  ({
    children,
    title,
    color,
    textStyle,
    style,
    onPress,
  }: PropsWithChildren<{
    title: string;
    color?: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
    onPress?: null | (() => void);
  }>) => {
    return (
      <Pressable
        onPress={onPress}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            padding: (12).px(),
          },
          style,
        ]}>
        {children}
        <Text
          numberOfLines={1}
          style={[
            {color: color ?? '#26282C', marginLeft: (12).px()},
            textStyle,
          ]}>
          {title}
        </Text>
      </Pressable>
    );
  },
);

export const PSMessageManageAccessPhotos = React.memo(
  ({isVisible, toggleModal}: {isVisible: boolean; toggleModal: () => void}) => {
    const {translator} = usePSTranslationContext();

    const styles = useStylesManageAccessPhotosOverlay();

    const onSelectMorePressed = React.useCallback(async () => {
      try {
        toggleModal();
        setTimeout(() => {
          iOS14RefreshGallerySelection();
        }, 500);
      } catch (error) {
        psLogger.error(
          'PSMessageManageAccessPhotos onSelectMorePressed: ',
          error,
        );
      }
    }, [toggleModal]);

    const onChangeSettingsPressed = React.useCallback(async () => {
      try {
        toggleModal();
        setTimeout(() => {
          Linking.openSettings();
        }, 500);
      } catch (error) {
        psLogger.error(
          'PSMessageManageAccessPhotos onChangeSettingsPressed: ',
          error,
        );
      }
    }, [toggleModal]);

    return (
      <Modal
        onBackdropPress={toggleModal}
        isVisible={isVisible}
        onSwipeComplete={toggleModal}
        swipeDirection={['down']}
        style={styles.view}>
        <View style={styles.container}>
          <ActionItem
            title={translator('ps_gallery_select_more')}
            textStyle={styles.styTxtDelete}
            style={styles.styActionItem}
            onPress={onSelectMorePressed}
          />
          <ActionItem
            title={translator('ps_change_settings')}
            textStyle={styles.styTxtDelete}
            style={{padding: (2).px(), flexDirection: 'column'}}
            onPress={onChangeSettingsPressed}
          />
        </View>

        <View style={styles.container}>
          <ActionItem
            title={translator('ps_cancel')}
            textStyle={styles.styTxtCancel}
            onPress={toggleModal}
            style={{flexDirection: 'column'}}
          />
        </View>
      </Modal>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const useStylesManageAccessPhotosOverlay = () => {
  const {colors, typography} = usePSDesignSystemContext();

  return React.useMemo(
    () =>
      StyleSheet.create({
        view: {
          justifyContent: 'flex-end',
          margin: 0,
        },
        container: {
          borderRadius: (12).px(),
          padding: (5).px(),
          backgroundColor: colors.Primary.background,
          marginHorizontal: (16).px(),
          marginBottom: (16).px(),
        },
        styTxtCancel: {
          ...typography.headingLargeM,
          color: colors.Branding.b400,
        },
        styTxtDelete: {
          ...typography.headingLargeM,
          color: colors.Branding.b400,
          marginVertical: (16).px(),
        },

        styActionItem: {
          flexDirection: 'column',
          borderBottomWidth: 1,
          borderBottomColor: colors.Neutral.n50,
          padding: (0).px(),
          width: '100%',
        },
      }),
    [colors, typography],
  );
};
