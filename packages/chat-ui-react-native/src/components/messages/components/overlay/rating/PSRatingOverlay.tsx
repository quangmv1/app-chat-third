import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {usePSRatingContext, usePSRatingVisibleContext} from '../../../contexts';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../../context';
import {PSTextButton} from '../../../../PSTextButton';
import {PSStartRating} from './PSStarRating';
import {PSIcSubmitFill24, PSIcSubmitSuccess} from '../../../../../icons';
import {psLogger} from '../../../../../utils';
import {PSFlashMessage} from '../../../../flash-message';
import isEqual from 'react-fast-compare';
import {PSMessageEntity, PSMessageRatingEntity} from '../../../../../types';
import {useIsMountedRef} from '../../../../../hooks';
import {PSRatingTextInput} from './PSRatingTextInput';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

export const PSRatingOverlay = () => {
  const {colors, typography} = usePSDesignSystemContext();

  const {translator} = usePSTranslationContext();

  const realm = useRealm();

  const chatApiClient = usePSChatApiClientContext();

  const {isVisible, rating, bottomSheetRef} = usePSRatingVisibleContext();

  const {hide} = usePSRatingContext();

  const [isLoading, setLoading] = React.useState(false);

  const [ratingValue, setRatingValue] = React.useState<number>(0);

  const [comment, setComment] = React.useState('');

  const [isSubmitSuccess, setSubmitSuccess] = React.useState(false);

  const isMounted = useIsMountedRef();

  const isSubmitValidate = React.useMemo(() => {
    return ratingValue > 0;
  }, [ratingValue]);

  React.useEffect(() => {
    if (!rating) return;

    rating.ratingValue && setRatingValue(rating.ratingValue);
    rating.ratingComment && setComment(rating.ratingComment);

    if (!chatApiClient) return;

    const fetchRatingThread = async () => {
      try {
        const respone = await chatApiClient.sessionApi.fetchRating(
          rating.supportThreadId,
          rating.sessionId,
        );
        const data = respone.data;
        if (isMounted.current && data) {
          setRatingValue(data.rating_value);
          setComment(prev => {
            return data.rating_comment;
          });
        }
      } catch (error) {
        psLogger.error('PSRatingOverlay: fetchRatingThread => ', error);
      }
    };

    if (!rating.lockComment) {
      fetchRatingThread();
    }
  }, [chatApiClient, rating]);

  const ratingChange = React.useCallback((newRating: number) => {
    // console.log(`${newRating}`);
    setRatingValue(prevRating => {
      return newRating !== prevRating ? newRating : prevRating;
    });
  }, []);

  const hideModal = React.useCallback(() => {
    hide();
    setRatingValue(0);
    setComment('');
    setLoading(false);
    setSubmitSuccess(false);
  }, [hide]);

  const handleSubmitRating = React.useCallback(async () => {
    try {
      if (!chatApiClient || !rating) {
        return;
      }
      setLoading(true);
      await chatApiClient.sessionApi.updateRating({
        supportThreadId: rating.supportThreadId,
        sessionId: rating.sessionId,
        lockComment: rating.lockComment,
        ratingValue: ratingValue,
        ratingComment: comment,
        threadId: rating.threadId,
        messageId: rating.messageId,
      });
      setSubmitSuccess(true);

      // Nếu là lần cuối rating msg
      if (rating.lockComment && rating.messageId) {
        realm.write(() => {
          const messageCurrent = PSMessageEntity.getFirstByThreadIdAndMessageId(
            realm,
            rating.threadId,
            rating.messageId!,
          );
          if (messageCurrent?.isValid()) {
            messageCurrent?.updateRating({
              ...messageCurrent.body?.rating,
              value: ratingValue,
              comment: comment,
              lockComment: rating.lockComment,
            } as PSMessageRatingEntity);
          }
        });
      }
    } catch (e) {
      setLoading(false);
      PSFlashMessage.show({
        type: 'error',
        position: 'bottom',
        text1: `${e}`,
      });
      psLogger.error('PSRatingOverlay: handleSubmitRating ', e);
    } finally {
      // hide();
      // setRating(0);
      // setMsg('');
      setLoading(false);
    }
  }, [ratingValue, comment, chatApiClient, hide, rating, realm]);

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
    ),
    [],
  );

  const backgroundStyle = React.useMemo(() => {
    return {
      backgroundColor: colors.Primary.background,
    };
  }, [colors.Neutral.n0]);

  return isVisible && rating ? (
    <BottomSheet
      ref={bottomSheetRef}
      // enablePanDownToClose={true}
      handleComponent={null}
      index={isVisible && rating ? 0 : -1}
      // snapPoints={[60, '30%']}
      snapPoints={[(325).px()]}
      // enableDynamicSizing={true}
      // enableContentPanningGesture={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      onClose={hideModal}>
      <View style={[styles.container, {backgroundColor: colors.Primary.background}]}>
        {isSubmitSuccess ? (
          <PSRatingOverlaySuccess />
        ) : (
          <>
            <MemoizeText
              text={translator('ps_rating_customer_support_rating')}
            />

            <View
              style={[styles.divider, {backgroundColor: colors.Neutral.n50}]}
            />

            <PSStartRating rating={ratingValue} onChange={ratingChange} />

            <PSRatingTextInput text={comment} onChangeText={setComment} />

            {isLoading ? (
              <ActivityIndicator size="small" color={colors.Primary.branding} />
            ) : (
              <View style={styles.containerButton}>
                <PSTextButton
                  disabled={!isSubmitValidate}
                  text={'Submit'}
                  textStyle={[typography.headingMediumM, {color: colors.Primary.white}]}
                  style={[
                    styles.button,
                    {
                      backgroundColor: isSubmitValidate
                        ? colors.Primary.branding
                        : colors.Neutral.n100,
                      borderColor: isSubmitValidate
                        ? colors.Primary.branding
                        : colors.Neutral.n100,
                    },
                  ]}
                  rightIcon={() => (
                    <PSIcSubmitFill24
                      width={(28).px()}
                      height={(28).px()}
                      fill={colors.Primary.white}
                    />
                  )}
                  onPress={handleSubmitRating}
                />
              </View>
            )}
          </>
        )}
      </View>
    </BottomSheet>
  ) : null;
};

