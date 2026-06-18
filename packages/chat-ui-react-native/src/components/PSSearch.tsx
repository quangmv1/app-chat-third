import React from 'react';
import {
  StyleSheet,
  StyleProp,
  View,
  TextInput,
  ViewStyle,
  Text,
  TextStyle,
  ColorValue,
  GestureResponderEvent,
} from 'react-native';
import {IcLine15MagnifyingglassSearch as IcSearch} from '../icons/IcLine15MagnifyingglassSearch';
import isEqual from 'react-fast-compare';
import {usePSDesignSystemContext, usePSTranslationContext} from '../context';
import {PSIcClose24} from '../icons';
import {PSDebouncedPressable} from './PSDebouncedPressable';

type PSSearchProps = {
  value?: string;
  placeholder?: string;
  placeholderTextColor?: ColorValue;
  onChangeText?: (text: string) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  editable?: boolean;
  numberOfLines?: number;
  searchIconColor?: ColorValue;
  autoFocus?: boolean;
  onCleanPress?: null | ((event: GestureResponderEvent) => void);
  isVisibleClean?: boolean;
};

export const PSSearch = React.memo(
  ({
    value,
    placeholder,
    placeholderTextColor,
    onChangeText,
    style,
    textStyle,
    editable = true,
    searchIconColor,
    autoFocus,
    onCleanPress,
    isVisibleClean,
  }: PSSearchProps) => {
    const {colors, typography} = usePSDesignSystemContext();
    const {translator} = usePSTranslationContext();
    const [isActive, setActive] = React.useState(false);

    return (
      <View
        style={[
          styles.container,
          {
            borderColor: isActive
              ? colors.Primary.branding
              : colors.Primary.border,
            backgroundColor: colors.Primary.white,
          },
          style,
        ]}>
        <IcSearch
          width={(24).px()}
          height={(24).px()}
          fill={searchIconColor ?? '#808080'}
        />
        {editable ? (
          <TextInput
            style={[
              styles.textInput,
              {
                color: colors.Primary.mainText,
              },
              typography.bodyXLargeR,
              textStyle,
              {
                lineHeight: undefined, // https://github.com/facebook/react-native/issues/33986
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            underlineColorAndroid="transparent"
            value={value}
            onChangeText={onChangeText}
            multiline={false}
            numberOfLines={1}
            autoFocus={autoFocus ?? false}
            onFocus={() => {
              setActive(true);
            }}
            onBlur={() => {
              setActive(false);
            }}
          />
        ) : (
          <Text
            numberOfLines={1}
            style={[
              styles.textInput,
              textStyle,
              {color: placeholderTextColor ?? colors.Neutral.n200},
            ]}>
            {placeholder}
          </Text>
        )}
        {editable && !!onCleanPress && isVisibleClean && (
          <PSDebouncedPressable onPress={onCleanPress}>
            {/* <PSIcClose24
              width={(24).px()}
              height={(24).px()}
              fill={searchIconColor ?? '#808080'}
            /> */}
            <Text
              style={[typography.bodyMediumR, {color: colors.Primary.disable}]}>
              {translator('ps_clean')}
            </Text>
          </PSDebouncedPressable>
        )}
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: (12).px(),
    padding: (10).px(),
    borderWidth: (1).px(),
  },
  textInput: {
    flex: 1,
    marginStart: (8).px(),
    textAlignVertical: 'center',
    padding: 0,
  },
});
