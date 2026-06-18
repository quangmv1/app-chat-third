import React from 'react';
import {PSUserModel} from '../../../../types';
import {Keyboard, StyleProp, StyleSheet, Text, ViewStyle} from 'react-native';
import {usePSMessageItemContext} from '../PSMessageItem';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../hooks';
import {PSAvatarImage} from '../../../PSAvatarImage';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSMessageSeenUserOverlayActionContext} from '../../contexts';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

const MAX_LENGTH = 10;

const MemoizeUsers = React.memo(
  ({users}: {users: PSUserModel[]}) => {
    useRenderCounter('MessageReaction.MemoizeUsers');
    return users.map(user => (
      <PSAvatarImage
        key={user.extUserId}
        url={user.avatar}
        displayName={user.name}
        size={(16).px()}
        imageStyle={styles.avatar}
      />
    ));
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const MomoizeLengthText = React.memo(
  ({length}: {length: number}) => {
    useRenderCounter('MessageReaction.MomoizeLengthText');

    const {typography, colors} = usePSDesignSystemContext();

    const {translator} = usePSTranslationContext();

    const textStyles = React.useMemo(() => {
      return [styles.text, typography.bodyXSmallR, {color: colors.Neutral.n700}];
    }, [colors.Neutral.n700, typography.bodyXSmallR]);

    return length > MAX_LENGTH ? (
      <Text style={textStyles}>
        {translator(
          'ps_message_seen_users_with_other_count',
          // @ts-ignore
          {
            count: length - MAX_LENGTH,
          },
        )}
      </Text>
    ) : null;
  },
  (prev, next) => {
    return prev.length === next.length;
  },
);

export const PSMessageSeenUsers = React.memo(
  ({
    seenUsers,
    containerStyle,
  }: {
    seenUsers: PSUserModel[];
    containerStyle: StyleProp<ViewStyle>;
  }) => {
    const {isOverlay} = usePSMessageItemContext();

    const {show} = usePSMessageSeenUserOverlayActionContext();

    useRenderCounter('MessageReaction', !isOverlay && seenUsers.length > 0);

    const onPress = () => {
      Keyboard.dismiss();
      show(seenUsers);
    };

    return !isOverlay && seenUsers.length ? (
      <PSDebouncedPressable
        onPress={onPress}
        style={[styles.container, containerStyle]}>
        <MemoizeUsers users={seenUsers.slice(0, MAX_LENGTH)} />
        <MomoizeLengthText length={seenUsers.length} />
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {flexDirection: 'row'},
  avatar: {marginEnd: (4).px()},
  text: {},
});
