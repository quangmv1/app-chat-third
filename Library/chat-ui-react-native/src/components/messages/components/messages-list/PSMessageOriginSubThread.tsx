import React from 'react';
import isEqual from 'react-fast-compare';
import { StyleSheet, Text, View } from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useQuery,
  useRealm,
} from '../../../../context';
import {
  PSDeviceEntity,
  PSMessageEntity,
  PSMessagePosition,
  mapMessageEntityToModel,
} from '../../../../types';
import { usePSMessageCurrentThreadContext } from '../../contexts';
import { PSMessageItem } from '../PSMessageItem';

const _PSMessageOriginSubThread = () => {
  const styles = useStylesPSMessageSubThread();

  const { translator } = usePSTranslationContext();

  const currentThread = usePSMessageCurrentThreadContext();

  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const messageParentThread = useQuery(PSMessageEntity).filtered(
    PSMessageEntity.filteredByThreadIdAndMessageId(
      currentThread?.parentId!,
      currentThread?.originalMessageId!,
    ),
  );

  React.useEffect(() => {
    // từ lấy messageCount từ curent subthread để cập nhật
    // vì mỗi lần vào 1 thread đều gọi api getThreadById
    // và chỉ cập nhật khi nó là 1 subthread có messageCount lớn hơn 0
    if (
      currentThread?.parentId &&
      currentThread.originalMessageId &&
      currentThread.messageCount > 0
    ) {
      if (!realm.isInTransaction) {
        const messageOrigin = PSMessageEntity.getFirstByThreadIdAndMessageId(
          realm,
          currentThread?.parentId!,
          currentThread?.originalMessageId!,
        );
        realm.write(() => {
          if (
            messageOrigin &&
            (!messageOrigin.messageSubThreadCount ||
              messageOrigin.messageSubThreadCount < currentThread.messageCount)
          )
            messageOrigin?.updateMessageSubThreadCount(
              currentThread.messageCount,
            );
          if (!messageOrigin?.subThreadId) {
            // kiểm tra messageOrigin nếu chưa có subThreadId thì cập nhật subThreadId cho nó.
            messageOrigin?.updateMessageSubThreadId(currentThread.id);
          }
        });
      }
    }
  }, [
    currentThread?.id,
    currentThread?.messageCount,
    currentThread?.originalMessageId,
    currentThread?.parentId,
    realm,
    messageParentThread,
  ]);

  React.useEffect(() => {
    const parentId = currentThread?.parentId;
    const originalMessageId = currentThread?.originalMessageId;

    const fetchMessageById = async () => {
      if (!chatApiClient) return;
      const response = await chatApiClient?.messageApi.fetchMessageById(
        parentId!,
        originalMessageId!,
      );

      if (response?.data !== undefined) {
        realm.write(() => {
          const deviceId = PSDeviceEntity.get(realm);
          PSMessageEntity.createOrUpdate(
            realm,
            PSMessageEntity.mapFromDto(
              deviceId,
              chatApiClient.userId,
              parentId!,
              response.data,
            )!,
          );
        });
      }
    };

    if (!!parentId && !!originalMessageId) {
      const messageOrigin = PSMessageEntity.getFirstByThreadIdAndMessageId(
        realm,
        currentThread?.parentId!,
        currentThread?.originalMessageId!,
      );
      if (messageOrigin === undefined) {
        fetchMessageById();
      }
    }
  }, [
    realm,
    chatApiClient,
    currentThread?.parentId,
    currentThread?.originalMessageId,
  ]);

  const message = React.useMemo(() => {
    if (!messageParentThread?.[0]) {
      return null;
    }
    return mapMessageEntityToModel(
      chatApiClient?.userId!,
      messageParentThread?.[0]!,
      [],
      PSMessagePosition.NORMAL,
      true,
    );
  }, [chatApiClient, messageParentThread]);

  if (!message) return null;

  return (
    <View style={{ marginTop: (12).px() }}>
      <PSMessageItem message={message} isOverlay={false} isPSMessageSubThread />
      <View style={styles.container}>
        <Text style={styles.styTxt}>
          {translator(
            'ps_message_comment_count',
            // @ts-ignore
            {
              num: message?.messageSubThreadCount || 0,
            },
          )}
        </Text>
        <View style={styles.styLine} />
      </View>
    </View>
  );
};

export const PSMessageOriginSubThread = React.memo(
  _PSMessageOriginSubThread,
  (prev, next) => isEqual(prev, next),
);

const useStylesPSMessageSubThread = () => {
  const { colors, typography } = usePSDesignSystemContext();

  return React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: (16).px(),
          marginTop: (16).px(),
        },
        styTxt: {
          ...typography.bodyXLargeR,
          color: 'red'
        },
        styLine: {
          flex: 1,
          height: 1,
          borderWidth: 0.5,
          borderColor: colors.Neutral.n50,
          marginLeft: (16).px(),
        },
      }),
    [colors.Neutral.n50, colors.Neutral.n500, typography.bodyXLargeR],
  );
};
