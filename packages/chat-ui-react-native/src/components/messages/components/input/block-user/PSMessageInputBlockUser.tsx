import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View, Text} from 'react-native';
import {useRenderCounter} from '../../../../../hooks';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../../context';
import {PSIcInformation24} from '../../../../../icons';
import {PSTextButton} from '../../../../PSTextButton';
import {usePSMessageCurrentThreadContext} from '../../../contexts';
import {
  PSBlockAction,
  PSUserBlockStatus,
} from '@communi/chat-api-client-typescript';
import {PSThreadEntity} from '../../../../../types';

export const PSMessageInputBlockUser = React.memo(
  ({
    isBlockedByMe,
    isBlockedByPartner,
  }: {
    isBlockedByMe?: boolean;
    isBlockedByPartner?: boolean;
  }) => {
    return isBlockedByMe ? (
      <PSMessageInputBlockUserByMe />
    ) : isBlockedByPartner ? (
      <PSMessageInputBlockUserByPartner />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const PSMessageInputBlockUserByMe = React.memo(
  () => {
    useRenderCounter('PSMessageInputBlockUserByMe');

    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const chatApiClient = usePSChatApiClientContext();

    const realm = useRealm();

    const blockStatus = usePSMessageCurrentThreadContext()?.blockStatus;

    const psUserId = usePSMessageCurrentThreadContext()?.partner?.extUserId;

    const handleUnBlockUser = React.useCallback(async () => {
      if (!chatApiClient || !psUserId) return;
      await chatApiClient.userApi.setBlockUser(
        psUserId,
        PSBlockAction.UN_BLOCK,
      );
      realm.write(() => {
        PSThreadEntity.getFirstByPartnerId(realm, psUserId)?.updateBlockStatus(
          PSUserBlockStatus.NO_BLOCK,
        );
      });
    }, [chatApiClient, realm, psUserId, blockStatus]);

    const textStyles = React.useMemo(() => {
      return [styles.text, {color: colors.Neutral.n400}, typography.bodyMediumR];
    }, [colors.Neutral.n400, typography.bodyMediumR]);

    return (
      <View style={styles.container}>
        <PSIcInformation24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
        <Text style={textStyles}>
          {translator('ps_thread_profile_un_block_to_chat_with_user')}
        </Text>
        <PSTextButton
          text={translator('ps_thread_profile_un_block')}
          onPress={handleUnBlockUser}
          textStyle={[typography.headingMediumM, {color: colors.Primary.white}]}
          style={[
            styles.button,
            {
              backgroundColor: colors.Branding.b400,
            },
          ]}
        />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const PSMessageInputBlockUserByPartner = React.memo(
  () => {
    useRenderCounter('PSMessageInputBlockUserByPartner');

    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const name = usePSMessageCurrentThreadContext()?.partner?.name;

    const textStyles = React.useMemo(() => {
      return [styles.text, {color: colors.Neutral.n400}, typography.bodyMediumR];
    }, [colors.Neutral.n400, typography.bodyMediumR]);

    return (
      <View style={styles.container}>
        <PSIcInformation24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
        <Text style={textStyles}>
          {translator('ps_thread_profile_blocked_current')}
          <Text
            style={[
              typography.bodyMediumM,
              {color: colors.Neutral.n400},
            ]}>{` ${name} `}</Text>
          {translator('ps_thread_profile_blocked_no_want_receive_message')}
        </Text>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: (16).px(),
    paddingVertical: (8).px(),
  },
  text: {
    marginHorizontal: (10).px(),
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: (12).px(),
    paddingVertical: (10).px(),
  },
});
