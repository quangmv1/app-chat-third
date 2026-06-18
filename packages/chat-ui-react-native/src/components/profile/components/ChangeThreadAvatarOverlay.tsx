import {Alert, Linking, Platform, StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';
import {
  usePSChangeThreadAvatarOverlayContext,
  usePSChangeThreadAvatarOverlayVisibleContext,
} from '../contexts';
import {PSIc2Photo24, IcFillCamera} from '../../../icons';
import {psLogger, takePhoto, pickPhoto} from '../../../utils';
import {useActionThreadsProviderContext} from '../../threads';
import {usePSMessageCurrentThreadContext} from '../../messages';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {ActionItem} from './thread-profile';

export const ChangeThreadAvatarOverlay = () => {
  const {colors, typography} = usePSDesignSystemContext();

  const {translator} = usePSTranslationContext();

  const {hide} = usePSChangeThreadAvatarOverlayContext();

  const {isVisible} = usePSChangeThreadAvatarOverlayVisibleContext();

  const currentThread = usePSMessageCurrentThreadContext();

  const {changeAvatarThread} = useActionThreadsProviderContext();

  const chooseImage = async () => {
    try {
      const image = await pickPhoto({cropping: true});
      currentThread &&
        image?.uri &&
        changeAvatarThread(currentThread.id, {
          uri: image.uri,
          filename:
            image.name ??
            image.uri.substring(
              image.uri.lastIndexOf('/') + 1,
              image.uri.length,
            ),
          type: 'image',
          width: image.width,
          height: image.height,
        });
      hide();
    } catch (error) {
      psLogger.error('ChangeThreadAvatarOverlay: chooseImage: ', error);
    }
  };

  const openCamera = async () => {
    try {
      const photo = await takePhoto({cropping: true});
      if (photo?.askToOpenSettings) {
        Alert.alert(
          'Allow camera access in device settings',
          'Device camera is used to take photos or videos.',
          [
            {style: 'cancel', text: 'Cancel'},
            {
              onPress: () => Linking.openSettings(),
              style: 'default',
              text: 'Open Settings',
            },
          ],
        );
      }
      if (photo && !photo.cancelled) {
        currentThread &&
          photo?.uri &&
          changeAvatarThread(currentThread.id, {
            uri: photo.uri,
            filename:
              photo.name ??
              photo.uri.substring(
                photo.uri.lastIndexOf('/') + 1,
                photo.uri.length,
              ),
            type: 'image',
            width: photo.width,
            height: photo.height,
          });
      }
      hide();
    } catch (error) {
      psLogger.error('ChangeThreadAvatarOverlay: openCamera: ', error);
    }
  };

  return isVisible ? (
    <Modal
      onBackdropPress={hide}
      isVisible={isVisible}
      onSwipeComplete={hide}
      swipeDirection={['down']}
      style={styles.view}>
      <View
        style={[styles.container, {backgroundColor: colors.Primary.white}]}>
        <ActionItem
          title={translator('ps_thread_profile_choose_photo')}
          color={colors.Primary.subText}
          textStyle={typography.bodyXLargeR}
          onPress={() => {
            chooseImage();
          }}>
          <PSIc2Photo24 width={22} height={22} fill={colors.Primary.subText} />
        </ActionItem>

        <ActionItem
          title={translator('ps_thread_profile_take_photo')}
          color={colors.Primary.subText}
          textStyle={typography.bodyXLargeR}
          onPress={() => {
            openCamera();
          }}>
          <IcFillCamera width={22} height={22} fill={colors.Primary.subText} />
        </ActionItem>
      </View>
    </Modal>
  ) : null;
};

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    borderTopLeftRadius: (16).px(),
    borderTopRightRadius: (16).px(),
    paddingBottom: Platform.select({android: (2).px(), ios: (24).px()}),
  },
  loading: {
    backgroundColor: '#00000099',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
