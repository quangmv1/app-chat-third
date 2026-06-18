import {PSLabelDto} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {PSIcTick24} from '../../../../../icons';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {PSLabelTag} from '../../../../PSLabelTag';

export const PSSessionLabel = React.memo(
  ({
    label,
    isTick,
    onPress,
  }: {
    index: number;
    label: PSLabelDto;
    isTick?: boolean;
    onPress?: (label: PSLabelDto) => void;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();

    return (
      <PSDebouncedPressable
        style={styles.container}
        onPress={() => {
          onPress?.(label);
        }}>
        <PSLabelTag
          title={label.name}
          textStyle={[typography.bodyXLargeR, {color: label.color_code}]}
          style={[
            styles.tag,
            {
              borderColor: label.color_code,
              backgroundColor: `${label.color_code}1A`,
            },
          ]}
          disabled={true}
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
