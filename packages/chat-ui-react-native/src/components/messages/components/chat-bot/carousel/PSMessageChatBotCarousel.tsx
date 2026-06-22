import React from 'react';
import {
  // FlatList,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {
  PSMessageChatBotButtonModel,
  PSMessageChatBotCardModel,
  PSMessageChatBotCarouselModel,
} from '../../../../../types';
import {PSMessageChatBotSubTitle} from '../PSMessageChatBotSubTitle';
import isEqual from 'react-fast-compare';
import {PSMessageChatBotButton} from '../PSMessageChatBotButton';
import {usePSDesignSystemContext} from '../../../../../context';
import {PSImage} from '../../../../PSImage';
import {
  MESSAGE_BORDER_RADIUS,
  usePSMessageItemContext,
} from '../../PSMessageItem';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';

export const PSMessageChatBotCarousel = React.memo(
  ({
    carousel,
    containerStyle,
  }: {
    carousel?: PSMessageChatBotCarouselModel;
    containerStyle?: StyleProp<ViewStyle>;
  }) => {
    const keyExtractor = React.useCallback(
      (item: PSMessageChatBotCardModel, index: number) => index.toString(),
      [],
    );

    const renderItem = React.useCallback(
      ({item}: {item: PSMessageChatBotCardModel}) => (
        <MemoizeCard card={item} />
      ),
      [],
    );

    const renderSeparator = React.useCallback(() => {
      return <View style={styles.separator} />;
    }, []);

    return carousel ? (
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        style={containerStyle}
        contentContainerStyle={styles.listContentContainer}
        data={carousel.cards}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={renderSeparator}
        renderItem={renderItem}
      />
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeCard = React.memo(
  ({card}: {card: PSMessageChatBotCardModel}) => {
    const {typography, colors} = usePSDesignSystemContext();
    const {onMessagePress} = usePSMessageItemContext();

    const imageStyles = React.useMemo(() => {
      return [
        styles.images,
        {
          backgroundColor: colors.Branding.b800,
        },
      ];
    }, [colors.Branding.b800]);

    const textStyles = React.useMemo(() => {
      return [
        styles.subTitleText,
        typography.bodyMediumR,
        {color: colors.Neutral.n500},
      ];
    }, [colors.Neutral.n500, typography.bodyMediumR]);

    return (
      <PSDebouncedPressable
        onPress={onMessagePress}
        style={[styles.container, {backgroundColor: colors.Primary.white}]}>
        <PSImage
          style={imageStyles}
          resizeMode="cover"
          source={{
            uri: card.imageUrl,
          }}
        />
        <MemoizeTitle text={card.title} />
        <PSMessageChatBotSubTitle text={card.subTitle} textStyle={textStyles} />
        <MemoizeButtons buttons={card.buttons} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeTitle = React.memo(
  ({text}: {text?: string}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.titleText,
        typography.headingMediumS,
        {color: colors.Primary.subText},
      ];
    }, [colors.Primary.subText, typography.headingMediumS]);

    return text ? (
      <Text numberOfLines={1} style={textStyles}>
        {text.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeButtons = React.memo(
  ({buttons}: {buttons: PSMessageChatBotButtonModel[]}) => {
    return buttons.map((button, index) => (
      <PSMessageChatBotButton
        key={index}
        label={button.label}
        action={button.action}
      />
    ));
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  listContentContainer: {
    paddingEnd: (16).px(),
  },
  container: {
    marginTop: (4).px(),
    width: (256).px(),
    overflow: 'hidden',
    borderRadius: MESSAGE_BORDER_RADIUS,
  },
  titleText: {
    paddingHorizontal: (16).px(),
    paddingBottom: (8).px(),
    paddingTop: (12).px(),
  },
  subTitleText: {
    paddingHorizontal: (16).px(),
    paddingBottom: (12).px(),
  },
  itemContainer: {
    width: '100%',
  },
  optionText: {
    textAlign: 'center',
    marginHorizontal: (16).px(),
    marginVertical: (12).px(),
  },
  images: {
    width: '100%',
    height: (136).px(),
  },
  separator: {
    width: (16).px(),
    height: '100%',
  },
});
