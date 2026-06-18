import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {useRenderCounter} from '../../../../hooks';
import {PSTextButton} from '../../../PSTextButton';
import {
  usePSMessageAddOptionPollActionContext,
  usePSMessageAddOptionPollContext,
} from '../../contexts';

export const PSMessagePollAddOptionPopUp = React.memo(() => {
  const {translator} = usePSTranslationContext();

  const {colors} = usePSDesignSystemContext();

  const {hide} = usePSMessageAddOptionPollActionContext();

  const {isVisible, addOptionPoll} = usePSMessageAddOptionPollContext();

  const styles = useStylesPSMessagePollAddOptionPopUp();

  const [value, setValue] = React.useState('');

  const handleAddOptionPoll = React.useCallback(() => {
    hide();
    setValue('');
    addOptionPoll(value);
  }, [addOptionPoll, hide, value]);

  const handleOverlayout = React.useCallback(() => {
    const isKeyboard = Keyboard.isVisible();
    if (isKeyboard) {
      Keyboard.dismiss();
      return;
    }
    hide();
  }, [hide]);

  React.useEffect(() => {
    if (!isVisible) {
      setValue('');
    }
  }, [isVisible]);

  useRenderCounter('PSMessageAddOptionPollOverlay');

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <TouchableWithoutFeedback onPress={handleOverlayout}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.select({ios: 'height', android: undefined})}>
          <View style={styles.styModal}>
            <Text style={styles.styTitle}>
              {translator('ps_message_poll_add_option_popup_title')}
            </Text>
            <TextInput
              value={value}
              multiline
              numberOfLines={3}
              placeholder={translator(
                'ps_message_poll_add_option_popup_input_placeholder',
              )}
              onChangeText={setValue}
              style={styles.styTextInput}
              placeholderTextColor={colors.Neutral.n500}
              cursorColor={colors.Branding.b500}
              selectionColor={colors.Branding.b100}
            />
            <View style={styles.row}>
              <PSTextButton
                text={translator('ps_cancel')}
                onPress={hide}
                textStyle={styles.styTxtButton}
                style={styles.buttonCancel}
              />
              <PSTextButton
                text={translator('ps_confirm')}
                onPress={handleAddOptionPoll}
                textStyle={[styles.styTxtButton, {color: colors.Primary.white}]}
                style={[styles.buttonCancel, styles.buttonConfirm]}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const useStylesPSMessagePollAddOptionPopUp = () => {
  const {colors, typography} = usePSDesignSystemContext();

  return React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: `${colors.Neutral.n1000}2f`,
          alignItems: 'center',
          justifyContent: 'center',
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        styModal: {
          borderRadius: (12).px(),
          width: '90%',
          maxWidth: (400).px(),
          backgroundColor: colors.Primary.background,
          padding: (16).px(),
        },
        styTitle: {
          ...typography.headingLargeB,
          color: colors.Primary.subText,
        },
        styTextInput: {
          ...typography.bodyMediumR,
          color: colors.Primary.subText,
          marginVertical: (12).px(),
          borderWidth: (1).px(),
          borderRadius: (12).px(),
          borderColor: colors.Neutral.n500,
          paddingHorizontal: (8).px(),
          textAlignVertical: 'top',
          minHeight: (80).px(),
          maxHeight: (120).px(),
        },
        buttonCancel: {
          borderWidth: (1).px(),
          borderColor: colors.Branding.b500,
          borderRadius: (8).px(),
          flex: 1,
        },
        buttonConfirm: {
          backgroundColor: colors.Branding.b400,
          borderWidth: 0,
          marginLeft: (8).px(),
        },
        styTxtButton: {
          ...typography.bodyMediumR,
          color: colors.Branding.b500,
        },
      }),
    [colors, typography],
  );
};