const PSRatingOverlaySuccess = React.memo(
  () => {
    const {colors, typography} = usePSDesignSystemContext();
    const {translator} = usePSTranslationContext();
    return (
      <View style={styles.containerSuccess}>
        <PSIcSubmitSuccess width={(130).px()} height={(130).px()} />
        <Text
          style={[
            styles.titleSuccess,
            typography.headingMediumS,
            {color: colors.Primary.subText},
          ]}>
          {translator('ps_rating_thank_you_for_your_feedback')}
        </Text>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  ({text}: {text: string}) => {
    const {colors, typography} = usePSDesignSystemContext();

    return (
      <Text style={[styles.title, typography.headingMediumS, {color: colors.Primary.subText}]}>
        {text}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  keyboardAvoidingView: {
    borderTopLeftRadius: (16).px(),
    borderTopRightRadius: (16).px(),
  },
  container: {
    flexDirection: 'column',
    borderTopLeftRadius: (16).px(),
    borderTopRightRadius: (16).px(),
    paddingBottom: Platform.select({android: (2).px(), ios: (24).px()}),
  },
  title: {
    alignSelf: 'center',
    marginTop: (22).px(),
    marginBottom: (8).px(),
  },
  titleSuccess: {
    alignSelf: 'center',
    marginTop: (8).px(),
    marginBottom: (16).px(),
  },
  containerButton: {
    flexDirection: 'row',
    padding: (16).px(),
    paddingBottom: (12).px(),
  },
  button: {
    flex: 1,
    borderWidth: (1).px(),
    paddingVertical: (8).px(),
  },
  containerSuccess: {
    paddingTop: (30).px(),
    flexDirection: 'column',
    alignItems: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
  },
});
