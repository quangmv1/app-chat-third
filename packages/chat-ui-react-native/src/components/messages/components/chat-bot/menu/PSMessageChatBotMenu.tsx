import React, {Fragment} from 'react';
import isEqual from 'react-fast-compare';
import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {
  PSIcMessageQuestion24,
  PSIcQuickLeft24,
  PSIcRightSmall24,
} from '../../../../../icons';
import {PSSpacer} from '../../../../PSSpacer';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {PSMessageChatBotMenuModel} from '../../../../../types';
import {
  usePSMessageInputReplyChatBotContext,
  usePSMessageNavigationContext,
} from '../../../contexts';
import {PSMessageMetadataChatBotButtonActionType} from '@communi/chat-api-client-typescript';

export const PSMessageChatBotMenu = React.memo(
  ({menu}: {menu: PSMessageChatBotMenuModel}) => {
    const replyChatBot = usePSMessageInputReplyChatBotContext();
    const {onChatBotActionPress} = usePSMessageNavigationContext();

    const [backStack, setBackStack] = React.useState<
      PSMessageChatBotMenuModel[]
    >([]);

    const data = React.useMemo<PSMessageChatBotMenuModel>(() => {
      return backStack[backStack.length - 1] ?? menu;
    }, [menu, backStack]);

    const onHeaderPress = React.useCallback(() => {
      setBackStack(prev => {
        if (prev.length) {
          return prev.splice(0, prev.length - 1);
        } else {
          return prev;
        }
      });
    }, []);

    const onOptionPress = React.useCallback(
      (item: PSMessageChatBotMenuModel) => {
        if (item.chidren && item.chidren.length) {
          setBackStack(prev => [...prev, item]);
        } else if (item.action) {
          switch (item.action.type) {
            case PSMessageMetadataChatBotButtonActionType.URI:
              onChatBotActionPress?.(
                item.action.payload,
                item.label,
                item.action.payload,
              );
              break;
            case PSMessageMetadataChatBotButtonActionType.POST_BACK:
            case PSMessageMetadataChatBotButtonActionType.MESSAGE:
              replyChatBot(item.label, item.action.payload);
              onChatBotActionPress?.(
                undefined,
                item.label,
                item.action.payload,
              );
              break;
          }
        }
      },
      [onChatBotActionPress, replyChatBot],
    );

    return (
      <Fragment>
        <Header
          text={data.label}
          onPress={onHeaderPress}
          canBack={backStack.length > 0}
        />
        {data.chidren?.map((element, index) => {
          return (
            <Fragment key={index}>
              <Menu
                key={`Option-${index}`}
                menu={element}
                onPress={onOptionPress}
              />
              <Divider key={`Divider-${index}`} />
            </Fragment>
          );
        })}
      </Fragment>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const Header = React.memo(
  ({
    text,
    canBack,
    onPress,
  }: {
    text: string;
    canBack?: boolean;
    onPress: () => void;
  }) => {
    const {typography, colors} = usePSDesignSystemContext();

    const containerStyles = React.useMemo(() => {
      return [styles.headerContainer, {backgroundColor: colors.Branding.b400}];
    }, [colors.Branding.b400]);

    const textStyles = React.useMemo(() => {
      return [
        typography.headingLargeM,
        {
          color: colors.Primary.mainText,
          marginStart: (8).px(),
          flex: 1,
        },
      ];
    }, [colors.Primary.mainText, typography.headingLargeM]);

    return (
      <PSDebouncedPressable onPress={onPress} style={containerStyles}>
        {canBack ? (
          <PSIcQuickLeft24
            width={(24).px()}
            height={(24).px()}
            fill={colors.Primary.white}
          />
        ) : (
          <PSIcMessageQuestion24
            width={(24).px()}
            height={(24).px()}
            fill={colors.Primary.white}
          />
        )}
        <MemoizeText textStyle={textStyles} text={text} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const Menu = React.memo(
  ({
    menu,
    onPress,
  }: {
    menu: PSMessageChatBotMenuModel;
    onPress: (item: PSMessageChatBotMenuModel) => void;
  }) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [typography.headingLargeM, {color: colors.Primary.mainText}];
    }, [colors.Primary.mainText, typography.headingLargeM]);

    return (
      <PSDebouncedPressable
        onPress={() => onPress(menu)}
        style={styles.optionContainer}>
        <MemoizeText textStyle={textStyles} text={menu.label} />
        <PSSpacer />
        <PSIcRightSmall24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  ({text, textStyle}: {text: string; textStyle?: StyleProp<TextStyle>}) => {
    return <Text style={textStyle}>{text}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const Divider = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const containerStyle = React.useMemo(() => {
    return {
      backgroundColor: colors.Neutral.n50,
    };
  }, [colors.Neutral.n50]);

  return <View style={[styles.dividerContainer, containerStyle]} />;
});

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    padding: (12).px(),
    alignItems: 'center',
  },
  optionContainer: {flexDirection: 'row', padding: (12).px()},
  dividerContainer: {
    width: '100%',
    height: (0.5).px(),
  },
});
