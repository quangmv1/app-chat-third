import React, {PropsWithChildren} from 'react';
import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Text,
  View,
  TextStyle,
  TextProps,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from './PSDebouncedPressable';
import {PSAvatarImage} from './PSAvatarImage';
import {
  usePSAreaInsetsContext,
  usePSDesignSystemContext,
  usePSThreadUnreadContext,
} from '../context';
import {PSMessages, PSMessagesProps, PSMessagesStyles} from './messages';
import {
  setWindowSoftInputAdjustNothing,
  setWindowSoftInputAdjustPan,
  setWindowSoftInputAdjustResize,
} from '../utils';

export const PSBubbleChatBot = (
  props: PropsWithChildren<{
    floatingButtonProps: PSBubbleChatBotFloatingButtonProps;
    messagesProps: PSMessagesProps;
  }>,
) => {
  return (
    <PSBubbleChatBotPickerProvider>
      {props.children}
      <PSBubbleChatBotFloatingButton
        {...props.floatingButtonProps}
        {...props.messagesProps}
      />
      <PSBubbleChatBotPicker {...props.messagesProps} />
    </PSBubbleChatBotPickerProvider>
  );
};

export type PSBubbleChatBotFloatingButtonProps = {
  text?: string;
  avatarUrl?: string;
  avatar?: React.ReactElement;
  containerStyle?: StyleProp<ViewStyle>;
  avatarBotStyle?: StyleProp<ViewStyle>;
  isTextVisible?: boolean;
  isUnreadVisible?: boolean;
  onPress?: null | (() => void);
  containerTextStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  textProps?: TextProps;
} & PSMessagesProps;

