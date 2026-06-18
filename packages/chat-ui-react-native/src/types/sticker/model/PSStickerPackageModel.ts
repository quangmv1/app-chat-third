import {PSStickerPackageEntity} from '../entity';

export type PSStickerPackageModel = {
  id: string;
  name: string;
  iconFileUrl: string;
};

export const mapStickerPackageEntityToModel = (
  stickerPackage: PSStickerPackageEntity,
) => {
  return {
    id: stickerPackage.id,
    name: stickerPackage.name,
    iconFileUrl: stickerPackage.iconFileUrl,
  } as PSStickerPackageModel;
};

export const mapStickerPackagesEntityToModel = (
  stickerPackages: PSStickerPackageEntity[],
) => {
  return stickerPackages.map<PSStickerPackageModel>(sticker => {
    return mapStickerPackageEntityToModel(sticker);
  });
};
