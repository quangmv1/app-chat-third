import React, {memo, useCallback, useMemo} from 'react';
import isEqual from 'react-fast-compare';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSIcCopy25} from '../../../../icons/new_icon';
import {setClipboardString} from '../../../../utils';
import {PSFlashMessage} from '../../../flash-message';
import {useThreadInfoUserWithChatBotContext} from '../../contexts';

export const PSThreadDeskUserID = React.memo(
  () => {
    const styles = useStylesPSThreadDeskUserID();
    const {translator} = usePSTranslationContext();
    const {alias, userId, psUserId} = useThreadInfoUserWithChatBotContext();
    if (!alias && !userId && !psUserId) return null;
    return (
      <View style={styles.contain}>
        <View>
          {!!alias && (
            <Text style={styles.styTxtTitle}>{translator('ps_alias')}</Text>
          )}
          {!!userId && (
            <Text style={styles.styTxtTitle}>{translator('user_id')}</Text>
          )}
          {!!psUserId && (
            <Text style={styles.styTxtTitle}>{translator('ps_user_id')}</Text>
          )}
        </View>
        <View>
          <MemoizeTextInfo value={alias} />
          <MemoizeTextInfo value={userId} />
          <MemoizeTextInfo value={psUserId} />
        </View>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

type TextInfoT = {
  value?: string;
};

const MemoizeTextInfo = memo(
  ({value = ''}: TextInfoT) => {
    const styles = useStylesPSThreadDeskUserID();
    const {translator} = usePSTranslationContext();

    const _handleCopyValue = useCallback(() => {
      setClipboardString(value);
      PSFlashMessage.show({
        type: 'success',
        text1: translator('ps_message_action_copied'),
        position: 'bottom',
        visibilityTime: 2000,
      });
    }, [value, translator]);

    if (!value) return null;

    return (
      <View style={styles.row}>
        <Text style={styles.styTxtInfo}>{value}</Text>
        <Pressable onPress={_handleCopyValue}>
          <PSIcCopy25 />
        </Pressable>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const useStylesPSThreadDeskUserID = () => {
  const {typography, colors} = usePSDesignSystemContext();
  return useMemo(
    () =>
      StyleSheet.create({
        contain: {
          backgroundColor: colors.Primary.white,
          borderRadius: (12).px(),
          paddingHorizontal: (12).px(),
          paddingVertical: (6).px(),
          marginVertical: (16).px(),
          flexDirection: 'row',
        },
        styTxtTitle: {
          color: colors.Primary.subText,
          textAlign: 'justify',
          marginBottom: (8).px(),
          ...typography.bodyXLargeR,
        },
        styTxtInfo: {
          color: colors.Neutral.n500,
          textAlign: 'justify',
          marginBottom: (8).px(),
          marginLeft: (12).px(),
          marginRight: (8).px(),
          ...typography.headingMediumM,
        },
        row: {
          flexDirection: 'row',
          height: (33).px(),
        },
      }),
    [colors, typography],
  );
};
