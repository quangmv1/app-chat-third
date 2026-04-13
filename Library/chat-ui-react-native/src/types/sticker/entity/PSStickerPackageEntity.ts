import {PSStickerPackageDto} from '@communi/chat-api-client-typescript';
import {Realm} from '@realm/react';
import {PSStickerEntity} from './PSStickerEntity';

export class PSStickerPackageEntity extends Realm.Object {
  public id!: string;
  public name!: string;
  public iconFileUrl!: string;
  public stickers!: Realm.List<PSStickerEntity>;

  public static schema: Realm.ObjectSchema = {
    name: 'PSStickerPackageEntity',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: {type: 'string', default: ''},
      iconFileUrl: 'string',
      stickers: {
        type: 'list',
        objectType: 'PSStickerEntity',
        default: [],
      },
    },
  };

  updateStickers(stickers: PSStickerEntity[]) {
    this.stickers.push(...stickers);
  }

  static createOrUpdate = (
    realm: Realm,
    stickerPackage: PSStickerPackageEntity,
  ) => {
    return realm.create<PSStickerPackageEntity>(
      PSStickerPackageEntity.schema.name,
      stickerPackage,
      Realm.UpdateMode.All,
    );
  };

  static getAllStickerPackages = (realm: Realm) =>
    realm.objects<PSStickerPackageEntity>(PSStickerPackageEntity.schema.name);

  static filteredById = (packageId: string) => `id == "${packageId}"`;

  static getFirstById = (realm: Realm, packageId: string) =>
    realm
      .objects<PSStickerPackageEntity>(PSStickerPackageEntity.schema.name)
      .filtered(PSStickerPackageEntity.filteredById(packageId))[0];

  static filteredByIds = (packageIds: string[]) =>
    packageIds.map(packageId => `id == "${packageId}"`).join(' || ');

  static getByIds = (realm: Realm, packageIds: string[]) =>
    realm
      .objects<PSStickerPackageEntity>(PSStickerPackageEntity.schema.name)
      .filtered(PSStickerPackageEntity.filteredByIds(packageIds));

  static deletePackages = (realm: Realm, packageIds: string[]) => {
    const cachedStickerPackages = PSStickerPackageEntity.getByIds(
      realm,
      packageIds,
    );
    realm.write(() => {
      cachedStickerPackages.forEach(stickerPackage => {
        realm.delete(stickerPackage.stickers);
      });
      realm.delete(cachedStickerPackages);
    });
  };

  static mapFromDto = (stickerPackage?: PSStickerPackageDto) => {
    if (stickerPackage) {
      const stickers = (stickerPackage.stickers ?? [])
        .map(sticker => PSStickerEntity.mapFromDto(sticker))
        .filter(item => item !== undefined) as PSStickerEntity[];
      return {
        id: stickerPackage.id,
        name: stickerPackage.name,
        iconFileUrl: stickerPackage.icon_file_url,
        stickers: stickers as unknown,
      } as PSStickerPackageEntity;
    } else {
      return undefined;
    }
  };
}
