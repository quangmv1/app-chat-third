import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleProp, StyleSheet, Text, TextStyle, ViewStyle} from 'react-native';
import {PSIcDropDown24} from '../icons';
import {PSDebouncedPressable} from './PSDebouncedPressable';

type Props = {
  title: string;
  textStyle: StyleProp<TextStyle>;
  disabled?: null | boolean;
  visibleDropDown?: undefined | boolean;
  colorDropDown?: undefined | string;
  style?: StyleProp<ViewStyle>;
  onPress?: null | (() => void);
};

export const PSLabelTag = React.memo(
  (props: Props) => {
    return (
      <PSDebouncedPressable
        style={[styles.container, props.style]}
        disabled={props.disabled}
        onPress={props.onPress}>
        {props.visibleDropDown ? (
          <PSIcDropDown24
            width={(24).px()}
            height={(24).px()}
            fill={props.colorDropDown}
          />
        ) : null}
        <Text style={[props.textStyle, styles.text]}>{props.title}</Text>
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: (8).px(),
    borderWidth: (0.5).px(),
    borderRadius: (4).px(),
    marginVertical: (4).px(),
  },
  text: {
    // marginStart: (14).px(),
  },
});
