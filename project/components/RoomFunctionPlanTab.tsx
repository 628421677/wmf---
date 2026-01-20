import React, { useMemo, useState } from 'react';
import { CheckCircle, Plus, Trash2 } from 'lucide-react';
import { RoomFunctionPlanItem, UserRole } from '../types';
import { getMainCategories, getRoomFunctionLabel, getSubCategories } from '../utils/roomFunctionCatalog';

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
  const [newRow, setNewRow] = useState({
    buildingName: projectName,
    roomNo: '',
    area: '',
    mainCategory: 'Teaching',
    subCategory: 'TheoryClassroom',
    remark: '',
  });

  const mains = useMemo(() => getMainCategories(), []);
  const subs = useMemo(() => getSubCategories(newRow.mainCategory as any), [newRow.mainCategory]);

  const addRow = () => {
    if (disabled) return;
    if (!newRow.roomNo.trim()) return;
    const area = Number(newRow.area) || 0;
    const item: RoomFunctionPlanItem = {
      id: `RFP-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      buildingName: newRow.buildingName || projectName,
      roomNo: newRow.roomNo.trim(),
      area,
      mainCategory: newRow.mainCategory,
      subCategory: newRow.subCategory,
      remark: newRow.remark?.trim() || undefined,
    };
    onChange([item, ...plan]);
    setNewRow(p => ({ ...p, roomNo: '', area: '', remark: '' }));
  };

  const removeRow = (id: string) => {
    if (disabled) return;
    onChange(plan.filter(p => p.id !== id));
  };

  const canEdit = userRole === UserRole.AssetAdmin && !disabled;

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

      {/* 新增 */}
      {canEdit && (
        <div className="border border-[#dee0e3] rounded-lg p-4 bg-[#fcfcfd]">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-[#646a73] mb-1">建筑名称</label>
              <input
                className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                value={newRow.buildingName}
                onChange={e => setNewRow(p => ({ ...p, buildingName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-[#646a73] mb-1">房间号 *</label>
              <input
                className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                value={newRow.roomNo}
                onChange={e => setNewRow(p => ({ ...p, roomNo: e.target.value }))}
                placeholder="如 101"
              />
            </div>
            <div>
              <label className="block text-xs text-[#646a73] mb-1">面积(㎡)</label>
              <input
                type="number"
                className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                value={newRow.area}
                onChange={e => setNewRow(p => ({ ...p, area: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-[#646a73] mb-1">主类</label>
              <select
                className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                value={newRow.mainCategory}
                onChange={e => {
                  const main = e.target.value;
                  const nextSubs = getSubCategories(main as any);
                  setNewRow(p => ({ ...p, mainCategory: main, subCategory: nextSubs[0]?.value || '' }));
                }}
              >
                {mains.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#646a73] mb-1">亚类</label>
              <select
                className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                value={newRow.subCategory}
                onChange={e => setNewRow(p => ({ ...p, subCategory: e.target.value }))}
              >
                {subs.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mt-3 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs text-[#646a73] mb-1">备注</label>
              <input
                className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                value={newRow.remark}
                onChange={e => setNewRow(p => ({ ...p, remark: e.target.value }))}
                placeholder="可填写典型房间示例或使用说明"
              />
            </div>
            <button
              onClick={addRow}
              className="md:col-span-1 px-3 py-2 bg-[#3370ff] text-white rounded text-sm hover:bg-[#285cc9] flex items-center justify-center gap-1"
            >
              <Plus size={14} /> 添加
            </button>
          </div>
        </div>
      )}

      {/* 列表 */}
      <div className="overflow-hidden border border-[#dee0e3] rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f6f7] text-[#646a73]">
            <tr>
              <th className="px-4 py-2 text-left">建筑</th>
              <th className="px-4 py-2 text-left">房间号</th>
              <th className="px-4 py-2 text-right">面积(㎡)</th>
              <th className="px-4 py-2 text-left">功能分类</th>
              <th className="px-4 py-2 text-left">备注</th>
              <th className="px-4 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dee0e3]">
            {plan.map(r => (
              <tr key={r.id} className="hover:bg-[#f9fafb]">
                <td className="px-4 py-2">{r.buildingName}</td>
                <td className="px-4 py-2 font-medium">{r.roomNo}</td>
                <td className="px-4 py-2 text-right">{r.area || '-'}</td>
                <td className="px-4 py-2">{getRoomFunctionLabel(r.mainCategory as any, r.subCategory as any)}</td>
                <td className="px-4 py-2 text-[#646a73]">{r.remark || '-'}</td>
                <td className="px-4 py-2 text-center">
                  {canEdit ? (
                    <button
                      onClick={() => removeRow(r.id)}
                      className="text-red-600 hover:text-red-700"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <span className="text-xs text-[#8f959e]">-</span>
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



