import React from 'react';
import {StyleSheet, TextInput} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../context';
import {useRenderCounter} from '../../../../hooks';
import {PSThreadDraftEntity} from '../../../../types';
import {PSRichText} from '../../../PSRichText';
import {
  usePSMessageCurrentThreadIdContext,
  usePSMessageInputRefContext,
  usePSMessageInputTextContext,
  usePSMessageIsSubthreadContext,
  usePSMessagePreviewLinkActionContext,
} from '../../contexts';

export const PSMessageTextInput = React.memo(() => {
  const {translator} = usePSTranslationContext();

  const {typography, colors} = usePSDesignSystemContext();

  const textInputRef = usePSMessageInputRefContext();

  const isSubthread = usePSMessageIsSubthreadContext();

  const threadId = usePSMessageCurrentThreadIdContext() ?? '';

  const {text, mentionIds, onChangeText, handleSelectionChange} =
    usePSMessageInputTextContext();

  const realm = useRealm();

  const myTime = React.useRef<any>();

  const handleSaveDraftContent = React.useCallback(() => {
    clearTimeout(myTime.current);
    myTime.current = setTimeout(() => {
      realm.write(() => {
        PSThreadDraftEntity.createOrUpdate(
          realm,
          PSThreadDraftEntity.mapToEntity(threadId, text, mentionIds),
        );
      });
    }, 650);
  }, [realm, threadId, text, mentionIds]);

  const {setUrlsToFetchPreviewLink} = usePSMessagePreviewLinkActionContext();

  const onUrlsParsed = React.useCallback(
    (urls: string[]) => {
      setUrlsToFetchPreviewLink(urls);
    },
    [setUrlsToFetchPreviewLink],
  );

  useRenderCounter('PSMessageTextInput');

  const textStyles = React.useMemo(() => {
    return [
      styles.input,
      typography.bodyXXXLargeR,
      {
        color: colors.Primary.mainText,
        lineHeight: undefined, // https://github.com/facebook/react-native/issues/33986
      },
    ];
  }, [colors.Primary.mainText, typography.bodyXXXLargeR]);

  const richTextStyles = React.useMemo(() => {
    return [typography.bodyXXXLargeR, {color: colors.Primary.branding}];
  }, [colors.Primary.branding, typography.bodyXXXLargeR]);

  return (
    <TextInput
      autoCorrect={false}
      editable
      multiline
      enablesReturnKeyAutomatically
      ref={textInputRef}
      scrollEnabled={true}
      underlineColorAndroid="transparent"
      style={textStyles}
      placeholder={translator(
        isSubthread
          ? 'ps_comment_input_placeholder'
          : 'ps_message_input_placeholder',
      )}
      placeholderTextColor={colors.Primary.disable}
      onSelectionChange={e => {
        handleSelectionChange(e);
        handleSaveDraftContent();
      }}
      onChangeText={onChangeText}
      onBlur={handleSaveDraftContent}>
      <PSRichText
        // enableLog
        text={text}
        mentionEnabled
        urlEnabled
        emailEnabled
        mentionIds={mentionIds}
        parentStyle={{color: colors.Primary.mainText}}
        mentionStyle={richTextStyles}
        urlStyle={richTextStyles}
        emailStyle={richTextStyles}
        phoneNumberStyle={richTextStyles}
        hashtagStyle={richTextStyles}
        onUrlsParsed={onUrlsParsed}
      />
    </TextInput>
  );
});

const styles = StyleSheet.create({
  input: {
    flex: 1,
    width: '100%',
    minHeight: (24).px(),
    maxHeight: (100).px(),
    alignItems: 'center',
    paddingVertical: (6).px(),
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
