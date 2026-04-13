import React, {PropsWithChildren} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  LayoutAnimation,
} from 'react-native';
import {
  usePSFormContext,
  usePSFormVisibleContext,
  usePSMessageCurrentThreadIdContext,
  usePSPSMessageKeyboardAreaContext,
} from '../../../contexts';
import isEqual from 'react-fast-compare';
import {FormDescription, FormInput, FormTitle} from './component';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
  useRealm,
} from '../../../../../context';
import {
  PSIcDropDown24,
  PSIcEmail24,
  PSIcGlobal24,
  PSIcSubmitFill24,
} from '../../../../../icons';
import {
  FormInputType,
  FormType,
  ItemModel,
  PSMessageEntity,
} from '../../../../../types';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {DatePicker, psLogger} from '../../../../../utils';
import moment from 'moment';
import BottomSheet from '@gorhom/bottom-sheet';
import {PSTextButton} from '../../../../PSTextButton';
import {
  PSCreateMessageBodyMetadataRequestDto,
  PSMessageMetadataType,
} from '@communi/chat-api-client-typescript';
import {ScrollView} from 'react-native-gesture-handler';

export const PSFormOverlay = () => {
  const {isVisible, form, bottomSheetRef, messageId} =
    usePSFormVisibleContext();

  const {hide} = usePSFormContext();

  const {translator} = usePSTranslationContext();

  const {colors, typography} = usePSDesignSystemContext();

  const [currentForm, setCurrentForm] = React.useState(form);

  const [errors, setErrors] = React.useState<{
    [key: string]: string | undefined;
  }>({});

  const [openDateTimePicker, setOpenDateTimePicker] = React.useState<{
    [key: string]: boolean | undefined;
  }>({});

  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const [isLoading, setLoading] = React.useState(false);

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  React.useEffect(() => {
    if (isVisible && form) {
      setCurrentForm(form);
    } else {
      setErrors({});
      setOpenDateTimePicker({});
    }
  }, [isVisible, form]);

  const handleSubmit = async () => {
    // if (Object.values(errors).some(error => error !== undefined)) {
    //   return;
    // }

    if (!currentForm) return;

    try {
      let newErrors: {[key: string]: boolean} = {};

      for (const item of currentForm.blocks) {
        if (
          item.form?.required &&
          item.type === FormInputType.DateInput &&
          item.form?.isRange &&
          item.value.split(' to ').length < 2
        ) {
          newErrors[item.id] = true;
          setErrors(prevErrors => ({
            ...prevErrors,
            [item.id]: translator('ps_this_field_is_required'),
          }));
        } else if (item.form?.required && item.value.trim() === '') {
          newErrors[item.id] = true;
          setErrors(prevErrors => ({
            ...prevErrors,
            [item.id]: translator('ps_this_field_is_required'),
          }));
        } else if (
          item.value &&
          item.type === FormInputType.NumberInput &&
          (item.form?.min || item.form?.max)
        ) {
          let error;
          const result = Number(item.value);
          const min = Number(item.form?.min);
          const max = Number(item.form?.max);
          if (!isNaN(result) && !isNaN(min) && result < min) {
            error = translator(
              'ps_invalid_number_greater_or_equal',
              // @ts-ignore
              {
                min: min,
              },
            );
          } else if (!isNaN(result) && !isNaN(max) && result > max) {
            error = translator(
              'ps_invalid_number_less_or_equal',
              // @ts-ignore
              {
                max: max,
              },
            );
          } else error = undefined;
          if (error !== undefined) {
            newErrors[item.id] = true;
          }
          setErrors(prevErrors => ({
            ...prevErrors,
            [item.id]: error,
          }));
        } else if (
          item.type === FormInputType.EmailInput &&
          item.value &&
          !isValidEmail(item.value)
        ) {
          newErrors[item.id] = true;
          setErrors(prevErrors => ({
            ...prevErrors,
            [item.id]: translator('ps_invalid_email'),
          }));
        } else if (
          item.type === FormInputType.UrlInput &&
          item.value &&
          !isValidUrl(item.value)
        ) {
          newErrors[item.id] = true;
          setErrors(prevErrors => ({
            ...prevErrors,
            [item.id]: translator('ps_invalid_link'),
          }));
        } else if (
          item.type === FormInputType.PhoneNumberInput &&
          item.value &&
          !isValidPhoneNumber(item.value)
        ) {
          newErrors[item.id] = true;
          setErrors(prevErrors => ({
            ...prevErrors,
            [item.id]: translator('ps_invalid_phone_number'),
          }));
        } else {
          setErrors(prevErrors => ({
            ...prevErrors,
            [item.id]: undefined,
          }));
        }
      }

      if (Object.keys(newErrors).length > 0) {
        return;
      }
    } catch (error) {
      psLogger.error(`PSFormOverlay handleSubmit : ${error}`);
    }

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
        form: JSON.stringify(currentForm),
        form_submitted: true,
      });
      setLoading(true);
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
          messageCurrent.body!.formSubmitted = true;
          messageCurrent.editedAt = Date.now();
        });
      }
      setLoading(false);
      hideModal();
    } catch (error) {
      setLoading(false);
      psLogger.error(`PSFormOverlay: error = ${JSON.stringify(error)}`);
    }
  };

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
      setLoading(true);
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
      setLoading(false);
      hideModal();
    } catch (error) {
      setLoading(false);
      psLogger.error(`PSFormOverlay: error = ${JSON.stringify(error)}`);
    }
  };

  const hideModal = () => {
    setErrors({});
    setOpenDateTimePicker({});
    hide();
  };

  const renderCustomHandle = React.useCallback(() => {
    return <FormTitle title={form?.settingsForm?.title} hide={hideModal} />;
  }, [hideModal]);

  const backgroundStyle = React.useMemo(() => {
    return {
      backgroundColor: colors.Primary.white,
    };
  }, [colors.Primary.white]);

  return isVisible && form && currentForm ? (
    <BottomSheet
      ref={bottomSheetRef}
      enablePanDownToClose={false}
      // handleComponent={null}
      index={isVisible ? 0 : -1}
      snapPoints={['100%']}
      handleComponent={renderCustomHandle}
      // backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      onClose={hideModal}
      // onBackdropPress={hideModal}
      // backdropColor={colors.Primary.white}
      // isVisible={isVisible}
      // onSwipeComplete={hideModal}
      // swipeDirection={['down']}
      // style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <FormDescription description={form.settingsForm?.description} />
        {currentForm.blocks.map((item, index) => {
          // Text Input
          if (item.type === FormInputType.TextInput) {
            return (
              <FormInput
                key={item.id}
                value={item.value}
                onChangeText={text => {
                  // set value
                  setCurrentForm(prevForm => {
                    if (!prevForm) return;

                    return {
                      ...prevForm,
                      blocks: prevForm.blocks.map((block, i) =>
                        i === index ? {...block, value: text} : block,
                      ),
                    };
                  });

                  // // Kiểm tra lỗi và cập nhật state errors
                  // let error;
                  // if (item.form?.required && text.trim() === '') {
                  //   error = translator('ps_this_field_is_required');
                  // } else {
                  //   error = undefined;
                  // }

                  // setErrors(prevErrors => ({
                  //   ...prevErrors,
                  //   [item.id]: error,
                  // }));
                }}
                onBlur={() => {
                  // Kiểm tra lỗi và cập nhật state errors
                  let error;
                  if (item.form?.required && item.value.trim() === '') {
                    error = translator('ps_this_field_is_required');
                  } else {
                    error = undefined;
                  }

                  setErrors(prevErrors => ({
                    ...prevErrors,
                    [item.id]: error,
                  }));
                }}
                label={item.form?.label}
                required={item.form?.required}
                description={item.form?.description}
                placeholder={item.form?.placeholder}
                isLong={item.form?.isLong}
                error={errors[item.id]}
              />
            );
          }

          // Number Input
          if (item.type === FormInputType.NumberInput) {
            return (
              <FormInput
                key={item.id}
                value={item.value}
                onChangeText={textO => {
                  const text = textO.replaceAll(',', '.');
                  // set value
                  setCurrentForm(prevForm => {
                    if (!prevForm) return;

                    return {
                      ...prevForm,
                      blocks: prevForm.blocks.map((block, i) =>
                        i === index ? {...block, value: text} : block,
                      ),
                    };
                  });

                  // Kiểm tra lỗi và cập nhật state errors
                  // let error;
                  // if (item.form?.required && text.trim() === '') {
                  //   error = translator('ps_this_field_is_required');
                  // } else if (
                  //   item.form?.required &&
                  //   (item.form.min || item.form.max)
                  // ) {
                  //   const result = Number(text);
                  //   const min = Number(item.form.min);
                  //   const max = Number(item.form.max);
                  //   if (!isNaN(result) && !isNaN(min) && result < min) {
                  //     error = `Invalid number. (required: >= ${min})`;
                  //   } else if (!isNaN(result) && !isNaN(max) && result > max) {
                  //     error = `Invalid number. (required: <= ${max})`;
                  //   } else error = undefined;
                  // } else {
                  //   error = undefined;
                  // }

                  // setErrors(prevErrors => ({
                  //   ...prevErrors,
                  //   [item.id]: error,
                  // }));
                }}
                onBlur={() => {
                  // Kiểm tra lỗi và cập nhật state errors
                  // let error;
                  // if (item.form?.required && item.value.trim() === '') {
                  //   error = translator('ps_this_field_is_required');
                  // } else {
                  //   error = undefined;
                  // }

                  // setErrors(prevErrors => ({
                  //   ...prevErrors,
                  //   [item.id]: error,
                  // }));

                  let error;
                  if (item.form?.required && item.value.trim() === '') {
                    error = translator('ps_this_field_is_required');
                  } else if (item.value && (item.form.min || item.form.max)) {
                    const result = Number(item.value);
                    const min = Number(item.form.min);
                    const max = Number(item.form.max);
                    if (!isNaN(result) && !isNaN(min) && result < min) {
                      error = translator(
                        'ps_invalid_number_greater_or_equal',
                        // @ts-ignore
                        {
                          min: min,
                        },
                      );
                    } else if (!isNaN(result) && !isNaN(max) && result > max) {
                      error = translator(
                        'ps_invalid_number_less_or_equal',
                        // @ts-ignore
                        {
                          max: max,
                        },
                      );
                    } else error = undefined;
                  } else {
                    error = undefined;
                  }

                  setErrors(prevErrors => ({
                    ...prevErrors,
                    [item.id]: error,
                  }));
                }}
                label={item.form?.label}
                required={item.form?.required}
                description={item.form?.description}
                placeholder={item.form?.placeholder}
                keyboardType={'decimal-pad'} // numeric
                error={errors[item.id]}
              />
            );
          }

          // Email Input
          if (item.type === FormInputType.EmailInput) {
            return (
              <FormInput
                key={item.id}
                value={item.value}
                onChangeText={text => {
                  // set value
                  setCurrentForm(prevForm => {
                    if (!prevForm) return;

                    return {
                      ...prevForm,
                      blocks: prevForm.blocks.map((block, i) =>
                        i === index ? {...block, value: text} : block,
                      ),
                    };
                  });

                  // Kiểm tra lỗi và cập nhật state errors
                  // let error;
                  // if (item.form?.required && text.trim() === '') {
                  //   error = translator('ps_this_field_is_required');
                  // } else if (item.form?.required && !isValidEmail(text)) {
                  //   error = translator('ps_invalid_email');
                  // } else {
                  //   error = undefined;
                  // }

                  // setErrors(prevErrors => ({
                  //   ...prevErrors,
                  //   [item.id]: error,
                  // }));
                }}
                onBlur={() => {
                  // Kiểm tra lỗi và cập nhật state errors
                  // let error;
                  // if (item.form?.required && item.value.trim() === '') {
                  //   error = translator('ps_this_field_is_required');
                  // } else {
                  //   error = undefined;
                  // }

                  // setErrors(prevErrors => ({
                  //   ...prevErrors,
                  //   [item.id]: error,
                  // }));

                  let error;
                  if (item.form?.required && item.value.trim() === '') {
                    error = translator('ps_this_field_is_required');
                  } else if (!isValidEmail(item.value)) {
                    error = translator('ps_invalid_email');
                  } else {
                    error = undefined;
                  }

                  setErrors(prevErrors => ({
                    ...prevErrors,
                    [item.id]: error,
                  }));
                }}
                label={item.form?.label}
                required={item.form?.required}
                description={item.form?.description}
                placeholder={item.form?.placeholder}
                keyboardType={'email-address'}
                error={errors[item.id]}
                icon={
                  <PSIcEmail24
                    width={24}
                    height={24}
                    fill={colors.Primary.subText}
                  />
                }
              />
            );
          }

          // Url Input
          if (item.type === FormInputType.UrlInput) {
            return (
              <FormInput
                key={item.id}
                value={item.value}
                onChangeText={text => {
                  // set value
                  setCurrentForm(prevForm => {
                    if (!prevForm) return;

                    return {
                      ...prevForm,
                      blocks: prevForm.blocks.map((block, i) =>
                        i === index ? {...block, value: text} : block,
                      ),
                    };
                  });

                  // Kiểm tra lỗi và cập nhật state errors
                  // let error;
                  // if (item.form?.required && text.trim() === '') {
                  //   error = translator('ps_this_field_is_required');
                  // } else {
                  //   error = undefined;
                  // }

                  // setErrors(prevErrors => ({
                  //   ...prevErrors,
                  //   [item.id]: error,
                  // }));
                }}
                onBlur={() => {
                  // Kiểm tra lỗi và cập nhật state errors
                  let error;
                  if (item.form?.required && item.value.trim() === '') {
                    error = translator('ps_this_field_is_required');
                  } else if (!isValidUrl(item.value)) {
                    error = translator('ps_invalid_link');
                  } else {
                    error = undefined;
                  }

                  setErrors(prevErrors => ({
                    ...prevErrors,
                    [item.id]: error,
                  }));
                }}
                label={item.form?.label}
                required={item.form?.required}
                description={item.form?.description}
                placeholder={item.form?.placeholder}
                keyboardType={'url'}
                error={errors[item.id]}
                icon={
                  <PSIcGlobal24
                    width={24}
                    height={24}
                    fill={colors.Primary.subText}
                  />
                }
              />
            );
          }

          // Date Input
          if (item.type === FormInputType.DateInput) {
            const dateTimeFromToValue = item.value.split(' to ');
            const dateTimeFromValue = dateTimeFromToValue[0];
            const dateTimeToValue = dateTimeFromToValue[1];
            return (
              <View key={item.id} style={{flexDirection: 'column'}}>
                {/* title */}
                {item.form?.label ? (
                  <Text
                    style={[
                      {
                        marginBottom: 4,
                      },
                      typography.bodyLargeS,
                      {color: colors.Primary.mainText},
                    ]}>
                    {item.form?.label}
                    {item.form?.required && (
                      <Text style={{color: colors.Negative.normal}}> *</Text>
                    )}
                  </Text>
                ) : null}
                {/* description */}
                {item.form?.description ? (
                  <Text
                    style={[
                      {
                        marginBottom: 4,
                      },
                      typography.bodyMediumR,
                      {color: colors.Primary.subText},
                    ]}>
                    {item.form?.description}
                  </Text>
                ) : null}

                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <PSDebouncedPressable
                    style={{flex: 1}}
                    onPress={() => {
                      setOpenDateTimePicker(prev => ({
                        ...prev,
                        [item.id]: true,
                      }));
                    }}>
                    <View pointerEvents="none">
                      <FormInput
                        key={item.id}
                        value={convertDateFormat(
                          dateTimeFromValue,
                          item.form?.withTime,
                        )}
                        // label={item.form?.label}
                        labelInput={'From'}
                        required={item.form?.required}
                        // description={item.form?.description}
                        placeholder={item.form?.placeholder}
                        editable={false}
                        error={errors[item.id]}
                      />
                    </View>
                  </PSDebouncedPressable>
                  {item.form?.isRange && (
                    <PSDebouncedPressable
                      style={{
                        flex: 1,
                        marginStart: 18,
                      }}
                      onPress={() => {
                        setOpenDateTimePicker(prev => ({
                          ...prev,
                          [`${item.id}To`]: true,
                        }));
                      }}>
                      <View pointerEvents="none">
                        <FormInput
                          key={`${item.id}To`}
                          value={convertDateFormat(
                            dateTimeToValue,
                            item.form?.withTime,
                          )}
                          // label={item.form?.label ? ' ' : undefined}
                          labelInput={'To'}
                          // required={item.form?.required}
                          // description={
                          //   item.form?.description ? '  ' : undefined
                          // }
                          placeholder={item.form?.placeholder}
                          editable={false}
                          error={errors[item.id]}
                        />
                      </View>
                    </PSDebouncedPressable>
                  )}
                </View>

                <DatePicker
                  key={`${item.id}_Date`}
                  modal
                  mode={item.form?.withTime ? 'datetime' : 'date'}
                  open={openDateTimePicker[item.id]}
                  date={item.form?.min ? new Date(item.form.min) : new Date()}
                  minimumDate={
                    item.form?.min ? new Date(item.form.min) : undefined
                  }
                  maximumDate={
                    item.value.split(' to ')[1]
                      ? new Date(item.value.split(' to ')[1]!)
                      : item.form?.max
                        ? new Date(item.form.max)
                        : undefined
                  }
                  onConfirm={date => {
                    setErrors(prevErrors => ({
                      ...prevErrors,
                      [item.id]: undefined,
                    }));
                    // // set value
                    setCurrentForm(prevForm => {
                      if (!prevForm || !date) return;

                      const dateTimeFromTo = item.value.split(' to ');

                      // const dateTimeFrom = dateTimeFromTo[0];
                      const dateTimeTo = dateTimeFromTo[1];

                      const newDateTimeFromTo = `${moment(date).format('yyyy-MM-DDTHH:mm')}${dateTimeTo ? ` to ${dateTimeTo}` : ''}`;

                      return {
                        ...prevForm,
                        blocks: prevForm.blocks.map((block, i) =>
                          i === index
                            ? {
                                ...block,
                                value: newDateTimeFromTo,
                              }
                            : block,
                        ),
                      };
                    });

                    // close DateTimePicker
                    setOpenDateTimePicker(prev => ({
                      ...prev,
                      [item.id]: false,
                    }));
                  }}
                  onCancel={() => {
                    setOpenDateTimePicker(prev => ({
                      ...prev,
                      [item.id]: false,
                    }));
                    // setOpenDateTimePicker(false);
                  }}
                />

                <DatePicker
                  key={`${item.id}_Date_To`}
                  modal
                  mode={item.form?.withTime ? 'datetime' : 'date'}
                  open={openDateTimePicker[`${item.id}To`]}
                  date={
                    item.value.split(' to ')[0]
                      ? new Date(item.value.split(' to ')[0]!)
                      : item.form?.min
                        ? new Date(item.form.min)
                        : new Date()
                  }
                  minimumDate={
                    item.value.split(' to ')[0]
                      ? new Date(item.value.split(' to ')[0]!)
                      : item.form?.min
                        ? new Date(item.form.min)
                        : undefined
                  }
                  maximumDate={
                    item.form?.max ? new Date(item.form.max) : undefined
                  }
                  onConfirm={date => {
                    setErrors(prevErrors => ({
                      ...prevErrors,
                      [item.id]: undefined,
                    }));
                    // // set value
                    setCurrentForm(prevForm => {
                      if (!prevForm || !date) return;

                      const dateTimeFromTo = item.value.split(' to ');

                      const dateTimeFrom = dateTimeFromTo[0];
                      // const dateTimeTo = dateTimeFromTo[1];

                      const newDateTimeFromTo = `${dateTimeFrom ? `${dateTimeFrom}` : ''} to ${moment(date).format('yyyy-MM-DDTHH:mm')}`;

                      return {
                        ...prevForm,
                        blocks: prevForm.blocks.map((block, i) =>
                          i === index
                            ? {
                                ...block,
                                value: newDateTimeFromTo,
                              }
                            : block,
                        ),
                      };
                    });

                    setOpenDateTimePicker(prev => ({
                      ...prev,
                      [`${item.id}To`]: false,
                    }));
                  }}
                  onCancel={() => {
                    setOpenDateTimePicker(prev => ({
                      ...prev,
                      [`${item.id}To`]: false,
                    }));
                  }}
                />
              </View>
            );
          }

          // Phone Number Input
          if (item.type === FormInputType.PhoneNumberInput) {
            return (
              <FormInput
                key={item.id}
                value={item.value}
                onChangeText={text => {
                  // set value
                  setCurrentForm(prevForm => {
                    if (!prevForm) return;

                    return {
                      ...prevForm,
                      blocks: prevForm.blocks.map((block, i) =>
                        i === index ? {...block, value: text} : block,
                      ),
                    };
                  });

                  // Kiểm tra lỗi và cập nhật state errors
                  // let error;
                  // if (item.form?.required && text.trim() === '') {
                  //   error = translator('ps_this_field_is_required');
                  // } else {
                  //   error = undefined;
                  // }

                  // setErrors(prevErrors => ({
                  //   ...prevErrors,
                  //   [item.id]: error,
                  // }));
                }}
                onBlur={() => {
                  // Kiểm tra lỗi và cập nhật state errors
                  let error;
                  if (item.form?.required && item.value.trim() === '') {
                    error = translator('ps_this_field_is_required');
                  } else if (!isValidPhoneNumber(item.value)) {
                    error = translator('ps_invalid_phone_number');
                  } else {
                    error = undefined;
                  }

                  setErrors(prevErrors => ({
                    ...prevErrors,
                    [item.id]: error,
                  }));
                }}
                label={item.form?.label}
                required={item.form?.required}
                description={item.form?.description}
                placeholder={item.form?.placeholder}
                keyboardType={'phone-pad'}
                error={errors[item.id]}
              />
            );
          }

          // Choice Input
          if (item.type === FormInputType.ChoiceInput) {
            if (item.form?.type === FormType.Checkbox) {
              return (
                <WrapChoice
                  key={item.id}
                  label={item.form?.label}
                  required={item.form?.required}
                  description={item.form?.description}
                  error={errors[item.id]}>
                  <MultiChoice
                    choices={item.items.mapNotNull((item, index) => {
                      return {
                        ...item,
                        id: `${item.content}-${index}`,
                      } as ItemModel;
                    })}
                    // selectedItem={singleSelection}
                    onChange={selectedItems => {
                      setErrors(prevErrors => ({
                        ...prevErrors,
                        [item.id]: undefined,
                      }));

                      // set value
                      setCurrentForm(prevForm => {
                        if (!prevForm) return;

                        return {
                          ...prevForm,
                          blocks: prevForm.blocks.map((block, i) =>
                            i === index
                              ? {
                                  ...block,
                                  value: selectedItems
                                    .map(e => e.content)
                                    .join(','),
                                }
                              : block,
                          ),
                        };
                      });
                    }}
                  />
                </WrapChoice>
              );
            } else if (item.form?.type === FormType.Dropdown) {
              return (
                <WrapChoice
                  key={item.id}
                  label={item.form?.label}
                  required={item.form?.required}
                  description={item.form?.description}
                  error={errors[item.id]}>
                  <DropdownInput
                    choices={item.items.mapNotNull((item, index) => {
                      return {
                        ...item,
                        id: `${item.content}-${index}`,
                      } as ItemModel;
                    })}
                    onChange={selectedItem => {
                      setErrors(prevErrors => ({
                        ...prevErrors,
                        [item.id]: undefined,
                      }));

                      // set value
                      setCurrentForm(prevForm => {
                        if (!prevForm) return;

                        return {
                          ...prevForm,
                          blocks: prevForm.blocks.map((block, i) =>
                            i === index
                              ? {...block, value: selectedItem.content}
                              : block,
                          ),
                        };
                      });
                    }}
                  />
                </WrapChoice>
              );
            } else {
              // FormType.SingleChoice
              return (
                <WrapChoice
                  key={item.id}
                  label={item.form?.label}
                  required={item.form?.required}
                  description={item.form?.description}
                  error={errors[item.id]}>
                  <SingleChoice
                    choices={item.items.mapNotNull((item, index) => {
                      return {
                        ...item,
                        id: `${item.content}-${index}`,
                      } as ItemModel;
                    })}
                    // selectedItem={singleSelection}
                    onChange={selectedItem => {
                      setErrors(prevErrors => ({
                        ...prevErrors,
                        [item.id]: undefined,
                      }));

                      // set value
                      setCurrentForm(prevForm => {
                        if (!prevForm) return;

                        return {
                          ...prevForm,
                          blocks: prevForm.blocks.map((block, i) =>
                            i === index
                              ? {...block, value: selectedItem.content}
                              : block,
                          ),
                        };
                      });
                    }}
                  />
                </WrapChoice>
              );
            }
          }

          // =====
        })}
        <KeyBoardHeightView />
      </ScrollView>
      {/* </KeyboardAvoidingView> */}
      <View style={styles.buttonContainer}>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <View style={styles.row_button}>
            {!form.settingsForm?.required ? (
              <PSTextButton
                text={translator('ps_skip')}
                textStyle={[
                  typography.headingLargeB,
                  {color: colors.Primary.branding},
                ]}
                style={[
                  {flex: 1},
                  {
                    borderWidth: 1,
                    borderColor: colors.Primary.branding,
                  },
                ]}
                onPress={handleSkip}
              />
            ) : null}

            {!form.settingsForm?.required ? <View style={{width: 12}} /> : null}

            <PSTextButton
              text={translator('ps_submit')}
              textStyle={[
                typography.headingLargeB,
                {color: colors.Primary.white},
              ]}
              style={[{flex: 1}, {backgroundColor: colors.Primary.branding}]}
              leftIcon={() => (
                <PSIcSubmitFill24
                  width={32}
                  height={32}
                  fill={colors.Primary.white}
                />
              )}
              onPress={handleSubmit}
            />
          </View>
        )}
      </View>
      {/* </SafeAreaView> */}
    </BottomSheet>
  ) : null;
};

