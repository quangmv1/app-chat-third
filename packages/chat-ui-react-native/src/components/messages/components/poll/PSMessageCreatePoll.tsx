import React, {Fragment} from 'react';
import {
  usePSMessageCurrentThreadIdContext,
  usePSMessageCreatePollActionContext,
  usePSMessageCreatePollContext,
} from '../../contexts';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSSendMessageContext,
  usePSTranslationContext,
} from '../../../../context';
import {useRenderCounter} from '../../../../hooks';
import isEqual from 'react-fast-compare';
import {IcLine15PlusMarkCircle, IcLine15XmarkCircle} from '../../../../icons';
import {PSMessagePollModel, PSMessagePollOptionModel} from '../../../../types';
import uuid from 'react-native-uuid';
import moment from 'moment';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {PSCheckBox} from '../../../PSCheckBox';
import {Alert} from 'react-native';
import {DatePicker} from '../../../../utils';

export const PSMessageCreatePoll = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const {hide} = usePSMessageCreatePollActionContext();

  const {isVisible, bottomSheetRef} = usePSMessageCreatePollContext();

  const [isValidated, setIsValidated] = React.useState(true);

  const currentThreadId = usePSMessageCurrentThreadIdContext();

  const {sendMessage} = usePSSendMessageContext();

  const [openDateTimePicker, setOpenDateTimePicker] = React.useState(false);

  const [questionText, setQuestionText] = React.useState('');

  const [options, setOptions] = React.useState<string[]>(['', '']);

  const [allowAddingOption, setAllowAddingOption] = React.useState(true);

  const [allowMultipleVotes, setAllowMultipleVotes] = React.useState(true);

  const [incognitoMode, setIncognitoMode] = React.useState(false);

  const [closeAt, setCloseAt] = React.useState(-1);

  const {translator} = usePSTranslationContext();

  const initState = () => {
    setQuestionText('');
    setOptions(['', '']);
    setAllowAddingOption(true);
    setAllowMultipleVotes(true);
    setIncognitoMode(false);
    setCloseAt(-1);
  };

  const handleClose = React.useCallback(() => {
    hide();
    initState();
  }, [hide]);

  React.useEffect(() => {
    const validate =
      questionText.trim() !== '' &&
      (options.filter(option => option.trim() !== '').length >= 2
        ? true
        : allowAddingOption);
    setIsValidated(validate);
  }, [allowAddingOption, options, questionText, setIsValidated]);

  const createMessagePoll = React.useCallback(() => {
    if (bottomSheetRef?.current) {
      bottomSheetRef?.current?.close();
    }
    if (!currentThreadId) {
      return;
    }
    const request = {
      threadId: currentThreadId,
      poll: {
        id: '',
        title: questionText,
        allowAddingOption: allowAddingOption,
        allowMultipleVotes: allowMultipleVotes,
        incognitoMode: incognitoMode,
        closeAt: closeAt,
        options: options
          .filter(option => option.trim() !== '')
          .map(option => {
            return {
              id: uuid.v4().toString(),
              text: option,
              voteCount: 0,
              partialVoters: [],
            } as PSMessagePollOptionModel;
          }),
        myVotes: [],
      } as PSMessagePollModel,
    };
    sendMessage(request);
  }, [
    allowMultipleVotes,
    allowAddingOption,
    bottomSheetRef,
    closeAt,
    currentThreadId,
    incognitoMode,
    options,
    questionText,
    sendMessage,
  ]);

  const handleCreateMessagePoll = React.useCallback(() => {
    if (options.filter(option => option.trim() !== '').length < 2) {
      Alert.alert(
        translator('ps_message_poll_create_poll'),
        translator('ps_message_poll_description_confirm_create_poll'),
        [
          {
            text: translator('ps_cancel'),
            style: 'cancel',
          },
          {
            text: translator('ps_confirm'),
            onPress: () => createMessagePoll(),
          },
        ],
      );
    } else {
      createMessagePoll();
    }
  }, [createMessagePoll, options, translator]);

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
    ),
    [],
  );

  const renderCustomHandle = React.useCallback(() => {
    return (
      <Handle
        isValidated={isValidated}
        onCreateMessagePollPressed={handleCreateMessagePoll}
        onClose={handleClose}
      />
    );
  }, [handleClose, handleCreateMessagePoll, isValidated]);

  const handleAddOptionPress = React.useCallback(() => {
    setOptions([...options, '']);
  }, [options, setOptions]);

  const renderContent = React.useCallback(() => {
    return (
      <BottomSheetScrollView>
        <View
          style={[
            styles.containerContent,
            {backgroundColor: colors.Primary.white},
          ]}>
          <HeadingText
            title={translator('ps_message_poll_question')}
            isRequire={true}
          />
          <Question
            questionText={questionText}
            setQuestionText={setQuestionText}
            containerStyle={styles.questionsContainer}
          />
          <HeadingText
            title={translator('ps_message_poll_add_option')}
            textStyle={styles.optionsHeadingText}
          />
          <Options
            options={options}
            setOptions={setOptions}
            containerStyle={styles.optionsContainerMargin}
          />
          <AddOptionButton
            onAddOptionPress={handleAddOptionPress}
            containerStyle={styles.addOptionButtonMargin}
          />
          <HeadingText
            title={translator('ps_message_poll_setting')}
            textStyle={styles.settingsHeadingText}
          />
          <Settings
            allowAddingOption={allowAddingOption}
            setAllowAddingOption={setAllowAddingOption}
            allowMultipleVotes={allowMultipleVotes}
            setAllowMultipleVotes={setAllowMultipleVotes}
            incognitoMode={incognitoMode}
            setIncognitoMode={setIncognitoMode}
            closeAt={closeAt}
            setCloseAt={setCloseAt}
            setOpenDateTimePicker={setOpenDateTimePicker}
          />
          <CloseAtTimeDatePicker
            openDateTimePicker={openDateTimePicker}
            setOpenDateTimePicker={setOpenDateTimePicker}
            setCloseAt={setCloseAt}
          />
          {closeAt !== -1 && (
            <CloseAtText
              closeAt={closeAt}
              setOpenDateTimePicker={setOpenDateTimePicker}
            />
          )}
        </View>
      </BottomSheetScrollView>
    );
  }, [
    colors.Primary.linerBorder,
    translator,
    questionText,
    options,
    handleAddOptionPress,
    allowAddingOption,
    allowMultipleVotes,
    incognitoMode,
    closeAt,
    openDateTimePicker,
  ]);

  const backgroundStyle = React.useMemo(() => {
    return {
      backgroundColor: colors.Primary.white,
    };
  }, [colors.Primary.linerBorder]);

  return isVisible ? (
    <BottomSheet
      ref={bottomSheetRef}
      enablePanDownToClose={true}
      handleComponent={renderCustomHandle}
      index={isVisible ? 0 : -1}
      snapPoints={['90%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      onClose={handleClose}>
      {renderContent()}
    </BottomSheet>
  ) : null;
});

