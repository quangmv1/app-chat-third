import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  usePSDesignSystemContext,
  usePSMediaPickerVisibleContext,
  usePSTranslationContext,
} from '../../../../../context';
import { PSMessgeInputAttachmentChipButton } from './PSMessgeInputAttachmentChipButton';
import {
  usePSMessageCurrentThreadContext,
  usePSMessageInputCameraContext,
  usePSMessageInputFileContext,
  usePSMessageInputPollContext,
  usePSMessageImagePickerContext,
  usePSPSMessageKeyboardAreaContext,
  usePSMessageInputAttachmentContext,
  PSMessageInputAttachmentItemType
} from '../../../contexts';
import { PSThreadType } from '@communi/chat-api-client-typescript';
import PSIcGallery24 from '../../../../../icons/new_icon/PSIcGallery24';
import PSIc2Camera24 from '../../../../../icons/new_icon/PSIc2Camera24';
import PSIc2Attachment24 from '../../../../../icons/new_icon/PSIc2Attachment24';
import PSIcPoll24 from '../../../../../icons/new_icon/PSIcPoll24';
import { PSIcAttachment24 } from '../../../../../icons';

export const PSMessageInputAttachmentBar = React.memo(() => {
  const { colors } = usePSDesignSystemContext();

  const { isMediaPickerShown } = usePSMediaPickerVisibleContext();

  const { keyboardShown } = usePSPSMessageKeyboardAreaContext();

  const { inputAttachmentItems } = usePSMessageInputAttachmentContext();


  const containerStyles = React.useMemo(() => {
    return [
      styles.scrollView,
      styles.container,
      {
        backgroundColor: colors.Primary.white,
      },
    ];
  }, [colors.Primary.white]);


  const shouldShowAttachBar = isMediaPickerShown && !keyboardShown;

  if (!shouldShowAttachBar) {
    return null;
  }

  return !inputAttachmentItems() || inputAttachmentItems()?.length === 0 ? (
    <View
      style={containerStyles}>
      <PSMessgeInputAttachmentGallery />
      <PSMessgeInputAttachmentCamera />
      <PSMessgeInputAttachmentFile />
      <PSMessgeInputAttachmentPoll />
    </View>
  )
    : <View style={containerStyles}>
      {inputAttachmentItems()?.map((item, index) => {
        switch (item.type) {
          case PSMessageInputAttachmentItemType.GALLERY:
            return <PSMessgeInputAttachmentGallery key={index} />;
          case PSMessageInputAttachmentItemType.CAMERA:
            return <PSMessgeInputAttachmentCamera key={index} />;
          case PSMessageInputAttachmentItemType.FILE:
            return <PSMessgeInputAttachmentFile key={index} />;
          case PSMessageInputAttachmentItemType.POLL:
            return <PSMessgeInputAttachmentPoll key={index} />;
          default:
            return <PSMessgeInputAttachmentChipButton
              key={index}
              text={item?.label ?? ''}
              Icon={item?.icon ?? PSIcAttachment24}
              onPress={item.onPress}
            />;
        }
      })}
    </View>;
});


const PSMessgeInputAttachmentGallery = () => {
  const { translator } = usePSTranslationContext();
  const onImagePickerPress = usePSMessageImagePickerContext();

  return (
    <PSMessgeInputAttachmentChipButton
      text={translator('ps_attachment_gallery')}
      Icon={PSIcGallery24}
      // isActivated
      onPress={onImagePickerPress}
    />
  )
}

const PSMessgeInputAttachmentCamera = () => {
  const { translator } = usePSTranslationContext();
  const onOpenCameraPress = usePSMessageInputCameraContext();

  return (
    <PSMessgeInputAttachmentChipButton
      text={translator('ps_attachment_camera')}
      Icon={PSIc2Camera24}
      containerStyle={styles.chip}
      onPress={onOpenCameraPress}
    />
  )
}

const PSMessgeInputAttachmentFile = () => {
  const { translator } = usePSTranslationContext();
  const { openFileManager } = usePSMessageInputFileContext();

  return (
    <PSMessgeInputAttachmentChipButton
      text={translator('ps_attachment_file')}
      Icon={PSIc2Attachment24}
      containerStyle={styles.chip}
      onPress={openFileManager}
    />
  )
}

const PSMessgeInputAttachmentPoll = () => {
  const { translator } = usePSTranslationContext();
  const { openCreatePoll } = usePSMessageInputPollContext();
  const currentThread = usePSMessageCurrentThreadContext();

  return (
    <>
      {currentThread?.type === PSThreadType.GROUP ? (
        <PSMessgeInputAttachmentChipButton
          text={translator('ps_attachment_poll')}
          Icon={PSIcPoll24}
          containerStyle={styles.chip}
          onPress={openCreatePoll}
        />

      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: (6).px(),
    // paddingBottom: (6).px(),
    paddingHorizontal: (12).px(),
  },
  contentContainerStyle: {
    marginHorizontal: (12).px(),
  },
  chip: {
    // marginStart: (12).px(),
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  }
});
