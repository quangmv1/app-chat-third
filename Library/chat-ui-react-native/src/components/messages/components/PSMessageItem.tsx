import React, { PropsWithChildren } from 'react';
import {
  PSMessageModel,
  isDeletedMessage,
  messagePositionToMarginVertical,
} from '../../../types';
import { PSMessageActionNote } from './action-note';
import { usePSChatApiClientContext } from '../../../context';
import {
  PSMessageAwesomeMessageWrapper,
  PSMessageBotCarouselWrapper,
  PSMessageBotMenuWrapper,
  PSMessageBotQuickReplyWrapper,
  PSMessageDeletedWrapper,
  PSMessagePollWrapper,
  PSMessagePromotionalTypeWrapper,
  PSMessageRatingWrapper,
  PSMessageStickerWrapper,
} from './wrapper';
import { LayoutAnimation } from 'react-native';
import {
  usePSCustomizedMessageItemFactoryContext,
  usePSMessageActionsOverlayContext,
  usePSMessageSetToShowHeaderTimeContext,
} from '../contexts';
import { hapticHeavy } from '../../../utils';
import { useDeepCompareMemoize } from '../../../hooks';
import { isEqual } from 'lodash';
import { PSDeleteMessageLevel } from '@communi/chat-api-client-typescript';
import { PSThreadSwipeRowProvider } from '../../threads';

export const MESSAGE_MAX_WIDTH = (310).px();
export const MESSAGE_BORDER_RADIUS = (16).px();
export const MESSAGE_BORDER_WIDTH = (1.5).px();
export const MESSAGE_MARGIN_HORIZONTAL = (16).px();
export const MESSAGE_AVATAR_SENDER_SIZE = (32).px();
export const MESSAGE_CONTENT_MARGIN_AVATAR = (8).px();
export const MESSAGE_CONTENT_MARGIN_STATUS = (4).px();
export const MESSAGE_STATUS_SIZE = (12).px();
export const MESSAGE_REACTIONS_MARGIN_TOP = (0).px();
export const MESSAGE_REACTIONS_OVERLAY_TOP = (7).px();
export const MESSAGE_SEEN_USERS_MARGIN_TOP = (4).px();
export const MESSAGE_TOP_OR_NORMAL_MARGIN_TOP = (8).px();
export const MESSAGE_BOTTOM_OR_MIDDLE_MARGIN_TOP = (4).px();
export const MESSAGE_BUBBLE_MARGIN_HORIZONTAL = (12).px();
export const MESSAGE_BUBBLE_FIRST_CONTENT_MARGIN_TOP = (6).px();
export const MESSAGE_BUBBLE_OTHER_CONTENT_MARGIN_TOP = (6).px();
export const MESSAGE_BUBBLE_LAST_CONTENT_MARGIN_BOTTOM = (6).px();

type PSMessageItemContextValue = {
  myUserId: string;
  isOverlay: boolean;
  isMyMessage: boolean;
  message?: PSMessageModel;
  onMessagePress: () => void;
  onMessageLongPress: () => void;
};

const PSMessageItemContext = React.createContext<PSMessageItemContextValue>(
  {} as PSMessageItemContextValue,
);

type PSMessageItemStylesValue = {
  margin: {
    marginTop: number;
    marginBottom: number;
  };
};

const PSMessageItemStylesContext =
  React.createContext<PSMessageItemStylesValue>({} as PSMessageItemStylesValue);

