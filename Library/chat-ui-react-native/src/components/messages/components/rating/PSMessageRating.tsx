import React from 'react';
import isEqual from 'react-fast-compare';
import {View, StyleSheet, Text, Keyboard} from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../context';
import {
  PSMessageEntity,
  PSMessageRatingEntity,
  PSMessageRatingModel,
} from '../../../../types';
import {MESSAGE_MARGIN_HORIZONTAL} from '../PSMessageItem';
import {PSStartRating} from '../overlay';
import {PSIcEdit16, PSIcSend24} from '../../../../icons';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {
  usePSMessageCurrentThreadIdContext,
  usePSRatingContext,
} from '../../contexts';
import {psLogger} from '../../../../utils';

export const PSMessageRating = React.memo(
  ({messageId, rating}: {messageId: number; rating: PSMessageRatingModel}) => {
    const {colors} = usePSDesignSystemContext();

    const chatApiClient = usePSChatApiClientContext();

    const realm = useRealm();

    const currentThreadId = usePSMessageCurrentThreadIdContext();

    const show = usePSRatingContext().show;

    const onStartRatingChange = React.useCallback(
      async (newRating: number) => {
        if (!currentThreadId || !chatApiClient) return;
        if (newRating !== rating.value) {
          const currentRatingValue = rating.value;
          const messageCurrent = PSMessageEntity.getFirstByThreadIdAndMessageId(
            realm,
            currentThreadId,
            messageId,
          );
          try {
            realm.write(() => {
              if (messageCurrent?.isValid()) {
                messageCurrent?.updateRating({
                  ...messageCurrent.body?.rating,
                  value: newRating,
                } as PSMessageRatingEntity);
              }
            });
            await chatApiClient.sessionApi.updateRating({
              supportThreadId: rating.supportThreadId,
              sessionId: rating.sessionId,
              lockComment: rating.lockComment,
              ratingValue: newRating,
              ratingComment: rating.comment,
              threadId: currentThreadId,
              messageId: messageId,
            });
          } catch (e) {
            realm.write(() => {
              if (messageCurrent?.isValid()) {
                messageCurrent?.updateRating({
                  ...messageCurrent.body?.rating,
                  value: currentRatingValue,
                } as PSMessageRatingEntity);
              }
            });
            psLogger.error('PSMessageRating: onStartRatingChange', e);
          }
        }
      },
      [realm, chatApiClient, currentThreadId, messageId, rating],
    );

    const onSubmitPress = React.useCallback(async () => {
      if (!currentThreadId || !chatApiClient) return;
      const messageCurrent = PSMessageEntity.getFirstByThreadIdAndMessageId(
        realm,
        currentThreadId,
        messageId,
      );
      try {
        realm.write(() => {
          if (messageCurrent?.isValid()) {
            messageCurrent?.updateRating({
              ...messageCurrent.body?.rating,
              lockComment: true,
            } as PSMessageRatingEntity);
          }
        });
        await chatApiClient.sessionApi.updateRating({
          supportThreadId: rating.supportThreadId,
          sessionId: rating.sessionId,
          lockComment: true,
          ratingValue: rating.value,
          ratingComment: rating.comment,
          threadId: currentThreadId,
          messageId: messageId,
        });
      } catch (e) {
        realm.write(() => {
          if (messageCurrent?.isValid()) {
            messageCurrent?.updateRating({
              ...messageCurrent.body?.rating,
              lockComment: false,
            } as PSMessageRatingEntity);
          }
        });
        psLogger.error('PSMessageRating: onSubmitPress', e);
      }
    }, [realm, chatApiClient, currentThreadId, messageId, rating]);

    const onEditPress = React.useCallback(() => {
      Keyboard.dismiss();
      if (!currentThreadId) return;
      show({
        supportThreadId: rating.supportThreadId,
        sessionId: rating.sessionId,
        threadId: currentThreadId,
        lockComment: true,
        ratingValue: rating.value,
        ratingComment: rating.comment,
        messageId: messageId,
      });
    }, [show, rating, currentThreadId, messageId]);

    return (
      <View
        style={[
          styles.container,
          {
            borderColor: colors.Primary.linerBorder,
            backgroundColor: colors.Primary.white,
          },
        ]}>
        <MemoizeText text={rating.title} />

        <PSStartRating
          rating={rating.value}
          sizeStart={(20).px()}
          styleStart={{paddingHorizontal: (15).px()}}
          starContainer={{marginTop: (22).px(), marginBottom: (14).px()}}
          disabled={rating.lockComment}
          onChange={onStartRatingChange}
        />

        <PSBottomStatusRating
          lockComment={rating.lockComment}
          comment={rating.comment}
          isStartRated={rating.value > 0}
          onEditPress={onEditPress}
          onSubmitPress={onSubmitPress}
        />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const PSBottomStatusRating = React.memo(
  ({
    lockComment,
    comment,
    isStartRated,
    onEditPress,
    onSubmitPress,
  }: {
    lockComment: boolean;
    comment: string;
    isStartRated: boolean;
    onEditPress: () => void;
    onSubmitPress: () => void;
  }) => {
    const {colors} = usePSDesignSystemContext();

    return (
      <View
        style={[
          styles.containerComment,
          {borderTopColor: colors.Primary.linerBorder},
        ]}>
        {lockComment ? (
          <SuccessRating />
        ) : (
          <CommentRating
            comment={comment}
            isStartRated={isStartRated}
            onEditPress={onEditPress}
            onSubmitPress={onSubmitPress}
          />
        )}
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const CommentRating = React.memo(
  ({
    comment,
    isStartRated,
    onEditPress,
    onSubmitPress,
  }: {
    comment: string;
    isStartRated: boolean;
    onEditPress: () => void;
    onSubmitPress: () => void;
  }) => {
    const {translator} = usePSTranslationContext();
    const {colors, typography} = usePSDesignSystemContext();
    const styleText = React.useMemo(() => {
      return [
        {color: comment ? colors.Primary.mainText : colors.Primary.disable},
        typography.bodyMediumR,
      ];
    }, [comment]);

    const submitPress = React.useCallback(() => {
      if (isStartRated) {
        // call api submit lock lun
        onSubmitPress();
      } else {
        // open popup rating
        onEditPress();
      }
    }, [isStartRated, onEditPress, onSubmitPress]);

    return (
      <View style={styles.commentSubmit}>
        <Text
          suppressHighlighting
          onPress={onEditPress}
          style={[styles.commentText, styleText]}
          numberOfLines={4}
          ellipsizeMode="tail">
          {comment
            ? comment
            : translator('ps_rating_share_your_feedback_optional')}
        </Text>

        <View style={{marginStart: (4).px()}}>
          {comment ? (
            <PSDebouncedPressable onPress={onEditPress}>
              <PSIcEdit16
                width={(20).px()}
                height={(20).px()}
                fill={colors.Primary.branding}
              />
            </PSDebouncedPressable>
          ) : (
            <PSDebouncedPressable onPress={submitPress}>
              <PSIcSend24
                width={(26).px()}
                height={(26).px()}
                fill={
                  isStartRated
                    ? colors.Primary.branding
                    : colors.Primary.disable
                }
              />
            </PSDebouncedPressable>
          )}
        </View>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeText = React.memo(
  ({text}: {text: string}) => {
    const {colors, typography} = usePSDesignSystemContext();

    return text.trim() === '' ? null : (
      <Text
        style={[
          {alignSelf: 'center', marginTop: (12).px()},
          typography.bodyLargeS,
          {color: colors.Primary.mainText},
        ]}>
        {text}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const SuccessRating = React.memo(
  () => {
    const {translator} = usePSTranslationContext();
    const {colors, typography} = usePSDesignSystemContext();
    return (
      <Text style={[typography.bodyMediumR, {color: colors.Active.normal}]}>
        {translator('ps_rating_thank_you_for_your_feedback')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginStart: MESSAGE_MARGIN_HORIZONTAL,
    marginTop: (4).px(),
    width: (317).px(),
    borderRadius: (12).px(),
    borderWidth: (1).px(),
  },
  commentSubmit: {flexDirection: 'row', alignItems: 'center'},
  commentText: {
    alignItems: 'center',
    flex: 1,
  },
  containerComment: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: (1).px(),

    paddingHorizontal: (12).px(),
    paddingVertical: (8).px(),
  },
});
