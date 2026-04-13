import {
  PSStickerDto,
  PSStickerFileType,
} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';

export class PSStickerEntity extends Realm.Object {
  public id!: string;
  public fileUrl!: string;
  public fileType!: PSStickerFileType;
  public filePath!: string;
  public fileBucket!: string;
  public pickedAt!: number;

  public static schema: Realm.ObjectSchema = {
    name: 'PSStickerEntity',
    primaryKey: 'id',
    properties: {
      id: 'string',
      fileUrl: 'string',
      filePath: 'string',
      fileBucket: 'string',
      fileType: {type: 'string', default: PSStickerFileType.PNG},
      pickedAt: {type: 'int', indexed: true, default: 0},
    },
  };

  updatePickedAt(pickedAt: number) {
    this.pickedAt = pickedAt;
  }

  static filteredById = (stickerId: string) => `id == "${stickerId}"`;

  static filteredByPickedAt = () => 'pickedAt > 0';

  static getAllStickerPicked = (realm: Realm) =>
    realm
      .objects<PSStickerEntity>(PSStickerEntity.schema.name)
      .filtered(PSStickerEntity.filteredByPickedAt());

  static getFirstById = (realm: Realm, stickerId: string) =>
    realm
      .objects<PSStickerEntity>(PSStickerEntity.schema.name)
      .filtered(PSStickerEntity.filteredById(stickerId))[0];

  static getFirstByPickedAt = (realm: Realm) =>
    realm
      .objects<PSStickerEntity>(PSStickerEntity.schema.name)
      .filtered(PSStickerEntity.filteredByPickedAt())[0];

  static sorted: [string, boolean][] = [['pickedAt', true]];

  static mapFromDto = (dto: PSStickerDto) => {
    if (dto) {
      return {
        id: dto.id,
        fileUrl: dto.file_url,
        fileType: dto.file_type,
        filePath: dto.file_path,
        fileBucket: dto.file_bucket,
      } as PSStickerEntity;
    } else {
      return undefined;
    }
  };
}
