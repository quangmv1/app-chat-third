import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';
import {
  usePSSessionNoteContext,
  usePSSessionNoteVisibleContext,
  useThreadDeskProfileActionsContext,
} from '../../contexts';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../../context';
import {PSTextButton} from '../../../../PSTextButton';
import {psLogger} from '../../../../../utils';
import {usePSMessageCurrentThreadIdContext} from '../../../../messages';

export const PSSessionNoteOverlay = () => {
  const {colors, typography} = usePSDesignSystemContext();

  const {translator} = usePSTranslationContext();

  const chatApiClient = usePSChatApiClientContext();

  const {hide} = usePSSessionNoteContext();

  const {isVisible, session} = usePSSessionNoteVisibleContext();

  const {changeSessionNote} = useThreadDeskProfileActionsContext();

  const [isLoading, setLoading] = React.useState(false);

  const [msg, setMsg] = React.useState('');

  const threadId = usePSMessageCurrentThreadIdContext();

  const handleSaveNote = React.useCallback(async () => {
    try {
      if (!chatApiClient || !threadId || !session) {
        return;
      }
      setLoading(true);
      await chatApiClient.sessionApi.setNote(threadId, session.id, msg);
      changeSessionNote(session.id, msg);
    } catch (e) {
      setLoading(false);
      psLogger.error('PSSessionNoteOverlay: handleSaveNote ', e);
    } finally {
      setLoading(false);
      setMsg('');
      hide();
    }
  }, [changeSessionNote, chatApiClient, hide, msg, session, threadId]);

  React.useEffect(() => {
    if (isVisible) {
      session?.note && setMsg(session.note);
    } else {
      setMsg('');
    }
  }, [isVisible]);

  return isVisible ? (
    <Modal
      onBackdropPress={hide}
      isVisible={isVisible}
      onSwipeComplete={hide}
      swipeDirection={['down']}
      style={styles.view}>
      <KeyboardAvoidingView
        behavior="padding"
        style={[
          styles.keyboardAvoidingView,
          {backgroundColor: colors.Primary.background},
        ]}>
        <View style={[styles.container, {backgroundColor: colors.Primary.background}]}>
          <Text
            style={[styles.title, typography.headingMediumS, {color: colors.Primary.subText}]}>
            Note
          </Text>

          <TextInput
            placeholder={translator('ps_session_note_holder')}
            onChangeText={setMsg}
            value={msg}
            multiline={true}
            numberOfLines={5}
            keyboardType={
              Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'
            }
            placeholderTextColor={colors.Neutral.n200}
            style={[
              styles.inputText,
              {borderColor: colors.Neutral.n50},
              typography.bodyXLargeR,
            ]}
          />

          {isLoading ? (
            <ActivityIndicator size="small" color={colors.Primary.branding} />
          ) : (
            <View style={styles.containerButton}>
              <PSTextButton
                text={translator('ps_cancel')}
                textStyle={[typography.headingLargeM, {color: colors.Primary.branding}]}
                style={[styles.button, {borderColor: colors.Primary.branding}]}
                onPress={hide}
              />
              <View style={{width: (16).px()}} />
              <PSTextButton
                text={translator('ps_confirm')}
                textStyle={[typography.headingLargeM, {color: colors.Primary.mainText}]}
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.Primary.branding,
                    borderColor: colors.Primary.branding,
                  },
                ]}
                onPress={handleSaveNote}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  ) : null;
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    borderTopLeftRadius: (16).px(),
    borderTopRightRadius: (16).px(),
  },
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  inputText: {
    alignItems: 'center',
    height: (128).px(),
    width: '100%',
    borderRadius: (12).px(),
    borderWidth: (1).px(),
    textAlignVertical: 'top',
    marginVertical: (12).px(),
    padding: (12).px(),
  },
  container: {
    flexDirection: 'column',
    borderTopLeftRadius: (16).px(),
    borderTopRightRadius: (16).px(),
    padding: (16).px(),
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
  title: {
    alignSelf: 'center',
    marginVertical: (6).px(),
  },
  containerButton: {flexDirection: 'row'},
  button: {
    flex: 1,
    borderWidth: (1).px(),
  },
});
