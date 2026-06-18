import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {
  PSScreenStylesProvider,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {PSIcNoLinkState, PSIcOption24} from '../../../icons';
import {setClipboardString} from '../../../utils';
import {PSActionBar} from '../../PSActionBar';
import {PSDebouncedPressable} from '../../PSDebouncedPressable';
import {PSTextButton} from '../../PSTextButton';
import {
  PSLinkJoinGroupNavigationProvider,
  PSLinkJoinGroupProvider,
  usePSLinkJoinGroupActionsContext,
  usePSLinkJoinGroupContext,
  usePSLinkJoinGroupNavigationContext,
} from '../contexts';
import {PSLinkJoinGroupStyles} from './PSLinkJoinGroupStyles';
import {PSFlashMessage} from '../../flash-message';
import {
  PSLinkJoinGroupOverlayProvider,
  usePSLinkJoinGroupOverlayContext,
} from '../contexts/PSLinkJoinGroupOverlayContext';
import {PSRoleThreadType} from '@communi/chat-api-client-typescript';
import QRCode, {QRCodeProps} from 'react-native-qrcode-svg';

type PSLinkJoinGroupProps = QRCodeProps & {
  threadId: string;
  domainLinkJoin?: string | undefined;
  linkJoinGroupStyles?: PSLinkJoinGroupStyles;
  onBackPress?: null | (() => void);
  onShareLinkPress?: null | ((link: string) => void);
};

export const PSLinkJoinGroup = (props: PSLinkJoinGroupProps) => {
  return (
    <PSScreenStylesProvider styles={props.linkJoinGroupStyles}>
      <PSLinkJoinGroupNavigationProvider
        onBackPress={props.onBackPress}
        onShareLinkPress={props.onShareLinkPress}>
        <PSLinkJoinGroupProvider
          threadId={props.threadId}
          domainLinkJoin={props.domainLinkJoin}>
          <PSLinkJoinGroupOverlayProvider>
            <PSLinkJoinGroupScreenUI {...props} />
          </PSLinkJoinGroupOverlayProvider>
        </PSLinkJoinGroupProvider>
      </PSLinkJoinGroupNavigationProvider>
    </PSScreenStylesProvider>
  );
};

const PSLinkJoinGroupScreenUI = (props: QRCodeProps) => {
  const {translator} = usePSTranslationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const {onBackPress, onShareLinkPress} = usePSLinkJoinGroupNavigationContext();
  const {show} = usePSLinkJoinGroupOverlayContext();
  const {isLoading, link, role, permissions} = usePSLinkJoinGroupContext();
  const {createInvitationLinks} = usePSLinkJoinGroupActionsContext();

  const copyToClipboard = React.useCallback(
    (text: string) => {
      setClipboardString(text);
      PSFlashMessage.show({
        type: 'success',
        text1: translator('ps_message_action_copied'),
        position: 'bottom',
        visibilityTime: 2000,
      });
    },
    [translator],
  );

  const roleEditLink = React.useMemo(() => {
    if (role === PSRoleThreadType.OWNER) return true;
    const permission = permissions?.filter(
      ite => ite.userRole === PSRoleThreadType.ADMIN,
    )[0];
    if (
      role === PSRoleThreadType.ADMIN &&
      permission?.permission?.setupInvitationLink
    )
      return true;
    return false;
  }, [role, permissions]);

  return (
    <View
      style={[styles.container, {backgroundColor: colors.Primary.background}]}>
      <PSActionBar
        titleText={translator('ps_thread_profile_link_join_group')}
        onBackPress={onBackPress}
      />

      {!link ? (
        <View style={{marginTop: (16).px(), alignItems: 'center'}}>
          <PSIcNoLinkState width={(178).px()} height={(178).px()} />
        </View>
      ) : null}

      <View
        style={[
          styles.container_content,
          {
            backgroundColor: colors.Primary.white,
            // shadowColor: colors.Neutral.n100,
          },
        ]}>
        {link ? (
          <View style={{marginBottom: (24).px(), alignItems: 'center'}}>
            <QRCode
              value={link}
              size={(204).px()}
              logoSize={(62).px()}
              {...props}
            />
          </View>
        ) : null}

        <Text
          style={[typography.headingMediumS, {color: colors.Primary.subText}]}>
          {link
            ? translator('ps_thread_profile_link_join_group')
            : roleEditLink
              ? translator('ps_thread_profile_create_link_join_group')
              : translator('ps_thread_profile_no_link_join_group')}
        </Text>

        {/* ======== View container link invitation ============ */}
        {link ? (
          <View
            style={[
              styles.link_content,
              {
                backgroundColor: colors.Primary.background,
              },
            ]}>
            <Text
              style={[
                typography.bodyXLargeR,
                {color: colors.Primary.subText},
                {flex: 1},
              ]}>
              {link}
            </Text>
            {roleEditLink ? (
              <PSDebouncedPressable
                onPress={() => {
                  show(link);
                }}
                style={styles.right_link_content}>
                <PSIcOption24
                  width={(24).px()}
                  height={(24).px()}
                  fill={colors.Primary.subText}
                />
              </PSDebouncedPressable>
            ) : null}
          </View>
        ) : null}

        <View style={{marginTop: (8).px(), marginBottom: (8).px()}}>
          <Text
            style={[typography.bodySmallR, {color: colors.Primary.subText}]}>
            {!link && !roleEditLink
              ? translator('ps_thread_profile_no_link_join_group_description')
              : translator('ps_thread_profile_link_join_group_description')}
          </Text>
        </View>

        {/* ======== Button actions ============ */}
        {link ? (
          <View style={styles.row_button}>
            <PSTextButton
              text={translator('ps_message_action_copy')}
              textStyle={[
                typography.headingLargeM,
                {color: colors.Primary.white},
              ]}
              style={[
                styles.button,
                {backgroundColor: colors.Primary.branding},
              ]}
              onPress={() => {
                copyToClipboard(link);
              }}
            />
            <View style={{width: (16).px()}} />
            <PSTextButton
              text={translator('ps_message_action_share')}
              textStyle={[
                typography.headingLargeM,
                {color: colors.Primary.white},
              ]}
              style={[
                styles.button,
                {backgroundColor: colors.Primary.branding},
              ]}
              onPress={() => {
                onShareLinkPress?.(link);
              }}
            />
          </View>
        ) : roleEditLink ? (
          <View style={styles.row_button}>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.Primary.branding}
                style={styles.button}
              />
            ) : (
              <PSTextButton
                text={translator('ps_thread_profile_create_link_join_group')}
                textStyle={[
                  typography.headingLargeM,
                  {color: colors.Primary.white},
                ]}
                style={[
                  styles.button,
                  {backgroundColor: colors.Primary.branding},
                ]}
                onPress={createInvitationLinks}
              />
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container_content: {
    flexDirection: 'column',
    borderRadius: (16).px(),
    margin: (16).px(),
    paddingBottom: (16).px(),
    paddingHorizontal: (16).px(),
    paddingTop: (24).px(),
  },
  link_content: {
    flexDirection: 'row',
    width: '100%',
    padding: (12).px(),
    marginTop: (8).px(),
    borderRadius: (12).px(),
    alignItems: 'center',
  },
  right_link_content: {marginLeft: (12).px()},
  row_button: {flexDirection: 'row'},
  button: {flex: 1},
});
