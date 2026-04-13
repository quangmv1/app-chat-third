import React from 'react';
import {StyleSheet, Text, View, StyleProp, ViewStyle} from 'react-native';
import {PSIcForward24} from '../../../../icons';
import {usePSMessageItemContext} from '../PSMessageItem';
import {PSUserModel} from '../../../../types';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../../../hooks';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

export const PSMessageForwardHeader = React.memo(
  ({
    forwarder,
    containerStyle,
  }: {
    forwarder?: PSUserModel;
    containerStyle: StyleProp<ViewStyle>;
  }) => {
    const {colors} = usePSDesignSystemContext();

    const {translator} = usePSTranslationContext();

    const {myUserId, isMyMessage} = usePSMessageItemContext();

    useRenderCounter('MessageForwardHeader', forwarder !== undefined);

    const textStyles = React.useMemo(() => {
      return [
        styles.text,
        {
          color: isMyMessage ? colors.Primary.mainText : colors.Primary.subText,
        },
      ];
    }, [colors.Primary.subText, colors.Primary.mainText, isMyMessage]);

    return forwarder ? (
      <View style={[styles.container, containerStyle]}>
        <PSIcForward24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.branding}
        />
        <Text style={textStyles}>
          <MemoizeForwardFrom />
          <MemoizeForwarder
            name={
              forwarder.extUserId === myUserId
                ? translator('ps_you')
                : forwarder.name
            }
          />
        </Text>
      </View>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const MemoizeForwardFrom = React.memo(() => {
  const {typography} = usePSDesignSystemContext();

  const {translator} = usePSTranslationContext();

  return (
    <Text style={typography.bodyMediumR}>{translator('ps_message_forward_from')}</Text>
  );
});

const MemoizeForwarder = React.memo(
  ({name}: {name: string}) => {
    const {typography} = usePSDesignSystemContext();
    return <Text style={typography.bodyMediumM}>{name}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginStart: (4).px(),
  },
});
