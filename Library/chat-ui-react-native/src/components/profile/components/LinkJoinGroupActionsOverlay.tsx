import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';

import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {PSIcReload24, PSIcRevokeLink24} from '../../../icons';
import {usePSLinkJoinGroupActionsContext} from '../contexts';
import {
  usePSLinkJoinGroupOverlayContext,
  usePSLinkJoinGroupOverlayVisibleContext,
} from '../contexts/PSLinkJoinGroupOverlayContext';
import {ActionItem} from './thread-profile';

export const LinkJoinGroupActionsOverlay = () => {
  const {translator} = usePSTranslationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const {isVisible, link} = usePSLinkJoinGroupOverlayVisibleContext();
  const {hide, showConfirmRemoveLink} = usePSLinkJoinGroupOverlayContext();
  const {createInvitationLinks} = usePSLinkJoinGroupActionsContext();

  // const {downloadMessageFile, downLoadMessageMedia} =
  //   usePSMessageFileSavedContext();

  // const downloadImageOrVideoMedia = () => {
  //   try {
  //     media && downLoadMessageMedia(media.content.srcUrl);

  //     hide();
  //   } catch (error) {
  //     hide();
  //   }
  // };

  // const downloadFileMedia = async () => {
  //   try {
  //     media &&
  //       downloadMessageFile(
  //         media.content.id,
  //         media.content.srcUrl,
  //         media.name ?? '',
  //       );

  //     hide();
  //   } catch (error) {
  //     hide();
  //   }
  // };

  return isVisible && link !== undefined ? (
    <Modal
      onBackdropPress={hide}
      isVisible={isVisible && link !== undefined}
      onSwipeComplete={hide}
      swipeDirection={['down']}
      style={styles.view}>
      <View
        style={[styles.container, {backgroundColor: colors.Primary.white}]}>
        <ActionItem
          title={translator('ps_thread_profile_recreate_link_join_group_')}
          color={colors.Primary.subText}
          textStyle={typography.bodyXLargeR}
          onPress={() => {
            hide();
            createInvitationLinks();
          }}>
          <PSIcReload24 width={24} height={24} fill={colors.Primary.subText} />
        </ActionItem>
        <ActionItem
          title={translator('ps_thread_profile_cancel_link_join_group_')}
          color={colors.Primary.subText}
          textStyle={typography.bodyXLargeR}
          onPress={() => {
            hide();
            showConfirmRemoveLink?.();
          }}>
          <PSIcRevokeLink24 width={24} height={24} fill={colors.Primary.subText} />
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
    flexDirection: 'column',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
