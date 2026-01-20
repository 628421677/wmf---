import { AssetStatus } from '../types';

// 兼容旧状态值（历史 localStorage 数据）
export type LegacyAssetStatus =
  | AssetStatus
  | 'Construction'
  | 'PreAcceptance'
  | 'AuditReview'
  | 'FinancialReview'
  | 'Active'
  | 'Disposal'
  | 'Initiation'
  | 'FinalAccounting'
  | 'InventoryCheck'
  | 'TransferIn'
  | 'Archive'
  | 'Draft';

export function normalizeAssetStatus(status: any): AssetStatus {
  switch (status) {
    // 新状态（已是正确值）
    case AssetStatus.DisposalPending:
    case AssetStatus.PendingReview:
    case AssetStatus.PendingArchive:
    case AssetStatus.Archived:
      return status;

    // 老状态映射到新四状态
    case 'Draft':
      return AssetStatus.DisposalPending;

    case 'PreAcceptance':
    case 'AuditReview':
    case 'FinancialReview':
    case 'Construction':
    case 'Initiation':
    case 'FinalAccounting':
    case 'InventoryCheck':
    case 'TransferIn':
      // 统一视为“待处置”（新建/录入后的初始态）
      return AssetStatus.DisposalPending;

    case 'Active':
    case 'Archive':
      // 老数据里 Active/Archive 表示归档结束
      return AssetStatus.Archived;

    case 'Disposal':
      return AssetStatus.DisposalPending;

    default:
      return AssetStatus.DisposalPending;
  }
}
