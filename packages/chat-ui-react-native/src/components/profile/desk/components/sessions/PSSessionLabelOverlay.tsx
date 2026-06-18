import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import React from 'react';
import {
  usePSSessionLabelActionContext,
  usePSSessionLabelContext,
  usePSSessionLabelVisibleContext,
  useThreadDeskProfileActionsContext,
} from '../../contexts';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
} from '../../../../../context';
import {psLogger} from '../../../../../utils';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import isEqual from 'react-fast-compare';
import {PSLabelDto} from '@communi/chat-api-client-typescript';
import {PSSessionLabel} from './PSSessionLabel';
import {usePSMessageCurrentThreadIdContext} from '../../../../messages';

export const PSSessionLabelOverlay = React.memo(
  () => {
    const {typography, colors} = usePSDesignSystemContext();

    const windowSize = useWindowDimensions();

    // const {translator} = usePSTranslationContext();

    const currentThreadId = usePSMessageCurrentThreadIdContext();

    const chatApiClient = usePSChatApiClientContext();

    // const realm = useRealm();

    const {addSessionLabel, removeSessionLabel} =
      useThreadDeskProfileActionsContext();

    const {bottomSheetRef} = usePSSessionLabelContext();

    const {hide} = usePSSessionLabelActionContext();

    const {isVisible, session} = usePSSessionLabelVisibleContext();

    const [labels, setLabels] = React.useState<PSLabelDto[]>([]);

    const handleLabelPress = React.useCallback(
      async (label: PSLabelDto) => {
        if (chatApiClient && currentThreadId && session) {
          try {
            const isIncludes =
              session.label !== undefined &&
              session.label.map(e => e.id).includes(label.id);

            if (isIncludes) {
              await chatApiClient.sessionApi.deleteLabel(
                currentThreadId,
                session.id,
                label.id,
              );
              removeSessionLabel(session.id, label);
            } else {
              await chatApiClient.sessionApi.addLabel(
                currentThreadId,
                session.id,
                label.id,
              );
              addSessionLabel(session.id, label);
            }

            hide();
          } catch (error) {
            psLogger.error('PSTagsPicker: handleTagPress', error);
          }
        }
      },
      [chatApiClient, currentThreadId, hide, session],
    );

    const fetchLabels = React.useCallback(async () => {
      if (chatApiClient) {
        try {
          const response = await chatApiClient.tagApi.fetchLabels();

          if (response.data && response.data.length > 0) {
            setLabels(response.data);
          } else {
          }
        } catch (error) {
          psLogger.error('PSSessionLabelOverlay: fetchLabels', error);
        }
      }
    }, [chatApiClient]);

    React.useEffect(() => {
      if (isVisible && chatApiClient) {
        fetchLabels();
      }
    }, [chatApiClient, fetchLabels, isVisible]);

    const renderBackdrop = React.useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} />
      ),
      [],
    );

    const keyUserExtractor = React.useCallback(
      (item: PSLabelDto) => item.id,
      [],
    );

    const renderLabelItem = React.useCallback(
      ({index, item}: {index: number; item: PSLabelDto}) => (
        <PSSessionLabel
          index={index}
          label={item}
          isTick={session?.label?.some(e => e.id === item.id)}
          onPress={handleLabelPress}
        />
      ),
      [session?.label, handleLabelPress],
    );

    const renderCustomHandle = React.useCallback(() => {
      return (
        <View style={styles.handleContainer}>
          <Text style={[{color: colors.Primary.subText}, typography.headingMediumS]}>
            {'Labels'}
          </Text>
        </View>
      );
    }, [colors.Primary.subText, typography.headingMediumS]);

    const renderSeparator = React.useCallback(() => {
      return (
        <View style={[styles.separator, {backgroundColor: colors.Neutral.n50}]} />
      );
    }, [colors.Neutral.n50]);

    return (
      <BottomSheet
        backdropComponent={renderBackdrop}
        backgroundStyle={{backgroundColor: colors.Primary.background}}
        ref={bottomSheetRef}
        containerHeight={windowSize.height}
        enablePanDownToClose={true}
        handleHeight={20}
        handleComponent={renderCustomHandle}
        index={-1}
        onClose={hide}
        snapPoints={['50%', '90%']}>
        <BottomSheetFlatList
          style={[styles.labelsContainer, {backgroundColor: colors.Primary.background}]}
          data={labels}
          keyExtractor={keyUserExtractor}
          renderItem={renderLabelItem}
          ItemSeparatorComponent={renderSeparator}
        />
      </BottomSheet>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  labelsContainer: {
    flex: 1,
    paddingBottom: (12).px(),
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: (16).px(),
    paddingVertical: (12).px(),
    borderTopStartRadius: (22).px(),
    borderTopEndRadius: (22).px(),
  },
  separator: {
    height: (0.5).px(),
  },
});
