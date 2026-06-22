import React from 'react';
import {usePSScreenStylesContext} from '../../../../context';
import {PSMessagesStyles} from '../../PSMessagesStyles';
import {usePSMessageCurrentThreadContext} from '../../contexts';

export const PSBottomMessagesView = React.memo(() => {
  const renderBottomMessagesView =
    usePSScreenStylesContext<PSMessagesStyles>().renderThreadViewBottom;

  const currentThread = usePSMessageCurrentThreadContext();

  return currentThread && renderBottomMessagesView
    ? renderBottomMessagesView(currentThread)
    : null;
});
