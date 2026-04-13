import {
  PSMessageActionNoteType,
  PSMessageMetadataType,
} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import { useDeepCompareMemoize, useRenderCounter } from '../../../../hooks';
import { PSIcPin24, PSIcUnPin24 } from '../../../../icons';
import {
  PSMessageBodyModel,
  PSMessageModel,
  PSMessageParticipantsModel,
  PSUserModel,
} from '../../../../types';
import { PSAvatarImage } from '../../../PSAvatarImage';
import { PSDebouncedPressable } from '../../../PSDebouncedPressable';
import { processTextWithMentionFromBackEnd } from '../../../PSRichText';
import { usePSScrollToMessageContext } from '../../contexts';

const MemoizeText = React.memo(
  ({ text, style }: { text: string; style?: StyleProp<TextStyle> }) => {
    return <Text style={style}>{text}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const Common = React.memo(
  ({ type, sender }: { type: PSMessageActionNoteType; sender: PSUserModel }) => {
    const { translator } = usePSTranslationContext();

    const { typography, colors } = usePSDesignSystemContext();

    const text = React.useMemo(() => {
      switch (type) {
        case PSMessageActionNoteType.CREATE_GROUP:
          return translator('ps_message_action_note_create_group');
        case PSMessageActionNoteType.JOIN_GROUP:
          return translator('ps_message_action_note_join_group');
        case PSMessageActionNoteType.LEAVE_GROUP:
          return translator('ps_message_action_note_leave_group');
        case PSMessageActionNoteType.GROUP_NAME_UPDATED:
          return translator('ps_message_action_note_group_name_updated');
        case PSMessageActionNoteType.GROUP_AVATAR_UPDATED:
          return translator('ps_message_action_note_group_avatar_updated');
        case PSMessageActionNoteType.GROUP_DESCRIPTION_UPDATED:
          return translator('ps_message_action_note_group_description_updated');
        case PSMessageActionNoteType.JOIN_PUBLIC_GROUP:
          return translator('ps_message_action_note_join_public_group');
        default:
          return translator('ps_message_action_note_unsupported');
      }
    }, [translator, type]);

    const textContainerStyles = React.useMemo(() => {
      return [
        styles.text,
        { color: colors.Primary.mainText },
        typography.bodyLargeR,
      ];
    }, [colors.Primary.mainText, typography.bodyLargeR]);

    const textStyles = React.useMemo(() => {
      return [typography.bodyLargeS, { color: colors.Primary.mainText }];
    }, [colors.Primary.mainText, typography.bodyLargeS]);

    return (
      <View style={styles.container}>
        <PSAvatarImage
          imageStyle={styles.avatar}
          size={(16).px()}
          displayName={sender.name}
          url={sender.avatar}
        />
        <Text numberOfLines={3} style={textContainerStyles}>
          <MemoizeText style={textStyles} text={sender.name} />
          <MemoizeText text={text} />
        </Text>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const AddOrRemoveMember = React.memo(
  ({
    type,
    sender,
    participants,
  }: {
    type: PSMessageActionNoteType;
    sender: PSUserModel;
    participants?: PSMessageParticipantsModel;
  }) => {
    const { translator } = usePSTranslationContext();

    const { typography, colors } = usePSDesignSystemContext();

    const textContainerStyles = React.useMemo(() => {
      return [
        typography.bodyMediumR,
        {
          color: colors.Primary.mainText,
          marginStart:
            type !== PSMessageActionNoteType.MEMBER_ADDED_BY_SYSTEM &&
              type !== PSMessageActionNoteType.MEMBER_REMOVED_BY_SYSTEM
              ? (8).px()
              : undefined,
        },
      ];
    }, [colors.Primary.mainText, type, typography.bodyMediumR]);

    const textStyles = React.useMemo(() => {
      return [typography.bodyLargeS, { color: colors.Primary.mainText }];
    }, [colors.Primary.mainText, typography.bodyLargeS]);

    return participants ? (
      <View style={styles.container}>
        {type !== PSMessageActionNoteType.MEMBER_ADDED_BY_SYSTEM &&
          type !== PSMessageActionNoteType.MEMBER_REMOVED_BY_SYSTEM ? (
          <PSAvatarImage
            imageStyle={styles.avatar}
            size={(16).px()}
            displayName={sender.name}
            url={sender.avatar}
          />
        ) : null}
        <Text numberOfLines={3} style={textContainerStyles}>
          <MemoizeText
            style={textStyles}
            text={
              type === PSMessageActionNoteType.MEMBER_ADDED_BY_SYSTEM ||
                type === PSMessageActionNoteType.MEMBER_REMOVED_BY_SYSTEM
                ? translator('ps_system')
                : sender.name
            }
          />
          <MemoizeText
            text={translator(
              type === PSMessageActionNoteType.ADD_MEMBER
                ? 'ps_message_action_note_add'
                : type === PSMessageActionNoteType.REMOVE_MEMBER
                  ? 'ps_message_action_note_remove'
                  : ' ',
            )}
          />
          <MemoizeText style={textStyles} text={participants.member.name} />
          {participants.memberCount > 1 ? (
            <MemoizeText
              style={textStyles}
              text={translator(
                'ps_message_action_add_removed_with',
                // @ts-ignore
                {
                  count: participants.memberCount - 1,
                },
              )}
            />
          ) : null}
        </Text>
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const PinOrUnpin = React.memo(
  ({
    type,
    sender,
    message,
  }: {
    type: PSMessageActionNoteType;
    sender: PSUserModel;
    message?: PSMessageModel;
  }) => {
    const { translator } = usePSTranslationContext();

    const { scrollToMessage } = usePSScrollToMessageContext();

    const onPress = () => {
      if (message) {
        scrollToMessage(message.id, true);
      }
    };

    const { typography, colors } = usePSDesignSystemContext();

    const text = React.useMemo(() => {
      if (!message?.body) {
        return undefined;
      }
      const result = processTextWithMentionFromBackEnd(
        message.body.text,
        message.body.mentionIds,
      );

      if (result.text) {
        const truncatedString = result.text.includes('\n')
          ? result.text.split('\n')[0] + '...'
          : result.text;
        return `"${truncatedString}"`;
      } else if (message.body.media.length) {
        if (message.body.media.length === 1) {
          const media = message.body.media[0]!;
          if (media.type === PSMessageMetadataType.IMAGE) {
            return translator('ps_message_action_note_image');
          } else {
            return translator('ps_message_action_note_video');
          }
        } else {
          return translator('ps_message_action_note_album');
        }
      } else if (message.body.files.length) {
        return translator('ps_message_action_note_file');
      } else if (message.body.poll) {
        return message.body.poll.title;
      } else if (message.body.sticker) {
        return 'sticker';
      } else {
        return undefined;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translator, useDeepCompareMemoize(message?.body)]);

    const IconType = React.useMemo(() => {
      if (type === PSMessageActionNoteType.PIN) {
        return PSIcPin24;
      } else if (type === PSMessageActionNoteType.UNPIN) {
        return PSIcUnPin24;
      } else {
        return undefined;
      }
    }, [type]);

    const textContainerStyles = React.useMemo(() => {
      return [
        styles.text,
        typography.bodyLargeR,
        { color: colors.Primary.mainText },
      ];
    }, [colors.Primary.subText, typography.bodyMediumR]);

    const textNameStyles = React.useMemo(() => {
      return [typography.bodyLargeS, { color: colors.Primary.mainText }];
    }, [colors.Primary.mainText, typography.bodyLargeS]);

    const textViewStyles = React.useMemo(() => {
      return [typography.bodyLargeS, { color: colors.Primary.mainText }];
    }, [colors.Primary.mainText, typography.bodyLargeS]);

    return !!text && IconType !== undefined ? (
      <PSDebouncedPressable onPress={onPress} style={styles.container}>
        <IconType width={16} height={16} fill={colors.Primary.mainText} />
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={textContainerStyles}>
          <MemoizeText style={textNameStyles} text={sender.name} />
          <MemoizeText
            text={translator(
              type === PSMessageActionNoteType.PIN
                ? 'ps_message_action_note_pin'
                : 'ps_message_action_note_unpin',
            )}
          />
          <MemoizeText text={` ${text} `} />
          <MemoizeText style={textViewStyles} text={translator('ps_view')} />
        </Text>
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const BlockOrUnBlockMember = React.memo(
  ({
    type,
    sender,
    participants,
  }: {
    type: PSMessageActionNoteType;
    sender: PSUserModel;
    participants?: PSMessageParticipantsModel;
  }) => {
    const { translator } = usePSTranslationContext();

    const { typography, colors } = usePSDesignSystemContext();

    const textContainerStyles = React.useMemo(() => {
      return [
        typography.bodyMediumR,
        {
          color: colors.Neutral.n500,
          marginStart: (8).px(),
        },
      ];
    }, [colors.Neutral.n500, type, typography.bodyMediumR]);

    const textStyles = React.useMemo(() => {
      return [typography.bodyMediumM, { color: colors.Neutral.n700 }];
    }, [colors.Neutral.n700, typography.bodyMediumM]);

    return participants ? (
      <View style={styles.container}>
        <PSAvatarImage
          imageStyle={styles.avatar}
          size={(16).px()}
          displayName={sender.name}
          url={sender.avatar}
        />
        <Text numberOfLines={3} style={textContainerStyles}>
          <MemoizeText style={textStyles} text={sender.name} />
          <MemoizeText
            text={translator(
              type === PSMessageActionNoteType.BLOCK_MEMBER
                ? 'ps_message_action_note_block'
                : type === PSMessageActionNoteType.UN_BLOCK_MEMBER
                  ? 'ps_message_action_note_un_block'
                  : ' ',
            )}
          />
          <MemoizeText style={textStyles} text={participants.member.name} />
          {participants.memberCount > 1 ? (
            <MemoizeText
              style={textStyles}
              text={translator(
                'ps_message_action_add_removed_with',
                // @ts-ignore
                {
                  count: participants.memberCount - 1,
                },
              )}
            />
          ) : null}
        </Text>
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessageActionNote = React.memo(
  ({
    messageBody,
    sender,
  }: {
    messageBody: PSMessageBodyModel;
    sender: PSUserModel;
  }) => {
    useRenderCounter('MessageActionNote', messageBody.actionNote !== undefined);

    const component = React.useMemo(() => {
      if (messageBody.actionNote) {
        const type = messageBody.actionNote.type;
        switch (type) {
          case PSMessageActionNoteType.ADD_MEMBER:
          case PSMessageActionNoteType.REMOVE_MEMBER:
          case PSMessageActionNoteType.MEMBER_ADDED_BY_SYSTEM:
          case PSMessageActionNoteType.MEMBER_REMOVED_BY_SYSTEM:
            return (
              <AddOrRemoveMember
                type={messageBody.actionNote.type}
                sender={sender}
                participants={messageBody.participants}
              />
            );
          case PSMessageActionNoteType.PIN:
          case PSMessageActionNoteType.UNPIN:
            return (
              <PinOrUnpin
                type={messageBody.actionNote.type}
                sender={sender}
                message={messageBody.pinOrUnpinMessage}
              />
            );
          case PSMessageActionNoteType.BLOCK_MEMBER:
          case PSMessageActionNoteType.UN_BLOCK_MEMBER:
            return (
              <BlockOrUnBlockMember
                type={messageBody.actionNote.type}
                sender={sender}
                participants={messageBody.participants}
              />
            );
          case PSMessageActionNoteType.JOIN_GROUP:
          case PSMessageActionNoteType.JOIN_PUBLIC_GROUP:
            return (
              <JoinGroupAction
                type={messageBody.actionNote.type}
                sender={sender}
                participants={messageBody.participants}
              />
            );
          default:
            return (
              <Common type={messageBody.actionNote.type} sender={sender} />
            );
        }
      } else {
        return undefined;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useDeepCompareMemoize(sender), useDeepCompareMemoize(messageBody)]);

    return component;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);


const JoinGroupAction = React.memo(
  ({
    type,
    sender,
    participants,
  }: {
    type: PSMessageActionNoteType;
    sender: PSUserModel;
    participants?: PSMessageParticipantsModel;
  }) => {
    const { translator } = usePSTranslationContext();

    const { typography, colors } = usePSDesignSystemContext();

    const textContainerStyles = React.useMemo(() => {
      return [
        typography.bodyMediumR,
        {
          color: colors.Primary.mainText,
          marginStart:
            type !== PSMessageActionNoteType.MEMBER_ADDED_BY_SYSTEM &&
              type !== PSMessageActionNoteType.MEMBER_REMOVED_BY_SYSTEM
              ? (8).px()
              : undefined,
        },
      ];
    }, [colors.Primary.mainText, type, typography.bodyMediumR]);

    const textStyles = React.useMemo(() => {
      return [typography.bodyLargeS, { color: colors.Primary.mainText }];
    }, [colors.Primary.mainText, typography.bodyLargeS]);

    return participants ? (
      <View style={styles.container}>
        <Text numberOfLines={3} style={{ ...textContainerStyles, textAlign: 'center' }}>
          <MemoizeText style={textStyles} text={sender.name} />
          {participants.memberCount > 1 ? (
            <MemoizeText
              style={textStyles}
              text={translator(
                'ps_message_action_add_removed_with',
                // @ts-ignore
                {
                  count: participants.memberCount - 1,
                },
              )}
            />
          ) : null}
          <MemoizeText text={translator('ps_message_action_note_join_public_group')} />
        </Text>
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    maxWidth: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: (8).px(),
    marginHorizontal: (16).px(),
    marginTop: (12).px(),
  },
  text: { marginStart: (8).px() },
  avatar: { marginTop: (2).px() },
});
