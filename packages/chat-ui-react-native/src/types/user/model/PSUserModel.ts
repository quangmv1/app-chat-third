import {
  PSRoleThreadType,
  PSUserDto,
  PSUserType,
} from '@communi/chat-api-client-typescript';
import {PSUserEntity} from '../entity/PSUserEntity';

export type PSUserModel = {
  extUserId: string;
  userId: string;
  name: string;
  avatar?: string;
  type: PSUserType;
  verified?: boolean;
  role?: PSRoleThreadType;
};

export const mapUserEntityToModel = (user?: PSUserEntity) => {
  return (
    user &&
    ({
      extUserId: user.extUserId,
      userId: user.userId,
      name: user.name,
      avatar: user.avatar,
      type: user.type,
      verified: user.verified,
      role: user.role,
    } as PSUserModel)
  );
};

export const mapUserDtoToModel = (user: PSUserDto) => {
  return {
    extUserId: user.ext_user_id,
    userId: user.user_id,
    name: user.display_name,
    avatar: user.avatar_url,
    type: user.type ?? PSUserType.USER,
    verified: user.verified,
  } as PSUserModel;
};

export const mapUsersDtoToModel = (users: PSUserDto[]) => {
  return users.map<PSUserModel>(user => {
    return mapUserDtoToModel(user);
  });
};

export const mapUserModelToEntity = (user: PSUserModel) => {
  return {
    extUserId: user.extUserId,
    userId: user.userId,
    name: user.name,
    avatar: user.avatar,
    type: user.type,
    verified: user.verified,
  } as PSUserEntity;
};
