import {
  PSSearchThreadType,
  PSThreadType,
} from '@communi/chat-api-client-typescript';
import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {psLogger} from '../../../utils';
import {PSThreadEntity, SearchThreadUIModel} from '../../../types';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../context';
import {PSAvatarImage} from '../../PSAvatarImage';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';
import {PSAgentBadge, PSBotBadge, PSPublicGroupBadge} from '../../PSBotBadge';
import {PSAvatarSubThread} from '../../PSAvatarSubThread';
import {PSIcHashTag24, PSIcVerified} from '../../../icons';

type ForwardThreadItemProps = {
  index: number;
  thread: SearchThreadUIModel;
  forwarded: boolean;
  verified?: boolean;
  onForwardMessage: (
    targetThreadId: string,
    targetThreadType: PSThreadType,
  ) => Promise<void>;
};

const ForwardThreadItem = ({
  index,
  thread,
  forwarded,
  verified,
  onForwardMessage,
}: ForwardThreadItemProps) => {
  const {translator} = usePSTranslationContext();
  const [isLoading, setLoading] = useState(false);
  const {colors, typography} = usePSDesignSystemContext();
  const isBot = React.useMemo(() => {
    return thread.type === PSSearchThreadType.BOT;
  }, [thread.type]);
  const isPublicGroup = React.useMemo(() => {
    return thread.isPublicGroup;
  }, [thread.isPublicGroup]);
  const isAgent = React.useMemo(() => {
    return thread.type === PSSearchThreadType.CS_AGENT;
  }, [thread.type]);

  const realm = useRealm();

  const psAvatarSubThread = React.useMemo(() => {
    if (thread.parentId && thread.parentId !== '0') {
      const currentThread = PSThreadEntity.getFirstById(realm, thread.parentId);
      return (
        <PSAvatarSubThread
          displayName={currentThread?.name ?? ''}
          url={currentThread?.avatar ?? ''}
        />
      );
    } else {
      return (
        <View>
          <PSAvatarImage
            displayName={thread.name}
            url={thread.avatar}
            size={40}
          />
          {isPublicGroup ? (
            <View
              style={[
                styles.thread_public,
                {
                  backgroundColor: colors.Primary.decorative,
                  borderColor: colors.Primary.white,
                },
              ]}>
              <PSIcHashTag24
                width={(12).px()}
                height={(12).px()}
                fill={'#FFFFFF'}
              />
            </View>
          ) : null}
        </View>
      );
    }
  }, [realm, thread.parentId, thread.name, thread.avatar]);

  return (
    <View style={styles.container}>
      {psAvatarSubThread}
      <View style={styles.titleContainer}>
        <Text
          style={[styles.title, {color: colors.Primary.subText}, typography.headingMediumS]}>
          {thread.name}
        </Text>
        {verified ? <PSIcVerified /> : null}
        {isBot && (
          <PSBotBadge
            textStyle={[
              // styles.botBadge,
              typography.bodySmallR,
              {
                color: colors.Primary.decorative,
                backgroundColor: colors.SubBranding.sb50,
              },
              {marginStart: (4).px()},
            ]}
          />
        )}
        {isAgent && (
          <PSAgentBadge
            textStyle={[
              // styles.botBadge,
              typography.bodySmallR,
              {
                color: colors.Primary.decorative,
                backgroundColor: colors.SubBranding.sb50,
              },
              {marginStart: (4).px()},
            ]}
          />
        )}
        {/* {isPublicGroup && <PSPublicGroupBadge />} */}
      </View>
      <PSDebouncedPressable
        style={[
          styles.button,
          {
            backgroundColor: forwarded
              ? colors.Neutral.n100
              : colors.Primary.branding,
            borderColor: forwarded ? colors.Neutral.n300 : colors.Primary.branding,
          },
        ]}
        onPress={
          forwarded
            ? undefined
            : async () => {
                try {
                  setLoading(true);
                  await onForwardMessage(
                    thread.id,
                    thread.type === PSSearchThreadType.GROUP
                      ? PSThreadType.GROUP
                      : PSThreadType.DIRECT,
                  );
                } catch (e) {
                  psLogger.error('ForwardThreadItem: ', e);
                } finally {
                  setLoading(false);
                }
              }
        }>
        {isLoading && !forwarded ? (
          <ActivityIndicator size="small" color={colors.Primary.mainText} />
        ) : (
          <Text
            style={[
              typography.bodyMediumR,
              {
                color: forwarded ? colors.Neutral.n300 : colors.Primary.white,
              },
            ]}>
            {translator('ps_send')}
          </Text>
        )}
      </PSDebouncedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: (8).px(),
    paddingHorizontal: (16).px(),
  },
  titleContainer: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    marginHorizontal: 10,
  },
  button: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (12).px(),
    height: (32).px(),
    paddingHorizontal: (12).px(),
    borderWidth: (1).px(),
  },
  thread_public: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: (2).px(),
    borderColor: '#EDEDED',
    width: (16).px(),
    height: (16).px(),
    borderRadius: (6).px(),
    backgroundColor: '#9B76FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ForwardThreadItem;
// export default memo(
//   ForwardThreadItem,
//   (prev: ForwardThreadItemProps, next: ForwardThreadItemProps) => {
//     return (
//       isEqual(prev.thread, next.thread) &&
//       isEqual(prev.forwarded, next.forwarded)
//     );
//   },
// );
