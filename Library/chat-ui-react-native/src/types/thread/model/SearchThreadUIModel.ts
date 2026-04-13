import {
  PSSearchThreadResponseDto,
  PSSearchThreadType,
  PSThreadGroupLevelType,
  PSThreadType,
  PSUserType,
} from '@communi/chat-api-client-typescript';
import {PSThreadEntity} from '../entity/PSThreadEntity';
import {PSThreadListPCLEntity} from '../entity/PSThreadListPCLEntity';

export type SearchThreadUIModel = {
  id: string;
  targetUserId?: string;
  threadId?: string;
  avatar: string;
  name: string;
  type: PSSearchThreadType;
  isPublicGroup: boolean;
  verified?: boolean;
  parentId?: string;
  targetName?: string;
};

export const mapSearchThreadResponseDtoToSearchThreadUIModel = (
  threadsSearchDto: PSSearchThreadResponseDto[],
  csTeams?: PSThreadListPCLEntity[],
) => {
  return threadsSearchDto.map<SearchThreadUIModel>(threadSearchDto => {
    const isDirectOrUserOrBot = !!threadSearchDto.user;

    const targetCSName =
      threadSearchDto.thread?.targets &&
      threadSearchDto.thread?.targets.length > 0
        ? threadSearchDto.thread?.targets
            .mapNotNull(
              csTeamId => csTeams?.find(e => e.id === `${csTeamId}`)?.name,
            )
            .join(', ')
        : undefined;

    return {
      id: isDirectOrUserOrBot
        ? threadSearchDto.user?.ext_user_id
        : threadSearchDto.thread?.id,
      targetUserId: threadSearchDto.user?.ext_user_id,
      threadId: threadSearchDto.thread?.id,
      avatar: isDirectOrUserOrBot
        ? threadSearchDto.user?.avatar_url
        : threadSearchDto.thread?.avatar,
      name: isDirectOrUserOrBot
        ? threadSearchDto.user?.display_name
        : threadSearchDto.thread?.name,
      type: threadSearchDto.type,
      isPublicGroup: !isDirectOrUserOrBot && threadSearchDto.thread?.public,
      verified: !!threadSearchDto.user?.verified,
      targetName: targetCSName,
    } as unknown as SearchThreadUIModel;
  });
};

export const mapThreadsEntityToSearchThreadsUIModel = (
  threadsEntity: PSThreadEntity[],
  csTeams?: PSThreadListPCLEntity[],
) => {
  return threadsEntity.map<SearchThreadUIModel>(threadEntity => {
    const isDirect = threadEntity.type === PSThreadType.DIRECT;

    var type = PSSearchThreadType.DIRECT;
    if (isDirect) {
      if (threadEntity.partner?.type) {
        switch (threadEntity.partner.type) {
          case PSUserType.BOT:
            type = PSSearchThreadType.BOT;
            break;
          case PSUserType.CS_AGENT:
            type = PSSearchThreadType.CS_AGENT;
            break;
          case PSUserType.GUEST:
            type = PSSearchThreadType.GUEST;
            break;
        }
      }
    } else {
      type = PSSearchThreadType.GROUP;
    }

    const targetCSName = threadEntity.targetIdUserType
      ? [threadEntity.targetIdUserType]
          .mapNotNull(
            csTeamId => csTeams?.find(e => e.id === `${csTeamId}`)?.name,
          )
          .join(', ')
      : undefined;
    return {
      id: isDirect ? threadEntity.partner?.extUserId : threadEntity.id,
      targetUserId: threadEntity.partner?.extUserId,
      threadId: threadEntity.id,
      avatar: threadEntity.avatar,
      name: threadEntity.name,
      type: type,
      isPublicGroup:
        threadEntity.groupLevel === PSThreadGroupLevelType.PUBLIC_GROUP,
      verified: !!threadEntity.partner?.verified,
      parentId: threadEntity.parentId,
      targetName: targetCSName,
    } as unknown as SearchThreadUIModel;
  });
};
