/* eslint-disable react-native/no-inline-styles */

import {PropsWithChildren, useCallback} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';
import {
  PSIcMute24,
  PSIcMuted24,
  PSIcPin24,
  PSIcUnPin24,
  PSIcDelete24,
  IcLine15Xmark,
} from '../../../../icons';
import {PSThreadModel} from '../../../../types';
import {
  useActionThreadsProviderContext,
  useThreadActionsDeleteOverlay,
} from '../../contexts';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';

const HeaderModal = ({toggleModal}: {toggleModal: () => void}) => {
  const {colors, typography} = usePSDesignSystemContext();
  const {translator} = usePSTranslationContext();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: (12).px(),
      }}>
      <Text style={[{color: colors.Primary.mainText}, typography.bodyXLargeS]}>
        {translator('ps_thread_action_title')}
      </Text>
      <PSDebouncedPressable onPress={toggleModal}>
        <IcLine15Xmark
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.mainText}
        />
      </PSDebouncedPressable>
    </View>
  );
};

const ActionItem = ({
  children,
  title,
  color,
  textStyle,
  onPress,
}: PropsWithChildren<{
  title: string;
  color?: string;
  textStyle?: TextStyle;
  onPress?: null | (() => void);
}>) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: (12).px(),
      }}>
      {children}
      <Text
        style={[{color: color ?? '#26282C', marginLeft: (12).px()}, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
};

export const ThreadActionsOverlay = ({
  isVisible,
  toggleModal,
  thread,
}: {
  isVisible: boolean;
  toggleModal: () => void;
  thread: PSThreadModel;
}) => {
  const {colors, typography} = usePSDesignSystemContext();
  const {translator} = usePSTranslationContext();

  const showThreadActions = useThreadActionsDeleteOverlay();

  const {pinThread, muteThread} = useActionThreadsProviderContext();

  const onPinPressed = useCallback(() => {
    toggleModal();
    pinThread(thread.id);
  }, [pinThread, thread.id, toggleModal]);

  const onMutePressed = useCallback(() => {
    toggleModal();
    muteThread(thread.id);
  }, [muteThread, thread.id, toggleModal]);

  const onDeletePressed = useCallback(() => {
    toggleModal();
    showThreadActions(thread.id);
  }, [showThreadActions, thread.id, toggleModal]);

  return (
    <Modal
      onBackdropPress={toggleModal}
      isVisible={isVisible}
      onSwipeComplete={toggleModal}
      swipeDirection={['down']}
      style={styles.view}>
      <View
        style={[styles.container, {backgroundColor: colors.Primary.white}]}>
        <HeaderModal toggleModal={toggleModal} />

        <ActionItem
          title={
            thread.pinnedAt !== 0
              ? translator('ps_thread_un_pin')
              : translator('ps_thread_pin')
          }
          color={colors.Primary.mainText}
          textStyle={typography.bodyXLargeR}
          onPress={onPinPressed}>
          {thread.pinnedAt !== 0 ? (
            <PSIcUnPin24
              width={(28).px()}
              height={(28).px()}
              fill={colors.Primary.branding}
            />
          ) : (
            <PSIcPin24
              width={(28).px()}
              height={(28).px()}
              fill={colors.Primary.branding}
            />
          )}
        </ActionItem>
        <ActionItem
          title={
            thread.isMute
              ? translator('ps_thread_action_un_mute')
              : translator('ps_thread_action_mute')
          }
          color={colors.Primary.mainText}
          textStyle={typography.bodyXLargeR}
          onPress={onMutePressed}>
          {thread.isMute ? (
            <PSIcMute24
              width={(28).px()}
              height={(28).px()}
              fill={colors.Primary.branding}
            />
          ) : (
            <PSIcMuted24
              width={(28).px()}
              height={(28).px()}
              fill={colors.Primary.branding}
            />
          )}
        </ActionItem>
        {thread.isJoined ? (
          <ActionItem
            title={translator('ps_thread_action_delete')}
            color={colors.Negative.normal}
            textStyle={typography.bodyXLargeR}
            onPress={onDeletePressed}>
            <PSIcDelete24
              width={(28).px()}
              height={(28).px()}
              fill={colors.Negative.normal}
            />
          </ActionItem>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    flexDirection: 'column',
    borderTopLeftRadius: (16).px(),
    borderTopRightRadius: (16).px(),
    paddingBottom: Platform.select({android: (2).px(), ios: (24).px()}),
  },
});
