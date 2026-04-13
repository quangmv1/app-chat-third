import React, {forwardRef, useImperativeHandle} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import {usePSDesignSystemContext, usePSTranslationContext} from '../context';
import {PSPopupShowT} from '../context/PSPopupContext';
import {PSTextButton} from './PSTextButton';

type Action =
  | {type: 'SHOW_POPUP'; payload: PSPopupShowT}
  | {type: 'CLOSE_POPUP'; payload?: PSPopupShowT};

const initialState: PSPopupShowT = {
  title: '',
  description: '',

  leftText: '',
  colorLeftText: undefined,
  backgroundLeftText: undefined,
  onPressLeft: () => {},

  rightText: '',
  colorRightText: undefined,
  backgroundRightText: undefined,
  onPressRight: () => {},
};

const reducer = (state: PSPopupShowT, action: Action): PSPopupShowT => {
  switch (action.type) {
    case 'SHOW_POPUP':
      return {
        title: action.payload?.title,
        description: action.payload?.description,

        leftText: action.payload?.leftText,
        colorLeftText: action.payload?.colorLeftText,
        backgroundLeftText: action.payload?.backgroundLeftText,
        onPressLeft: action.payload?.onPressLeft,

        rightText: action.payload?.rightText,
        colorRightText: action.payload?.colorRightText,
        backgroundRightText: action.payload?.backgroundRightText,
        onPressRight: action.payload?.onPressRight,
      };
    case 'CLOSE_POPUP':
      return initialState;
    default:
      return state;
  }
};

export const PSModalPopup = forwardRef((_props, ref) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const inOutAnim = React.useRef(new Animated.Value(-500)).current;

  const {colors} = usePSDesignSystemContext();

  const [isVisible, setIsVisible] = React.useState(false);

  const [state, dispatch]: [PSPopupShowT, React.Dispatch<Action>] =
    React.useReducer(reducer, initialState);

  const styles = useStylesPSModalPopup();

  const {translator} = usePSTranslationContext();

  const show = React.useCallback((param: PSPopupShowT) => {
    setIsVisible(true);
    dispatch({type: 'SHOW_POPUP', payload: param});
    Animated.timing(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      duration: 500,
    }).start();
    Animated.timing(inOutAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 350,
    }).start();
  }, []);

  const close = React.useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 500,
    }).start();
    Animated.timing(inOutAnim, {
      toValue: -500,
      useNativeDriver: true,
      duration: 350,
    }).start(() => {
      setIsVisible(false);
      dispatch({type: 'CLOSE_POPUP'});
    });
  }, []);

  useImperativeHandle(ref, () => ({
    show,
    close,
  }));

  const onPressLeft = React.useCallback(() => {
    typeof state.onPressLeft === 'function' && state.onPressLeft();
    close();
  }, [state.onPressLeft, close]);

  const onPressRight = React.useCallback(() => {
    typeof state.onPressRight === 'function' && state.onPressRight();
    close();
  }, [state.onPressLeft, close]);

  return isVisible ? (
    <TouchableWithoutFeedback onPress={close}>
      <Animated.View style={[styles.styModal, {opacity: fadeAnim}]}>
        <Animated.View
          style={[styles.container, {transform: [{translateX: inOutAnim}]}]}>
          <View style={styles.containerTitle}>
            <Text style={styles.styTitle}>
              {state.title || translator('ps_title_warning')}
            </Text>
          </View>

          <View style={styles.containerBody}>
            <Text style={styles.styDescription}>{state.description || ''}</Text>
            <View style={styles.row}>
              <PSTextButton
                text={state.leftText || translator('ps_cancel')}
                textStyle={[
                  styles.textStyleCancel,
                  {color: state.colorLeftText || colors.Branding.b400},
                ]}
                style={[
                  styles.styButtonCancel,
                  {
                    backgroundColor:
                      state.backgroundLeftText || colors.Primary.linerBorder,
                  },
                ]}
                onPress={onPressLeft}
              />
              <PSTextButton
                text={state.rightText || translator('ps_accept')}
                textStyle={[
                  styles.textStyleConfirm,
                  {color: state.colorRightText || colors.Primary.white},
                ]}
                style={[
                  styles.styButtonConfirm,
                  {
                    backgroundColor:
                      state.backgroundRightText || colors.Negative.normal,
                  },
                ]}
                onPress={onPressRight}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  ) : null;
});

const useStylesPSModalPopup = () => {
  const {colors, typography} = usePSDesignSystemContext();
  const {width, height} = useWindowDimensions();

  return React.useMemo(
    () =>
      StyleSheet.create({
        styModal: {
          backgroundColor: `${colors.Neutral.n1000}4f`,
          width,
          height,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
        },
        container: {
          backgroundColor: colors.Primary.background,
          borderRadius: (16).px(),
          overflow: 'hidden',
          maxWidth: (400).px(),
          minWidth: (380).px(),
        },
        containerTitle: {
          backgroundColor: colors.Primary.background,
          padding: (16).px(),
          borderBottomWidth: (1).px(),
          borderBottomColor: colors.Neutral.n50,
        },
        containerBody: {
          padding: (16).px(),
        },
        styTitle: {
          ...typography.headingMediumS,
          color: colors.Primary.subText,
          textAlign: 'center',
        },
        styDescription: {
          ...typography.bodyXLargeR,
          color: colors.Neutral.n700,
          marginBottom: (24).px(),
        },
        textStyleCancel: {
          ...typography.headingLargeM,
          color: colors.Branding.b400,
        },
        textStyleConfirm: {
          ...typography.headingLargeM,
          color: colors.Primary.white,
        },
        styButtonCancel: {
          backgroundColor: colors.Primary.white,
          flex: 1,
          borderRadius: (12).px(),
        },
        styButtonConfirm: {
          backgroundColor: colors.Negative.normal,
          flex: 1,
          marginLeft: (8).px(),
          borderRadius: (12).px(),
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
      }),
    [colors, typography],
  );
};
