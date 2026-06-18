import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {PSAvatarImage} from '../../../../components';
import {usePSDesignSystemContext} from '../../../../context';
import {useThreadProfileInfoContext} from '../../contexts';
import {PSIcVerified} from '../../../../icons';

const MemoizeThreadName = React.memo(
  ({name, verified}: {name?: string; verified?: boolean}) => {
    const {colors, typography} = usePSDesignSystemContext();

    return name ? (
      <View style={styles.row}>
        <Text style={[styles.text, {color: colors.Primary.subText}, typography.headingMediumS]}>
          {name}
        </Text>
        {verified ? <PSIcVerified style={{marginLeft: (4).px()}} /> : null}
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const ThreadProfileInfo = () => {
  const {avatar, name, verified} = useThreadProfileInfoContext();

  return (
    <View style={styles.container}>
      <PSAvatarImage url={avatar} displayName={name} size={(84).px()} />
      <MemoizeThreadName name={name} verified={verified} />
    </View>
  );
};

export const PSThreadProfileInfo = React.memo(
  ThreadProfileInfo,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {alignItems: 'center'},
  text: {marginTop: (12).px(), marginBottom: (8).px()},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
