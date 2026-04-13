import React from 'react';
import isEqual from 'react-fast-compare';
import {
  Platform,
  StyleProp,
  StyleSheet,
  Switch,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {usePSDesignSystemContext} from '../../context';

type PropsT = {
  value?: boolean;
  onPress?: () => void;
  stylebtnOnOff?: StyleProp<ViewStyle>;
  styleCircle?: StyleProp<ViewStyle>;
  trackColor?: {
    false: string;
    true: string;
  };
  disabled?: boolean;
  size?: number;
};

const _ButtonSwitch = (props: PropsT) => {
  const colors = usePSDesignSystemContext().colors;
  const {
    value,
    onPress,
    stylebtnOnOff,
    styleCircle,
    trackColor = {false: colors.Neutral.n50, true: colors.Branding.b500},
    disabled,
    size = 2,
  } = props;

  const styles = useStylesButtonSwitch({size});

  if (Platform.OS === 'ios') {
    return (
      <Switch
        disabled={disabled}
        trackColor={{
          false: trackColor?.false,
          true: trackColor?.true,
        }}
        thumbColor={colors.Primary.white}
        ios_backgroundColor={disabled ? colors.Neutral.n50 : colors.Neutral.n100}
        onValueChange={onPress}
        value={value}
        style={{opacity: disabled ? 0.4 : 1}}
      />
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      disabled={disabled}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <View
        style={[
          styles.btnOnOff,
          {
            backgroundColor: !value ? trackColor?.false : trackColor?.true,
            opacity: disabled ? 0.8 : 1,
          },
          stylebtnOnOff,
        ]}>
        <View
          style={[
            styles.circle,
            {
              left: !value ? 0 : null,
              right: !value ? null : 0,
              shadowOffset: {width: !value ? 2 : -2, height: 0},
            },
            styleCircle,
          ]}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export const ButtonSwitch = React.memo(_ButtonSwitch, (prev, next) =>
  isEqual(prev, next),
);
const WIDTH_BUTTON = (26).px();
const HEIGHT_BUTTON = (15).px();
const useStylesButtonSwitch = ({size}: {size: number}) => {
  const colors = usePSDesignSystemContext().colors;

  return React.useMemo(
    () =>
      StyleSheet.create({
        btnOnOff: {
          width: WIDTH_BUTTON * size,
          height: HEIGHT_BUTTON * size,
          borderRadius: WIDTH_BUTTON * size,
          alignSelf: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.Neutral.n200,
          position: 'relative',
        },
        circle: {
          width: (WIDTH_BUTTON / 2) * size,
          height: (WIDTH_BUTTON / 2) * size,
          borderRadius: WIDTH_BUTTON * size,
          borderWidth: 0.5,
          borderColor: colors.Neutral.n100,
          backgroundColor: colors.Primary.white,
          position: 'absolute',
          shadowColor: `${colors.Neutral.n100}4f`,
          shadowRadius: 1,
          shadowOpacity: 1,
          alignSelf: 'center',
        },
      }),
    [colors],
  );
};
