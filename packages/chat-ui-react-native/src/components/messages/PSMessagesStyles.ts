import {StyleProp, ViewStyle, ImagePropsBase} from 'react-native';
import {MessageActionItem, PSMessageAction} from './components';
import {PSThreadGroupLevelType} from '@communi/chat-api-client-typescript';
import {PSThreadEntity} from '../../types';

export type PSMessagesStyles = {
  isFloating?: boolean;
  container?: StyleProp<ViewStyle>;
  background?: {
    style?: StyleProp<ViewStyle>;
    imageProps?: ImagePropsBase;
  };
  renderEmptyMessages?: (userId: string) => React.ReactElement;
  messageActions?: {
    domainLinkMessage?: string | undefined;
    isShowReportAction?: boolean;
    allowedActions?: PSMessageAction[];
    renderMessageMenuOptions?: MessageActionItem[];
  };
  actionsBar?: {
    style?: StyleProp<ViewStyle>;
    hideAvatar?: boolean;
    rightButton?: ({userId}: {userId?: string}) => React.ReactElement;
    isMenuRightButtonVisible?: boolean;
    isSearchRightButtonVisible?: boolean;
    isActiveUserCountVisible?: boolean;
    allowedActiveUserCountVisibleWithGroup?: PSThreadGroupLevelType[];
  };
  renderThreadViewBottom?: (
    currentThread?: PSThreadEntity,
  ) => React.ReactElement;
  contextObject?: string;
  renderContextObjectThreadViewBottom?: () => React.ReactElement;
  attachment?: {
    maxNumberOfMedia?: number;
  };
};
