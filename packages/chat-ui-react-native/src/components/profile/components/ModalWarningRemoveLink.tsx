import React, {Ref, forwardRef, useCallback, useImperativeHandle} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {PSIcInformation40} from '../../../icons/new_icon';
import {PSTextButton} from '../../PSTextButton';
import {usePSLinkJoinGroupActionsContext} from '../contexts';
import {
  usePSLinkJoinGroupOverlayContext,
  usePSLinkJoinGroupOverlayVisibleContext,
} from '../contexts/PSLinkJoinGroupOverlayContext';

export interface ActionModalWarningRemoveLink {
  show: () => void;
}

export const ModalWarningRemoveLink = forwardRef(
  (_, ref: Ref<ActionModalWarningRemoveLink>) => {
    const [isVisible, setVisible] = React.useState(false);

    const {translator} = usePSTranslationContext();

    const styles = useStyleModalWarningRemoveLink();

    const deleteInvitationLinks =
      usePSLinkJoinGroupActionsContext().deleteInvitationLinks;
    const setLink = usePSLinkJoinGroupOverlayContext().setLink;

    const link = usePSLinkJoinGroupOverlayVisibleContext().link ?? '';

    const show = React.useCallback(() => {
      setVisible(true);
    }, []);

    const hide = React.useCallback(() => {
      setVisible(false);
    }, []);

    const handleRemoveLink = useCallback(() => {
      hide();
      deleteInvitationLinks(link.substring(link.lastIndexOf('/') + 1));
      setLink?.(undefined);
    }, [hide, deleteInvitationLinks, link]);

    useImperativeHandle(ref, () => ({
      show,
    }));

    return (
      <Modal
        onBackdropPress={hide}
        isVisible={isVisible}
        onSwipeComplete={hide}
        swipeDirection={['down']}
        style={styles.view}>
        <View style={styles.contain}>
          <PSIcInformation40 width={(32).px()} height={(32).px()} />
          <Text style={styles.styTxtTitle}>
            {translator('ps_title_warning')}
          </Text>
          <Text style={styles.styTxtDes}>
            {translator('ps_description_warning_link')}
          </Text>
          <View style={styles.row}>
            <PSTextButton
              text={translator('ps_cancel')}
              textStyle={styles.styTxtButtonCancel}
              style={styles.styButtonCancel}
              onPress={hide}
            />
            <PSTextButton
              text={translator('ps_accept')}
              textStyle={styles.styTxtButtonAccept}
              style={styles.styButtonAccept}
              onPress={handleRemoveLink}
            />
          </View>
        </View>
      </Modal>
    );
  },
);

const useStyleModalWarningRemoveLink = () => {
  const {colors, typography} = usePSDesignSystemContext();
  return React.useMemo(
    () =>
      StyleSheet.create({
        contain: {
          backgroundColor: colors.Primary.background,
          borderRadius: (8).px(),
          padding: (16).px(),
        },
        view: {
          justifyContent: 'center',
          margin: (16).px(),
        },
        styTxtTitle: {
          ...typography.headingMediumS,
          color: colors.Neutral.n500,
          marginTop: (16).px(),
        },
        styTxtDes: {
          ...typography.bodyXLargeR,
          color: colors.Neutral.n500,
          marginTop: (16).px(),
        },
        styTxtButtonCancel: {
          ...typography.headingLargeM,
          color: colors.Branding.b400,
        },
        styButtonCancel: {
          borderRadius: (12).px(),
          backgroundColor: colors.Primary.white,
          flex: 1,
          marginRight: (4).px(),
        },
        styTxtButtonAccept: {
          ...typography.headingLargeM,
          color: colors.Primary.white,
        },
        styButtonAccept: {
          borderRadius: (12).px(),
          backgroundColor: colors.Branding.b400,
          flex: 1,
          marginLeft: (4).px(),
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: (16).px(),
        },
      }),
    [colors, typography],
  );
};
