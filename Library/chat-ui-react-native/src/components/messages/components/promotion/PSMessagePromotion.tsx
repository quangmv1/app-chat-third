import React from 'react';
import isEqual from 'react-fast-compare';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePSDesignSystemContext } from '../../../../context';
import { useDeepCompareMemoize } from '../../../../hooks';
import { PSIcPromotion } from '../../../../icons';
import { PSMessageChatBotButtonModel, PSMessageMediaModel, PSMessageModel } from '../../../../types';
import { PSDebouncedPressable } from '../../../PSDebouncedPressable';
import { PSImage } from '../../../PSImage';
import { usePSMessageItemContext } from '../PSMessageItem';
import { PSMessageChatBotButton } from '../chat-bot';
import { usePSMessageMediaViewerContext } from '../../contexts/PSMessageMediaViewerContext';

export const PSMessagePromotion = React.memo(
  ({ message }: { message: PSMessageModel }) => {
    const { onMessagePress, onMessageLongPress, isOverlay } = usePSMessageItemContext();
    const showImagesViewer = usePSMessageMediaViewerContext();

    const styles = useStylesPSMessagePromotionalTypeWrapper();

    const promotion = React.useMemo(() => {
      return message.body?.promotion;
    }, [useDeepCompareMemoize(message.body?.promotion)]);

    const onImagePress = React.useCallback(
      (index: number) => {
        if (!isOverlay && promotion?.imageUrl) {
          let image = {
            id: '0',
            srcUrl: promotion.imageUrl,
            srcThumbUrl: promotion.imageUrl,
          } as PSMessageMediaModel;
          showImagesViewer(index, [image]);
        }
      },
      [isOverlay, message, showImagesViewer],
    );


    return (
      <PSDebouncedPressable
        onPress={onMessagePress}
        onLongPress={onMessageLongPress}
        style={styles.container}>
        <MemoizeLabel text={promotion?.label} />
        <Pressable onPress={() => onImagePress(0)}>
          <PSImage
            source={{
              uri: promotion?.imageUrl,
            }}
            style={styles.styBanner} />
        </Pressable>
        <MemoizeTitle text={promotion?.title} />
        <MemoizeDescription text={promotion?.description} />
        <MemoizeButtons buttons={promotion?.buttons ?? []} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeLabel = React.memo(
  ({ text }: { text?: string }) => {
    const styles = useStylesPSMessagePromotionalTypeWrapper();
    if (!text) return null;
    return (
      <View style={styles.row}>
        <PSIcPromotion />
        <Text style={styles.styTxtLabel}>{text}</Text>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeTitle = React.memo(
  ({ text }: { text?: string }) => {
    const styles = useStylesPSMessagePromotionalTypeWrapper();

    return text ? <Text style={styles.styTxtTitle}>{text}</Text> : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeDescription = React.memo(
  ({ text }: { text?: string }) => {
    const styles = useStylesPSMessagePromotionalTypeWrapper();

    return text ? <Text style={styles.styTxtDes}>{text}</Text> : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeButtons = React.memo(
  ({ buttons }: { buttons: PSMessageChatBotButtonModel[] }) => {
    const styles = useStylesPSMessagePromotionalTypeWrapper();
    return buttons.map((button, index) => (
      <PSMessageChatBotButton
        key={index}
        label={button.label}
        action={button.action}
        textStyles={styles.styTxtButton}
      />
    ));
  },
  (prev, next) => isEqual(prev, next),
);

const useStylesPSMessagePromotionalTypeWrapper = () => {
  const { colors, typography } = usePSDesignSystemContext();

  return React.useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
        },
        container: {
          backgroundColor: colors.Primary.background,
          padding: (12).px(),
          margin: (16).px(),
          borderRadius: (16).px(),
        },
        styTxtLabel: {
          ...typography.headingMediumM,
          color: colors.Neutral.n700,
          marginLeft: (12).px(),
        },
        styTxtTitle: {
          ...typography.headingMediumS,
          color: colors.Primary.subText,
        },
        styTxtDes: {
          ...typography.bodyXLargeR,
          color: colors.Neutral.n800,
          marginVertical: (12).px(),
        },
        styBanner: {
          width: '100%',
          aspectRatio: 322 / 182,
          borderRadius: (16).px(),
          marginVertical: (12).px(),
        },
        styTxtButton: {
          ...typography.headingLargeM,
          color: colors.Branding.b400,
        },
      }),
    [colors, typography],
  );
};
