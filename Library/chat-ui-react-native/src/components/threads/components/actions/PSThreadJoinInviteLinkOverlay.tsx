import React from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {
  usePSDesignSystemContext,
  usePSThreadJoinInviteLinkContext,
  usePSThreadJoinInviteLinkOverlayActionContext,
  usePSThreadJoinInviteLinkOverlayContext,
  usePSTranslationContext,
} from '../../../../context';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
} from 'react-native';
import {Text} from 'react-native';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {IcLine15Xmark} from '../../../../icons';
import isEqual from 'react-fast-compare';
import {PSAvatarImage} from '../../../PSAvatarImage';
import {PSTextButton} from '../../../PSTextButton';

export const PSThreadJoinInviteLinkOverlay = React.memo(() => {
  const {translator} = usePSTranslationContext();
  const {typography, colors} = usePSDesignSystemContext();
  const {isVisible, bottomSheetRef} = usePSThreadJoinInviteLinkOverlayContext();
  const {hideThreadJoinInviteLinkOverlay} =
    usePSThreadJoinInviteLinkOverlayActionContext();
  const {threadByLink, isLoading, errorLink, joinInvitationLinks} =
    usePSThreadJoinInviteLinkContext();

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
    ),
    [],
  );

  const backgroundStyle = React.useMemo(() => {
    return {
      backgroundColor: colors.Primary.white,
    };
  }, [colors.Primary.linerBorder]);

  return isVisible ? (
    <BottomSheet
      ref={bottomSheetRef}
      enablePanDownToClose={true}
      handleComponent={null}
      index={isVisible ? 0 : -1}
      snapPoints={['40%', '90%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      style={{padding: (16).px()}}
      onClose={hideThreadJoinInviteLinkOverlay}>
      <View style={styles.container_content}>
        <PSDebouncedPressable
          style={styles.right_handle}
          onPress={hideThreadJoinInviteLinkOverlay}>
          <IcLine15Xmark
            width={(24).px()}
            height={(24).px()}
            fill={colors.Primary.subText}
          />
        </PSDebouncedPressable>

        <MemoizeAvatarThread
          avatar={threadByLink?.avatar_url}
          name={threadByLink?.name}
        />

        <MemoizeText
          style={[
            typography.headingLargeB,
            {color: colors.Primary.subText},
            {marginTop: (4).px()},
          ]}
          text={threadByLink?.name ?? ''}
        />

        <MemoizeText
          style={[
            typography.bodyXLargeR,
            {color: colors.Neutral.n300},
            {marginTop: (4).px()},
          ]}
          text={translator(
            'ps_thread_profile_total_users',
            // @ts-ignore
            {
              total: `${threadByLink?.member_count ?? '...'}`,
            },
          )}
        />

        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.Primary.branding}
            style={styles.bottom}
          />
        ) : (
          <PSTextButton
            disabled={!!errorLink}
            text={translator('ps_message_join_group')}
            textStyle={(typography.headingLargeM, {color: colors.Primary.white})}
            style={[
              styles.bottom,
              {
                backgroundColor: !!errorLink
                  ? colors.Neutral.n100
                  : colors.Primary.branding,
              },
            ]}
            onPress={joinInvitationLinks}
          />
        )}
      </View>
    </BottomSheet>
  ) : null;
});

const MemoizeText = React.memo(
  ({text, style}: {text: string; style?: StyleProp<TextStyle>}) => {
    return <Text style={style}>{text}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeAvatarThread = React.memo(
  ({avatar, name}: {avatar?: string; name?: string}) => {
    return (
      <View style={{marginTop: (16).px()}}>
        <PSAvatarImage url={avatar} displayName={name} size={(84).px()} />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container_content: {flexDirection: 'column', flex: 1, alignItems: 'center'},
  right_handle: {
    position: 'absolute',
    right: (0).px(),
  },
  bottom: {marginTop: (16).px(), width: '100%'},
});
