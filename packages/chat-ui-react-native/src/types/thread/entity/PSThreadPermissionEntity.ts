import {Realm} from '@realm/react';
import {PSThreadPermissionDto} from '@communi/chat-api-client-typescript';

export class PSThreadPermissionEntity extends Realm.Object {
  public addMember!: boolean;
  public addAdmin!: boolean;
  public banMember!: boolean;
  public muteMember!: boolean;
  public pinMessage!: boolean;
  public removeMember!: boolean;
  public sendMessage!: boolean;
  public sendComment!: boolean;
  public unbanMember!: boolean;
  public unmuteMember!: boolean;
  public unpinMessage!: boolean;
  public setupInvitationLink!: boolean;

  public static schema: Realm.ObjectSchema = {
    name: 'PSThreadPermissionEntity',
    embedded: true,
    properties: {
      addMember: {type: 'bool', default: false},
      addAdmin: {type: 'bool', default: false},
      banMember: {type: 'bool', default: false},
      muteMember: {type: 'bool', default: false},
      pinMessage: {type: 'bool', default: false},
      removeMember: {type: 'bool', default: false},
      sendMessage: {type: 'bool', default: false},
      sendComment: {type: 'bool', default: false},
      unbanMember: {type: 'bool', default: false},
      unmuteMember: {type: 'bool', default: false},
      unpinMessage: {type: 'bool', default: false},
      setupInvitationLink: {type: 'bool', default: false},
    },
  };

  static mapFromDto = (dto: PSThreadPermissionDto) => {
    return {
      addMember: dto.add_member,
      addAdmin: dto.add_admin,
      banMember: dto.ban_member,
      muteMember: dto.mute_member,
      pinMessage: dto.pin_message,
      removeMember: dto.remove_member,
      sendMessage: dto.send_message,
      sendComment: dto.send_comment,
      unbanMember: dto.unban_member,
      unmuteMember: dto.unmute_member,
      unpinMessage: dto.unpin_message,
      setupInvitationLink: dto.setup_invitation_link,
    } as PSThreadPermissionEntity;
  };

  static mapFromEntityToDto = (entity: PSThreadPermissionEntity) => {
    return {
      add_member: entity.addMember,
      add_admin: entity.addAdmin,
      ban_member: entity.banMember,
      mute_member: entity.muteMember,
      pin_message: entity.pinMessage,
      remove_member: entity.removeMember,
      send_message: entity.sendMessage,
      send_comment: entity.sendComment,
      unban_member: entity.unbanMember,
      unmute_member: entity.unmuteMember,
      unpin_message: entity.unpinMessage,
      setup_invitation_link: entity.setupInvitationLink,
    } as PSThreadPermissionDto;
  };
}
