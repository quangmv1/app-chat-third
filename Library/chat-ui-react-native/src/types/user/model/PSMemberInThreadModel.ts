import {PSRoleThreadType, PSUserDto} from '@communi/chat-api-client-typescript';

export type PSMemberInThreadModel = {
  extUserId: string;
  userId: string;
  name: string;
  avatar?: string;
  role?: PSRoleThreadType;
  verified?: boolean;
};

export const mapMemberInThreadDtoToModel = (user: PSUserDto) => {
  return {
    extUserId: user.ext_user_id,
    userId: user.user_id,
    name: user.display_name,
    avatar: user.avatar_url,
    role: user.role,
    verified: user.verified,
  } as PSMemberInThreadModel;
};

export const mapMembersInThreadDtoToModel = (users: PSUserDto[]) => {
  return users.map<PSMemberInThreadModel>(user => {
    return mapMemberInThreadDtoToModel(user);
  });
};
