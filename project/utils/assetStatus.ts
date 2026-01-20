import { AssetStatus } from '../types';

export function getAssetStatusLabel(status: AssetStatus, isArchived?: boolean): string {
  if (status === AssetStatus.Archive && !isArchived) {
    return '待归档';
  }

  const labels: Record<AssetStatus, string> = {
    [AssetStatus.Initiation]: '立项阶段',
    [AssetStatus.Construction]: '建设实施',
    [AssetStatus.FinalAccounting]: '竣工决算',
    [AssetStatus.InventoryCheck]: '资产清查',
    [AssetStatus.TransferIn]: '转固入账',
    [AssetStatus.Archive]: '已归档',
    [AssetStatus.Disposal]: '处置中',
  };
  return labels[status] || status;
}

export function getAssetStatusColor(status: AssetStatus, isArchived?: boolean): string {
  // “待归档”是一个特殊展示态：status 仍为 Archive，但 isArchived=false
  if (status === AssetStatus.Archive && !isArchived) {
    return 'bg-orange-50 text-orange-600 border-orange-200';
  }

  const colors: Record<AssetStatus, string> = {
    [AssetStatus.Initiation]: 'bg-blue-50 text-blue-600 border-blue-200',
    [AssetStatus.Construction]: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    [AssetStatus.FinalAccounting]: 'bg-orange-50 text-orange-600 border-orange-200',
    [AssetStatus.InventoryCheck]: 'bg-purple-50 text-purple-600 border-purple-200',
    [AssetStatus.TransferIn]: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    [AssetStatus.Archive]: 'bg-green-50 text-green-600 border-green-200',
    [AssetStatus.Disposal]: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return colors[status] || '';
}



