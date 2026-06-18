import {PSSessionDto} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View, Text, StyleProp, ViewStyle} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {PSIcEdit16} from '../../../../../icons';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {usePSSessionNoteContext} from '../../contexts';

const SessionNote = ({
  session,
  isClosed,
  style,
}: {
  session: PSSessionDto;
  isClosed: boolean;
  style?: StyleProp<ViewStyle>;
}) => {
  const {typography, colors} = usePSDesignSystemContext();

  const {show} = usePSSessionNoteContext();

  const handleClick = React.useCallback(() => {
    show(session);
  }, [session, show]);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, typography.headingMediumM, {color: colors.Primary.subText}]}>
        Note
      </Text>
      <Text
        style={[styles.textNote, typography.bodyMediumR, {color: colors.Neutral.n500}]}>
        {session.note}
      </Text>
      {isClosed ? null : (
        <PSDebouncedPressable
          style={styles.contentNoteEdit}
          onPress={handleClick}>
          <PSIcEdit16
            width={(16).px()}
            height={(16).px()}
            fill={colors.Primary.subText}
          />
          <Text
            style={[
              typography.headingMediumM,
              {color: colors.Branding.b600, marginStart: (4).px()},
            ]}>
            Add note
          </Text>
        </PSDebouncedPressable>
      )}
    </View>
  );
};

export const PSSessionNote = React.memo(SessionNote, (prev, next) => {
  return isEqual(prev, next);
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: (12).px(),
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  textNote: {flex: 2, textAlign: 'right'},
  contentNoteEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: (4).px(),
  },
});
