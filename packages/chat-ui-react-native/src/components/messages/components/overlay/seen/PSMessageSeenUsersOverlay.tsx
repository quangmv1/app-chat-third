import React from 'react';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {StyleSheet, Text, View} from 'react-native';
import {PSUserModel} from '../../../../../types';
import {PSMessageReactionsOverlayUserItem} from '../reactions';
import {
  usePSMessageSeenUserOverlayActionContext,
  usePSMessageSeenUserOverlayContext,
} from '../../../contexts';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../../context';

export const PSMessageSeenUsersOverlay = React.memo(() => {
  const {translator} = usePSTranslationContext();
  const {typography, colors} = usePSDesignSystemContext();
  const {isVisible, seenUsers, bottomSheetRef} =
    usePSMessageSeenUserOverlayContext();
  const {hide} = usePSMessageSeenUserOverlayActionContext();

  const keyUserExtractor = React.useCallback(
    (item: PSUserModel) => item.extUserId,
    [],
  );

  const renderUserItem = React.useCallback(
    ({item}: {item: PSUserModel}) => (
      <PSMessageReactionsOverlayUserItem user={item} />
    ),
    [],
  );

  const renderBackdrop = React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} />
    ),
    [],
  );

  const renderCustomHandle = React.useCallback(() => {
    return (
      <View style={[styles.handleContainer]}>
        <Text style={[{color: colors.Primary.subText}, typography.bodyMediumS]}>
          {translator(
            'ps_message_seen_users_overlay_title',
            // @ts-ignore
            {
              count: seenUsers.length.toString(),
            },
          )}
        </Text>
      </View>
    );
  }, [colors.Primary.subText, typography.bodyMediumS, translator, seenUsers.length]);

  const backgroundStyle = React.useMemo(() => {
    return {
      backgroundColor: colors.Primary.white,
    };
  }, [colors.Primary.linerBorder]);

  const flatListStyles = React.useMemo(() => {
    return [styles.usersContainer, {backgroundColor: colors.Primary.white}];
  }, [colors.Primary.linerBorder]);

  return isVisible ? (
    <BottomSheet
      ref={bottomSheetRef}
      enablePanDownToClose={true}
      handleComponent={renderCustomHandle}
      index={isVisible ? 0 : -1}
      snapPoints={['50%', '90%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      onClose={hide}>
      <BottomSheetFlatList
        style={flatListStyles}
        data={seenUsers}
        keyExtractor={keyUserExtractor}
        renderItem={renderUserItem}
      />
    </BottomSheet>
  ) : null;
});

const styles = StyleSheet.create({
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: (16).px(),
    paddingVertical: (12).px(),
    borderTopStartRadius: (22).px(),
    borderTopEndRadius: (22).px(),
  },
  usersContainer: {
    flex: 1,
    paddingBottom: (12).px(),
  },
});
