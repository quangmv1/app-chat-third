import React from 'react';
import { ColorValue, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { PSMessagePreviewLinkModel } from '../../../../types';
import isEqual from 'react-fast-compare';
import { useRenderCounter } from '../../../../hooks';
import { usePSMessageNavigationContext } from '../../contexts';
import {
  MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
  usePSMessageItemContext,
} from '../PSMessageItem';
import { PSImage } from '../../../PSImage';
import { PSDebouncedPressable } from '../../../PSDebouncedPressable';
import { usePSDesignSystemContext } from '../../../../context';

const Image = React.memo(
  ({ image, aspectRatio }: { image?: string; aspectRatio?: number }) => {
    const { colors } = usePSDesignSystemContext();

    const imageStyles = React.useMemo(() => {
      return [
        styles.image,
        {
          aspectRatio: aspectRatio ?? 1,
          // backgroundColor: colors.Branding.b800,
        },
      ];
    }, [aspectRatio, colors.Branding.b800]);

    return image ? (
      <PSImage
        style={imageStyles}
        resizeMode="cover"
        source={{
          uri: image,
        }}
      />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const Title = React.memo(
  ({ color, title }: { color: ColorValue; title?: string }) => {
    const { typography } = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [styles.textTitle, typography.bodyMediumS, { color: color }];
    }, [color, typography.bodyMediumS]);

    return title ? (
      <Text numberOfLines={2} style={textStyles}>
        {title}
      </Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const Desription = React.memo(
  ({ color, description }: { color: ColorValue; description?: string }) => {
    const { typography } = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [styles.textDescription, typography.bodyMediumR, { color: color }];
    }, [color, typography.bodyMediumR]);

    return description ? (
      <Text numberOfLines={2} style={textStyles}>
        {description}
      </Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessagePreviewLink = React.memo(
  ({
    previewLink,
    containerStyle,
  }: {
    previewLink?: PSMessagePreviewLinkModel;
    containerStyle?: StyleProp<ViewStyle>;
  }) => {
    const { onUrlPress } = usePSMessageNavigationContext();

    const { isMyMessage, onMessageLongPress } = usePSMessageItemContext();

    const { colors } = usePSDesignSystemContext();

    const aspectRatio = React.useMemo(() => {
      if (previewLink?.width && previewLink?.height) {
        return previewLink.width / previewLink.height;
      } else {
        return undefined;
      }
    }, [previewLink?.width, previewLink?.height]);

    const onPress = () => {
      if (onUrlPress && previewLink?.url) {
        onUrlPress(previewLink.url);
      }
    };

    useRenderCounter('MessagePreviewLink', previewLink !== undefined);
    return previewLink ? (
      <PSDebouncedPressable
        onPress={onPress}
        onLongPress={onMessageLongPress}
        style={[styles.container, containerStyle]}>
        <Image image={previewLink.image} aspectRatio={aspectRatio} />
        <Title
          color={
            isMyMessage ? colors.Primary.mainText : colors.Primary.mainText
          }
          title={previewLink.title}
        />
        <Desription
          color={isMyMessage ? colors.Primary.subText : colors.Primary.subText}
          description={previewLink.description}
        />
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
  },
  image: { width: '100%', alignSelf: 'center' },
  textTitle: {
    paddingHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
    marginTop: (12).px(),
    marginBottom: (6).px(),
  },
  textDescription: {
    marginTop: (2).px(),
    marginBottom: (10).px(),
    paddingHorizontal: MESSAGE_BUBBLE_MARGIN_HORIZONTAL,
  },
});
