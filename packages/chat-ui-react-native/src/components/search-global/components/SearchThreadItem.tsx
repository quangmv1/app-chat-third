import {PSSearchThreadType} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import {
  PSAgentBadge,
  PSAvatarImage,
  PSAvatarSubThread,
  PSBotBadge,
  PSDebouncedPressable,
  PSPublicGroupBadge,
} from '../../../components';
import {usePSDesignSystemContext, useRealm} from '../../../context';
import {PSThreadEntity, SearchThreadUIModel} from '../../../types';
import {PSIcHashTag24, PSIcVerified} from '../../../icons';

const SearchThreadItem = ({
  thread,
  verified,
  onPress,
  keySearch,
}: {
  index: number;
  thread: SearchThreadUIModel;
  verified?: boolean;
  onPress?: ({item}: {item: SearchThreadUIModel}) => void;
  keySearch?: string;
}) => {
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

  const maxWidth = React.useMemo(() => {
    if (verified && isBot) return '80%';
    if (verified && isAgent) return '80%';
    // if (isBot && isPublicGroup) return '80%';
    // if (verified && isPublicGroup) return '85%';
    if (verified || isBot || isPublicGroup || isAgent) return '90%';
    return '100%';
  }, [verified, isBot, isPublicGroup, isAgent]);

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
  }, [realm, isPublicGroup, thread.parentId, thread.name, thread.avatar]);

  return (
    <PSDebouncedPressable
      style={styles.container}
      onPress={() => {
        onPress?.({
          item: thread,
        });
      }}>
      {psAvatarSubThread}
      <View style={styles.titleContainer}>
        <View>
          {thread.targetName && (
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[
                styles.title,
                {color: colors.Neutral.n300, maxWidth},
                typography.bodyMediumR,
              ]}>
              {thread.targetName}
            </Text>
          )}
          {/* <Text
            style={[
              styles.title,
              {color: colors.Primary.subText, maxWidth},
              typography.headingMediumS,
            ]}>
            {thread.name}
          </Text> */}
          <HighlightedThreadName
            message={thread.name}
            searchKeyword={keySearch ?? ''}
            style={[
              styles.title,
              {color: colors.Primary.subText},
              typography.headingMediumS,
            ]}
          />
        </View>

        {verified ? <PSIcVerified /> : null}
        {isBot && (
          <PSBotBadge
            textStyle={[
              styles.botBadge,
              typography.bodyXSmallM,
              {
                color: colors.Primary.decorative,
                // borderColor: colors.Primary.decorative,
                backgroundColor: colors.SubBranding.sb50,
              },
              {marginStart: (4).px()},
            ]}
          />
        )}
        {isAgent && (
          <PSAgentBadge
            textStyle={[
              styles.botBadge,
              typography.bodyXSmallM,
              {
                color: colors.Primary.decorative,
                // borderColor: colors.Primary.decorative,
                backgroundColor: colors.SubBranding.sb50,
              },
              {marginStart: (4).px()},
            ]}
          />
        )}
        {/* {isPublicGroup && <PSPublicGroupBadge />} */}
      </View>
      <View style={{width: 20, height: 20}} />
    </PSDebouncedPressable>
  );
};

const HighlightedThreadName = ({
  message,
  searchKeyword,
  style,
}: {
  message: string;
  searchKeyword: string;
  style?: StyleProp<TextStyle> | undefined;
}) => {
  const {colors, typography} = usePSDesignSystemContext();
  if (!searchKeyword) {
    return (
      <Text numberOfLines={1} ellipsizeMode="tail" style={style}>
        {message}
      </Text>
    );
  }

  const normalizedMessage = message.removeDiacritics().toLowerCase();
  const normalizedKeyword = searchKeyword
    .removeDiacritics()
    .toLowerCase()
    .trim();

  // Tìm tất cả các vị trí xuất hiện của từ khóa
  const indices: number[] = [];
  let startIndex = 0;
  while (true) {
    const index = normalizedMessage.indexOf(normalizedKeyword, startIndex);
    if (index === -1) break;
    indices.push(index);
    startIndex = index + normalizedKeyword.length;
  }

  // Nếu không tìm thấy từ khóa, hiển thị message bình thường
  if (indices.length === 0) {
    return (
      <Text numberOfLines={1} ellipsizeMode="tail" style={style}>
        {message}
      </Text>
    );
  }

  // Tạo mảng các phần của message
  const parts: {text: string; highlight: boolean}[] = [];
  let lastIndex = 0;
  indices.forEach(index => {
    if (index > lastIndex) {
      parts.push({text: message.slice(lastIndex, index), highlight: false});
    }
    parts.push({
      text: message.slice(index, index + searchKeyword.length),
      highlight: true,
    });
    lastIndex = index + searchKeyword.length;
  });
  if (lastIndex < message.length) {
    parts.push({text: message.slice(lastIndex), highlight: false});
  }

  return (
    <Text style={style}>
      {parts.map((part, index) => (
        <Text
          key={index}
          style={
            part.highlight ? {backgroundColor: colors.Branding.b50} : undefined
          }>
          {part.text}
        </Text>
      ))}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    // shadowOffset: {width: 0, height: 2},
    // shadowRadius: 6,
    // shadowOpacity: 0.26,
    // elevation: 8,
    // padding: 10,
    // borderRadius: 10,
    // marginVertical: 5,
    // marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    // height: 68,
    paddingVertical: 8,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
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
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 48 / 2,
  },
  botBadge: {
    // marginStart: (4).px(),
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

export const PSSearchThreadItem = React.memo(SearchThreadItem, (prev, next) => {
  return isEqual(prev, next);
});
