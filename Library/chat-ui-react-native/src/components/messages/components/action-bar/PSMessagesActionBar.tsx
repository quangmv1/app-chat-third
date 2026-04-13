import {PSThreadType, PSUserType} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {
  ColorValue,
  Keyboard,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {
  DETERMINE_OFFLINE_TIME_ONE_DAY,
  DETERMINE_OFFLINE_TIME_ONE_HOUR,
  DETERMINE_OFFLINE_TIME_ONE_WEEK,
  DETERMINE_RECENT_OFFLINE_TIME,
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSIsDeskModeContext,
  usePSLastOnlineTimeContext,
  usePSMediaPickerActionContext,
  usePSScreenStylesContext,
  usePSStickerPickerActionContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../context';
import {useDeepCompareMemoize, useRenderCounter} from '../../../../hooks';
import {
  PSIcArrowRight24,
  PSIcClose24,
  PSIcHashTag24,
  PSIcMenuInfo24,
  PSIcSearch24,
  PSIcVerified,
} from '../../../../icons';
import {
  PSTagModel,
  PSThreadEntity,
  PSThreadSettingEntity,
  mapTagCategoryEntityToModel,
  mapTagEntityToModel,
} from '../../../../types';
import {PSBusEvent, PSEventBus, psLogger} from '../../../../utils';
import {PSBackButton} from '../../../PSActionBar';
import {PSAvatarImage} from '../../../PSAvatarImage';
import {PSAvatarSubThread} from '../../../PSAvatarSubThread';
import {PSAgentBadge, PSBotBadge} from '../../../PSBotBadge';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {PSLabelTag} from '../../../PSLabelTag';
import {usePSTagsPickerActionContext} from '../../../tags';
import {PSMessagesStyles} from '../../PSMessagesStyles';
import {
  usePSActiveUserCountInThreadContext,
  usePSMessageCurrentThreadContext,
  usePSMessageIsSubthreadContext,
  usePSMessageNavigationContext,
  usePSMessageUserBlockContext,
  usePSSelectMessageActionContext,
  usePSSelectMessageContext,
  usePSSelectMessageIsEnabledContext,
} from '../../contexts';
import _ from 'lodash';

const HEADER_CONTENT_HEIGHT = (60).px();

const CONTENT_LENGTH = 30;

const MessageActionBar = React.memo(() => {
  useRenderCounter('MessageActionBar');

  const messageStyles = usePSScreenStylesContext<PSMessagesStyles>();

  const {isDeskMode} = usePSIsDeskModeContext();

  const {translator} = usePSTranslationContext();

  const {colors} = usePSDesignSystemContext();

  const {
    onBackPress,
    onThreadProfilePress,
    onThreadDeskProfilePress,
    onSearchMessagePress,
    onParentThreadPress,
  } = usePSMessageNavigationContext();

  const {closeMediaPicker} = usePSMediaPickerActionContext();

  const {closeStickerPicker} = usePSStickerPickerActionContext();

  const activeUserCount = usePSActiveUserCountInThreadContext().activeUserCount;

  const isSubThread = usePSMessageIsSubthreadContext();

  const currentThread = usePSMessageCurrentThreadContext();

  const {onlineTimePartners} = usePSLastOnlineTimeContext();

  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const [threadParentName, setThreadParentName] = React.useState('');

  const {isBlockedByMe, isBlockedByPartner} = usePSMessageUserBlockContext();

  const {subTitle, color, isOnline} = React.useMemo(() => {
    // mình đang block user này hoặc mình bị block
    if (isBlockedByMe || isBlockedByPartner) {
      return {
        subTitle: undefined,
        isOnline: false,
      };
    }

    if (
      currentThread?.type === PSThreadType.GROUP &&
      !isSubThread &&
      !(messageStyles.actionsBar?.isActiveUserCountVisible === false) &&
      (messageStyles.actionsBar?.allowedActiveUserCountVisibleWithGroup ===
        undefined ||
        (currentThread?.groupLevel &&
          messageStyles.actionsBar?.allowedActiveUserCountVisibleWithGroup.includes(
            currentThread.groupLevel,
          )))
    ) {
      return {
        subTitle: `${translator(
          'ps_thread_profile_total_users',
          // @ts-ignore
          {
            total: `${currentThread?.memberCount}`,
          },
        )} ${activeUserCount > 0 ? `| ${activeUserCount} ${translator('ps_message_online').toLowerCase()}` : ''}`,
        color: colors.Neutral.n600,
        isOnline: false,
      };
    }

    if (
      currentThread?.type === PSThreadType.GROUP ||
      currentThread?.partner?.type !== PSUserType.USER
    ) {
      return {
        subTitle: undefined,
        isOnline: false,
      };
    }
    const lastOnlineTime = onlineTimePartners.find(
      item => item.threadId === currentThread?.id,
    )?.lastOnlineTime;
    if (lastOnlineTime) {
      const now = new Date().getTime() / 1000;
      const subSecond = Math.max(0, now - lastOnlineTime);
      if (subSecond < DETERMINE_RECENT_OFFLINE_TIME) {
        return {
          subTitle: translator('ps_message_online'),
          color: colors.Active.normal,
          isOnline: true,
        };
      } else if (subSecond < DETERMINE_OFFLINE_TIME_ONE_HOUR) {
        return {
          subTitle: translator(
            'ps_message_active_time_minute',
            // @ts-ignore
            {
              time: `${Math.round(subSecond / 60)}`,
            },
          ),
          color: colors.Neutral.n600,
          isOnline: false,
        };
      } else if (subSecond < DETERMINE_OFFLINE_TIME_ONE_DAY) {
        return {
          subTitle: translator(
            'ps_message_active_time_hour',
            // @ts-ignore
            {
              time: `${Math.round(subSecond / (60 * 60))}`,
            },
          ),
          color: colors.Neutral.n600,
          isOnline: false,
        };
      } else if (subSecond < DETERMINE_OFFLINE_TIME_ONE_WEEK) {
        return {
          subTitle: translator('ps_message_online_recently'),
          color: colors.Neutral.n600,
          isOnline: false,
        };
      } else {
        return {
          subTitle: undefined, // translator('ps_message_offline'),
          color: colors.Neutral.n600,
          isOnline: false,
        };
      }
    } else {
      return {
        subTitle: undefined, // translator('ps_message_offline'),
        color: colors.Neutral.n600,
        isOnline: false,
      };
    }
  }, [
    currentThread?.id,
    currentThread?.type,
    currentThread?.partner?.type,
    currentThread?.memberCount,
    colors.Active.normal,
    colors.Neutral.n600,
    useDeepCompareMemoize(onlineTimePartners),
    translator,
    isBlockedByMe,
    isBlockedByPartner,
    messageStyles.actionsBar?.isActiveUserCountVisible,
    activeUserCount,
    messageStyles.actionsBar?.allowedActiveUserCountVisibleWithGroup,
    currentThread?.groupLevel,
  ]);

  const onPress = () => {
    const threadId = currentThread?.id;
    if (threadId) {
      Keyboard.dismiss();
      closeMediaPicker();
      closeStickerPicker();
      if (onThreadProfilePress && threadId) {
        onThreadProfilePress(threadId);
      }
    }
  };

  const handleSubthreadDetail = () => {
    const threadId = currentThread?.parentId;
    const messageId = currentThread?.originalMessageId;
    if (threadId && messageId) {
      Keyboard.dismiss();
      closeMediaPicker();
      closeStickerPicker();
      if (typeof onParentThreadPress === 'function') {
        onParentThreadPress(threadId);
        setTimeout(() => {
          PSEventBus.getInstance().dispatch(
            PSBusEvent.SCROLL_TO_MESSAGE,
            messageId,
          );
        }, 1000);
      }
    }
  };

  const onDeskPress = () => {
    const threadId = currentThread?.id;
    if (threadId) {
      Keyboard.dismiss();
      closeMediaPicker();
      closeStickerPicker();
      if (onThreadDeskProfilePress && threadId) {
        onThreadDeskProfilePress(threadId);
      }
    }
  };

  const onPressSearchMessage = React.useCallback(() => {
    if (currentThread?.parentId) {
      onSearchMessagePress?.(currentThread?.id);
    }
  }, [currentThread?.parentId, currentThread?.id, onSearchMessagePress]);

  const isShowRightButton = React.useMemo(() => {
    if (
      currentThread?.type === PSThreadType.DIRECT &&
      typeof messageStyles?.actionsBar?.rightButton === 'function'
    )
      return true;
    return false;
  }, [currentThread?.type, messageStyles?.actionsBar]);

  const isShowMenuRightBottom = React.useMemo(() => {
    return messageStyles?.actionsBar?.isMenuRightButtonVisible === false
      ? false
      : true;
  }, [messageStyles?.actionsBar?.isMenuRightButtonVisible]);

  const isShowSearchRightBottom = React.useMemo(() => {
    return messageStyles?.actionsBar?.isSearchRightButtonVisible === false
      ? false
      : true;
  }, [messageStyles?.actionsBar?.isSearchRightButtonVisible]);

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.white,
        borderBottomColor: colors.Primary.border,
      },
    ];
  }, [colors.Primary.white, colors.Primary.border]);

  const threadParent = React.useMemo(() => {
    return PSThreadEntity.getFirstById(realm, currentThread?.parentId!);
  }, [realm, currentThread?.parentId]);

  React.useEffect(() => {
    // nếu là subthread thì gọi thêm api get thread parent vừa để lấy permission vừa để lấy tên
    // thread parent khi trong cache chưa có data parent
    if (!isSubThread) return;
    if (threadParent?.name) {
      setThreadParentName(threadParent.name ?? '');
    }
    const fetchDataThreadParent = async () => {
      const response = await chatApiClient?.threadApi.fetchThreadById(
        currentThread?.parentId!,
      );
      setThreadParentName(response?.data?.name ?? '');
      if (!_.isEmpty(response?.data?.setting)) {
        realm.write(() => {
          PSThreadEntity.getFirstById(
            realm,
            currentThread?.parentId!,
          )?.updateSetting(
            PSThreadSettingEntity.mapFromDto(response?.data?.setting)!,
          );
        });
      }
    };
    fetchDataThreadParent();
  }, [isSubThread, threadParent?.name, currentThread?.parentId, chatApiClient]);

  return (
    <View style={[containerStyles, messageStyles?.actionsBar?.style]}>
      <PSBackButton
        onBackPress={onBackPress}
        fillColor={colors.Primary.subText}
      />
      <PSDebouncedPressable
        disabled={isSubThread}
        style={styles.rowContainer}
        onPress={onPress}>
        {!messageStyles.actionsBar?.hideAvatar && (
          <MemoizeAvatarThread
            avatar={currentThread?.avatar}
            name={currentThread?.name}
            parentId={currentThread?.parentId}
            isOnline={isOnline}
            isPublicGroup={currentThread?.isPublic()}
            isSubThread={isSubThread}
          />
        )}
        <View style={styles.textContainer}>
          <MemoizeTitle
            title={currentThread?.name}
            isBot={currentThread?.partner?.type === PSUserType.BOT}
            isAgent={currentThread?.partner?.type === PSUserType.CS_AGENT}
            verified={currentThread?.partner?.verified}
            isSubThread={isSubThread}
            threadParentName={threadParentName}
            onPress={onDeskPress}
            handleSubthreadDetail={handleSubthreadDetail}
          />
          <MemoizeSubTitle subTitle={subTitle} color={color} />

          {isDeskMode ? <MemoizeTags /> : null}
        </View>
      </PSDebouncedPressable>
      {isShowRightButton &&
        messageStyles?.actionsBar?.rightButton?.({
          userId: currentThread?.partner?.userId,
        })}
      {isSubThread ? (
        isShowSearchRightBottom ? (
          <PSDebouncedPressable onPress={onPressSearchMessage}>
            <PSIcSearch24 fill={colors.Primary.subText} />
          </PSDebouncedPressable>
        ) : null
      ) : isShowMenuRightBottom ? (
        <PSDebouncedPressable onPress={onPress}>
          <PSIcMenuInfo24
            width={(32).px()}
            height={(32).px()}
            fill={colors.Primary.subText}
          />
        </PSDebouncedPressable>
      ) : null}
    </View>
  );
});

