import {
  PSUserDto,
  PS_FETCH_USER_BY_IDS_MAX,
} from '@communi/chat-api-client-typescript';
import cloneDeep from 'lodash.clonedeep';
import React from 'react';
import isEqual from 'react-fast-compare';
import Moment from 'react-moment';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../context';
import {
  useDeepCompareMemoize,
  useIsMountedRef,
  useRenderCounter,
} from '../../../../hooks';
import {IcLine15PlusMarkCircle} from '../../../../icons';
import {
  PSMessagePollModel,
  PSMessagePollOptionModel,
  PSUserEntity,
  PSUserModel,
  getPreviewSubThreadName,
  mapUserEntityToModel,
  mapUsersDtoToModel,
} from '../../../../types';
import {psLogger} from '../../../../utils';
import {PSAvatarImage} from '../../../PSAvatarImage';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {PSFlashMessage} from '../../../flash-message';
import {
  usePSMessageAddOptionPollActionContext,
  usePSMessageIsSubthreadContext,
  usePSMessagePollContext,
  usePSMessagePollOverlayActionContext,
} from '../../contexts';
import {usePSMessageItemContext} from '../PSMessageItem';
import {PSMessageComment} from '../comment';

const BORDER_RADIUS = (12).px();

const MessagePollContent = ({
  messageId,
  poll,
}: {
  messageId: number;
  poll: PSMessagePollModel;
}) => {
  useRenderCounter(`MessagePollContent: id = ${poll.id}`);

  const {translator} = usePSTranslationContext();

  const {colors} = usePSDesignSystemContext();

  const {message} = usePSMessageItemContext();

  const isSubThread = usePSMessageIsSubthreadContext();

  const {isOverlay} = usePSMessageItemContext();

  const {vote, unvote} = usePSMessagePollContext();

  const {show: showVotedUsers} = usePSMessagePollOverlayActionContext();

  const {show: showAddOption} = usePSMessageAddOptionPollActionContext();

  const onOptionPress = React.useCallback(
    (optionId: string) => {
      if (!isOverlay && poll.id) {
        const now = new Date().getTime(); // timestamp unix
        if (poll.closeAt === -1 || now < poll.closeAt) {
          if (poll.myVotes.includes(optionId)) {
            unvote(messageId, poll.id, optionId);
          } else {
            // check case single choice hay multiple choice
            if (!poll.allowMultipleVotes && poll.myVotes.length > 0) {
              PSFlashMessage.show({
                type: 'error',
                text1: translator(
                  'ps_message_poll_can_select_only_one_option_message',
                ),
                position: 'bottom',
                visibilityTime: 2000,
              });
              return;
            }

            vote(messageId, poll.id, optionId);
          }
        } else {
          PSFlashMessage.show({
            type: 'error',
            text1: translator('ps_message_poll_ended_message'),
            position: 'bottom',
            visibilityTime: 2000,
          });
        }
      }
    },
    [
      translator,
      isOverlay,
      messageId,
      poll.id,
      poll.closeAt,
      poll.allowMultipleVotes,
      useDeepCompareMemoize(poll.myVotes),
      vote,
      unvote,
    ],
  );

  const onAddOptionPress = React.useCallback(() => {
    if (!isOverlay) {
      const now = new Date().getTime(); // timestamp unix
      if (poll.closeAt === -1 || now < poll.closeAt) {
        showAddOption(messageId, poll.id);
      } else {
        PSFlashMessage.show({
          type: 'error',
          text1: translator('ps_message_poll_ended_message'),
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    }
  }, [translator, isOverlay, messageId, poll.id, poll.closeAt, showAddOption]);

  const onUsersVotedPress = React.useCallback(
    (optionId: string, voteCount: number) => {
      if (!isOverlay && poll.id) {
        if (voteCount) {
          showVotedUsers(messageId, poll.id, optionId, voteCount);
        }
      }
    },
    [isOverlay, messageId, poll.id, showVotedUsers],
  );

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.white,
      },
    ];
  }, [colors.Primary.linerBorder]);

  return (
    <View style={containerStyles}>
      <PollTitle title={poll.title} />
      <PollExpireTime expireTime={poll.closeAt} />

      <Options
        myVotes={poll.myVotes}
        options={poll.options}
        incognitoMode={poll.incognitoMode}
        onPress={onOptionPress}
        onUsersVotedPress={onUsersVotedPress}
      />

      <AddOption
        allowAddingOption={poll.allowAddingOption}
        onAddOptionPress={onAddOptionPress}
      />

      {!poll.id && (
        <ActivityIndicator size="small" color="blue" style={styles.indicator} />
      )}
      {message && !isSubThread ? (
        <PSMessageComment
          messageId={message.id}
          subThreadName={getPreviewSubThreadName(message, translator)}
          subThreadId={message.subThreadId}
          messageSubThreadCount={message.messageSubThreadCount}
          containerStyle={[
            styles.styContainerStyle,
            {borderTopColor: colors.Neutral.n100},
          ]}
        />
      ) : null}
    </View>
  );
};

