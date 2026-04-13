import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import isEqual from 'react-fast-compare';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSMessageInputReplyChatBotContext} from '../../contexts';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

export const PSMessageChatBotAgainStarted = React.memo(
  () => {
    const {translator} = usePSTranslationContext();

    const {colors} = usePSDesignSystemContext();

    const replyChatBot = usePSMessageInputReplyChatBotContext();

    const onPress = () => {
      replyChatBot(
        translator('ps_message_input_with_bot_get_started'),
        'start',
      );
    };

    const containerStyles = React.useMemo(() => {
      return [
        styles.container,
        {
          backgroundColor: colors.Primary.branding,
        },
      ];
    }, [colors.Primary.branding]);

    return (
      <>
        <View style={styles.styWrapButton}>
          <GradientView />
        </View>
        <View
          style={[
            {
              width: '100%',
              paddingBottom: (14).px(),
              backgroundColor: colors.Primary.white,
            },
          ]}>
          <PSDebouncedPressable onPress={onPress} style={containerStyles}>
            <MemoizeText />
          </PSDebouncedPressable>
        </View>
      </>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const GradientView = React.memo(
  () => {
    const {colors} = usePSDesignSystemContext();
    return (
      <View style={styles.containerX}>
        <Svg height={(67).px()} width="100%">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={colors.Primary.white}
                stopOpacity="0"
              />
              <Stop
                offset="1"
                stopColor={colors.Primary.white}
                stopOpacity="1"
              />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height={(67).px()} fill="url(#grad)" />
        </Svg>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  () => {
    const {typography, colors} = usePSDesignSystemContext();

    const {translator} = usePSTranslationContext();

    const textStyles = React.useMemo(() => {
      return [typography.bodyLargeS, {color: colors.Primary.white}];
    }, [colors.Primary.white, typography.bodyLargeS]);

    return (
      <Text style={textStyles}>
        {translator('ps_message_input_with_bot_again_started')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    // marginTop: 2,
    paddingHorizontal: (24).px(),
    paddingVertical: (8).px(),
    height: (40).px(),
    borderRadius: (12).px(),
    alignSelf: 'center',
    justifyContent: 'center',
    // zIndex: 99,
    // elevation: 1,
    // position: 'absolute',
    // bottom: Platform.select({ios: (70).px(), android: (90).px()}),
    // marginBottom: (14).px(),
  },
  styWrapButton: {
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    // bottom: 50,
    width: '100%',
    top: -(66).px(),
  },
  containerX: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // position: 'absolute',
    // top: -(67).px(),
  },
});
