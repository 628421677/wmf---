import React, { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { RoomFunctionPlanItem, UserRole } from '../types';
import { getMainCategories, getSubCategories } from '../utils/roomFunctionCatalog';

interface RoomFunctionPlanTabProps {
  projectName: string;
  plan: RoomFunctionPlanItem[];
  onChange: (next: RoomFunctionPlanItem[]) => void;
  confirmed: boolean;
  confirmedAt?: string;
  confirmedBy?: string;
  onConfirm: () => void;
  disabled?: boolean;
  userRole: UserRole;
}

const RoomFunctionPlanTab: React.FC<RoomFunctionPlanTabProps> = ({
  projectName,
  plan,
  onChange,
  confirmed,
  confirmedAt,
  confirmedBy,
  onConfirm,
  disabled,
  userRole,
}) => {
  const mains = useMemo(() => getMainCategories(), []);

  const canEdit = userRole === UserRole.AssetAdmin && !disabled;

  const updateRow = (id: string, patch: Partial<RoomFunctionPlanItem>) => {
    if (!canEdit) return;
    onChange(plan.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-[#646a73]">归档前必须完成建筑-房间功能划分（按主类/亚类）。</div>
          {confirmed ? (
            <div className="text-xs text-green-700 mt-1 flex items-center gap-1">
              <CheckCircle size={14} /> 已确认 {confirmedAt ? `(${new Date(confirmedAt).toLocaleString()})` : ''} {confirmedBy ? `| ${confirmedBy}` : ''}
            </div>
          ) : (
            <div className="text-xs text-amber-700 mt-1">未确认：归档将被阻止</div>
          )}
        </div>
        {canEdit && (
          <button
            onClick={onConfirm}
            disabled={confirmed || plan.length === 0}
            className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            确认划分
          </button>
        )}
      </div>


      {/* 列表 */}
      <div className="overflow-hidden border border-[#dee0e3] rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f6f7] text-[#646a73]">
            <tr>
              <th className="px-4 py-2 text-left">建筑</th>
              <th className="px-4 py-2 text-left">房间号</th>
              <th className="px-4 py-2 text-right">面积(㎡)</th>
              <th className="px-4 py-2 text-left">主类</th>
              <th className="px-4 py-2 text-left">亚类</th>
              <th className="px-4 py-2 text-left">备注</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dee0e3]">
            {plan.map(r => (
              <tr key={r.id} className="hover:bg-[#f9fafb]">
                <td className="px-4 py-2">{r.buildingName}</td>
                <td className="px-4 py-2 font-medium">{r.roomNo}</td>
                <td className="px-4 py-2 text-right">{r.area || '-'}</td>
                <td className="px-4 py-2">
                  {canEdit ? (
                    <select
                      className="w-full border border-[#dee0e3] rounded px-2 py-1 text-sm"
                      value={r.mainCategory || ''}
                      onChange={e => {
                        const main = e.target.value;
                        const nextSubs = getSubCategories(main as any);
                        updateRow(r.id, { mainCategory: main, subCategory: nextSubs[0]?.value || '' });
                      }}
                    >
                      {mains.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span>{r.mainCategory || '-'}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {canEdit ? (
                    <select
                      className="w-full border border-[#dee0e3] rounded px-2 py-1 text-sm"
                      value={r.subCategory || ''}
                      onChange={e => updateRow(r.id, { subCategory: e.target.value })}
                    >
                      {getSubCategories((r.mainCategory || '') as any).map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span>{r.subCategory || '-'}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {canEdit ? (
                    <input
                      className="w-full border border-[#dee0e3] rounded px-2 py-1 text-sm"
                      value={r.remark || ''}
                      onChange={e => updateRow(r.id, { remark: e.target.value })}
                      placeholder="备注"
                    />
                  ) : (
                    <span className="text-[#646a73]">{r.remark || '-'}</span>
                  )}
                </td>
              </tr>
            ))}
            {plan.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#8f959e]">暂无房间功能划分数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomFunctionPlanTab;



