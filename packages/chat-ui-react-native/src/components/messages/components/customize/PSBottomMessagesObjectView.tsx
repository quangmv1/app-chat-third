import React from 'react';
import {usePSScreenStylesContext} from '../../../../context';
import {PSMessagesStyles} from '../../PSMessagesStyles';
import {usePSMessageObjectContext} from '../../contexts';

export const PSBottomMessagesObjectView = React.memo(() => {
  const renderContextObjectThreadViewBottom =
    usePSScreenStylesContext<PSMessagesStyles>()
      .renderContextObjectThreadViewBottom;

  const contextObject =
    usePSScreenStylesContext<PSMessagesStyles>().contextObject;

  const isVisibleContextObjectView =
    usePSMessageObjectContext().isVisibleContextObjectView;

  return isVisibleContextObjectView &&
    contextObject &&
    renderContextObjectThreadViewBottom
    ? renderContextObjectThreadViewBottom()
    : null;
});
