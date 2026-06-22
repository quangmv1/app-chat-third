import React from 'react';
import Toast, {
  ToastShowParams,
  BaseToast,
  SuccessToast,
  InfoToast,
  ErrorToast,
  BaseToastProps,
  ToastProps,
} from 'react-native-toast-message';
import {PSAvatarImage} from '../PSAvatarImage';
import {Platform, StyleSheet} from 'react-native';
import {usePSAreaInsetsContext, usePSDesignSystemContext} from '../../context';
import {addKeyboardListener, removeKeyboardListener} from '../../utils';
import {PSAvatarSubThread} from '../PSAvatarSubThread';
import {
  IcFillCheckMarkCircle,
  PSIcMessageError12,
  PSIcWarning24,
} from '../../icons';

export type PSToastProps = BaseToastProps;

export type PSFlashMessageProps = {
  sizeAvatar?: number;
} & BaseToastProps &
  ToastProps;

export const PSFlashMessage = ({
  propsFlashMessage,
  propsErrorToast,
  propsSuccessToast,
}: {
  propsFlashMessage?: PSFlashMessageProps;
  propsErrorToast?: PSToastProps;
  propsSuccessToast?: PSToastProps;
}) => {
  const {colors, typography} = usePSDesignSystemContext();

  const propsSuccessToastDefault = React.useMemo(() => {
    return {
      text1Style: [
        {
          color: '#FFFFFF',
        },
        typography.bodyMediumM,
      ],
      renderLeadingIcon: () => (
        <IcFillCheckMarkCircle
          width={(24).px()}
          height={(24).px()}
          fill={'#FFFFFF'}
        />
      ),
      style: {
        borderLeftColor: undefined,
        borderLeftWidth: undefined,
        elevation: undefined,
        shadowColor: undefined,
        shadowOffset: undefined,
        shadowOpacity: undefined,
        shadowRadius: undefined,
        borderRadius: (8).px(),
        backgroundColor: '#19C273',
        alignItems: 'center',
        marginHorizontal: (12).px(),
        width: (404).px(),
        height: (56).px(),
        padding: (12).px(),
      },
      contentContainerStyle: {
        paddingHorizontal: (10).px(),
      },
    } as PSToastProps;
  }, [typography.bodyMediumM]);

  const propsErrorToastDefault = React.useMemo(() => {
    return {
      text1Style: [
        {
          color: '#F45252',
        },
        typography.bodyMediumM,
      ],
      renderLeadingIcon: () => (
        <PSIcWarning24 width={(24).px()} height={(24).px()} />
      ),
      style: {
        borderLeftColor: undefined,
        borderLeftWidth: undefined,
        elevation: undefined,
        shadowColor: undefined,
        shadowOffset: undefined,
        shadowOpacity: undefined,
        shadowRadius: undefined,
        borderRadius: (8).px(),
        backgroundColor: '#FEEEEE',
        alignItems: 'center',
        marginHorizontal: (12).px(),
        width: (404).px(),
        // height: (56).px(),
        padding: (12).px(),
        height: undefined,
        minHeight: (56).px(),
      },
      contentContainerStyle: {
        paddingHorizontal: (10).px(),
      },
      text1NumberOfLines: 2,
    } as PSToastProps;
  }, [typography.bodyMediumM]);

  const success = React.useCallback(
    (props?: BaseToastProps) => {
      return (
        <SuccessToast
          {...props}
          {...propsSuccessToastDefault}
          {...propsSuccessToast}
        />
      );
    },
    [propsSuccessToastDefault, propsSuccessToast],
  );

  const info = React.useCallback((props?: BaseToastProps) => {
    return <InfoToast {...props} />;
  }, []);

  const error = React.useCallback(
    (props?: BaseToastProps) => {
      return (
        <ErrorToast
          {...props}
          {...propsErrorToastDefault}
          {...propsErrorToast}
        />
      );
    },
    [propsErrorToastDefault, propsErrorToast],
  );

  const flashMessage = React.useCallback(
    ({
      props,
      onPress,
    }: {
      props?: {
        text1: string;
        text2: string;
        displayName: string;
        urlAvatar: string;
        isSubThread?: boolean;
      };
      onPress?: () => void;
    }) => {
      return (
        <BaseToast
          onPress={onPress}
          style={[
            styles.container,
            {
              backgroundColor: colors.Primary.white,
              borderLeftColor: colors.Branding.b600,
              shadowColor: colors.Neutral.n1000,
            },
            propsFlashMessage?.style,
          ]}
          text1NumberOfLines={propsFlashMessage?.text1NumberOfLines ?? 1}
          text2NumberOfLines={propsFlashMessage?.text2NumberOfLines ?? 1}
          contentContainerStyle={
            propsFlashMessage?.contentContainerStyle ??
            styles.contentContainerStyle
          }
          text1={props?.text1}
          text2={props?.text2}
          text1Style={[
            {color: colors.Primary.mainText},
            typography.bodyXXLargeS,
            propsFlashMessage?.text1Style,
          ]}
          text2Style={[
            {color: colors.Primary.subText},
            typography.bodyXLargeR,
            propsFlashMessage?.text2Style,
          ]}
          renderLeadingIcon={() =>
            props?.isSubThread ? (
              <PSAvatarSubThread
                displayName={props?.displayName ?? ''}
                url={props?.urlAvatar ?? ''}
              />
            ) : (
              <PSAvatarImage
                imageStyle={styles.avatar}
                displayName={props?.displayName}
                url={props?.urlAvatar}
                size={propsFlashMessage?.sizeAvatar ?? 44}
              />
            )
          }
        />
      );
    },
    [
      colors.Neutral.n500,
      colors.Primary.subText,
      colors.Neutral.n1000,
      colors.Neutral.n0,
      colors.Branding.b600,
      typography.bodyMediumR,
      typography.headingMediumS,
      propsFlashMessage,
    ],
  );

  const config = React.useMemo(() => {
    return {
      success: success,
      info: info,
      error: error,
      flashMessage: flashMessage,
    };
  }, [error, flashMessage, info, success]);

  const [keyboardHeight, setKeyboardHeight] = React.useState(360);

  const {bottomInset} = usePSAreaInsetsContext();

  React.useEffect(() => {
    const keyboardAreaHeightChanged = (height: number) => {
      setKeyboardHeight(
        Platform.select({
          ios: height - 37 + bottomInset,
          default: height,
        }),
      );
    };
    addKeyboardListener(keyboardAreaHeightChanged);
    return () => {
      removeKeyboardListener(keyboardAreaHeightChanged);
    };
  }, [bottomInset]);

  return (
    <Toast
      config={config}
      topOffset={Platform.select({android: (50).px(), ios: (110).px()})}
      bottomOffset={Platform.select({android: (70).px(), ios: (100).px()})}
      keyboardOffset={Platform.select({
        android: (70).px() + keyboardHeight,
        ios: (65).px(),
      })}
      {...propsFlashMessage}
      // autoHide={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '90%',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 12,
    shadowOpacity: 0.4,
    elevation: 3,
  },
  contentContainerStyle: {paddingHorizontal: (12).px()},
  avatar: {marginLeft: (12).px()},
});

PSFlashMessage.show = (params: ToastShowParams) => Toast.show(params);

PSFlashMessage.hide = (params?: void) => Toast.hide(params);
