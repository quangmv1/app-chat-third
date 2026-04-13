import {PSTagDto} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {usePSDesignSystemContext} from '../../context';
import {PSIcTick24} from '../../icons';
import {PSDebouncedPressable} from '../PSDebouncedPressable';
import {PSLabelTag} from '../PSLabelTag';

export const PSTagPicker = React.memo(
  ({
    tag,
    isTick,
    onPress,
  }: {
    index: number;
    tag: PSTagDto;
    isTick?: boolean;
    onPress?: (tag: PSTagDto) => void;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();

    return (
      <PSDebouncedPressable
        style={styles.container}
        onPress={() => {
          onPress?.(tag);
        }}>
        <PSLabelTag
          title={tag.name}
          textStyle={[typography.bodyXLargeR, {color: tag.color_code}]}
          style={[
            styles.tag,
            {
              borderColor: tag.color_code,
              backgroundColor: `${tag.color_code}1A`,
            },
          ]}
          onPress={() => {
            onPress?.(tag);
          }}
        />

        {isTick ? (
          <PSIcTick24
            width={(24).px()}
            height={(24).px()}
            fill={colors.Primary.subText}
          />
        ) : null}
      </PSDebouncedPressable>
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
    justifyContent: 'space-between',
    paddingHorizontal: (16).px(),
    paddingVertical: (12).px(),
  },
  tag: {
    marginEnd: (4).px(),
  },
});
