import {PSThreadPermissionEntity} from '../entity/PSThreadPermissionEntity';

export type PSThreadPermissionModel = {
  addMember: boolean;
  banMember: boolean;
  muteMember: boolean;
  pinMessage: boolean;
  removeMember: boolean;
  sendMessage: boolean;
  unbanMember: boolean;
  unmuteMember: boolean;
  unpinMessage: boolean;
};

export const mapThreadPermissionEntityToModel = (
  entity?: PSThreadPermissionEntity,
) => {
  if (entity) {
    return {
      addMember: entity.addMember,
      banMember: entity.banMember,
      muteMember: entity.muteMember,
      pinMessage: entity.pinMessage,
      removeMember: entity.removeMember,
      sendMessage: entity.sendMessage,
      unbanMember: entity.unbanMember,
      unmuteMember: entity.unmuteMember,
      unpinMessage: entity.unpinMessage,
    } as PSThreadPermissionModel;
  } else {
    return undefined;
  }
};
