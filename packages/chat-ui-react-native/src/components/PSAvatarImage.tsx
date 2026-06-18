import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  Text,
  ViewStyle,
  useWindowDimensions,
  ImageStyle,
  Platform,
  Image,
} from 'react-native';
import {generateThumbUrl} from '../utils';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../hooks';
import {PSImage} from './PSImage';

type PSAvatarImageProps = {
  url?: string;
  displayName?: string;
  size?: number;
  borderRadius?: number;
  imageStyle?: StyleProp<ImageStyle>;
};

export const PSAvatarImage = React.memo(
  (props: PSAvatarImageProps) => {
    useRenderCounter('AvatarImage');

    const {url, displayName, size = 32, borderRadius, imageStyle} = props;

    const [imageError, setImageError] = React.useState(false);
    const onError = () => {
      setImageError(true);
    };

    const thumbUrl = React.useMemo(() => {
      return generateThumbUrl({
        srcUrl: url ?? '',
        srcThumbUrl: url,
        width: 128,
        height: 128,
      });
    }, [url, size]);

    React.useEffect(() => {
      setImageError(false);

      if (Platform.OS === 'android' && thumbUrl) {
        // https://github.com/facebook/react-native/issues/7440
        Image.prefetch(thumbUrl).catch(onError);
      }
    }, [thumbUrl]);

    if (thumbUrl && !imageError) {
      return (
        <PSImage
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: borderRadius ?? size / 2,
            },
            imageStyle,
          ]}
          source={{
            uri: thumbUrl,
          }}
          resizeMode="contain"
          onError={onError}
        />
      );
    } else {
      return (
        <AvatarText
          label={displayName}
          size={size}
          borderRadius={borderRadius}
          style={imageStyle}
        />
      );
    }
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const backgroundColors = [
  '#C3C7CC',
  '#F5222D',
  '#FADB14',
  '#FFA940',
  '#A0D911',
  '#20C950',
  '#13C2C2',
  '#1A99F4',
  '#2F54EB',
  '#722ED1',
  '#FF4D82',
];

const getBackgroundColorByText = (text: String) => {
  const length = backgroundColors.length;
  let index = 0;
  if (text.length >= 2) {
    index = (text.charCodeAt(0) + text.charCodeAt(1)) % length;
  } else {
    index = text.charCodeAt(0) % length;
  }
  return backgroundColors[index] ?? backgroundColors[0];
};

const defaultSize = 64;

export type PSAvatarImageTextProps = React.ComponentPropsWithRef<
  typeof View
> & {
  label?: string;
  size?: number;
  borderRadius?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

const AvatarText = ({
  label,
  size = defaultSize,
  borderRadius,
  style,
  labelStyle,
}: PSAvatarImageTextProps) => {
  const {fontScale} = useWindowDimensions();

  const text = React.useMemo(() => {
    const words = (label ?? 'PS')
      .split(' ')
      .filter(item => item && item.charAt(0).match(/[\p{L}]/gu));

    switch (words.length) {
      case 0:
        return 'PS';

      case 1:
        return words[0]!.charAt(0);

      default:
        return words[0]!.charAt(0) + words[words.length - 1]!.charAt(0);
    }
  }, [label]);

  const backgroundColor = React.useMemo(
    () => getBackgroundColorByText(text),
    [text],
  );

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: borderRadius ?? size / 2,
          backgroundColor: backgroundColor,
        },
        styles.container,
        style,
      ]}>
      <Text
        style={[
          styles.text,
          {
            fontSize: size / 2,
            lineHeight: size / fontScale,
          },
          labelStyle,
        ]}
        numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    textTransform: 'uppercase',
  },
  image: {
    borderWidth: 0.25,
    borderColor: '#EDEDED',
  },
});