const MemoizeAvatarThread = React.memo(
  ({
    avatar,
    name,
    parentId,
    isOnline,
    isPublicGroup,
    isSubThread,
  }: {
    avatar?: string;
    name?: string;
    parentId?: string;
    isPublicGroup?: boolean;
    isOnline: boolean;
    isSubThread?: boolean;
  }) => {
    const {colors} = usePSDesignSystemContext();
    const size = (44).px();
    const hashtagContainerStyles = React.useMemo(() => {
      return [
        styles.threadPublic,
        {
          backgroundColor: colors.Primary.decorative,
          borderColor: colors.Primary.white,
          top: size / 1.5,
        },
      ];
    }, [colors.Primary.decorative, colors.Primary.white]);

    const statusContainerStyles = React.useMemo(() => {
      return [
        styles.status,
        {
          borderColor: colors.Neutral.n0,
          backgroundColor: colors.Active.normal,
          top: size / 1.5,
        },
      ];
    }, [colors.Neutral.n0, colors.Active.normal]);

    if (isSubThread && parentId) {
      const realm = useRealm();
      const parentThread = PSThreadEntity.getFirstById(realm, parentId);
      return (
        <PSAvatarSubThread
          displayName={parentThread?.name ?? ''}
          url={parentThread?.avatar ?? ''}
        />
      );
    }

    return (
      <View style={{position: 'relative'}}>
        <PSAvatarImage
          size={size}
          displayName={name ?? ''}
          url={avatar ?? ''}
        />
        {isPublicGroup ? (
          <View style={hashtagContainerStyles}>
            <PSIcHashTag24
              width={(12).px()}
              height={(12).px()}
              fill={colors.Neutral.n0}
            />
          </View>
        ) : isOnline ? (
          <View style={statusContainerStyles} />
        ) : null}
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeTitle = React.memo(
  ({
    title,
    isBot,
    isAgent,
    containerStyle,
    verified,
    isSubThread,
    threadParentName,
    onPress,
    handleSubthreadDetail,
  }: {
    title?: string;
    isBot: boolean;
    isAgent: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    verified?: boolean;
    isSubThread?: boolean;
    threadParentName?: string;
    onPress?: null | (() => void);
    handleSubthreadDetail?: null | (() => void);
  }) => {
    const {isDeskMode} = usePSIsDeskModeContext();
    const {translator} = usePSTranslationContext();

    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.title,
        typography.headingLargeB,
        {
          color: colors.Primary.mainText,
          flex:
            Platform.OS === 'android' && title && title.length > CONTENT_LENGTH
              ? 1
              : undefined,
        },
      ];
    }, [colors.Primary.mainText, typography.headingLargeB, title]);

    const badgeStyles = React.useMemo(() => {
      return [
        styles.botBadge,
        typography.bodyMediumS,
        {
          color: colors.Primary.decorative,
          backgroundColor: colors.SubBranding.sb50,
        },
      ];
    }, [colors.Primary.decorative, typography.bodyMediumS]);

    if (isSubThread)
      return (
        <View
          style={[
            styles.titleContainer,
            {flexDirection: 'column'},
            containerStyle,
          ]}>
          <Text numberOfLines={1} style={[textStyles, {flex: undefined}]}>
            {translator('ps_topic')}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={{...typography.bodyMediumR, color: colors.Neutral.n600}}>
            {translator('ps_from')}
            <Text
              style={{
                ...typography.bodyMediumM,
                color: colors.Primary.branding,
              }}
              onPress={
                typeof handleSubthreadDetail === 'function'
                  ? handleSubthreadDetail
                  : () => {}
              }>
              {' '}
              {threadParentName}
            </Text>
          </Text>
        </View>
      );

    return title ? (
      <PSDebouncedPressable
        style={[styles.titleContainer, containerStyle]}
        disabled={!isDeskMode}
        onPress={onPress}>
        <Text numberOfLines={1} style={textStyles}>
          {title.workAroundTextOneLineContainsNewLineIOS()}
        </Text>
        {verified ? <PSIcVerified style={{marginLeft: (4).px()}} /> : null}
        {isBot && <PSBotBadge textStyle={badgeStyles} />}
        {isAgent && <PSAgentBadge textStyle={badgeStyles} />}
        {isDeskMode && (
          <PSIcArrowRight24
            width={(24).px()}
            height={(24).px()}
            fill={colors.Primary.subText}
          />
        )}
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeSubTitle = React.memo(
  ({subTitle, color}: {subTitle?: string; color?: ColorValue}) => {
    const {typography} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        typography.bodyMediumR,
        {
          color: color,
        },
      ];
    }, [color, typography.bodyMediumR]);

    return subTitle && color ? (
      <Text style={textStyles}>{subTitle}</Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MessageSelectModeActionBar = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.branding,
      },
    ];
  }, [colors.Primary.branding]);

  return (
    <View style={containerStyles}>
      <View style={styles.titleSelectMode}>
        <MemoizeSelectModeTitle />
      </View>
      <MemoizeCancelButton />
    </View>
  );
});

