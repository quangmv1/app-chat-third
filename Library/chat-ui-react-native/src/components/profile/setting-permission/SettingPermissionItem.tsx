import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {usePSDesignSystemContext} from '../../../context';
import {ButtonSwitch} from '../../button-switch';

export const SettingPermissionItem = ({
  label,
  value,
  disable,
  toggleSwitch,
}: {
  label: string;
  value: boolean;
  disable?: boolean;
  toggleSwitch: (value: boolean) => void;
}) => {
  const styles = useStyleSettingPermissionItem();

  const [on, setOn] = useState<boolean>(value);

  const {colors} = usePSDesignSystemContext();

  const onValueChange = useCallback(() => {
    setOn(prv => {
      typeof toggleSwitch === 'function' && toggleSwitch(!prv);
      return !prv;
    });
  }, [toggleSwitch]);

  return (
    <View style={styles.contianer}>
      <Text style={styles.styTxtLabel}>{label}</Text>
      <ButtonSwitch
        value={on}
        onPress={onValueChange}
        trackColor={{
          false: colors.Neutral.n50,
          true: colors.Branding.b400,
        }}
        disabled={disable}
      />
    </View>
  );
};

const useStyleSettingPermissionItem = () => {
  const {colors, typography} = usePSDesignSystemContext();
  return useMemo(
    () =>
      StyleSheet.create({
        contianer: {
          paddingHorizontal: (16).px(),
          marginVertical: (12).px(),
          flexDirection: 'row',
          alignItems: 'center',
        },
        styTxtLabel: {
          ...typography.bodyXXLargeR,
          flex: 1,
          color: colors.Primary.subText,
        },
      }),
    [colors, typography],
  );
};
