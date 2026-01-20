import { AssetStatus } from '../types';

export function getAssetStatusLabel(status: AssetStatus): string {
  const labels: Record<AssetStatus, string> = {
    [AssetStatus.DisposalPending]: '待处置',
    [AssetStatus.PendingReview]: '待审核',
    [AssetStatus.PendingArchive]: '待归档',
    [AssetStatus.Archived]: '已归档',
  };
  return labels[status] || status;
}

export function getAssetStatusColor(status: AssetStatus): string {
  const colors: Record<AssetStatus, string> = {
    [AssetStatus.DisposalPending]: 'bg-gray-50 text-gray-600 border-gray-200',
    [AssetStatus.PendingReview]: 'bg-amber-50 text-amber-700 border-amber-200',
    [AssetStatus.PendingArchive]: 'bg-orange-50 text-orange-600 border-orange-200',
    [AssetStatus.Archived]: 'bg-green-50 text-green-600 border-green-200',
  };
  return colors[status] || '';
}