const HandleTitle = React.memo(
  () => {
    const {translator} = usePSTranslationContext();
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.handleTitleText,
        typography.headingMediumS,
        {color: colors.Primary.mainText},
      ];
    }, [colors.Primary.mainText, typography.headingMediumS]);

    return (
      <Text style={textStyles}>
        {translator('ps_message_poll_create_poll')}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const HandleRightText = React.memo(
  ({isValidated}: {isValidated: boolean}) => {
    const {translator} = usePSTranslationContext();
    const {typography, colors} = usePSDesignSystemContext();
    const textStyles = React.useMemo(() => {
      return [
        styles.handleRightText,
        isValidated ? typography.bodyMediumS : typography.bodyXLargeR,
        {color: isValidated ? colors.Primary.branding : colors.Primary.disable},
      ];
    }, [
      colors.Primary.branding,
      colors.Primary.disable,
      isValidated,
      typography.bodyXLargeR,
      typography.bodyMediumS,
    ]);
    return <Text style={textStyles}>{translator('ps_continue')}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const HandleLeftText = React.memo(
  () => {
    const {translator} = usePSTranslationContext();
    const {typography, colors} = usePSDesignSystemContext();
    const textStyles = React.useMemo(() => {
      return [
        styles.handleLeftText,
        typography.bodyXLargeR,
        {color: colors.Primary.mainText},
      ];
    }, [colors.Primary.mainText, typography.bodyXLargeR]);
    return <Text style={textStyles}>{translator('ps_cancel')}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const Handle = React.memo(
  ({
    isValidated,
    onCreateMessagePollPressed,
    onClose,
  }: {
    isValidated: boolean;
    onCreateMessagePollPressed: () => void;
    onClose: () => void;
  }) => {
    const {colors} = usePSDesignSystemContext();
    const containerStyles = React.useMemo(() => {
      return [
        styles.handleContainer,
        {
          backgroundColor: colors.Primary.white,
          borderBottomColor: colors.Primary.border,
        },
      ];
    }, [colors.Primary.white, colors.Primary.border]);
    return (
      <View style={containerStyles}>
        <PSDebouncedPressable
          style={styles.handleLeftContainer}
          onPress={onClose}>
          <HandleLeftText />
        </PSDebouncedPressable>
        <HandleTitle />
        <PSDebouncedPressable
          disabled={!isValidated}
          style={styles.handleRightContainer}
          onPress={onCreateMessagePollPressed}>
          <HandleRightText isValidated={isValidated} />
        </PSDebouncedPressable>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const HeadingText = React.memo(
  ({
    title,
    isRequire,
    textStyle,
  }: {
    title: string;
    isRequire?: boolean;
    textStyle?: StyleProp<TextStyle>;
  }) => {
    const {typography, colors} = usePSDesignSystemContext();
    useRenderCounter(`PSMessageCreatePoll: HeadingText ${title}`);

    const textContainerStyles = React.useMemo(() => {
      return [
        textStyle,
        typography.bodyXLargeR,
        {color: colors.Primary.mainText},
      ];
    }, [colors.Primary.mainText, textStyle, typography.bodyXLargeR]);

    const textStyles = React.useMemo(() => {
      return [styles.textRequire, {color: colors.Negative.normal}];
    }, [colors.Negative.normal]);

    return (
      <Text style={textContainerStyles}>
        {title}
        {isRequire && <Text style={textStyles}> *</Text>}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const Question = React.memo(
  ({
    questionText,
    setQuestionText,
    containerStyle,
  }: {
    questionText: string;
    setQuestionText: React.Dispatch<React.SetStateAction<string>>;
    containerStyle?: StyleProp<ViewStyle>;
  }) => {
    const {typography, colors} = usePSDesignSystemContext();
    const {translator} = usePSTranslationContext();
    useRenderCounter('PSMessageCreatePoll: Question');
    const textStyles = React.useMemo(() => {
      return [
        styles.textInput,
        containerStyle,
        typography.bodyMediumR,
        {
          borderColor: colors.Primary.border,
          color: colors.Primary.mainText,
          lineHeight: undefined, // https://github.com/facebook/react-native/issues/33986
        },
      ];
    }, [
      colors.Primary.border,
      colors.Primary.mainText,
      containerStyle,
      typography.bodyMediumR,
    ]);

    return (
      <TextInput
        numberOfLines={1}
        style={textStyles}
        value={questionText}
        onChangeText={setQuestionText}
        placeholder={translator('ps_message_poll_enter_question')}
        placeholderTextColor={colors.Primary.placeHolder}
      />
    );
  },
  (prev, next) => isEqual(prev, next),
);

const Options = React.memo(
  ({
    options,
    setOptions,
    containerStyle,
  }: {
    options: string[];
    setOptions: React.Dispatch<React.SetStateAction<string[]>>;
    containerStyle?: StyleProp<ViewStyle>;
  }) => {
    const {translator} = usePSTranslationContext();
    const {typography, colors} = usePSDesignSystemContext();
    useRenderCounter('PSMessageCreatePoll: Options');

    const handleRemoveOptionPress = React.useCallback(
      (pos: number) => {
        setOptions(options.filter((_option, index) => index !== pos));
      },
      [options, setOptions],
    );

    const textStyles = React.useMemo(() => {
      return [
        styles.textInput,
        typography.bodyMediumR,
        {
          borderColor: colors.Primary.border,
          color: colors.Primary.mainText,
          lineHeight: undefined, // https://github.com/facebook/react-native/issues/33986
        },
      ];
    }, [
      colors.Primary.border,
      colors.Primary.mainText,
      typography.bodyMediumR,
    ]);

    return options.map((option, index, arr) => {
      return (
        <View key={index} style={[styles.optionsContainer, containerStyle]}>
          <TextInput
            numberOfLines={1}
            style={textStyles}
            value={option}
            onChangeText={newText => {
              setOptions(
                arr.map((value, index1) => {
                  if (index === index1) {
                    return newText;
                  } else {
                    return value;
                  }
                }),
              );
            }}
            placeholder={translator(
              'ps_message_poll_option',
              // @ts-ignore
              {
                num: `${index + 1}`,
              },
            )}
            placeholderTextColor={colors.Primary.placeHolder}
          />
          {arr.length > 2 && (
            <PSDebouncedPressable
              style={styles.removeOptionButton}
              onPress={() => {
                handleRemoveOptionPress(index);
              }}>
              <IcLine15XmarkCircle
                width={18}
                height={18}
                fill={colors.Negative.normal}
              />
            </PSDebouncedPressable>
          )}
        </View>
      );
    });
  },
  (prev, next) => isEqual(prev, next),
);

const AddOptionButtonContent = React.memo(
  ({text}: {text: string}) => {
    const {typography, colors} = usePSDesignSystemContext();
    const textStyles = React.useMemo(() => {
      return [typography.bodyXLargeR, {color: colors.Primary.mainText}];
    }, [colors.Primary.mainText, typography.bodyXLargeR]);
    return (
      <Fragment>
        <IcLine15PlusMarkCircle
          width={(18).px()}
          height={(18).px()}
          fill={colors.Primary.mainText}
        />
        <Text style={textStyles}>{text}</Text>
      </Fragment>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const AddOptionButton = React.memo(
  ({
    containerStyle,
    onAddOptionPress,
  }: {
    containerStyle?: StyleProp<ViewStyle>;
    onAddOptionPress: () => void;
  }) => {
    const {translator} = usePSTranslationContext();
    const {colors} = usePSDesignSystemContext();
    const containerStyles = React.useMemo(() => {
      return [
        styles.addOptionButton,
        containerStyle,
        {borderColor: colors.Primary.border},
      ];
    }, [colors.Primary.border, containerStyle]);
    return (
      <PSDebouncedPressable style={containerStyles} onPress={onAddOptionPress}>
        <AddOptionButtonContent
          text={` ${translator('ps_message_poll_add_option')}`}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const OptionTitleSetting = React.memo(
  ({text}: {text: string}) => {
    const {typography, colors} = usePSDesignSystemContext();
    const textStyles = React.useMemo(() => {
      return [
        styles.settingTitleText,
        typography.bodyXLargeR,
        {color: colors.Primary.subText},
      ];
    }, [colors.Primary.subText, typography.bodyXLargeR]);
    return <Text style={textStyles}>{text}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

const OptionSetting = React.memo(
  ({
    text,
    isChecked,
    onValueChange,
  }: {
    text: string;
    isChecked: boolean;
    onValueChange?: null | ((event: GestureResponderEvent) => void);
  }) => {
    const {colors} = usePSDesignSystemContext();
    return (
      <PSDebouncedPressable
        style={styles.settingsContainer}
        onPress={onValueChange}>
        <PSCheckBox
          checkBorderColor={colors.Primary.branding}
          uncheckBorderColor={colors.Primary.disable}
          iconFillColor={colors.Primary.branding}
          value={isChecked}
          onValueChange={onValueChange}
        />
        <OptionTitleSetting text={text} />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const Settings = React.memo(
  ({
    allowAddingOption,
    setAllowAddingOption,
    allowMultipleVotes,
    setAllowMultipleVotes,
    incognitoMode,
    setIncognitoMode,
    closeAt,
    setCloseAt,
    setOpenDateTimePicker,
  }: {
    allowAddingOption: boolean;
    setAllowAddingOption: React.Dispatch<React.SetStateAction<boolean>>;
    allowMultipleVotes: boolean;
    setAllowMultipleVotes: React.Dispatch<React.SetStateAction<boolean>>;
    incognitoMode: boolean;
    setIncognitoMode: React.Dispatch<React.SetStateAction<boolean>>;
    closeAt: number;
    setCloseAt: React.Dispatch<React.SetStateAction<number>>;
    setOpenDateTimePicker: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const {translator} = usePSTranslationContext();

    return (
      <Fragment>
        <OptionSetting
          text={translator('ps_message_poll_allow_multi_selection')}
          isChecked={allowMultipleVotes}
          onValueChange={() => {
            setAllowMultipleVotes(!allowMultipleVotes);
          }}
        />
        <OptionSetting
          text={translator('ps_message_poll_allow_add_more_option')}
          isChecked={allowAddingOption}
          onValueChange={() => {
            setAllowAddingOption(!allowAddingOption);
          }}
        />
        <OptionSetting
          text={translator('ps_message_poll_anonymous_poll')}
          isChecked={incognitoMode}
          onValueChange={() => {
            setIncognitoMode(!incognitoMode);
          }}
        />
        <OptionSetting
          text={translator('ps_message_poll_limit_time')}
          isChecked={closeAt !== -1}
          onValueChange={() => {
            setCloseAt(closeAt === -1 ? new Date().getTime() : -1);
            setOpenDateTimePicker(closeAt === -1);
          }}
        />
      </Fragment>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const CloseAtTimeDatePicker = React.memo(
  ({
    openDateTimePicker,
    setOpenDateTimePicker,
    setCloseAt,
  }: {
    openDateTimePicker: boolean;
    setOpenDateTimePicker: React.Dispatch<React.SetStateAction<boolean>>;
    setCloseAt: React.Dispatch<React.SetStateAction<number>>;
  }) => {
    return (
      <DatePicker
        modal
        mode={'datetime'}
        open={openDateTimePicker}
        date={new Date()}
        minimumDate={new Date()}
        onConfirm={date => {
          setOpenDateTimePicker(false);
          setCloseAt(date.getTime());
        }}
        onCancel={() => {
          setOpenDateTimePicker(false);
        }}
      />
    );
  },
  (prev, next) => isEqual(prev, next),
);

const CloseAtText = React.memo(
  ({
    closeAt,
    setOpenDateTimePicker,
  }: {
    closeAt: number;
    setOpenDateTimePicker: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const {typography, colors} = usePSDesignSystemContext();
    const time = React.useMemo(() => {
      return moment(closeAt).format('DD/MM [at] HH:mm');
    }, [closeAt]);

    const containerStyles = React.useMemo(() => {
      return [
        styles.closeAtText,
        {
          borderColor: colors.Branding.b600,
        },
      ];
    }, [colors.Branding.b600]);

    const textStyles = React.useMemo(() => {
      return [typography.bodyXLargeR, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.bodyXLargeR]);

    return (
      <PSDebouncedPressable
        onPress={() => {
          setOpenDateTimePicker(true);
        }}
        style={containerStyles}>
        <Text style={textStyles}>{time}</Text>
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  containerContent: {
    flex: 1,
    paddingVertical: (12).px(),
    paddingHorizontal: (16).px(),
    flexDirection: 'column',
  },
  handleContainer: {
    paddingHorizontal: (16).px(),
    height: (72).px(),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopStartRadius: (12).px(),
    borderTopEndRadius: (12).px(),
    borderBottomWidth: (0.5).px(),
  },
  handleTitleText: {
    textAlign: 'center',
  },
  handleRightContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  handleRightText: {
    textAlign: 'right',
  },
  handleLeftContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  handleLeftText: {
    textAlign: 'left',
  },
  questionsContainer: {marginTop: (12).px()},
  optionsContainer: {width: '100%', flexDirection: 'row'},
  optionsContainerMargin: {marginTop: (12).px()},
  optionsHeadingText: {marginTop: (24).px()},
  settingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: (6).px(),
  },
  textInput: {
    flex: 1,
    paddingHorizontal: (12).px(),
    paddingVertical: (12).px(),
    borderRadius: (22).px(),
    borderWidth: (1).px(),
    backgroundColor: 'transparent',
  },
  textRequire: {},
  addOptionButton: {
    borderRadius: (22).px(),
    borderWidth: (1).px(),
    width: '100%',
    padding: (8).px(),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  addOptionButtonMargin: {marginTop: (12).px()},
  removeOptionButton: {
    padding: (12).px(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsHeadingText: {marginTop: (24).px(), marginBottom: (16).px()},
  settingTitleText: {marginStart: (6).px()},
  closeAtText: {
    borderRadius: (22).px(),
    borderWidth: (1).px(),
    alignItems: 'center',
    marginTop: (4).px(),
    padding: (8).px(),
  },
});