function convertDateFormat(
  inputDate?: string | undefined,
  withTime?: boolean | undefined,
) {
  if (!inputDate) return '';

  // Tách ngày và giờ
  const [date, time] = inputDate.split('T');

  if (!date) return '';

  // Thay thế dấu '-' bằng '/' trong phần ngày
  const formattedDate = date.replace(/-/g, '/');

  // Kết hợp ngày và giờ theo định dạng mới
  if (withTime) return `${formattedDate} - ${time}`;
  return `${formattedDate}`;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url: string): boolean {
  const regex =
    /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z0-9]{2,}(:[0-9]{1,5})?(\/[^\s(),]*)?\/?$/;

  return !!url && regex.test(url.toLowerCase());
}

function isValidPhoneNumber(phoneNumber: string): boolean {
  const regex = /^[+\d]([\d ]+|(?:[.-](\d+)))*$/;

  if (!phoneNumber) {
    return false;
  }
  const normalize = isValidParentheses(phoneNumber);
  if (!normalize) {
    return false;
  }
  if (!regex.test(phoneNumber)) {
    return false;
  }
  return true;
}

function isValidParentheses(phoneNumber: string): string | undefined {
  let openCount = 0;
  let normalize = '';
  const length = phoneNumber.length;
  for (let i = 0; i < length; i++) {
    switch (phoneNumber[i]) {
      case '(':
        if (i + 1 < length && phoneNumber[i + 1] === '-') {
          return undefined;
        }
        openCount++;
        break;
      case ')':
        openCount--;
        if (openCount < 0) {
          // More closing parentheses than opening ones
          return undefined;
        }
        if (i > 0 && isNaN(Number(phoneNumber[i - 1]))) {
          return undefined;
        }
        break;
      default:
        normalize += phoneNumber[i];
        break;
    }
  }
  return openCount === 0 ? normalize : undefined;
}

