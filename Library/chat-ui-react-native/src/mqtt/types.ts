import {
  PSDeleteMessageLevel,
  PSMessageDto,
  PSThreadType,
  PSUserDto,
} from '@communi/chat-api-client-typescript';

export enum PSMqttEventType {
  CREATE_MESSAGE = 3,
  EDIT_MESSAGE = 4,
  DELETE_MESSAGE = 5,
  TYPING = 8,
  SEEN_MESSAGE = 13,
  TOGGLE_NOTIFY_THREAD = 14,
  PINNED_THREAD = 17,
  REACT_MESSAGE = 19,
  UNREACT_MESSAGE = 20,
  ADD_OPTION_POLL_MESSAGE = 22,
  VOTE_MESSAGE = 25,
  UNVOTE_MESSAGE = 26,
  LEAVE_THREAD = 30,
  DISBAND_GROUP = 31,
  DELETE_THREAD_BOTH = 52,
  ADD_TO_THREAD_LIST = 53,
  RATING_SESSION_THREAD = 54,
  LEAVE_THREAD_WITH_ME = 101,
}

export type PSMqttEvent = {
  topic: string;
  retain: boolean;
  event_type: PSMqttEventType;
  payload: any;
};

export type PSMqttTypingEventPayload = {
  actor: PSUserDto;
  thread_id: string;
};

export type PSMqttThreadPayload = {
  id: string;
  name: string;
  avatar_url?: string;
  type: PSThreadType;
  parent_id: string;
  original_message_id: number;
};

export type PSMqttNewMessageEventPayload = {
  message: PSMessageDto;
  thread: PSMqttThreadPayload;
};

export type PSMqttEditMessageEventPayload = {
  message: PSMessageDto;
  thread: {id: string};
};

export type PSMqttDeleteMessageEventPayload = {
  actor: PSUserDto;
  message_id: number;
  request_id: string;
  thread_id: string;
  delete_level: PSDeleteMessageLevel;
};

export type PSMqttSeenMessageEventPayload = {
  actor: PSUserDto;
  message_id: number;
  thread_id: string;
};

export type PSMqttToggleNotifyThreadEventPayload = {
  thread_id: string;
  enable_notify: boolean;
};

export type PSMqttPinnedThreadEventPayload = {
  thread_id: string;
  pinned_at: number;
};

export type PSMqttReactMessagePayload = {
  ext_user_id: string;
  thread_id: string;
  message_id: number;
  name: string;
};

export type PSMqttPollOptionPayload = {
  id: string;
  text?: string;
};

export type PSMqttPollPayload = {
  thread_id: string;
  message_id: number;
  option: PSMqttPollOptionPayload;
  actor: PSUserDto;
};

export type PSMqttVoteMessagePayload = {
  poll: PSMqttPollPayload;
};

export type PSMqttAddOptionPollMessagePayload = {
  poll: PSMqttPollPayload;
};

export type PSMqttLeaveThreadPayload = {
  thread_id: string;
};

export type PSMqttRatingSessionThreadEventPayload = {
  thread_id: string;
  session_id: string;
  is_rating_anytime: boolean;
  support_thread_id: string;
};

export type PSMqttAddToThreadListEventPayload = {
  thread_id: string;
};
