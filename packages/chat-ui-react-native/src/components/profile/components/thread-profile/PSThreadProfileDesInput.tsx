import React, {useCallback, useEffect, useRef} from 'react';
import {
  DeviceEventEmitter,
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextStyle,
} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSRichText} from '../../../PSRichText';
import {usePSDescriptionInputTextContext} from '../../contexts/PSThreadProfileDesInputContext';
import {LIMIT_CHARACTER} from './PSThreadProfileDescription';

type PropsPSMessageTextInput = {
  value: string;
  styleTextInput?: StyleProp<TextStyle>;
};

export const PSThreadProfileDesInput = React.memo(
  ({styleTextInput, value}: PropsPSMessageTextInput) => {
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const textInputRef = useRef<TextInput>(null);

    const {
      text,
      mentionIds,
      textInputValue,
      onChangeText,
      setInitTextInputValue,
      handleSelectionChange,
    } = usePSDescriptionInputTextContext();

    useEffect(() => {
      setInitTextInputValue(value);
      textInputRef.current?.focus();
    }, [value]);

    const textStyles = React.useMemo(() => {
      return [
        styles.input,
        typography.bodyXXLargeR,
        {
          color: colors.Primary.subText,
          lineHeight: undefined,
        },
      ];
    }, [colors.Primary.subText, typography.bodyXXLargeR]);

    const richTextStyles = React.useMemo(() => {
      return [typography.bodyXXLargeR, {color: colors.Branding.b600}];
    }, [colors.Branding.b600, typography.bodyXXLargeR]);

    const onContentSizeChange = useCallback(
      (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
        DeviceEventEmitter.emit('ON_CONTENT_CHANGE_SIZE_DESCRIPTION', {
          width: e.nativeEvent.contentSize.width,
          height: e.nativeEvent.contentSize.height,
        });
      },
      [],
    );

    return (
      <>
        <TextInput
          autoCorrect={false}
          editable
          multiline
          // maxLength={LIMIT_CHARACTER}
          enablesReturnKeyAutomatically
          ref={textInputRef}
          scrollEnabled={true}
          underlineColorAndroid="transparent"
          style={[textStyles, styleTextInput]}
          placeholder={translator('ps_message_input_placeholder')}
          placeholderTextColor={colors.Neutral.n200}
          onSelectionChange={handleSelectionChange}
          onContentSizeChange={onContentSizeChange}
          onChangeText={onChangeText}>
          <PSRichText
            text={text}
            mentionEnabled
            urlEnabled
            emailEnabled
            mentionIds={mentionIds}
            parentStyle={{color: colors.Primary.subText}}
            mentionStyle={richTextStyles}
            urlStyle={richTextStyles}
            emailStyle={richTextStyles}
            phoneNumberStyle={richTextStyles}
            hashtagStyle={richTextStyles}
          />
        </TextInput>
        <Text
          style={[
            typography.bodyMediumM,
            {
              color:
                textInputValue.length > LIMIT_CHARACTER
                  ? colors.Negative.normal
                  : colors.Neutral.n500,
            },
            styles.styTxtLimit,
          ]}>
          {textInputValue.length > LIMIT_CHARACTER
            ? translator('ps_warning_limit_character')
            : `${textInputValue.length}/${LIMIT_CHARACTER}`}
        </Text>
      </>
    );
  },
);

const styles = StyleSheet.create({
  input: {
    flex: 1,
    width: '100%',
    minHeight: (24).px(),
    maxHeight: (100).px(),
    alignItems: 'center',
    paddingVertical: (6).px(),
    textAlignVertical: 'top',
    includeFontPadding: false,
  },
  styTxtLimit: {
    textAlign: 'right',
    marginTop: (8).px(),
    lineHeight: undefined,
  },
});
