import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {useRenderCounter} from '../../../../../hooks';

export const PSMessageInputWarnTitle = React.memo(
  ({text}: {text: string}) => {
    useRenderCounter('PSMessageInputWarnTitle');

    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [styles.container, {color: colors.Neutral.n400}, typography.bodyMediumR];
    }, [colors.Neutral.n400, typography.bodyMediumR]);

    return <Text style={textStyles}>{text}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    textAlign: 'center',
  },
});
