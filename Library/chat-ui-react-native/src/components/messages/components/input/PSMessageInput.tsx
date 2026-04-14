import React from 'react';
import isEqual from 'react-fast-compare';
import { Alert, Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSMediaPickerActionContext,
  usePSMediaPickerVisibleContext,
  usePSStickerPickerActionContext,
  usePSStickerPickerVisibleContext,
  useRealm,
} from '../../../../context';
import { PSUserEntity } from '../../../../types/user/entity/PSUserEntity';
import { PSBusEvent, PSEventBus } from '../../../../utils';
import { usePSPSMessageKeyboardAreaContext } from '../../contexts';
import { PSMessageInputAttachmentAddButton } from './PSMessageInputAttachmentAddButton';
import { PSMessageInputChatBotCommandButton } from './PSMessageInputChatBotCommandButton';
import { PSMessageInputEditMessage } from './PSMessageInputEditMessage';
import { PSMessageInputFileUploadPreview } from './PSMessageInputFileUploadPreview';
import { PSMessageInputMediaUploadPreview } from './PSMessageInputMediaUploadPreview';
import { PSMessageInputPreviewLink } from './PSMessageInputPreviewLink';
import { PSMessageInputReplyMessage } from './PSMessageInputReplyMessage';
import { PSMessageInputSendButton } from './PSMessageInputSendButton';
import { PSMessageInputStickerButton } from './PSMessageInputStickerButton';
import { PSMessageTextInput } from './PSMessageTextInput';
import { PSMessageInputAttachmentBar } from './attachment-bar';

export const PSMessageInput =
  // javascript-obfuscator:disable
  React.memo(
    () => {
      const { colors } = usePSDesignSystemContext();

      const translateY = useSharedValue(0);

      const keyboardShown = usePSPSMessageKeyboardAreaContext().keyboardShown;

      const isMediaPickerShown =
        usePSMediaPickerVisibleContext().isMediaPickerShown;

      const { closeMediaPicker } = usePSMediaPickerActionContext();

      const isStickerPickerShown =
        usePSStickerPickerVisibleContext().isStickerPickerShown;

      const { closeStickerPicker } = usePSStickerPickerActionContext();

      const chatApiClient = usePSChatApiClientContext();
      const realm = useRealm();

      const me = PSUserEntity.getFirstByExtUserId(
        realm,
        chatApiClient?.userId || '',
      );

      const handleSwitchProfile = React.useCallback(() => {
        const users = realm.objects<PSUserEntity>(PSUserEntity.schema.name);
        
        // Prepare list for Alert
        const options = users.map(u => ({
          text: u.name || u.userId || 'Unknown',
          onPress: () => {
             console.log('DEBUG: User selected from UI:', u.userId);
             PSEventBus.getInstance().dispatch(PSBusEvent.SWITCH_USER, u.userId);
          }
        })).slice(0, 5); // Limit to 5 for demo

        options.push({ text: 'Cancel', onPress: () => {}, style: 'cancel' } as any);

        Alert.alert(
          'Switch Profile',
          'Choose a profile to switch to:',
          options as any
        );
      }, [realm]);

      const disableKeyboard = React.useCallback(() => {
        if (keyboardShown) Keyboard.dismiss();
        if (isMediaPickerShown) closeMediaPicker();
        if (isStickerPickerShown) closeStickerPicker();
      }, [
        keyboardShown,
        isMediaPickerShown,
        isStickerPickerShown,
        closeMediaPicker,
        closeStickerPicker,
      ]);

      const stylesPanGestureHandler = useAnimatedStyle(() => {
        return {
          transform: [
            {
              translateY: translateY.value,
            },
          ],
        };
      });

      const handler = useAnimatedGestureHandler({
        onStart: (_evt: any, ctx: { y: any }) => {
          ctx.y = translateY.value;
        },

        onActive: (evt: { translationY: any }, ctx: { y: any }) => {
          const nextTranslate = evt.translationY + ctx.y;
          if (!keyboardShown && !isMediaPickerShown && !isStickerPickerShown)
            return;
          translateY.value = Math.max(0, nextTranslate);
          if (nextTranslate > 5) runOnJS(disableKeyboard)();
        },

        onEnd: (evt: { velocityY: number }) => {
          translateY.value = 0;
        },
      });

      return (
        <PanGestureHandler
          hitSlop={{ horizontal: 60 }}
          activeOffsetY={[-30, 30]}
          onGestureEvent={handler}>
          <Animated.View
            hitSlop={{ top: 10 }}
            style={[
              styles.container,
              { borderTopColor: colors.Primary.border },
              stylesPanGestureHandler,
            ]}>
            <PSMessageInputPreviewLink />
            <PSMessageInputEditMessage />
            <PSMessageInputReplyMessage />

            <PSMessageInputMediaUploadPreview />
            <PSMessageInputFileUploadPreview />
            <TouchableOpacity onPress={handleSwitchProfile}>
              <Text style={{ marginHorizontal: (12).px(), color: colors.Primary.branding }}>
                {me?.name || 'Profile (Click to switch)'}
              </Text>
            </TouchableOpacity>


            <View
              style={[
                styles.inputRowContainer,
                { backgroundColor: colors.Primary.white },
              ]}>

              <PSMessageInputAttachmentAddButton
                containerStyle={styles.buttonInRow}
              />
              <View
                style={[
                  styles.textInputContainer,
                  {
                    // backgroundColor: 'blue',
                    borderColor: colors.Primary.linerBorder,
                  },
                ]}>
                <PSMessageInputChatBotCommandButton
                  containerStyle={styles.buttonInRow}
                />



                <PSMessageTextInput />

                <PSMessageInputStickerButton
                  containerStyle={[styles.buttonSticker, styles.buttonInRow]}
                />
                <PSMessageInputSendButton containerStyle={styles.buttonInRow} />
              </View>
            </View>
            <PSMessageInputAttachmentBar />
          </Animated.View>
        </PanGestureHandler>
      );
    },
    (prev, next) => isEqual(prev, next),
  );

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: (0.3).px(),
  },
  inputRowContainer: {
    flexDirection: 'row',
    paddingVertical: (8).px(),
    // paddingTop: (4).px(),
    paddingHorizontal: (12).px(),
    alignItems: 'flex-end',
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    // alignItems: 'center',
    // paddingHorizontal: (8).px(),
    padding: (8).px(),
    alignItems: 'flex-end',
    borderRadius: (12).px(),
    borderWidth: (1).px(),
  },
  buttonInRow: {
    marginBottom: Platform.select({ android: (4).px(), default: undefined }),
    // marginBottom: (8).px(),
    // backgroundColor: 'green',
  },
  buttonSticker: {
    marginHorizontal: (8).px(),
  },
});
