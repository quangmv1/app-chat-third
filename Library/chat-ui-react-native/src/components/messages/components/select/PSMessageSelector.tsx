import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleProp, View, ViewStyle} from 'react-native';
import {PSMessageStatus} from '../../../../types';
import {
  usePSSelectMessageContext,
  usePSSelectMessageIsEnabledContext,
} from '../../contexts';
import {PSCheckBox} from '../../../PSCheckBox';
import {usePSDesignSystemContext} from '../../../../context';

export const PSMessageSelector = React.memo(
  ({
    messageId,
    isDeleted,
    status,
    containerStyle,
  }: {
    messageId: number;
    isDeleted: boolean;
    status: PSMessageStatus;
    containerStyle?: StyleProp<ViewStyle>;
  }) => {
    const {colors} = usePSDesignSystemContext();

    const selectMessageIds = usePSSelectMessageContext();

    const isSelectMessageEnabled = usePSSelectMessageIsEnabledContext();

    return status === 'sent' && !isDeleted && isSelectMessageEnabled ? (
      <View style={containerStyle}>
        <PSCheckBox
          checkBorderColor={colors.Branding.b600}
          uncheckBorderColor={colors.Neutral.n400}
          iconFillColor={colors.Primary.branding}
          value={selectMessageIds?.includes(messageId)}
        />
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);
