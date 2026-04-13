import React from 'react';
import { PSIcAddCircle24 } from '../../../../icons';
import { StyleSheet, StyleProp, ViewStyle, Platform, Keyboard } from 'react-native';
import { useRenderCounter } from '../../../../hooks';
import isEqual from 'react-fast-compare';
import { PSDebouncedPressable } from '../../../PSDebouncedPressable';
import {
  usePSDesignSystemContext,
  usePSMediaPickerActionContext,
} from '../../../../context';
import { usePSEditMessageContext } from '../../contexts';

export const PSMessageInputAttachmentAddButton = React.memo(
  ({ containerStyle }: { containerStyle?: StyleProp<ViewStyle> }) => {
    useRenderCounter('PSMessageInputAttachmentAddButton');

    const { colors } = usePSDesignSystemContext();

    const { openMediaPicker } = usePSMediaPickerActionContext();
    const messageToEdit = usePSEditMessageContext();

    const onPress = () => {
      Keyboard.dismiss();
      openMediaPicker();
    };

    if (messageToEdit) return null;
    return (
      <PSDebouncedPressable
        onPress={onPress}
        style={[
          styles.container,
          containerStyle,
          {
            marginBottom: Platform.select({
              android: (12).px(),
              default: (8).px(),
            }),
          },
        ]}>
        <PSIcAddCircle24
          width={(32).px()}
          height={(32).px()}
          fill={colors.Neutral.n400}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    // marginStart: (4).px(),
    width: (32).px(),
    height: (32).px(),
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: (10).px(),
  },
});