const PSMessageItemProvider = React.memo(
  (
    props: PropsWithChildren<{
      myUserId: string;
      message: PSMessageModel;
      isOverlay: boolean;
      isDeleted: boolean;
    }>,
  ) => {
    const margin = React.useMemo(() => {
      return messagePositionToMarginVertical(props.message);
    }, [props.message]);

    const setMessageToShowHeaderTime = usePSMessageSetToShowHeaderTimeContext();

    const onMessagePress = React.useCallback(() => {
      if (!props.isOverlay) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessageToShowHeaderTime(prev => {
          return prev === undefined || prev !== props.message.primaryKey
            ? props.message.primaryKey
            : undefined;
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isOverlay, props.message.primaryKey]);

    const { show } = usePSMessageActionsOverlayContext();

    const onMessageLongPress = React.useCallback(() => {
      if (
        !props.isDeleted &&
        !props.isOverlay &&
        // !props.message.body?.quickReply &&
        !props.message.body?.carousel
      ) {
        hapticHeavy();
        show(props.message.primaryKey);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      props.isDeleted,
      props.isOverlay,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      // useDeepCompareMemoize(props.message.body?.quickReply),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useDeepCompareMemoize(props.message.body?.carousel),
      props.message.primaryKey,
      show,
    ]);

    const contextValue = React.useMemo(
      () =>
        ({
          myUserId: props.myUserId,
          isOverlay: props.isOverlay,
          isMyMessage: props.message.isMyMessage,
          message: props.message,
          onMessagePress: onMessagePress,
          onMessageLongPress: onMessageLongPress,
        }) as PSMessageItemContextValue,
      [
        props.myUserId,
        props.isOverlay,
        props.message.isMyMessage,
        onMessagePress,
        onMessageLongPress,
      ],
    );

    const stylesContextValue = React.useMemo(
      () =>
        ({
          margin: margin,
        }) as PSMessageItemStylesValue,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [useDeepCompareMemoize(margin)],
    );

    return (
      <PSMessageItemContext.Provider value={contextValue}>
        <PSMessageItemStylesContext.Provider value={stylesContextValue}>
          {props.children}
        </PSMessageItemStylesContext.Provider>
      </PSMessageItemContext.Provider>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const usePSMessageItemContext = () =>
  React.useContext(PSMessageItemContext);

export const usePSMessageSimpleItemStylesContext = () =>
  React.useContext(PSMessageItemStylesContext);

export const PSMessageItem = React.memo(
  ({
    message,
    isOverlay,
    isPSMessageSubThread,
  }: {
    message: PSMessageModel;
    isOverlay: boolean;
    isPSMessageSubThread?: boolean;
  }) => {
    const { customizedFactory } = usePSCustomizedMessageItemFactoryContext();

    const chatApiClient = usePSChatApiClientContext();

    const isDeleted = isDeletedMessage(
      message.isMyMessage,
      message.deleteLevel,
    );

    if (message.deleteLevel === PSDeleteMessageLevel.DELETE_THREAD) {
      return null;
    }

    if (
      message.deleteLevel === PSDeleteMessageLevel.ME &&
      message.isMyMessage
    ) {
      return null;
    }

    return chatApiClient ? (
      <PSMessageItemProvider
        myUserId={chatApiClient.userId}
        message={message}
        isOverlay={isOverlay}
        isDeleted={isDeleted}>
        <PSThreadSwipeRowProvider>
          {isDeleted ? (
            <PSMessageDeletedWrapper message={message} />
          ) : message.body?.actionNote ? (
            <PSMessageActionNote
              messageBody={message.body}
              sender={message.sender}
            />
          ) : message.body?.poll ? (
            <PSMessagePollWrapper message={message} />
          ) : message.body?.quickReply ? (
            <PSMessageBotQuickReplyWrapper message={message} />
          ) : message.body?.menu && message.body.menu.length ? (
            <PSMessageBotMenuWrapper message={message} />
          ) : message.body?.carousel ? (
            <PSMessageBotCarouselWrapper message={message} />
          ) : message.body?.sticker ? (
            <PSMessageStickerWrapper
              message={message}
              isPSMessageSubThread={isPSMessageSubThread}
            />
          ) : message.body?.promotion ? (
            <PSMessagePromotionalTypeWrapper message={message} />
          ) : message.body?.rating ? (
            <PSMessageRatingWrapper message={message} />
          ) : (message.body?.jsonPayload || message.body?.customName) && customizedFactory ? (
            customizedFactory(message)
          ) : (
            <PSMessageAwesomeMessageWrapper
              message={message}
              isPSMessageSubThread={isPSMessageSubThread}
            />
          )}
        </PSThreadSwipeRowProvider>
      </PSMessageItemProvider>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);