// Single Choice Component
const SingleChoice = React.memo(
  ({
    choices,
    onChange,
  }: {
    choices: ItemModel[];
    onChange: (item: ItemModel) => void;
  }) => {
    const [singleSelection, setSingleSelection] = React.useState<
      ItemModel | undefined
    >(undefined);
    return (
      <ChoiceComponent
        choices={choices}
        selectedItems={singleSelection ? [singleSelection] : []}
        onChange={items => {
          setSingleSelection(items[0]);
          items[0] && onChange(items[0]);
        }}
        radioMode={true}
      />
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MultiChoice = ({
  choices,
  onChange,
}: {
  choices: ItemModel[];
  onChange: (items: ItemModel[]) => void;
}) => {
  const [multiSelection, setMultiSelection] = React.useState<ItemModel[]>([]);
  return (
    <ChoiceComponent
      choices={choices}
      selectedItems={multiSelection}
      onChange={items => {
        setMultiSelection(items);
        items && onChange(items);
      }}
      radioMode={false}
    />
  );
};

const ChoiceComponent = ({
  choices,
  selectedItems,
  onChange,
  radioMode,
}: {
  choices: ItemModel[];
  selectedItems: ItemModel[];
  onChange: (items: ItemModel[]) => void;
  radioMode: boolean;
}) => {
  const handleSelect = (item: ItemModel) => {
    if (radioMode) {
      onChange([item]);
    } else {
      const updatedSelection = selectedItems.some(
        selectedItem => selectedItem.id === item.id,
      )
        ? selectedItems.filter(selectedItem => selectedItem.id !== item.id)
        : [...selectedItems, item];
      onChange(updatedSelection);
    }
  };

  return (
    <View style={styles.container}>
      {choices.map(item => {
        return (
          <ChoiceItem
            key={item.id}
            item={item}
            isSelected={selectedItems.some(
              selectedItem => selectedItem.id === item.id,
            )}
            onSelect={handleSelect}
            radioMode={radioMode}
          />
        );
      })}
    </View>
  );
};

const ChoiceItem = ({
  item,
  isSelected,
  onSelect,
  radioMode,
}: {
  item: ItemModel;
  isSelected: boolean;
  onSelect: (item: ItemModel) => void;
  radioMode: boolean;
}) => {
  const {colors, typography} = usePSDesignSystemContext();
  return (
    <PSDebouncedPressable
      key={item.id}
      style={styles.choiceItem}
      onPress={() => onSelect(item)}>
      <View
        style={[
          styles.checkbox,
          {
            borderColor: colors.Branding.b300,
            borderRadius: radioMode ? 10 : 4,
            backgroundColor: radioMode
              ? colors.Primary.white
              : isSelected
                ? colors.Branding.b300
                : colors.Primary.white,
          },
          isSelected && styles.checked,
        ]}>
        {radioMode
          ? isSelected && (
              <View
                style={[
                  styles.radioInner,
                  {backgroundColor: colors.Branding.b300},
                ]}
              />
            )
          : isSelected && (
              <Text style={[styles.checkmark, {color: colors.Primary.white}]}>
                ✓
              </Text>
            )}
      </View>
      <Text
        style={[
          typography.bodyXLargeR,
          {color: colors.Primary.mainText},
          {marginEnd: 20},
        ]}>
        {item.content}
      </Text>
    </PSDebouncedPressable>
  );
};

const WrapChoice = React.memo(
  ({
    label,
    description,
    error,
    required,
    children,
  }: PropsWithChildren<{
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
  }>) => {
    const {colors, typography} = usePSDesignSystemContext();
    return (
      <View style={{marginBottom: 20}}>
        {label ? (
          <Text
            style={[
              styles.label,
              typography.bodyLargeS,
              {color: colors.Primary.mainText},
            ]}>
            {label}
            {required && (
              <Text style={{color: colors.Negative.normal}}> *</Text>
            )}
          </Text>
        ) : null}
        {description ? (
          <Text
            style={[
              styles.label,
              typography.bodyMediumR,
              {color: colors.Primary.subText},
            ]}>
            {description}
          </Text>
        ) : null}
        {children}
        {error && (
          <Text
            style={[
              {marginTop: 7, color: colors.Negative.normal},
              typography.bodyMediumR,
            ]}>
            {error}
          </Text>
        )}
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const DropdownInput = React.memo(
  ({
    choices,
    onChange,
    label,
  }: {
    choices: ItemModel[];
    onChange: (item: ItemModel) => void;
    label?: string;
  }) => {
    const {colors, typography} = usePSDesignSystemContext();
    const [visible, setVisible] = React.useState(false);
    const [selected, setSelected] = React.useState<ItemModel | undefined>(
      undefined,
    );

    const toggleDropdown = React.useCallback(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setVisible(!visible);
    }, [visible]);

    const onItemPress = (item: ItemModel) => {
      setSelected(item);
      onChange(item);
      toggleDropdown();
    };

    const renderItem = (item: ItemModel) => (
      <PSDebouncedPressable
        style={[styles.item, {borderBottomColor: colors.Primary.border}]}
        onPress={() => onItemPress(item)}>
        <Text style={[typography.bodyLargeR, {color: colors.Primary.mainText}]}>
          {item.content}
        </Text>
      </PSDebouncedPressable>
    );

    return (
      <View
        style={{
          width: '100%',
        }}>
        <PSDebouncedPressable
          style={[
            styles.button,
            {
              borderColor: colors.Primary.border,
              alignItems: 'center',
              backgroundColor: colors.Primary.white,
            },
          ]}
          onPress={toggleDropdown}>
          <Text
            style={[
              styles.buttonText,
              typography.bodyXLargeR,
              {color: colors.Primary.mainText},
            ]}>
            {(selected && selected.content) || label}
          </Text>
          <PSIcDropDown24
            width={24}
            height={24}
            fill={colors.Primary.disable}
          />
        </PSDebouncedPressable>
        {visible && (
          <View
            style={[
              {
                width: '100%',
                backgroundColor: colors.Primary.white,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: colors.Primary.border,
                marginTop: 5,
                overflow: 'hidden',
              },
              {maxHeight: 200},
            ]}>
            <ScrollView
              style={{
                flexGrow: 0,
              }}>
              {choices.map(renderItem)}
            </ScrollView>
          </View>
        )}
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

// keyboard view height
const KeyBoardHeightView = React.memo(
  () => {
    const {keyboardHeight, keyboardShown} = usePSPSMessageKeyboardAreaContext();
    return keyboardShown ? (
      <View style={{height: keyboardHeight}}></View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'white',
    marginHorizontal: 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'white', // Hoặc màu nền bạn muốn cho modal
  },
  modalContainer: {
    flex: 1,
  },
  scrollViewContent: {
    // flexGrow: 1,
    // justifyContent: 'center',
    padding: (16).px(),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
    padding: 16,
  },
  // ==choice=
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checked: {
    // backgroundColor: 'white',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkmark: {
    fontSize: 14,
  },
  label: {
    marginBottom: 4,
  },
  // ======
  // =====Dropdown=====
  button: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1,
    height: (48).px(),
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonText: {
    flex: 1,
    textAlign: 'center',
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '90%',
    shadowColor: '#000000',
    shadowRadius: 4,
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.5,
    alignSelf: 'center',
  },
  item: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  // ======
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row_button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
