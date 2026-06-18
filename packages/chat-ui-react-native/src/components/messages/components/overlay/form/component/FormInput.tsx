import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../../context';

interface InputProps extends TextInputProps {
  label?: string;
  description?: string;
  icon?: React.JSX.Element | null;
  error?: string;
  password?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  labelInput?: string;
  isLong?: boolean;
}

export const FormInput: React.FC<InputProps> = ({
  label,
  description,
  labelInput,
  icon,
  error,
  password,
  required,
  isLong,
  onFocus = () => {},
  onBlur = () => {},
  ...props
}) => {
  const [hidePassword, setHidePassword] = useState(password);
  const [isFocused, setIsFocused] = useState(false);
  const {colors, typography} = usePSDesignSystemContext();
  return (
    <View style={{marginBottom: 20}}>
      {label ? (
        <Text
          style={[
            style.label,
            typography.bodyLargeS,
            {color: colors.Primary.mainText},
          ]}>
          {label}
          {required && <Text style={{color: colors.Negative.normal}}> *</Text>}
        </Text>
      ) : null}
      {description ? (
        <Text
          style={[
            style.label,
            typography.bodyMediumR,
            {color: colors.Primary.subText},
          ]}>
          {description}
        </Text>
      ) : null}
      <View
        style={[
          style.inputContainer,
          {
            borderColor: error
              ? colors.Negative.normal
              : isFocused
                ? colors.Branding.b300
                : colors.Primary.border,
            alignItems: 'center',
            backgroundColor: colors.Primary.white,
          } as ViewStyle,
          isLong ? {height: 140, alignItems: 'flex-start'} : null,
        ]}>
        {labelInput ? (
          <Text
            style={[
              style.label_input,
              typography.bodySmallR,
              {
                color: colors.Primary.subText,
                backgroundColor: colors.Primary.white,
              },
            ]}>
            {labelInput}
          </Text>
        ) : null}
        {icon ?? null}
        <TextInput
          multiline
          autoCorrect={false}
          onFocus={() => {
            onFocus();
            setIsFocused(true);
          }}
          onBlur={() => {
            onBlur();
            setIsFocused(false);
          }}
          underlineColorAndroid="transparent"
          secureTextEntry={hidePassword}
          style={[
            {color: colors.Primary.mainText, flex: 1},
            {
              paddingBottom: 8,
              marginStart: icon ? 8 : 0,
              lineHeight: undefined, // https://github.com/facebook/react-native/issues/33986
            },
            typography.bodyXLargeR,
            isLong ? {height: 140} : null,
          ]}
          textAlignVertical="top"
          placeholderTextColor={colors.Primary.placeHolder}
          {...props}
        />
      </View>
      {error && (
        <Text
          style={[
            {marginTop: 7, color: colors.Negative.normal},
            typography.bodyMediumR,
          ]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  label: {
    marginBottom: 4,
  },
  inputContainer: {
    height: (48).px(),
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8,
    // justifyContent: 'center',
    alignItems: 'center',
  },
  label_input: {
    position: 'absolute',
    top: -8, // Di chuyển label lên trên để nó nằm trên border
    left: 10,
    paddingHorizontal: 5, // Tạo khoảng trắng xung quanh text
  },
});