const MemoizeCancelButton = React.memo(() => {
  const {typography, colors} = usePSDesignSystemContext();

  const {translator} = usePSTranslationContext();

  const {cancelSelectMessage} = usePSSelectMessageActionContext();

  const textStyles = React.useMemo(() => {
    return [typography.headingMediumM, {color: colors.Primary.white}];
  }, [colors.Primary.white, typography.headingMediumM]);

  return (
    <PSDebouncedPressable
      style={styles.cancelButton}
      onPress={cancelSelectMessage}>
      <Text style={textStyles}>{translator('ps_cancel')}</Text>
    </PSDebouncedPressable>
  );
});

const MemoizeSelectModeTitle = React.memo(() => {
  const {typography, colors} = usePSDesignSystemContext();

  const {translator} = usePSTranslationContext();

  const selectedMessageId = usePSSelectMessageContext();

  const textStyles = React.useMemo(() => {
    return [typography.headingMediumM, {color: colors.Primary.white}];
  }, [colors.Primary.white, typography.headingMediumM]);

  return (
    <Text style={textStyles}>
      {translator(
        'ps_message_select_mode_title',
        // @ts-ignore
        {
          num: `${selectedMessageId.length}`,
        },
      )}
    </Text>
  );
});

const MessageFloatingActionBar = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const currentThread = usePSMessageCurrentThreadContext();

  const {onBackPress} = usePSMessageNavigationContext();

  const containerStyles = React.useMemo(() => {
    return [
      styles.floatingActionBarContainer,
      {backgroundColor: colors.Primary.branding},
    ];
  }, [colors.Primary.branding]);

  return (
    <View style={containerStyles}>
      <PSAvatarImage
        size={(36).px()}
        displayName={currentThread?.name ?? ''}
        url={currentThread?.avatar ?? ''}
      />
      <MemoizeTitleFloatingActionBar
        title={currentThread?.name}
        containerStyle={styles.floatingActionBarTitle}
      />
      <PSDebouncedPressable onPress={onBackPress}>
        <PSIcClose24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.placeHolder}
        />
      </PSDebouncedPressable>
    </View>
  );
});

