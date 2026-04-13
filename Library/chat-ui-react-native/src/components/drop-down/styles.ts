import {useMemo} from 'react';
import {I18nManager, StyleSheet} from 'react-native';
import {usePSDesignSystemContext} from '../../context';

export const useStylePSDropDown = () => {
  const {colors} = usePSDesignSystemContext();

  return useMemo(
    () =>
      StyleSheet.create({
        mainWrap: {
          justifyContent: 'center',
        },
        container: {
          flexShrink: 1,
          borderWidth: 0.5,
          borderColor: colors.Neutral.n300,
          backgroundColor: 'white',
          shadowColor: colors.Neutral.n0,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          elevation: 2,
        },
        flex1: {
          flex: 1,
        },
        flexShrink: {
          flexShrink: 1,
        },
        wrapTop: {
          justifyContent: 'flex-end',
        },
        dropdown: {
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: (35).px(),
        },
        title: {
          marginVertical: (5).px(),
          fontSize: 16,
          writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
        },
        item: {
          padding: (17).px(),
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        textItem: {
          flex: 1,
          fontSize: (16).px(),
          writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
        },
        icon: {
          width: (20).px(),
          height: (20).px(),
        },
        fullScreen: {
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [colors],
  );
};
