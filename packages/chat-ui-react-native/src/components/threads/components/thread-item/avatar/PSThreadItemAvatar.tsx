import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {PSIcHashTag24} from '../../../../../icons';
import {PSAvatarImage} from '../../../../PSAvatarImage';
import {PSAvatarSubThread} from '../../../../PSAvatarSubThread';
import {PSThreadEntity} from '../../../../../types';
import {usePSDesignSystemContext, useRealm} from '../../../../../context';
import {THREAD_AVATAR_SIZE} from '../PSThreadItem';

const ThreadItemAvatar = ({
  avatar,
  name,
  parentId,
  isOnline,
  isPublicGroup,
  isSubThread,
}: {
  avatar?: string;
  name?: string;
  parentId?: string;
  isPublicGroup?: boolean;
  isOnline: boolean;
  isSubThread?: boolean;
}) => {
  const {colors} = usePSDesignSystemContext();

  if (isSubThread && parentId) {
    const realm = useRealm();
    const parentThread = PSThreadEntity.getFirstById(realm, parentId);
    return (
      <PSAvatarSubThread
        displayName={parentThread?.name ?? ''}
        url={parentThread?.avatar ?? ''}
        size={THREAD_AVATAR_SIZE}
      />
    );
  }

  return (
    <View style={{maxHeight: THREAD_AVATAR_SIZE}}>
      <PSAvatarImage
        url={avatar}
        displayName={name}
        size={THREAD_AVATAR_SIZE}
      />
      {isPublicGroup ? (
        <View
          style={[
            styles.thread_public,
            {
              backgroundColor: colors.Primary.decorative,
              borderColor: colors.Primary.white,
            },
          ]}>
          <PSIcHashTag24
            width={(18).px()}
            height={(18).px()}
            fill={'#FFFFFF'}
          />
        </View>
      ) : isOnline ? (
        <View
          style={[
            styles.status,
            {
              backgroundColor: colors.Active.normal,
              borderColor: colors.Primary.white,
            },
          ]}
        />
      ) : null}
    </View>
  );
};

export const PSThreadItemAvatar = React.memo(ThreadItemAvatar, (prev, next) => {
  return isEqual(prev, next);
});

const styles = StyleSheet.create({
  status: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: (2).px(),
    borderColor: '#EDEDED',
    width: (16).px(),
    height: (16).px(),
    borderRadius: (16 / 2).px(),
    backgroundColor: 'green',
  },
  thread_public: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: (2).px(),
    borderColor: '#EDEDED',
    width: (18).px(),
    height: (18).px(),
    borderRadius: (6).px(),
    backgroundColor: '#9B76FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
