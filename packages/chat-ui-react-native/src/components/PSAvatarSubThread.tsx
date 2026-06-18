import React from 'react';
import {StyleSheet, View} from 'react-native';
import {PSIcSubThread} from '../icons';
import {PSAvatarImage} from './PSAvatarImage';
import {usePSDesignSystemContext} from '../context';

interface Props {
  url: string;
  displayName: string;
  size?: number;
}

const _PSAvatarSubThread = ({url, displayName, size}: Props) => {
  const styles = useStylesPSAvatarSubThread();
  const {colors} = usePSDesignSystemContext();

  return (
    <View style={{maxHeight: size ?? (48).px()}}>
      <View
        style={[
          styles.styWrapAvatar,
          {
            width: size ?? (50).px(),
            height: size ?? (50).px(),
            borderRadius: size ?? (50).px(),
          },
        ]}>
        <PSIcSubThread fill={colors.Primary.branding} />
      </View>
      <PSAvatarImage
        url={url}
        displayName={displayName}
        size={(24).px()}
        imageStyle={[styles.imageStyle, {borderColor: colors.Neutral.n0}]}
      />
    </View>
  );
};

export const PSAvatarSubThread = React.memo(_PSAvatarSubThread);

const useStylesPSAvatarSubThread = () => {
  const {colors} = usePSDesignSystemContext();
  return React.useMemo(
    () =>
      StyleSheet.create({
        styWrapAvatar: {
          width: (50).px(),
          height: (50).px(),
          borderRadius: (50).px(),
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.Primary.bgBranding,
        },
        imageStyle: {
          position: 'absolute',
          bottom: -5,
          right: -5,
          borderWidth: 2,
          borderRadius: 20,
        },
      }),
    [colors],
  );
};
