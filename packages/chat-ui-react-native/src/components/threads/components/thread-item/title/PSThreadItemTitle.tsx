import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {useRenderCounter} from '../../../../../hooks';
import {PSIcPinFilled24} from '../../../../../icons';
import {PSThreadItemLastMessageTime} from '../subtitle';
import {PSThreadItemName} from './PSThreadItemName';

const ThreadItemTitle = ({
  name,
  pinnedAt,
  lastMessageCreatedAt,
  isMute,
  isBot,
  isAgent,
  verified,
  isSubThread,
  isLastMessageCreatedAtVisible,
}: {
  name: string;
  pinnedAt: number;
  lastMessageCreatedAt: string;
  isMute: boolean;
  isBot: boolean;
  isAgent: boolean;
  verified?: boolean;
  isSubThread?: boolean;
  isLastMessageCreatedAtVisible?: boolean;
}) => {
  useRenderCounter('ThreadItemTitle');
  return (
    <View style={styles.container}>
      <PSThreadItemName
        name={name}
        isBot={isBot}
        isAgent={isAgent}
        verified={verified}
        isSubThread={isSubThread}
        isMute={isMute}
      />

      {isLastMessageCreatedAtVisible ? (
        <PSThreadItemLastMessageTime
          lastMessageCreatedAt={lastMessageCreatedAt}
        />
      ) : null}

      <MemoizeIconPin pinnedAt={pinnedAt} />
    </View>
  );
};

export const PSThreadItemTitle = React.memo(ThreadItemTitle, (prev, next) => {
  return isEqual(prev, next);
});

export const MemoizeIconPin = React.memo(
  ({pinnedAt}: {pinnedAt: number}) => {
    const {colors} = usePSDesignSystemContext();
    return pinnedAt !== 0 ? (
      <PSIcPinFilled24
        width={(16).px()}
        height={(16).px()}
        fill={colors.Primary.disable}
        style={styles.pinIcon}
      />
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: (2).px(),
  },
  pinIcon: {
    // marginEnd: (4).px(),
    marginStart: (4).px(),
  },
});
