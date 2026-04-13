import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {IcFill3People, PSIcQuickRight24, PSIcVerified} from '../icons';
import {PSAvatarImage} from './PSAvatarImage';
import {PSUserModel} from '../types';
import {PSRoleThreadType} from '@communi/chat-api-client-typescript';
import {usePSDesignSystemContext, usePSTranslationContext} from '../context';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from './PSDebouncedPressable';
import {PSCheckBox} from './PSCheckBox';

const styles = StyleSheet.create({
  container: {
    // shadowOffset: {width: 0, height: 2},
    // shadowRadius: 6,
    // shadowOpacity: 0.26,
    // elevation: 8,
    paddingHorizontal: (16).px(),
    paddingVertical: (12).px(),
    // borderRadius: 10,
    // marginVertical: 3,
    // marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    // height: 68,
    // borderTopWidth: (1).px(),
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: (12).px(),
  },
  title: {},
  container_create_group_card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  styWrapName: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginEnd: (24).px(),
  },
});

const ContentUserCard = React.memo(
  ({user, role}: {user: PSUserModel; role?: PSRoleThreadType}) => {
    const {colors, typography} = usePSDesignSystemContext();
    return (
      <>
        <PSAvatarImage
          url={user.avatar}
          displayName={user.name}
          size={(36).px()}
        />
        <View style={styles.titleContainer}>
          <View style={styles.styWrapName}>
            <Text
              style={[
                typography.headingMediumM,
                {color: colors.Primary.subText},
              ]}>
              {user.name}
            </Text>
            {!!user.verified && (
              <View style={{marginLeft: (4).px()}}>
                <PSIcVerified />
              </View>
            )}
          </View>
          {role && role !== PSRoleThreadType.MEMBER && (
            <Text
              style={[typography.headingMediumM, {color: colors.Neutral.n400}]}>
              {role === PSRoleThreadType.OWNER ? 'Owner' : 'Admin'}
            </Text>
          )}
        </View>
      </>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const CreateGroupCard = React.memo(
  ({onPressNewGroupThread}: {onPressNewGroupThread?: null | (() => void)}) => {
    const {colors, typography} = usePSDesignSystemContext();
    const {translator} = usePSTranslationContext();

    return (
      <PSDebouncedPressable
        style={[
          styles.container_create_group_card,
          {backgroundColor: colors.Primary.white},
        ]}
        onPress={onPressNewGroupThread}>
        <IcFill3People
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {color: colors.Primary.subText},
              typography.headingMediumM,
            ]}>
            {translator('ps_new_thread_create_group_chat')}
          </Text>
        </View>
        <PSIcQuickRight24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const UserCard = React.memo(
  ({
    index,
    user,
    isShowCheckBox,
    isChecked = false,
    onSelected,
    onPress,
    RightContent,
    role,
  }: {
    index: number;
    user: PSUserModel;
    isShowCheckBox: boolean;
    isChecked?: boolean;
    onSelected?: ({item, index}: {item: PSUserModel; index: number}) => void;
    onPress?: ({item}: {item: PSUserModel}) => void;
    RightContent?: React.ElementType;
    role?: PSRoleThreadType;
  }) => {
    // TODO y/c truyen vao tu parent
    const {colors} = usePSDesignSystemContext();

    return (
      <PSDebouncedPressable
        style={[styles.container]}
        onPress={() => {
          isShowCheckBox
            ? onSelected?.({
                index: index,
                item: user,
              })
            : onPress?.({
                item: user,
              });
        }}>
        <ContentUserCard user={user} role={role} />
        {isShowCheckBox && (
          <PSCheckBox
            checkBorderColor={colors.Primary.branding}
            uncheckBorderColor={colors.Primary.placeHolder}
            iconFillColor={'white'}
            checkFillColor={colors.Branding.b300}
            value={isChecked}
            onValueChange={() => {
              onSelected?.({
                index: index,
                item: user,
              });
            }}
          />
        )}
        {RightContent ? <RightContent /> : null}
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);
