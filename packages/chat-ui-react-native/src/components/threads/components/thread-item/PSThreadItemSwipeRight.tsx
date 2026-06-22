import React from 'react';
import isEqual from 'react-fast-compare';
import {Dimensions, StyleSheet, View} from 'react-native';
import {useRenderCounter} from '../../../../hooks';
import {
  PSThreadSwipeActionDelete,
  // PSThreadSwipeActionMore,
  PSThreadSwipeActionMute,
  PSThreadSwipeActionPin,
} from '../swipeable';
import {
  usePSDesignSystemContext,
  usePSScreenStylesContext,
} from '../../../../context';
import {PSThreadsStyles} from '../../PSThreadsStyles';

const windowDimensions = Dimensions.get('window');

type PSThreadItemSwipeRightProps = {
  threadId: string;
  pinnedAt: number;
  isMute: boolean;
  isJoin: boolean;
};

export const PSThreadItemSwipeRight = React.memo(
  ({threadId, pinnedAt, isMute, isJoin}: PSThreadItemSwipeRightProps) => {
    useRenderCounter('PSThreadItemSwipeRight');

    const colorsPrimaryWhite = usePSDesignSystemContext().colors.Primary.white;

    const threadItemSwipeStyle =
      usePSScreenStylesContext<PSThreadsStyles>().threadItem?.swipeStyle;

    return (
      <View
        style={[
          s.buttonsContainer,
          {backgroundColor: colorsPrimaryWhite},
          threadItemSwipeStyle,
        ]}>
        {/* =======Pin======= */}
        <PSThreadSwipeActionPin threadId={threadId} pinnedAt={pinnedAt} />
        {/* =======Mute======= */}
        <PSThreadSwipeActionMute threadId={threadId} isMute={isMute} />
        {/* =======More======= */}
        {/* <PSThreadSwipeActionMore threadId={threadId} /> */}
        {/* =======Delete======= */}
        {isJoin ? <PSThreadSwipeActionDelete threadId={threadId} /> : null}
      </View>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const s = StyleSheet.create({
  actionText: {
    color: 'white',
    backgroundColor: 'transparent',
  },
  buttonsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    flex: 1,
    left: windowDimensions.width,
    width: windowDimensions.width,
  },
});
