import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {
  PSThreadProfileBlockUserProvider,
  usePSThreadProfileBlockUserContext,
  useThreadProfileActionContext,
} from '../../contexts';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../context';
import {PSIcBlockUser24} from '../../../../icons';
import {PSThreadProfileRowItem} from './PSThreadProfileRowItem';
import {
  PSBlockAction,
  PSThreadType,
  PSUserBlockStatus,
} from '@communi/chat-api-client-typescript';
import {usePSMessageCurrentThreadContext} from '../../../messages';
import {PSThreadEntity} from '../../../../types';
import {PSThreadProfileStyles} from '../../PSThreadProfileStyles';

const ThreadProfileBlockUser = () => {
  const {type} = useThreadProfileActionContext();
  const isBlockUserVisible =
    usePSScreenStylesContext<PSThreadProfileStyles>().isBlockUserVisible;

  return type === PSThreadType.DIRECT && isBlockUserVisible !== false ? (
    <PSThreadProfileBlockUserProvider>
      <BlockUserUI />
    </PSThreadProfileBlockUserProvider>
  ) : null;
};

const BlockUserUI = React.memo(
  () => {
    const realm = useRealm();
    const chatApiClient = usePSChatApiClientContext();
    const {translator} = usePSTranslationContext();
    const {colors} = usePSDesignSystemContext();

    const blockStatus = usePSMessageCurrentThreadContext()?.blockStatus;

    const psUserId = usePSMessageCurrentThreadContext()?.partner?.extUserId;

    const {show} = usePSThreadProfileBlockUserContext();

    const handleUnBlockUser = React.useCallback(async () => {
      if (
        blockStatus === PSUserBlockStatus.NO_BLOCK ||
        blockStatus === PSUserBlockStatus.BLOCKED_BY_PARTNER
      ) {
        show();
      } else if (blockStatus === PSUserBlockStatus.BLOCKED_BY_ME) {
        if (!chatApiClient || !psUserId) return;
        await chatApiClient.userApi.setBlockUser(
          psUserId,
          PSBlockAction.UN_BLOCK,
        );
        realm.write(() => {
          PSThreadEntity.getFirstByPartnerId(
            realm,
            psUserId,
          )?.updateBlockStatus(PSUserBlockStatus.NO_BLOCK);
        });
      }
    }, [chatApiClient, realm, psUserId, blockStatus]);

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.Primary.white,
          },
        ]}>
        <PSThreadProfileRowItem
          title={
            blockStatus === PSUserBlockStatus.NO_BLOCK ||
            blockStatus === PSUserBlockStatus.BLOCKED_BY_PARTNER
              ? translator('ps_thread_profile_block_user')
              : blockStatus === PSUserBlockStatus.BLOCKED_BY_ME
                ? translator('ps_thread_profile_un_block_user')
                : ''
          }
          colorTitle={colors.Primary.subText}
          showIconRight={false}
          onPress={handleUnBlockUser}>
          <PSIcBlockUser24 width={20} height={20} fill={colors.Primary.subText} />
        </PSThreadProfileRowItem>
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

export const PSThreadProfileBlockUser = React.memo(
  ThreadProfileBlockUser,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderRadius: (12).px(),
    marginBottom: (16).px(),
  },
});
