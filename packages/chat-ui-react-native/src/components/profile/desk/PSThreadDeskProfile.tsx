import React, {PropsWithChildren} from 'react';
import isEqual from 'react-fast-compare';
import {TextStyle, Text, StyleProp} from 'react-native';

import {StyleSheet, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../context';
import {PSTagsPickerOverlay, PSTagsPickerProvider} from '../../tags';
import {
  PSThreadDeskContextScreen,
  PSThreadDeskStatus,
  PSThreadDeskTagCategories,
  PSThreadSessions,
} from './components';
import {
  PSSessionLabelProvider,
  PSSessionNoteProvider,
  PSThreadDeskProfileProvider,
  PSThreadDeskTagCategoriesProvider,
} from './contexts';
import {PSThreadDeskUserID} from './components';

const PSThreadProfileProviders = (props: PropsWithChildren) => {
  return (
    <PSTagsPickerProvider>
      <PSThreadDeskTagCategoriesProvider>
        <PSThreadDeskProfileProvider>
          <PSSessionLabelProvider>
            <PSSessionNoteProvider>
              {props.children}
              <PSTagsPickerOverlay />
            </PSSessionNoteProvider>
          </PSSessionLabelProvider>
        </PSThreadDeskProfileProvider>
      </PSThreadDeskTagCategoriesProvider>
    </PSTagsPickerProvider>
  );
};

const ThreadDeskProfileInfo = () => {
  const {typography, colors} = usePSDesignSystemContext();
  const {translator} = usePSTranslationContext();
  return (
    <PSThreadProfileProviders>
      <View style={styles.container}>
        <PSThreadSessions
          ListHeaderComponent={
            <>
              <PSThreadDeskUserID />
              <PSThreadDeskStatus />
              <PSThreadDeskTagCategories />
              <PSThreadDeskContextScreen />

              <MemoizeText
                text={translator('ps_sessions')}
                style={[
                  styles.titleSessions,
                  typography.headingMediumS,
                  {color: colors.Primary.subText},
                ]}
              />
            </>
          }
        />
      </View>
    </PSThreadProfileProviders>
  );
};

const MemoizeText = React.memo(
  ({text, style}: {text: string; style?: StyleProp<TextStyle>}) => {
    return <Text style={style}>{text}</Text>;
  },
  (prev, next) => isEqual(prev, next),
);

export const PSThreadDeskProfileInfo = React.memo(
  ThreadDeskProfileInfo,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleSessions: {
    marginTop: (28).px(),
    marginBottom: (16).px(),
  },
});
