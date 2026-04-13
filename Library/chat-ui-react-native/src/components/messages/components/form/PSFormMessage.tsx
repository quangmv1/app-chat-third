import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import isEqual from 'react-fast-compare';
import {
  PSFormStatus,
  PSMessageEntity,
  PSMessageFormModel,
} from '../../../../types';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {IcFillCheckMark, PSIcForm, PSIcGoTo24} from '../../../../icons';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../context';
import {
  usePSFormContext,
  usePSMessageCurrentThreadContext,
  usePSMessageCurrentThreadIdContext,
} from '../../contexts';
import {psLogger} from '../../../../utils';
import {
  PSCreateMessageBodyMetadataRequestDto,
  PSMessageMetadataType,
} from '@communi/chat-api-client-typescript';
import {PSFormResponseMessage} from './PSFormResponseMessage';

export const PSFormMessage = React.memo(
  ({
    form,
    messageId,
    formStatus,
    containerStyle,
  }: {
    messageId: number;
    form?: PSMessageFormModel;
    formStatus?: PSFormStatus;
    containerStyle: StyleProp<ViewStyle>;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();
    const {show} = usePSFormContext();
    const currentThreadLastMessageId =
      usePSMessageCurrentThreadContext()?.lastMessage?.id;

    React.useEffect(() => {
      if (
        currentThreadLastMessageId === messageId &&
        form &&
        formStatus === PSFormStatus.INVITATION
      ) {
        show(form, messageId);
      }
    }, [currentThreadLastMessageId, messageId, form, formStatus]);

    return form ? (
      formStatus === PSFormStatus.FORM_RESPONSE ? (
        <PSFormResponseMessage form={form} />
      ) : (
        <View style={{flexBasis: '100%'}}>
          <PSDebouncedPressable
            style={[
              styles.container,
              // {backgroundColor: 'green'},
              // containerStyle,
            ]}
            onPress={() => {
              formStatus === PSFormStatus.INVITATION && show(form, messageId);
            }}>
            <View
              style={[
                styles.container_title,
                {
                  backgroundColor: colors.Primary.bgBranding,
                  borderColor: colors.Branding.b100,
                },
              ]}>
              <PSIcForm
                width={(40).px()}
                height={(40).px()}
                fill={colors.Primary.branding}
              />

              <View style={styles.container_sub}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    typography.bodyMediumM,
                    {color: colors.Primary.mainText},
                  ]}>
                  {form.settingsForm?.title}
                </Text>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[
                    typography.bodyMediumR,
                    {color: colors.Primary.subText},
                  ]}>
                  {form.settingsForm?.description}
                </Text>
              </View>

              <FormIconByStatus formStatus={formStatus} />
            </View>
          </PSDebouncedPressable>

          <FormTextByStatus
            formStatus={formStatus}
            invitation={form.settingsForm?.invitation}
            containerStyle={containerStyle}
          />

          {/* // nếu form k required thì hien nut Bo qua */}
          <FormSkipButton
            form={form}
            messageId={messageId}
            formStatus={formStatus}
            formRequired={form.settingsForm?.required}
            containerStyle={containerStyle}
          />
        </View>
      )
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const FormTextByStatus = React.memo(
  ({
    formStatus,
    containerStyle,
    invitation,
  }: {
    formStatus?: PSFormStatus;
    invitation?: string;
    containerStyle: StyleProp<ViewStyle>;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();
    const {translator} = usePSTranslationContext();
    return formStatus === PSFormStatus.SUBMISSION ||
      (formStatus === PSFormStatus.INVITATION && !!invitation) ||
      formStatus === PSFormStatus.SKIP ? (
      <Text
        style={[
          typography.bodyXLargeR,
          containerStyle,
          {marginTop: 0, color: colors.Primary.mainText, width: 256},
        ]}>
        {formStatus === PSFormStatus.SUBMISSION
          ? translator('ps_form_status_submission')
          : formStatus === PSFormStatus.SKIP
            ? translator('ps_form_status_skip')
            : formStatus === PSFormStatus.INVITATION
              ? invitation
              : null}
      </Text>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const FormSkipButton = React.memo(
  ({
    form,
    messageId,
    formStatus,
    containerStyle,
    formRequired,
  }: {
    form: PSMessageFormModel;
    messageId: number;
    formRequired?: boolean;
    formStatus?: PSFormStatus;
    containerStyle: StyleProp<ViewStyle>;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();
    const {translator} = usePSTranslationContext();

    const chatApiClient = usePSChatApiClientContext();
    const realm = useRealm();
    const currentThreadId = usePSMessageCurrentThreadIdContext();

    const handleSkip = async () => {
      if (!chatApiClient || !messageId || !currentThreadId) return;
      try {
        const messageCurrent = PSMessageEntity.getFirstByThreadIdAndMessageId(
          realm,
          currentThreadId,
          messageId,
        );
        if (!messageCurrent) return;
        const metadata: PSCreateMessageBodyMetadataRequestDto[] = [];
        metadata.push({
          type: PSMessageMetadataType.FORM,
          form: JSON.stringify({...form, blocks: []}),
          skip: true,
        });
        const response = await chatApiClient.messageApi.editMessage(
          currentThreadId,
          messageId,
          {
            request_id: messageCurrent.requestId,
            body: {
              text: messageCurrent.body?.text,
              metadata: metadata,
            },
          },
        );
        if (response && messageCurrent.body) {
          realm.write(() => {
            messageCurrent.body!.skip = true;
            messageCurrent.editedAt = Date.now();
          });
        }
      } catch (error) {
        psLogger.error(`PSFormOverlay: error = ${JSON.stringify(error)}`);
      }
    };

    return formStatus === PSFormStatus.INVITATION && !formRequired ? (
      <PSDebouncedPressable
        onPress={handleSkip}
        style={[
          {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: colors.Primary.branding,
            backgroundColor: colors.Primary.bgBranding,
            maxWidth: 86,
            alignItems: 'center',
          },
          containerStyle,
          {marginTop: 0},
        ]}>
        <Text
          style={[{color: colors.Primary.branding}, typography.bodyXLargeS]}>
          {translator('ps_skip')}
        </Text>
      </PSDebouncedPressable>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const FormIconByStatus = React.memo(
  ({formStatus}: {formStatus?: PSFormStatus}) => {
    const {colors} = usePSDesignSystemContext();
    return formStatus === PSFormStatus.SUBMISSION ||
      formStatus === PSFormStatus.INVITATION ? (
      <View
        style={[
          {
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
          },
          {backgroundColor: colors.Primary.white},
        ]}>
        {formStatus === PSFormStatus.SUBMISSION ? (
          <IcFillCheckMark width={16} height={16} fill={colors.Active.normal} />
        ) : null}
        {formStatus === PSFormStatus.INVITATION ? (
          <PSIcGoTo24 width={16} height={16} fill={colors.Primary.branding} />
        ) : null}
      </View>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    padding: 8,
    width: '100%',
    // display: 'flex',
    // flexDirection: 'row',
    // alignItems: 'center',
    // alignSelf: 'flex-start',
    // maxWidth: (332).px(),
    // paddingVertical: (8).px(),
    // paddingHorizontal: (16).px(),
    // borderRadius: (8).px(),

    // borderRadius: 8,
  },
  container_title: {
    flexDirection: 'row',
    borderRadius: 8,
    flex: 1,
    width: 256,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  container_sub: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: (12).px(),
  },
});
