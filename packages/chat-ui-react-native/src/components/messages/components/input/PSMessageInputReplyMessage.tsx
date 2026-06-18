import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {
  usePSMessagePreviewLinkContext,
  usePSReplyMessageContext,
  usePSReplyMessageSetIdContext,
} from '../../contexts';
import {PSIcClose24, PSIcReply24} from '../../../../icons';
import {generateThumbUrl} from '../../../../utils';
import {useDeepCompareMemoize, useRenderCounter} from '../../../../hooks';
import {PSMessageMetadataType} from '@communi/chat-api-client-typescript';
import isEqual from 'react-fast-compare';
import {PSMessageMediaModel} from '../../../../types';
import {PSImage} from '../../../PSImage';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {processTextWithMentionFromBackEnd} from '../../../PSRichText';

const Sperator = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  return (
    <View style={[styles.sperator, {backgroundColor: colors.Branding.b400}]} />
  );
});

const Media = React.memo(
  ({media}: {media?: PSMessageMediaModel}) => {
    return media ? (
      <PSImage
        resizeMode="cover"
        style={styles.image}
        source={{
          uri: generateThumbUrl({
            srcUrl: media.srcUrl,
            srcThumbUrl: media.srcThumbUrl,
            width: 256,
            height: 256,
          }),
        }}
      />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const Title = React.memo(
  ({title}: {title: string}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.textTitle,
        typography.bodyMediumS,
        {color: colors.Primary.mainText},
      ];
    }, [colors.Primary.mainText, typography.bodyMediumS]);

    return (
      <Text style={textStyles} numberOfLines={1}>
        {title.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const Description = React.memo(
  ({description}: {description: string}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.textDescription,
        typography.bodyMediumR,
        {color: colors.Primary.subText},
      ];
    }, [colors.Primary.subText, typography.bodyMediumR]);

    return (
      <Text numberOfLines={1} style={textStyles}>
        {description.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessageInputReplyMessage = React.memo(() => {
  const {translator} = usePSTranslationContext();

  const {colors} = usePSDesignSystemContext();

  const chatApiClient = usePSChatApiClientContext();

  const previewLink = usePSMessagePreviewLinkContext();

  const messageToReply = usePSReplyMessageContext();

  const replyMessage = usePSReplyMessageSetIdContext();

  const onClosePressed = () => {
    replyMessage(undefined);
  };

  const title = React.useMemo(() => {
    if (chatApiClient) {
      return messageToReply
        ? translator(
            'ps_message_input_reply_to',
            // @ts-ignore
            {
              name:
                messageToReply.sender.extUserId === chatApiClient.userId
                  ? translator('ps_message_input_reply_me')
                  : messageToReply.sender.name,
            },
          )
        : '';
    } else {
      return '';
    }
  }, [chatApiClient, translator, messageToReply]);

  const description = React.useMemo(() => {
    return messageToReply && messageToReply.body
      ? `${
          messageToReply.body.text
            ? processTextWithMentionFromBackEnd(
                messageToReply.body.text,
                messageToReply.body.mentionIds,
              ).text
            : messageToReply.body.media.length > 1
              ? translator('ps_message_input_reply_description_album')
              : messageToReply.body.media.length === 1
                ? messageToReply.body.media[0]?.type ===
                  PSMessageMetadataType.IMAGE
                  ? translator('ps_message_input_reply_description_image')
                  : translator('ps_message_input_reply_description_video')
                : messageToReply.body.poll
                  ? translator(
                      'ps_message_input_reply_description_poll',
                      // @ts-ignore
                      {
                        name: messageToReply.body.poll.title,
                      },
                    )
                  : messageToReply.body.sticker
                    ? 'Sticker'
                    : ''
        }`
      : '';
  }, [translator, useDeepCompareMemoize(messageToReply)]);

  const firstMedia = messageToReply?.body?.media[0];

  useRenderCounter(
    'PSMessageInputReplyMessage',
    messageToReply !== undefined && previewLink === undefined,
  );

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.bgBranding,
        borderBottomColor: colors.Neutral.n400,
      },
    ];
  }, [colors.Primary.bgBranding, colors.Neutral.n400]);

  return messageToReply && previewLink === undefined ? (
    <View style={containerStyles}>
      <PSIcReply24
        width={(32).px()}
        height={(32).px()}
        fill={colors.Branding.b400}
      />
      <Sperator />
      <View style={styles.contentContainer}>
        <Title title={title} />
        <Description description={description} />
      </View>
      <Media media={firstMedia} />
      <PSDebouncedPressable style={styles.buttonClose} onPress={onClosePressed}>
        <PSIcClose24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
      </PSDebouncedPressable>
    </View>
  ) : null;
});

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: (8).px(),
    paddingHorizontal: (16).px(),
    height: (56).px(),
    borderBottomWidth: (0.5).px(),
  },
  sperator: {
    height: '100%',
    width: (4).px(),
    marginStart: (12).px(),
    borderRadius: (33).px(),
  },
  contentContainer: {flex: 1, flexDirection: 'column', marginStart: (12).px()},
  textTitle: {},
  textDescription: {marginTop: (2).px()},
  image: {
    borderRadius: (4).px(),
    width: (32).px(),
    height: (32).px(),
  },
  buttonClose: {paddingStart: (16).px()},
});
