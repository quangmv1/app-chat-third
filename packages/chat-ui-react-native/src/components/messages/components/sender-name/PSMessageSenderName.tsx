import React from 'react';
import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import isEqual from 'react-fast-compare';
import {usePSDesignSystemContext} from '../../../../context';
import {usePSMessageItemContext} from '../PSMessageItem';
import {PSIcVerified} from '../../../../icons';
import {PSAvatarImage} from '../../../PSAvatarImage';
import {PSRoleThreadType} from '@communi/chat-api-client-typescript';

export const PSMessageSenderName = React.memo(
  ({
    senderName,
    isSenderNameVisible,
    senderAvatar,
    isAvatarVisible,
    containerStyle,
    verified,
    role,
  }: {
    senderName: string;
    isSenderNameVisible: boolean;
    senderAvatar?: string;
    isAvatarVisible?: boolean;
    containerStyle?: StyleProp<TextStyle>;
    verified?: boolean;
    role?: PSRoleThreadType;
  }) => {
    // const {typography, colors} = usePSDesignSystemContext();

    // const {isMyMessage} = usePSMessageItemContext();

    // const textStyles = React.useMemo(() => {
    //   return [
    //     styles.name,
    //     containerStyle,
    //     typography.headingMediumS,
    //     {color: isMyMessage ? colors.Primary.mainText : colors.Primary.subText},
    //   ];
    // }, [
    //   colors.Primary.subText,
    //   colors.Primary.mainText,
    //   containerStyle,
    //   isMyMessage,
    //   typography.headingMediumS,
    // ]);

    // isAvatarVisible true khi hiển thị origin sender

    return isSenderNameVisible ? (
      <View style={[styles.row, containerStyle]}>
        <PSOriginSenderAvatar
          avatar={senderAvatar ?? ''}
          name={senderName}
          isAvatarVisible={isAvatarVisible ?? false}
        />
        {/* <Text style={textStyles}>
          {isAvatarOriginVisible ? originSender?.name : senderName}
        </Text> */}
        <MessageSenderName
          senderName={senderName}
          isAvatarVisible={isAvatarVisible ?? false}
        />
        {/* origin sender k cần hiển thị verified */}
        {!isAvatarVisible && verified ? (
          <PSIcVerified style={styles.styTick} />
        ) : null}

        {/* hiển thị role trong group */}
        {!!role && <SenderRole role={role} />}
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const PSOriginSenderAvatar = React.memo(
  ({
    avatar,
    name,
    isAvatarVisible,
  }: {
    avatar: string;
    name: string;
    isAvatarVisible: boolean;
  }) => {
    return isAvatarVisible ? (
      <PSAvatarImage
        size={(18).px()}
        url={avatar}
        displayName={name}
        imageStyle={{marginEnd: (8).px()}}
      />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MessageSenderName = React.memo(
  ({
    senderName,
    isAvatarVisible,
  }: {
    senderName: string;
    isAvatarVisible: boolean;
  }) => {
    const {typography, colors} = usePSDesignSystemContext();

    const {isMyMessage} = usePSMessageItemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.name,
        isAvatarVisible ? typography.headingXSmallM : typography.headingMediumS,
        {
          color: isMyMessage
            ? colors.Primary.mainText
            : isAvatarVisible
              ? colors.Neutral.n400
              : colors.Primary.subText,
        },
      ];
    }, [
      isAvatarVisible,
      colors.Primary.subText,
      colors.Neutral.n400,
      colors.Primary.mainText,
      isMyMessage,
      typography.headingMediumS,
      typography.headingXSmallM,
    ]);

    return <Text style={textStyles}>{senderName}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const SenderRole = React.memo(
  ({role}: {role: PSRoleThreadType}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const isOverlay = usePSMessageItemContext()?.isOverlay;

    return (role === PSRoleThreadType.OWNER ||
      role === PSRoleThreadType.ADMIN) &&
      !isOverlay ? (
      <View
        style={[
          {borderRadius: 4, paddingHorizontal: 4, marginStart: 8},
          {backgroundColor: colors.Primary.bgBranding},
        ]}>
        <Text style={[typography.bodySmallR, {color: colors.Primary.branding}]}>
          {role === PSRoleThreadType.OWNER ? 'Owner' : 'Admin'}
        </Text>
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  name: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  styTick: {
    marginStart: (8).px(),
    // marginLeft: (-8).px(),
    // marginRight: (8).px(),
    // marginTop: (4).px(),
  },
});