const MemoizeTitleFloatingActionBar = React.memo(
  ({
    title,
    containerStyle,
  }: {
    title?: string;
    containerStyle?: StyleProp<ViewStyle>;
  }) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.title,
        typography.headingLargeB,
        {
          color: colors.Primary.white,
        },
      ];
    }, [colors.Primary.white, typography.headingLargeB]);

    return title ? (
      <Text numberOfLines={1} style={[textStyles, containerStyle]}>
        {title.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessagesActionBar = () => {
  const messageStyles = usePSScreenStylesContext<PSMessagesStyles>();

  const isSelectModeEnabled = usePSSelectMessageIsEnabledContext();

  return isSelectModeEnabled ? (
    <MessageSelectModeActionBar />
  ) : messageStyles.isFloating ? (
    <MessageFloatingActionBar />
  ) : (
    <MessageActionBar />
  );
};

const MemoizeTags = React.memo(
  () => {
    const {typography} = usePSDesignSystemContext();

    const currentThread = usePSMessageCurrentThreadContext();

    const tags = React.useMemo(() => {
      return (
        currentThread?.tags
          .filter(e => e.isPredefined)
          .map(e => mapTagEntityToModel(e)) ?? []
      );
    }, [currentThread?.tags]);

    const category = React.useMemo(() => {
      const categories = currentThread?.tagCategories
        .filter(e => e.isPredefined)
        .map(e => mapTagCategoryEntityToModel(e));
      if (categories && categories.length > 0) {
        return categories[0];
      } else {
        return undefined;
      }
    }, [currentThread?.tagCategories]);

    const {openTagsPicker} = usePSTagsPickerActionContext();

    const onPress = React.useCallback(
      (tag: PSTagModel) => {
        Keyboard.dismiss();
        category && openTagsPicker(category, tag);
      },
      [openTagsPicker, category],
    );

    return tags.length > 0 ? (
      <View style={styles.containerTags}>
        {tags.map(tag => {
          return (
            <PSLabelTag
              key={tag.id}
              title={tag.name}
              textStyle={[typography.bodyXLargeR, {color: tag.colorCode}]}
              style={[
                styles.tag,
                {
                  borderColor: tag.colorCode,
                  backgroundColor: `${tag.colorCode}1A`,
                },
              ]}
              visibleDropDown={true}
              colorDropDown={tag.colorCode}
              onPress={() => {
                onPress(tag);
              }}
            />
          );
        })}
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    // height: HEADER_CONTENT_HEIGHT,
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: (10).px(),
    paddingHorizontal: (16).px(),
    borderBottomWidth: (0.5).px(),
  },
  rowContainer: {flexDirection: 'row', flex: 1, marginStart: (8).px()},
  textContainer: {
    marginLeft: (8).px(),
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    marginEnd: (48).px(),
    width: '100%',
    alignItems: 'center',
  },
  title: {
    flexShrink: 1,
  },
  subTitle: {
    marginTop: (2).px(),
  },
  status: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: (1.5).px(),
    width: (15.36).px(),
    height: (15.36).px(),
    borderRadius: (6).px(),
  },
  threadPublic: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: (2).px(),
    width: (18).px(),
    height: (18).px(),
    borderRadius: (6.3).px(),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    position: 'absolute',
    start: 0,
    paddingHorizontal: (16).px(),
  },
  titleSelectMode: {
    flex: 1,
    alignItems: 'center',
  },
  botBadge: {
    marginStart: (8).px(),
  },
  floatingActionBarContainer: {
    flexDirection: 'row',
    paddingVertical: (10).px(),
    paddingHorizontal: (12).px(),
    borderTopStartRadius: (12).px(),
    borderTopEndRadius: (12).px(),
    alignItems: 'center',
  },
  floatingActionBarTitle: {marginStart: (8).px(), flex: 1},
  containerTags: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: (4).px(),
  },
  tag: {
    marginEnd: (4).px(),
  },
});
