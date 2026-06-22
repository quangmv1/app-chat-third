import {Platform, StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';
import {
  usePSMediaCollectionActionsOverlayContext,
  usePSMediaCollectionActionsOverlayVisibleContext,
  usePSMediaCollectionNavigationContext,
} from '../contexts';
import {PSFlashMessage} from '../../../components';
import {
  IcLine152Square,
  IcLine15BubbleRectangleArrowRight,
  IcLine15CloudArrowDown,
} from '../../../icons';
import {PSMessageMetadataType} from '@communi/chat-api-client-typescript';
import {
  usePSDesignSystemContext,
  usePSMessageFileSavedContext,
  usePSTranslationContext,
} from '../../../context';
import {setClipboardString} from '../../../utils';
import { ActionItem } from './thread-profile';

export const MediaCollectionActionsOverlay = () => {
  const {translator} = usePSTranslationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const {isVisible, media} = usePSMediaCollectionActionsOverlayVisibleContext();
  const {hide} = usePSMediaCollectionActionsOverlayContext();
  const {onViewMessage} = usePSMediaCollectionNavigationContext();

  const {downloadMessageFile, downLoadMessageMedia} =
    usePSMessageFileSavedContext();

  const downloadImageOrVideoMedia = () => {
    try {
      media && downLoadMessageMedia(media.content.srcUrl);

      hide();
    } catch (error) {
      hide();
    }
  };

  const downloadFileMedia = async () => {
    try {
      media &&
        downloadMessageFile(
          media.content.id,
          media.content.srcUrl,
          media.name ?? '',
        );

      hide();
    } catch (error) {
      hide();
    }
  };

  return isVisible && media !== undefined ? (
    <Modal
      onBackdropPress={hide}
      isVisible={isVisible && media !== undefined}
      onSwipeComplete={hide}
      swipeDirection={['down']}
      style={styles.view}>
      <View
        style={[styles.container, {backgroundColor: colors.Primary.white}]}>
        {media.content.type !== PSMessageMetadataType.FILE && (
          <ActionItem
            title={
              media.content.type === PSMessageMetadataType.PREVIEW_LINK
                ? translator('ps_media_collection_copy_link')
                : 'Download'
            }
            color={colors.Primary.subText}
            textStyle={typography.bodyXLargeR}
            onPress={() => {
              if (media.content.type === PSMessageMetadataType.PREVIEW_LINK) {
                setClipboardString(media.content.srcUrl ?? '');
                PSFlashMessage.show({
                  type: 'success',
                  text1: 'Link copied',
                  position: 'bottom',
                  visibilityTime: 2000,
                });
              } else {
                if (media.content.type === PSMessageMetadataType.FILE) {
                  downloadFileMedia();
                } else {
                  downloadImageOrVideoMedia();
                }
              }
              hide();
            }}>
            {media.content.type === PSMessageMetadataType.PREVIEW_LINK ? (
              <IcLine152Square width={22} height={22} fill={colors.Primary.subText} />
            ) : (
              <IcLine15CloudArrowDown
                width={22}
                height={22}
                fill={colors.Primary.subText}
              />
            )}
          </ActionItem>
        )}

        <ActionItem
          title={translator('ps_media_collection_view_message')}
          color={colors.Primary.subText}
          textStyle={typography.bodyXLargeR}
          onPress={() => {
            hide();
            onViewMessage?.(media.messageId);
          }}>
          <IcLine15BubbleRectangleArrowRight
            width={22}
            height={22}
            fill={colors.Primary.subText}
          />
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
