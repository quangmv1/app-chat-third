import {Platform, StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';
import {
  usePSChangeThreadAvatarOverlayContext,
  usePSChangeThreadNameDialogContext,
  usePSChangeThreadProfileContext,
  usePSChangeThreadProfileVisibleContext,
} from '../contexts';
import {PSIc2Photo24, IcLine15Pencil} from '../../../icons';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {ActionItem} from './thread-profile';

export const ChangeThreadProfileOverlay = () => {
  const {colors, typography} = usePSDesignSystemContext();

  const {translator} = usePSTranslationContext();

  const {hide} = usePSChangeThreadProfileContext();

  const {isVisible, type} = usePSChangeThreadProfileVisibleContext();

  const {show: showChangeName} = usePSChangeThreadNameDialogContext();

  const {show: showChangeAvatar} = usePSChangeThreadAvatarOverlayContext();

  return isVisible && type !== undefined ? (
    <Modal
      onBackdropPress={hide}
      isVisible={isVisible && type !== undefined}
      onSwipeComplete={hide}
      swipeDirection={['down']}
      style={styles.view}>
      <View
        style={[styles.container, {backgroundColor: colors.Primary.white}]}>
        <ActionItem
          title={translator('ps_thread_profile_rename_group')}
          color={colors.Primary.subText}
          textStyle={typography.bodyXLargeR}
          onPress={() => {
            showChangeName();
            hide();
          }}>
          <IcLine15Pencil width={22} height={22} fill={colors.Primary.subText} />
        </ActionItem>

        <ActionItem
          title={translator('ps_thread_profile_replace_avatar_group')}
          color={colors.Primary.subText}
          textStyle={typography.bodyXLargeR}
          onPress={() => {
            showChangeAvatar();
            hide();
          }}>
          <PSIc2Photo24 width={22} height={22} fill={colors.Primary.subText} />
        </ActionItem>

        {/* <ActionItem title="Remove avatar" color="#E94040" onPress={() => {}}>
          <IcLine15XmarkCircle width={22} height={22} fill={'#E94040'} />
        </ActionItem> */}
      </View>
      {/* {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      )} */}
    </Modal>
  ) : null;
};

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
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
