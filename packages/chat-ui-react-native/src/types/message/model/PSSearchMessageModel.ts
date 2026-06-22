import {PSUserModel, mapUserDtoToModel} from '../../user';
import {
  PSSearchMessageDto,
  PSSearchThreadDto,
} from '@communi/chat-api-client-typescript';

export interface PSSearchMessageModel {
  id: number;
  sender?: PSUserModel;
  thread?: PSSearchThreadModel;
  threadId: string;
  createAt: number;
  text: string;
}

export interface PSSearchThreadModel {
  id: string;
  name: string;
  avatar: string;
}

export const mapPSSearchThreadDtoToModel = (dto: PSSearchThreadDto) => {
  return {
    id: dto.id,
    name: dto.name,
    avatar: dto.avatar,
  } as PSSearchThreadModel;
};

export const mapSearchMessageFromDtoToModel = (dto: PSSearchMessageDto) => {
  return {
    id: dto.id,
    threadId: dto.thread_id,
    createAt: dto.create_at,
    text: dto.text,
    sender: dto.sender && mapUserDtoToModel(dto.sender),
    thread: dto.thread && mapPSSearchThreadDtoToModel(dto.thread),
  } as PSSearchMessageModel;
};
