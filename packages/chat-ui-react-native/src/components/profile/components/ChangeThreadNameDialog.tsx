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
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {PSIcInformation40} from '../../../icons';
import {mapThreadEntityToModel} from '../../../types';
import {psLogger} from '../../../utils';
import {PSTextButton} from '../../PSTextButton';
import {usePSMessageCurrentThreadContext} from '../../messages';
import {useActionThreadsProviderContext} from '../../threads';
import {
  usePSChangeThreadNameDialogContext,
  usePSChangeThreadNameDialogVisibleContext,
} from '../contexts';

export const ChangeThreadNameDialog = () => {
  const thread = usePSMessageCurrentThreadContext();

  const chatApiClient = usePSChatApiClientContext();

  const {translator} = usePSTranslationContext();

  const styles = useStylesChangeThreadNameDialog();

  const {colors} = usePSDesignSystemContext();

  const currentThread = React.useMemo(() => {
    try {
      if (chatApiClient && thread && thread.isValid()) {
        return mapThreadEntityToModel(translator, chatApiClient.userId, thread);
      } else {
        return undefined;
      }
    } catch (error) {
      psLogger.error('ChangeThreadNameDialog: currentThread', error);
      return undefined;
    }
  }, [translator, chatApiClient, thread]);

  const {hide} = usePSChangeThreadNameDialogContext();

  const {isVisible} = usePSChangeThreadNameDialogVisibleContext();

  const [value, setValue] = React.useState(currentThread?.name);

  const {changeNameThread} = useActionThreadsProviderContext();

  const handleChangeInfoThread = React.useCallback(() => {
    if (currentThread && value && value.trim() !== '') {
      hide();
      changeNameThread(currentThread.id, value.trim());
    }
  }, [changeNameThread, currentThread, hide, value]);

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
      setValue(currentThread?.name);
    }
  }, [currentThread?.name, isVisible]);

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <TouchableWithoutFeedback onPress={handleOverlayout}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.select({ios: 'height', android: undefined})}>
          <View style={styles.styModal}>
            <View
              style={[
                styles.row,
                {justifyContent: undefined, alignItems: 'flex-end'},
              ]}>
              <PSIcInformation40
                width={24}
                height={24}
                fill={colors.Branding.b500}
              />
              <Text style={styles.styTitle}>
                {translator('ps_thread_profile_rename_group')}
              </Text>
            </View>
            <TextInput
              value={value}
              multiline
              placeholder={translator('ps_thread_profile_rename_group')}
              onChangeText={setValue}
              style={styles.styTextInput}
              placeholderTextColor={colors.Neutral.n100}
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
                onPress={handleChangeInfoThread}
                textStyle={[styles.styTxtButton, {color: colors.Neutral.n0}]}
                style={[styles.buttonCancel, styles.buttonConfirm]}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
const useStylesChangeThreadNameDialog = () => {
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
          marginStart: (8).px(),
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
