import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../context';
import {PSIcInformation40} from '../../../icons';
import {PSThreadEntity} from '../../../types';
import {PSTextButton} from '../../PSTextButton';
import {usePSMessageCurrentThreadContext} from '../../messages';
import {
  usePSThreadProfileBlockUserContext,
  usePSThreadProfileBlockUserVisibleContext,
  useThreadProfileInfoContext,
} from '../contexts';
import {
  PSBlockAction,
  PSUserBlockStatus,
} from '@communi/chat-api-client-typescript';

export const BlockUserComfirmDialog = () => {
  const psUserId = usePSMessageCurrentThreadContext()?.partner?.extUserId;

  const blockStatus = usePSMessageCurrentThreadContext()?.blockStatus;

  const chatApiClient = usePSChatApiClientContext();

  const {translator} = usePSTranslationContext();

  const styles = useStylesDialog();

  const {colors} = usePSDesignSystemContext();

  const name = useThreadProfileInfoContext().name;

  const realm = useRealm();

  const {hide} = usePSThreadProfileBlockUserContext();

  const {isVisible} = usePSThreadProfileBlockUserVisibleContext();

  const handleBlockUser = React.useCallback(async () => {
    if (!chatApiClient || !psUserId) return;
    try {
      await chatApiClient.userApi.setBlockUser(psUserId, PSBlockAction.BLOCK);
      realm.write(() => {
        PSThreadEntity.getFirstByPartnerId(realm, psUserId)?.updateBlockStatus(
          PSUserBlockStatus.BLOCKED_BY_ME,
        );
      });
      hide();
    } catch (error) {
      hide();
    }
  }, [chatApiClient, realm, psUserId, blockStatus, hide]);

  const handleOverlayout = React.useCallback(() => {
    hide();
  }, [hide]);

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <TouchableWithoutFeedback onPress={handleOverlayout}>
        <View style={styles.container}>
          <View style={styles.styModal}>
            <View style={styles.column}>
              <PSIcInformation40
                width={40}
                height={40}
                fill={colors.Branding.b500}
              />

              <Text style={styles.styTitle}>
                {translator('ps_thread_profile_block_user')}
              </Text>

              <Text style={styles.styDescription}>
                {translator('ps_thread_profile_block_description_confirm')}
                <Text style={styles.styDescriptionName}>{` ${name} `}</Text>?
              </Text>
            </View>

            <View style={styles.row}>
              <PSTextButton
                text={translator('ps_cancel')}
                onPress={hide}
                textStyle={styles.styTxtButton}
                style={styles.buttonCancel}
              />
              <PSTextButton
                text={translator('ps_thread_profile_block')}
                onPress={handleBlockUser}
                textStyle={[styles.styTxtButton, {color: colors.Neutral.n0}]}
                style={[
                  styles.buttonCancel,
                  styles.buttonConfirm,
                  {borderColor: colors.Negative.normal},
                ]}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
const useStylesDialog = () => {
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
        column: {
          flexDirection: 'column',
          marginBottom: (16).px(),
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
          marginTop: (16).px(),
          marginBottom: (8).px(),
        },
        styDescription: {
          ...typography.bodyXLargeR,
          color: colors.Neutral.n500,
        },
        styDescriptionName: {
          ...typography.headingLargeB,
          color: colors.Neutral.n500,
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
          backgroundColor: colors.Negative.normal,
          borderWidth: 0,
          marginLeft: (8).px(),
        },
        styTxtButton: {
          ...typography.headingLargeM,
          color: colors.Branding.b500,
        },
      }),
    [colors, typography],
  );
};
