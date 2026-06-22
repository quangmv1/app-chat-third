import React from 'react';
import {PSUserModel} from '../../types';
import {StyleProp, Text, TextStyle} from 'react-native';
import isEqual from 'react-fast-compare';
import {useRenderCounter} from '../../hooks';

const UsersTypingText = ({
  users,
  textStyle,
}: {
  users: PSUserModel[];
  textStyle: StyleProp<TextStyle>;
}) => {
  useRenderCounter('UsersTypingText');
  return (
    <Text style={textStyle}>
      {users.length === 1
        ? users[0]?.name + ' is typing'
        : users.map(item => item.name).join(', ') + ' are typing'}
    </Text>
  );
};

export const PSUsersTypingText = React.memo(
  UsersTypingText,
  (
    prev: {users: PSUserModel[]; textStyle: StyleProp<TextStyle>},
    next: {users: PSUserModel[]; textStyle: StyleProp<TextStyle>},
  ) => {
    return isEqual(prev, next);
  },
);