const PollTitle = React.memo(
  ({title}: {title: string}) => {
    const {typography, colors} = usePSDesignSystemContext();
    useRenderCounter('MessagePollContent.PollTitle');

    const textStyles = React.useMemo(() => {
      return [styles.pollTitle, typography.bodyMediumS, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.bodyMediumS]);

    return <Text style={textStyles}>{title}</Text>;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const PollExpireTime = React.memo(
  ({expireTime}: {expireTime: number}) => {
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();
    useRenderCounter('MessagePollContent.PollExpireTime');

    const filter = React.useCallback(
      (date: string) => {
        const nowDate = new Date();
        nowDate.setSeconds(0);
        nowDate.setMilliseconds(0);

        const expireDate = new Date();
        expireDate.setTime(expireTime);
        expireDate.setSeconds(0);
        expireDate.setMilliseconds(0);

        return nowDate.getTime() < expireDate.getTime()
          ? translator(
              'ps_message_poll_expire_will_end_at',
              // @ts-ignore
              {date: date},
            )
          : translator(
              'ps_message_poll_expire_ended_at',
              // @ts-ignore
              {date: date},
            );
      },
      [translator, expireTime],
    );

    const textStyles = React.useMemo(() => {
      return [
        styles.pollExpireTime,
        typography.bodyMediumR,
        {color: colors.Primary.subText},
      ];
    }, [colors.Primary.subText, typography.bodyMediumR]);

    return expireTime > 0 ? (
      <Moment
        format={'HH:mm DD/MM/yyyy'}
        toNow
        unix
        // @ts-ignore
        style={textStyles}
        element={Text}
        filter={filter}
        interval={30000}>
        {expireTime / 1000}
      </Moment>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const Options = React.memo(
  ({
    myVotes,
    options,
    incognitoMode,
    onPress,
    onUsersVotedPress,
  }: {
    myVotes: string[];
    options: PSMessagePollOptionModel[];
    incognitoMode: boolean;
    onPress: (optionId: string) => void;
    onUsersVotedPress: (optionId: string, voteCount: number) => void;
  }) => {
    useRenderCounter('MessagePollContent.Options');

    const totalVoteCount = React.useMemo(() => {
      return options.reduce((sum, current) => sum + current.voteCount, 0);
    }, [options]);

    return (
      <View style={styles.optionsContainer}>
        {cloneDeep(options)
          .sort((a, b) => b.voteCount - a.voteCount)
          .map(option => {
            return (
              <Option
                key={option.id}
                optionId={option.id}
                optionText={option.text}
                partialVoters={option.partialVoters}
                voteCount={option.voteCount}
                totalVoteCount={totalVoteCount}
                myVotes={myVotes}
                incognitoMode={incognitoMode}
                onPress={onPress}
                onUsersVotedPress={onUsersVotedPress}
              />
            );
          })}
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const Option = React.memo(
  ({
    optionId,
    optionText,
    partialVoters,
    voteCount,
    totalVoteCount,
    myVotes,
    incognitoMode,
    onPress,
    onUsersVotedPress,
  }: {
    optionId: string;
    optionText: string;
    partialVoters: string[];
    voteCount: number;
    totalVoteCount: number;
    myVotes: string[];
    incognitoMode: boolean;
    onPress: (optionId: string) => void;
    onUsersVotedPress: (optionId: string, voteCount: number) => void;
  }) => {
    useRenderCounter(`MessagePollContent.Option: optionId = ${optionId}`);
    const {colors} = usePSDesignSystemContext();

    const isVoted = myVotes.includes(optionId);

    const onOptionPress = React.useCallback(() => {
      onPress(optionId);
    }, [onPress, optionId]);

    const onOptionVotedUsersPress = React.useCallback(() => {
      onUsersVotedPress(optionId, voteCount);
    }, [onUsersVotedPress, optionId, voteCount]);

    const containerStyles = React.useMemo(() => {
      return [
        styles.optionContainer,
        {
          borderColor: colors.Primary.subText,
          backgroundColor: colors.Primary.white,
        },
      ];
    }, [colors.Primary.linerBorder, colors.Primary.subText]);

    return (
      <PSDebouncedPressable style={containerStyles} onPress={onOptionPress}>
        <OptionPercentBackground
          isVoted={isVoted}
          voteCount={voteCount}
          totalVoteCount={totalVoteCount}
        />

        <View style={styles.optionTextContainer}>
          <OptionTitle title={optionText} />
        </View>

        <OptionVotedUsers
          partialVoters={partialVoters}
          incognitoMode={incognitoMode}
          numVoter={voteCount}
          onPress={onOptionVotedUsersPress}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const OptionPercentBackground = React.memo(
  ({
    isVoted,
    voteCount,
    totalVoteCount,
  }: {
    isVoted: boolean;
    voteCount: number;
    totalVoteCount: number;
  }) => {
    useRenderCounter('MessagePollContent.OptionPercentBackground');
    const {colors} = usePSDesignSystemContext();
    const percent = totalVoteCount ? (voteCount / totalVoteCount) * 100 : 0;

    const style = React.useMemo(() => {
      return {
        backgroundColor: isVoted ? colors.Branding.b200 : colors.Neutral.n100,
        borderTopRightRadius: percent === 100 ? BORDER_RADIUS : 0,
        borderBottomRightRadius: percent === 100 ? BORDER_RADIUS : 0,
        width: `${percent}%`,
      } as ViewStyle;
    }, [colors.Branding.b200, colors.Neutral.n100, isVoted, percent]);

    return <View style={[styles.optionBackgroundPercent, style]} />;
  },
  (prev, next) => isEqual(prev, next),
);

const OptionTitle = React.memo(
  ({title}: {title: string}) => {
    const {typography, colors} = usePSDesignSystemContext();
    useRenderCounter(`MessagePollContent.OptionTitle: ${title}`);

    const textStyles = React.useMemo(() => {
      return [{color: colors.Primary.subText}, typography.bodyMediumR];
    }, [colors.Primary.subText, typography.bodyMediumR]);

    return (
      <Text numberOfLines={2} style={textStyles}>
        {title}
      </Text>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const VOTED_USER_SHOW_MAX = 3;

const OptionVotedUsers = React.memo(
  ({
    partialVoters,
    incognitoMode,
    numVoter,
    onPress,
  }: {
    partialVoters: string[];
    incognitoMode: boolean;
    numVoter: number;
    onPress?: null | ((event: GestureResponderEvent) => void);
  }) => {
    const isMounted = useIsMountedRef();

    const chatApiClient = usePSChatApiClientContext();

    const realm = useRealm();

    const [votedUsers, setVotedUsers] = React.useState<PSUserModel[]>([]);

    const subUsersVoted = React.useMemo(() => {
      return partialVoters.slice(0, VOTED_USER_SHOW_MAX);
    }, [useDeepCompareMemoize(partialVoters)]);

    const fetchUserByIds = React.useCallback(
      async (userIds: string[]) => {
        if (!userIds.length || !chatApiClient) {
          return;
        }
        try {
          // api fetchUserByIds chỉ lấy đc max = PS_FETCH_USER_BY_IDS_MAX
          const userIdsArray: string[][] = [];
          for (let i = 0; i < userIds.length / PS_FETCH_USER_BY_IDS_MAX; i++) {
            userIdsArray.push(
              userIds.slice(
                i * PS_FETCH_USER_BY_IDS_MAX,
                PS_FETCH_USER_BY_IDS_MAX + i * PS_FETCH_USER_BY_IDS_MAX,
              ),
            );
          }
          const responses = await Promise.all(
            userIdsArray.map(items =>
              chatApiClient.userApi.fetchUserByIds(items),
            ),
          );
          const users: PSUserDto[] = [];
          for (const response of responses) {
            if (response.data) {
              users.push(...response.data);
            }
          }
          if (users && users.length) {
            realm.write(() => {
              for (const user of users) {
                PSUserEntity.createOrUpdate(
                  realm,
                  PSUserEntity.mapFromDto(user)!,
                );
              }
            });
            if (isMounted.current) {
              setVotedUsers(values => [
                ...values,
                ...mapUsersDtoToModel(users),
              ]);
            }
          }
        } catch (error) {
          psLogger.error('OptionVotedUsers: fetchUserByIds', error);
          await new Promise(resolver =>
            setTimeout(() => {
              resolver('');
            }, 1000),
          );
          if (isMounted.current) {
            fetchUserByIds(userIds);
          }
        }
      },
      [chatApiClient, realm],
    );

    React.useEffect(() => {
      setVotedUsers([]);
      if (!incognitoMode && subUsersVoted.length) {
        const users =
          PSUserEntity.getByExtUserIds(realm, subUsersVoted).map(
            user => mapUserEntityToModel(user)!,
          ) ?? [];
        const userIdsCached = users.map(user => user.extUserId);
        const userIdsNotCached = subUsersVoted.filter(
          id => !userIdsCached.includes(id),
        );
        if (users && users.length) {
          setVotedUsers(values => [...values, ...users]);
        }
        if (userIdsNotCached && userIdsNotCached.length) {
          fetchUserByIds(userIdsNotCached);
        }
      }
    }, [
      realm,
      fetchUserByIds,
      useDeepCompareMemoize(subUsersVoted),
      incognitoMode,
    ]);

    useRenderCounter(
      'MessagePollContent.OptionVotedUsers',
      incognitoMode !== undefined && partialVoters.length > 0,
    );
    return !incognitoMode && partialVoters.length ? (
      <PSDebouncedPressable
        style={styles.usersVotedContainer}
        onPress={onPress}>
        <OptionVotedUsersHorizontalList votedUsers={votedUsers} />
        <OptionVotedUsersMore length={numVoter} />
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const OptionVotedUsersHorizontalList = React.memo(
  ({votedUsers}: {votedUsers: PSUserModel[]}) => {
    useRenderCounter(
      'MessagePollContent.OptionVotedUsers.HorizontalList',
      votedUsers.length > 0,
    );
    return votedUsers.length
      ? votedUsers.map(user => (
          <PSAvatarImage
            key={user.extUserId}
            size={16}
            displayName={user.name}
            url={user.avatar ?? ''}
            imageStyle={styles.userAvatar}
          />
        ))
      : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const OptionVotedUsersMore = React.memo(
  ({length}: {length: number}) => {
    useRenderCounter('MessagePollContent.OptionVotedUsersMore');
    const {typography, colors} = usePSDesignSystemContext();
    const textStyles = React.useMemo(() => {
      return [typography.bodyMediumR, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.bodyMediumR]);

    return length > VOTED_USER_SHOW_MAX ? (
      <View style={styles.userMoreVotedContainer}>
        <Text style={textStyles}>{`+${length - VOTED_USER_SHOW_MAX}`}</Text>
      </View>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const AddOption = React.memo(
  ({
    allowAddingOption,
    onAddOptionPress,
  }: {
    allowAddingOption: boolean;
    onAddOptionPress: () => void;
  }) => {
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const containerStyles = React.useMemo(() => {
      return [
        styles.addOptionContainer,
        {
          borderColor: colors.Primary.subText,
          backgroundColor: colors.Primary.white,
        },
      ];
    }, [colors.Primary.linerBorder, colors.Primary.subText]);

    const textStyles = React.useMemo(() => {
      return [styles.moreText, typography.bodyXLargeR, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.bodyXLargeR]);

    useRenderCounter('MessagePollContent.AddOption');
    return allowAddingOption ? (
      <PSDebouncedPressable style={containerStyles} onPress={onAddOptionPress}>
        <View style={styles.addOptionContentContainer}>
          <IcLine15PlusMarkCircle
            width={(18).px()}
            height={(18).px()}
            fill={colors.Primary.subText}
          />
          <Text style={textStyles}>
            {translator('ps_message_poll_add_option')}
          </Text>
        </View>
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

export const PSMessagePollContent = React.memo(
  MessagePollContent,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    padding: (16).px(),
    marginTop: (24).px(),
    marginBottom: (14).px(),
    borderRadius: BORDER_RADIUS,
  },
  pollTitle: {},
  pollExpireTime: {marginTop: (4).px()},
  optionsContainer: {
    width: '100%',
    marginTop: (16).px(),
  },
  optionContainer: {
    width: '100%',
    borderRadius: BORDER_RADIUS,
    borderWidth: (1).px(),
    flexDirection: 'row',
    paddingVertical: (12).px(),
    marginBottom: (12).px(),
    alignItems: 'center',
  },
  addOptionContainer: {
    width: '100%',
    borderRadius: BORDER_RADIUS,
    borderWidth: (1).px(),
    borderStyle: 'dashed',
    flexDirection: 'row',
    padding: (10).px(),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOptionContentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBackgroundPercent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BORDER_RADIUS,
    borderBottomLeftRadius: BORDER_RADIUS,
  },
  optionTextContainer: {
    paddingHorizontal: (12).px(),
    flex: 1,
  },
  usersVotedContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    marginEnd: (8).px(),
  },
  userMoreVotedContainer: {
    width: (16).px(),
    height: (16).px(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    alignSelf: 'center',
    textAlign: 'center',
    marginHorizontal: (8).px(),
    marginVertical: (2).px(),
  },
  selector: {marginStart: (8).px()},
  subTitleText: {marginTop: (2).px()},
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  userAvatar: {marginEnd: (2).px()},
  styContainerStyle: {
    marginTop: (16).px(),
    paddingTop: (12).px(),
    alignItems: 'flex-end',
  },
});
