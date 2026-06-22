import {PSDeleteMessageLevel} from '@communi/chat-api-client-typescript';
import {PSUserModel, mapUserEntityToModel} from '../../user';
import {PSLastMessageEntity} from '../entity/PSLastMessageEntity';
import {PSMessageStatus} from '../entity/PSMessageEntity';
import {
  PSLastMessageBodyModel,
  mapLastMessageBodyEntityToModel,
} from './PSLastMessageBodyModel';

export type PSLastMessageModel = {
  primaryKey: string;
  id: number;
  requestId: string;
  threadId: string;
  sender: PSUserModel;
  body?: PSLastMessageBodyModel;
  createdAt: number;
  editedAt: number;
  isMyMessage: boolean;
  status: PSMessageStatus;
  deleteLevel?: PSDeleteMessageLevel;
};

export const mapLastMessageEntityToModel = (
  myUserId: string,
  message: PSLastMessageEntity,
) => {
  return {
    primaryKey: message.primaryKey,
    id: message.id,
    requestId: message.requestId,
    threadId: message.threadId,
    sender: mapUserEntityToModel(message.sender),
    body: mapLastMessageBodyEntityToModel(message.body),
    createdAt: message.createdAt,
    editedAt: message.editedAt,
    isMyMessage: message.sender.extUserId === myUserId,
    status: message.status,
    deleteLevel: message.deleteLevel,
  } as PSLastMessageModel;
};
