import {PSSessionDto} from '@communi/chat-api-client-typescript';
import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {PSIcAddCircleDash32} from '../../../../../icons';
import {PSDebouncedPressable} from '../../../../PSDebouncedPressable';
import {PSLabelTag} from '../../../../PSLabelTag';
import {usePSSessionLabelActionContext} from '../../contexts';

const SessionLabels = ({
  session,
  isClosed,
}: {
  isClosed: boolean;
  session: PSSessionDto;
}) => {
  const {colors, typography} = usePSDesignSystemContext();

  const {show} = usePSSessionLabelActionContext();

  const handleClick = React.useCallback(() => {
    show(session);
  }, [session, show]);

  return (
    <PSDebouncedPressable
      style={styles.container}
      disabled={isClosed}
      onPress={handleClick}>
      {session.label?.map(label => (
        <PSLabelTag
          key={`${label.id}`}
          title={label.name}
          textStyle={[typography.bodyXLargeR, {color: colors.Primary.white}]}
          style={[
            styles.tagSelect,
            {
              borderColor: label.color_code,
              backgroundColor: label.color_code,
            },
          ]}
          disabled={true}
        />
      )) ?? null}

      {isClosed ? null : (
        <PSIcAddCircleDash32
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
      )}
    </PSDebouncedPressable>
  );
};

export const PSSessionLabels = React.memo(SessionLabels, (prev, next) => {
  return isEqual(prev, next);
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: (16).px(),
  },
  tagSelect: {
    marginEnd: (4).px(),
    borderRadius: (8).px(),
    paddingHorizontal: (12).px(),
    paddingVertical: (4).px(),
  },
});
