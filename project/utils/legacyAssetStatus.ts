import { AssetStatus } from '../types';

// 兼容旧状态值（历史 localStorage 数据）
export type LegacyAssetStatus =
  | AssetStatus
  | 'Construction'
  | 'PreAcceptance'
  | 'AuditReview'
  | 'FinancialReview'
  | 'Active'
  | 'Disposal';

export function normalizeAssetStatus(status: any): AssetStatus {
  switch (status) {
    case 'PreAcceptance':
      return AssetStatus.FinalAccounting;
    case 'AuditReview':
      return AssetStatus.FinalAccounting;
    case 'FinancialReview':
      return AssetStatus.TransferIn;
    case 'Active':
      return AssetStatus.Archive;
    case 'Construction':
      return AssetStatus.Construction;
    case 'Disposal':
      return AssetStatus.Disposal;
    case 'Initiation':
      return AssetStatus.Initiation;
    case 'FinalAccounting':
      return AssetStatus.FinalAccounting;
    case 'InventoryCheck':
      return AssetStatus.InventoryCheck;
    case 'TransferIn':
      return AssetStatus.TransferIn;
    case 'Archive':
      return AssetStatus.Archive;
    default:
      return AssetStatus.Initiation;
  }
}



