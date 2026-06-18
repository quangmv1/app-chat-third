import React from 'react';
import {StyleSheet, View} from 'react-native';
import {PSPinnedMessageArrowRight} from './PSPinnedMessageArrowRight';
import {PSPinnedMessageText} from './PSPinnedMessageText';
import {PSPinnedMessageMediaThumb} from './PSPinnedMessageMediaThumb';
import isEqual from 'react-fast-compare';
import {PSMessageModel} from '../../../../types';
import {useRenderCounter} from '../../../../hooks';
import {PSPinnedMessageFileThumb} from './PSPinnedMessageFileThumb';
import {usePSDesignSystemContext} from '../../../../context';
import {PSImage} from '../../../PSImage';

export const PSPinnedMessageContent = React.memo(
  ({
    pinnedMessagesLength,
    pinnedMessage,
    allPinnedMessagesPress,
  }: {
    pinnedMessagesLength: number;
    pinnedMessage: PSMessageModel;
    allPinnedMessagesPress: () => void;
  }) => {
    useRenderCounter('PinnedMessageContent');

    const {colors} = usePSDesignSystemContext();

    const lineStyles = React.useMemo(() => {
      return [styles.leadingLine, {backgroundColor: colors.Primary.branding}];
    }, [colors.Primary.branding]);

    return (
      <View style={styles.container}>
        <View style={lineStyles} />
        {pinnedMessage.body?.sticker && (
          <PSImage
            style={styles.sticker}
            source={{
              uri: pinnedMessage.body.sticker.srcUrl,
            }}
            resizeMode="cover"
          />
        )}
        <PSPinnedMessageMediaThumb media={pinnedMessage.body?.media[0]} />
        <PSPinnedMessageFileThumb
          file={pinnedMessage.body?.files[0]}
          isVisible={pinnedMessage.body?.files[0] !== undefined}
        />
        <PSPinnedMessageText
          pinnedMessagesLength={pinnedMessagesLength}
          pinnedMessage={pinnedMessage}
        />
        <PSPinnedMessageArrowRight onPress={allPinnedMessagesPress} />
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: (8).px(),
    height: '100%',
  },
  leadingLine: {
    width: (4).px(),
    height: '100%',
    borderRadius: (33).px(),
    marginStart: (16).px(),
  },
  sticker: {
    width: (40).px(),
    height: (40).px(),
    marginStart: (12).px(),
  },
});
