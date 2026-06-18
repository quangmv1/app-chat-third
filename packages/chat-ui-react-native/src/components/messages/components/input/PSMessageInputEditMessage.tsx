import React from 'react';
import {
  usePSEditMessageContext,
  usePSEditMessageSetIdContext,
  usePSMessagePreviewLinkContext,
} from '../../contexts';
import {Text, View, StyleSheet} from 'react-native';
import {PSIcClose24, PSIcPencil24} from '../../../../icons';
import {PSMessageMetadataType} from '@communi/chat-api-client-typescript';
import {useRenderCounter} from '../../../../hooks';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {processTextWithMentionFromBackEnd} from '../../../PSRichText';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

const Sperator = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const containerStyles = React.useMemo(() => {
    return [styles.sperator, {backgroundColor: colors.Branding.b400}];
  }, [colors.Branding.b400]);

  return <View style={containerStyles} />;
});

const Title = React.memo(
  ({title}: {title: string}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [styles.textTitle, typography.bodyMediumS, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.bodyMediumS]);

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
        typography.bodySmallR,
        {color: colors.Neutral.n400},
      ];
    }, [colors.Neutral.n400, typography.bodySmallR]);

    return (
      <Text numberOfLines={1} style={textStyles}>
        {description.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessageInputEditMessage = React.memo(() => {
  const {translator} = usePSTranslationContext();
  const {colors} = usePSDesignSystemContext();

  const previewLink = usePSMessagePreviewLinkContext();
  const messageToEdit = usePSEditMessageContext();
  const editMessage = usePSEditMessageSetIdContext();

  const textMentionValue = React.useMemo(
    () =>
      messageToEdit?.body?.text && messageToEdit?.body?.mentionIds
        ? processTextWithMentionFromBackEnd(messageToEdit.body.text, [
            ...messageToEdit.body.mentionIds,
          ])
        : undefined,
    [messageToEdit?.body?.text, messageToEdit?.body?.mentionIds],
  );

  const description = React.useMemo(() => {
    if (textMentionValue) {
      return textMentionValue.text;
    } else if (messageToEdit?.body?.media && messageToEdit.body.media.length) {
      if (messageToEdit.body.media.length > 1) {
        return translator('ps_message_input_edit_description_album');
      } else {
        const media = messageToEdit.body.media[0]!;
        if (media.type === PSMessageMetadataType.IMAGE) {
          return translator('ps_message_input_edit_description_image');
        } else {
          return translator('ps_message_input_edit_description_video');
        }
      }
    } else {
      return '';
    }
  }, [translator, textMentionValue, messageToEdit?.body?.media]);

  const onClosePressed = () => {
    editMessage(undefined);
  };

  useRenderCounter(
    'PSMessageInputEditMessage',
    messageToEdit !== undefined && previewLink === undefined,
  );

  const textStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.bgBranding,
        borderBottomColor: colors.Neutral.n400,
      },
    ];
  }, [colors.Primary.bgBranding, colors.Neutral.n400]);

  return messageToEdit && previewLink === undefined ? (
    <View style={textStyles}>
      <PSIcPencil24
        width={(32).px()}
        height={(32).px()}
        fill={colors.Branding.b400}
      />
      <Sperator />
      <View style={styles.contentContainer}>
        <Title title={translator('ps_message_input_edit_title')} />
        <Description description={description} />
      </View>
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
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    marginStart: (12).px(),
  },
  textTitle: {},
  textDescription: {marginTop: (2).px()},
  buttonClose: {paddingStart: (16).px()},
});
