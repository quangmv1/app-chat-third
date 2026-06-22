import {
  PSMessageMetadataType,
  PSSessionDto,
} from '@communi/chat-api-client-typescript';
import moment from 'moment';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSSendMessageContext,
  usePSTranslationContext,
} from '../../../../../context';
import {PSIcHashTag24} from '../../../../../icons';
import {PSMessageSessionModel} from '../../../../../types';
import {usePSMessageCurrentThreadIdContext} from '../../../../messages';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {PSTextButton} from '../../../../PSTextButton';
import {usePSThreadProfileNavigationContext} from '../../../contexts';
import {useThreadDeskProfileActionsContext} from '../../contexts';
import {PSSessionAgents} from './PSSessionAgents';
import {PSSessionLabels} from './PSSessionLabels';
import {PSSessionNote} from './PSSessionNote';

const ThreadSession = ({
  isSelect,
  session,
  onPress,
}: {
  isSelect: boolean;
  session: PSSessionDto;
  onPress?: null | ((sessionId: string) => void);
}) => {
  return isSelect ? (
    <MemoizeSessionOpen session={session} onPress={onPress} />
  ) : (
    <MemoizeSessionClose session={session} onPress={onPress} />
  );
};

export const PSThreadSession = React.memo(ThreadSession, (prev, next) => {
  return isEqual(prev, next);
});

const MemoizeSessionOpen = React.memo(
  ({
    session,
    onPress,
  }: {
    session: PSSessionDto;
    onPress?: null | ((sessionId: string) => void);
  }) => {
    const {translator} = usePSTranslationContext();

    const {colors, typography} = usePSDesignSystemContext();

    const threadId = usePSMessageCurrentThreadIdContext();

    const {onViewMessage} = usePSThreadProfileNavigationContext();

    const {sendMessage} = usePSSendMessageContext();

    const {closeSession} = useThreadDeskProfileActionsContext();

    const startTime = React.useMemo(() => {
      return moment(session.started_at).format('HH:mm, DD/MM/YYYY');
    }, [session.started_at]);

    const isClosed = React.useMemo(() => {
      return session.finished_at !== undefined && session.finished_at > 0;
    }, [session.finished_at]);

    const handleCloseSession = React.useCallback(() => {
      if (!threadId) {
        return;
      }
      const request = {
        threadId: threadId,
        text: '#SESSION - END',
        session: {
          type: PSMessageMetadataType.END_SESSION,
        } as PSMessageSessionModel,
      };
      sendMessage(request);
      closeSession(session.id);
    }, [closeSession, sendMessage, session.id, threadId]);

    return (
      <PSDebouncedPressable
        style={[
          styles.containerSelect,
          {
            borderColor: colors.Neutral.n50,
            backgroundColor: colors.Primary.background,
          },
        ]}
        onPress={() => {
          onPress?.(session.id);
        }}>
        <View style={{flexDirection: 'row'}}>
          <View style={[styles.viewAvatar, {backgroundColor: colors.Neutral.n50}]}>
            <PSIcHashTag24
              width={(24).px()}
              height={(24).px()}
              fill={colors.Primary.subText}
            />
          </View>

          <View style={styles.title}>
            <Text style={[typography.headingMediumS, {color: colors.Primary.subText}]}>
              {`Session ${session.session_number}`}
            </Text>
            <Text style={[typography.bodyMediumR, {color: colors.Neutral.n500}]}>
              {startTime}
            </Text>
          </View>

          <View style={{flexDirection: 'column'}}>
            <Text
              style={[
                typography.headingMediumM,
                {color: isClosed ? colors.Neutral.n500 : colors.Active.normal},
              ]}>
              {isClosed ? 'CLOSED' : 'ACTIVE'}
            </Text>
          </View>
        </View>

        <PSSessionLabels isClosed={isClosed} session={session} />

        <PSSessionAgents
          memberIds={session.member_ids}
          isClosed={isClosed}
          style={{marginTop: (16).px()}}
        />
        <PSSessionNote isClosed={isClosed} session={session} />

        <PSTextButton
          text={translator(isClosed ? 'ps_session_go_to' : 'ps_session_close')}
          textStyle={[{color: colors.Branding.b600}, typography.headingMediumM]}
          style={{
            marginTop: (16).px(),
            borderWidth: (1).px(),
            borderColor: colors.Branding.b600,
          }}
          onPress={() => {
            isClosed
              ? onViewMessage?.(session.start_msg_id)
              : handleCloseSession();
          }}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeSessionClose = React.memo(
  ({
    session,
    onPress,
  }: {
    session: PSSessionDto;
    onPress?: null | ((sessionId: string) => void);
  }) => {
    const {colors, typography} = usePSDesignSystemContext();

    const startTime = React.useMemo(() => {
      return moment(session.started_at).format('HH:mm, DD/MM/YYYY');
    }, [session.started_at]);

    const isClosed = React.useMemo(() => {
      return session.finish_msg_id && session.finish_msg_id > 0;
    }, [session.finish_msg_id]);

    return (
      <PSDebouncedPressable
        style={[
          styles.container,
          {
            borderColor: colors.Neutral.n50,
            backgroundColor: colors.Primary.background,
          },
        ]}
        onPress={() => {
          onPress?.(session.id);
        }}>
        <View style={[styles.viewAvatar, {backgroundColor: colors.Neutral.n50}]}>
          <PSIcHashTag24
            width={(24).px()}
            height={(24).px()}
            fill={colors.Primary.subText}
          />
        </View>

        <View style={styles.title}>
          <Text style={[typography.headingMediumS, {color: colors.Primary.subText}]}>
            {`Session ${session.session_number}`}
          </Text>
          <Text style={[typography.bodyMediumR, {color: colors.Neutral.n500}]}>
            {startTime}
          </Text>
        </View>

        <View style={{flexDirection: 'column'}}>
          <Text
            style={[
              typography.headingMediumM,
              {color: isClosed ? colors.Neutral.n500 : colors.Active.normal},
            ]}>
            {isClosed ? 'CLOSED' : 'ACTIVE'}
          </Text>
        </View>
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: (8).px(),
    paddingHorizontal: (12).px(),
    borderWidth: (1).px(),
    borderRadius: (12).px(),
  },
  containerSelect: {
    flexDirection: 'column',
    paddingVertical: (8).px(),
    paddingHorizontal: (12).px(),
    borderWidth: (1).px(),
    borderRadius: (12).px(),
  },
  text: {
    flex: 1,
  },
  title: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: (8).px(),
  },
  viewAvatar: {
    padding: (8).px(),
    borderRadius: (8).px(),
  },
});
