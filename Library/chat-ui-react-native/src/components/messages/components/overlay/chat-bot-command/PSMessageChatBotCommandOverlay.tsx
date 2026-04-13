import React from 'react';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../../context';
import {
  PSMessageChatBotCommandModel,
  usePSMessageChatBotCommandOverlayActionContext,
  usePSMessageChatBotCommandOverlayContext,
  usePSMessageInputReplyChatBotContext,
} from '../../../contexts';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';

// const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PSMessageChatBotCommandOverlay = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const {isVisible, commands, bottomSheetRef} =
    usePSMessageChatBotCommandOverlayContext();

  const {hide} = usePSMessageChatBotCommandOverlayActionContext();

  const renderBackdrop = React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} />
    ),
    [],
  );

  const keyUserExtractor = React.useCallback(
    (item: PSMessageChatBotCommandModel, index: number) =>
      item.command + index.toString(),
    [],
  );

  const renderUserItem = React.useCallback(
    ({item}: {item: PSMessageChatBotCommandModel}) => <Item item={item} />,
    [],
  );

  const backgroundStyle = React.useMemo(() => {
    return {
      backgroundColor: colors.Primary.white,
    };
  }, [colors.Primary.linerBorder]);

  const snapPoints = React.useMemo(() => {
    if (commands.length === 0) return ['50%'];
    if (commands.length === 1) {
      // const itemHeight = 80;
      // const percentage = Math.ceil((itemHeight / SCREEN_HEIGHT) * 100);
      return [`${12}%`];
    }
    return ['50%', '90%'];
  }, [commands.length]);

  return isVisible ? (
    <BottomSheet
      ref={bottomSheetRef}
      handleHeight={20}
      handleComponent={MemoizeHandle}
      enablePanDownToClose={true}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      onClose={hide}>
      <BottomSheetFlatList
        contentContainerStyle={
          commands.length ? styles.menuContainer : styles.emptyList
        }
        style={backgroundStyle}
        data={commands}
        ListEmptyComponent={<MemoizeEmpty />}
        keyExtractor={keyUserExtractor}
        renderItem={renderUserItem}
      />
    </BottomSheet>
  ) : null;
});

const Item = React.memo(
  ({item}: {item: PSMessageChatBotCommandModel}) => {
    const {hide} = usePSMessageChatBotCommandOverlayActionContext();

    const replyChatBot = usePSMessageInputReplyChatBotContext();

    const onPress = () => {
      replyChatBot(item.name, item.command);
      hide();
    };

    return (
      <PSDebouncedPressable onPress={onPress}>
        <MemoizeCommand name={item.name} />
        <MemoizeDivider />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeCommand = React.memo(
  ({name}: {name: string}) => {
    const {typography, colors} = usePSDesignSystemContext();

    return (
      <Text
        style={[styles.menuText, {color: colors.Primary.subText}, typography.bodyXLargeR]}>
        {name}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeDivider = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colors.Neutral.n50,
        },
      ]}
    />
  );
});

const MemoizeHandle = React.memo(
  () => {
    const {colors} = usePSDesignSystemContext();

    return (
      <View
        style={[
          styles.handleContainer,
          {backgroundColor: colors.Primary.white},
        ]}>
        <View
          style={[
            styles.handle,
            {
              backgroundColor: colors.Neutral.n400,
            },
          ]}
        />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeEmpty = React.memo(() => {
  const {translator} = usePSTranslationContext();
  const {typography, colors} = usePSDesignSystemContext();

  return (
    <View style={styles.emptyContainer}>
      <Text style={[typography.bodyXLargeR, {color: colors.Primary.subText}]}>
        {translator('ps_message_chat_bot_no_commands')}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  menuContainer: {
    width: '100%',
    paddingTop: (16).px(),
    paddingVertical: (12).px(),
  },
  handleContainer: {
    padding: (12).px(),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopStartRadius: (22).px(),
    borderTopEndRadius: (22).px(),
  },
  handle: {
    width: (48).px(),
    height: (4).px(),
    borderRadius: (12).px(),
  },
  menuText: {
    paddingHorizontal: (16).px(),
  },
  divider: {
    height: (0.5).px(),
    marginVertical: (12).px(),
  },
  emptyList: {flexGrow: 1},
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: (16).px(),
  },
});
