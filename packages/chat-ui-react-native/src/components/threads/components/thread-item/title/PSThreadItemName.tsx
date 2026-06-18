import React from 'react';
import isEqual from 'react-fast-compare';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  usePSDesignSystemContext,
  usePSScreenStylesContext,
  useQuery,
} from '../../../../../context';
import { useRenderCounter } from '../../../../../hooks';
import { PSIcReply, PSIcVerified } from '../../../../../icons';
import { PSAgentBadge, PSBotBadge } from '../../../../PSBotBadge';
import { PSThreadsStyles } from '../../../PSThreadsStyles';
import { MemoizeIconBell } from '../subtitle';
const CONTENT_LENGTH = 30;
const ThreadItemName = ({
  name,
  isBot,
  isAgent,
  verified,
  isSubThread,
  isMute,
}: {
  name: string;
  isBot: boolean;
  isAgent: boolean;
  verified?: boolean;
  isSubThread?: boolean;
  isMute: boolean;
}) => {
  useRenderCounter('ThreadItemName');

  const { colors, typography } = usePSDesignSystemContext();

  const text1Style =
    usePSScreenStylesContext<PSThreadsStyles>().threadItem?.text1Style;
  const text1Props =
    usePSScreenStylesContext<PSThreadsStyles>().threadItem?.text1Props;
  const text1NumberOfLines =
    usePSScreenStylesContext<PSThreadsStyles>().threadItem?.text1NumberOfLines;

  return (
    <View style={styles.container}>
      {isSubThread ? <PSIcReply fill={colors.Primary.subText} /> : null}
      <Text
        style={[
          typography.bodyXXXLargeS,
          styles.title,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            color: colors.Primary.mainText,
            flex:
              Platform.OS === 'android' && name.length > CONTENT_LENGTH
                ? 1
                : undefined,
          },
          text1Style,
        ]}
        numberOfLines={text1NumberOfLines ?? 1}
        ellipsizeMode="tail"
        {...text1Props}>
        {Platform.select({
          // ios: name.workAroundTextOneLineContainsNewLineIOS(),
          ios: name,
          android: name,
        })}
      </Text>
      {verified ? (
        <PSIcVerified
          width={(16).px()}
          height={(16).px()}
          style={{ marginStart: (4).px() }}
        />
      ) : null}
      {isBot && (
        <PSBotBadge
          textStyle={[
            styles.botBadge,
            typography.bodyXSmallM,
            {
              color: colors.Primary.decorative,
              // borderColor: colors.Primary.decorative,
              backgroundColor: colors.SubBranding.sb50,
            },
          ]}
        />
      )}
      {isAgent && (
        <PSAgentBadge
          textStyle={[
            styles.botBadge,
            typography.bodyXSmallM,
            {
              color: colors.Primary.decorative,
              // borderColor: colors.Primary.decorative,
              backgroundColor: colors.SubBranding.sb50,
            },
          ]}
        />
      )}
      <MemoizeIconBell isMute={isMute} />
    </View >
  );
};

export const PSThreadItemName = React.memo(ThreadItemName, (prev, next) => {
  return isEqual(prev, next);
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flexShrink: 1,
  },
  botBadge: {
    marginStart: (4).px(),
  },
});
