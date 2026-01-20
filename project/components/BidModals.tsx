import React, { useMemo } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { SpaceItem } from './CommercialHousing';

export interface BidItem {
  id: string;
  company: string;
  contactPerson: string;
  contactPhone: string;
  amount: number;
  depositPaid: boolean;
  bidDate: string;
  status: 'Valid' | 'Invalid' | 'Winner' | 'Loser';
}

interface BidListModalProps {
  isOpen: boolean;
  space: SpaceItem | null;
  onClose: () => void;
  onConfirmWinner: (bid: BidItem) => void;
}

const statusLabel = (s: BidItem['status']) => {
  switch (s) {
    case 'Winner':
      return '中标';
    case 'Loser':
      return '未中标';
    case 'Invalid':
      return '无效';
    default:
      return '有效';
  }
};

export const BidListModal: React.FC<BidListModalProps> = ({ isOpen, space, onClose, onConfirmWinner }) => {
  const bids = useMemo(() => space?.bids ?? [], [space]);

  if (!isOpen || !space) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
        <div className="p-4 border-b border-[#dee0e3] flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-[#1f2329]">查看竞标</div>
            <div className="text-xs text-[#8f959e] mt-1">{space.name} · {space.area}㎡</div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-auto">
          {bids.length === 0 ? (
            <div className="text-sm text-[#8f959e]">暂无竞标数据</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#f5f6f7] text-[#646a73]">
                <tr>
                  <th className="px-4 py-3 text-left">竞标单位</th>
                  <th className="px-4 py-3 text-left">联系人</th>
                  <th className="px-4 py-3 text-left">联系电话</th>
                  <th className="px-4 py-3 text-left">竞标月租金(元)</th>
                  <th className="px-4 py-3 text-left">保证金</th>
                  <th className="px-4 py-3 text-left">竞标日期</th>
                  <th className="px-4 py-3 text-left">状态</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee0e3]">
                {bids.map(bid => {
                  const isWinner = bid.status === 'Winner';
                  return (
                    <tr key={bid.id} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 font-medium">{bid.company}</td>
                      <td className="px-4 py-3">{bid.contactPerson}</td>
                      <td className="px-4 py-3">{bid.contactPhone}</td>
                      <td className="px-4 py-3 font-medium">¥{bid.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {bid.depositPaid ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 size={14} /> 已缴
                          </span>
                        ) : (
                          <span className="text-amber-600">未缴</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{bid.bidDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            bid.status === 'Winner'
                              ? 'bg-green-100 text-green-700'
                              : bid.status === 'Loser'
                                ? 'bg-gray-100 text-gray-600'
                                : bid.status === 'Invalid'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {statusLabel(bid.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isWinner ? (
                          <span className="text-xs text-green-600">已中标</span>
                        ) : (
                          <button
                            onClick={() => onConfirmWinner(bid)}
                            className="text-xs px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            确定中标
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

