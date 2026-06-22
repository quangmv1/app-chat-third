import React from 'react';
import {StyleProp, Text, TextStyle} from 'react-native';
import isEqual from 'react-fast-compare';

export const PSMessageChatBotSubTitle = React.memo(
  ({text, textStyle}: {text?: string; textStyle?: StyleProp<TextStyle>}) => {
    return text ? (
      <Text numberOfLines={3} style={textStyle}>
        {text}
      </Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);