const PSBubbleChatBotFloatingButton = React.memo(
  (props: PSBubbleChatBotFloatingButtonProps) => {
    const {openChatBotPicker} = usePSBubbleChatBotPickerContext();

    const _onPress = () => {
      props.onPress?.();
      openChatBotPicker();
    };

    return (
      <PSDebouncedPressable
        onPress={_onPress}
        style={[styles.floatingButtonContainer, props.containerStyle]}>
        <View style={[styles.avatarBotContainer, props.avatarBotStyle]}>
          {props.avatar ? (
            props.avatar
          ) : (
            <PSAvatarImage
              url={props.avatarUrl}
              displayName="BOT"
              size={(68).px()}
              imageStyle={{borderWidth: undefined, borderColor: undefined}}
            />
          )}
        </View>
        {!props.isUnreadVisible && props.isTextVisible && (
          <PSBubbleChatBotFloatingButtonDot />
        )}
        {props.isUnreadVisible && (
          <PSBubbleChatBotFloatingButtonCount
            targetUserId={props.targetUserId}
            targetThreadId={props.targetThreadId}
          />
        )}
        {props.isTextVisible && props.text && (
          <PSBubbleChatBotFloatingButtonText
            text={props.text}
            containerTextStyle={props.containerTextStyle}
            textStyle={props.textStyle}
            textProps={props.textProps}
          />
        )}
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const PSBubbleChatBotFloatingButtonDot = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const containerStyles = React.useMemo(() => {
    return [
      styles.floatingButtonDot,
      {backgroundColor: colors.Negative.normal},
    ];
  }, [colors.Negative.normal]);

  return <View style={containerStyles} />;
});

const PSBubbleChatBotFloatingButtonCount = React.memo(
  ({
    targetUserId,
    targetThreadId,
  }: {
    targetUserId?: string;
    targetThreadId?: string;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();

    const getUnreadMessageCount =
      usePSThreadUnreadContext().getUnreadMessageCount;

    const countUnread = React.useMemo(() => {
      const count = getUnreadMessageCount({
        userId: targetUserId,
        threadId: targetThreadId,
      });
      return count;
    }, [getUnreadMessageCount]);

    const containerStyles = React.useMemo(() => {
      return [
        styles.floatingButtonDot,
        {backgroundColor: colors.Negative.normal},
      ];
    }, [colors.Negative.normal]);

    if (countUnread)
      return (
        <View style={[containerStyles, styles.styWrapCount]}>
          <Text
            style={[
              typography.headingXSmallM,
              {
                color: colors.Neutral.n0,
                paddingBottom: (5).px(),
                paddingLeft: (1).px(),
                lineHeight: 14,
              },
            ]}>
            {countUnread < 100 ? countUnread : '99+'}
          </Text>
        </View>
      );
    return null;
  },
  (prev, next) => isEqual(prev, next),
);

const PSBubbleChatBotFloatingButtonText = React.memo(
  ({
    text,
    containerTextStyle,
    textStyle,
    textProps,
  }: {
    text: string;
    containerTextStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    textProps?: TextProps;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();

    const containerStyles = React.useMemo(() => {
      return [
        styles.floatingButtonTextContainer,
        {backgroundColor: colors.Primary.background},
        containerTextStyle,
      ];
    }, [colors.Primary.background, containerTextStyle]);

    const textStyles = React.useMemo(() => {
      return [
        typography.bodyMediumR,
        {color: colors.Primary.subText},
        textStyle,
      ];
    }, [colors.Primary.subText, typography.bodyMediumR, textStyle]);

    return (
      <View style={containerStyles}>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={textStyles}
          {...textProps}>
          {text}
        </Text>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const PSBubbleChatBotPicker = React.memo((messagesProps: PSMessagesProps) => {
  const {bottomInset} = usePSAreaInsetsContext();

  const {colors} = usePSDesignSystemContext();

  const windowSize = useWindowDimensions();

  const {isChatBotPickerShown, closeChatBotPicker, bottomSheetRef} =
    usePSBubbleChatBotPickerContext();

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      if (isChatBotPickerShown) {
        setWindowSoftInputAdjustNothing();
      } else {
        setWindowSoftInputAdjustPan();
      }
    }
  }, [isChatBotPickerShown]);

  const messagesStyles = React.useMemo(() => {
    return {
      isFloating: true,
      container: {paddingBottom: bottomInset},
      // hasKeyboardHeightView: false,
    } as PSMessagesStyles;
  }, [bottomInset]);

  return isChatBotPickerShown ? (
    <BottomSheet
      // keyboardBehavior={'interactive'}
      // android_keyboardInputMode={'adjustResize'}
      backgroundStyle={{backgroundColor: colors.Primary.background}}
      ref={bottomSheetRef}
      containerHeight={windowSize.height}
      enablePanDownToClose={true}
      handleHeight={undefined}
      handleComponent={null}
      index={isChatBotPickerShown ? 0 : -1}
      onClose={closeChatBotPicker}
      snapPoints={['90%']}>
      {isChatBotPickerShown ? (
        <PSMessages
          {...messagesProps}
          messagesStyles={messagesStyles}
          onBackPress={closeChatBotPicker}
        />
      ) : null}
    </BottomSheet>
  ) : null;
});

type PSBubbleChatBotPickerContextValue = {
  isChatBotPickerShown: boolean;
  closeChatBotPicker: () => void;
  openChatBotPicker: () => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
};

const PSBubbleChatBotPickerContext = React.createContext(
  {} as PSBubbleChatBotPickerContextValue,
);

const PSBubbleChatBotPickerProvider = (props: PropsWithChildren) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const [isChatBotPickerShown, setChatBotPickerShown] = React.useState(false);

  const isVisibleRef = React.useRef(false);

  const openPicker = React.useCallback(() => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setChatBotPickerShown(true);
    } else {
      return;
    }
    setTimeout(() => {
      const bottomSheet = bottomSheetRef?.current;
      if (bottomSheet) {
        bottomSheet.snapToIndex(0);
      } else {
        isVisibleRef.current = false;
        setChatBotPickerShown(false);
      }
    }, 500); // trick đảm bảo bottomSheetRef != null
  }, []);

  const closePicker = React.useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setChatBotPickerShown(false);
    }
    bottomSheetRef?.current?.close();
  }, []);

  React.useEffect(() => {
    if (!isChatBotPickerShown && isVisibleRef.current) {
      isVisibleRef.current = false;
    }
  }, [isChatBotPickerShown]);

  const contextValue = React.useMemo<PSBubbleChatBotPickerContextValue>(
    () => ({
      isChatBotPickerShown: isChatBotPickerShown,
      openChatBotPicker: openPicker,
      closeChatBotPicker: closePicker,
      bottomSheetRef: bottomSheetRef,
    }),
    [isChatBotPickerShown, openPicker, closePicker],
  );

  return (
    <PSBubbleChatBotPickerContext.Provider value={contextValue}>
      {props.children}
    </PSBubbleChatBotPickerContext.Provider>
  );
};

export const usePSBubbleChatBotPickerContext = () =>
  React.useContext(PSBubbleChatBotPickerContext);

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  floatingButtonTextContainer: {
    marginHorizontal: (12).px(),
    padding: (8).px(),
    borderRadius: (8).px(),
    maxWidth: (226).px(),
  },
  floatingButtonDot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: (16).px(),
    height: (16).px(),
    borderRadius: 999,
    padding: (4).px(),
  },
  avatarBotContainer: {
    width: (68).px(),
    height: (68).px(),
    borderRadius: (68).px() / 2,
    shadowColor: 'black',
    shadowOpacity: 0.35,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
    elevation: 3,
    backgroundColor: 'transparent',
  },
  styWrapCount: {
    justifyContent: 'center',
    alignItems: 'center',
    width: (24).px(),
    height: (24).px(),
  },
});
