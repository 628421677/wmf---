import React, { useMemo, useState } from 'react';
import { CheckCircle, Plus, Trash2 } from 'lucide-react';
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
  floorCount?: number;
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
  floorCount,
}) => {
  const mains = useMemo(() => getMainCategories(), []);

  const canEdit = !disabled;

  const [newRow, setNewRow] = useState<{ buildingName: string; floor: string; roomNo: string; area: string }>(() => ({
    buildingName: (plan[0]?.buildingName || projectName || '').trim(),
    floor: '',
    roomNo: '',
    area: '',
  }));

  const updateRow = (id: string, patch: Partial<RoomFunctionPlanItem>) => {
    if (!canEdit) return;
    onChange(plan.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    if (!canEdit) return;

    const buildingName = (newRow.buildingName || '').trim();
    const floor = (newRow.floor || '').trim();
    const roomNoRaw = (newRow.roomNo || '').trim();
    const area = Number(newRow.area);

    if (!buildingName) {
      alert('请输入建筑名称');
      return;
    }
    if (!floor) {
      alert('请选择楼层');
      return;
    }
    if (!roomNoRaw) {
      alert('请输入房间号');
      return;
    }
    if (!Number.isFinite(area) || area <= 0) {
      alert('请输入正确的面积');
      return;
    }

    const item: RoomFunctionPlanItem = {
      id: `RFP-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      buildingName,
      roomNo: `${floor}-${roomNoRaw}`,
      area,
      mainCategory: '',
      subCategory: '',
      remark: undefined,
    };

    onChange([item, ...plan]);
    setNewRow(p => ({ ...p, floor: '', roomNo: '', area: '' }));
  };

  const removeRow = (id: string) => {
    if (!canEdit) return;
    if (!confirm('确定要删除该房间吗？')) return;
    onChange(plan.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-[#646a73]">归档前必须完成建筑-房间管理（按主类/亚类）。</div>
          {confirmed ? (
            <div className="text-xs text-green-700 mt-1 flex items-center gap-1">
              <CheckCircle size={14} /> 已确认 {confirmedAt ? `(${new Date(confirmedAt).toLocaleString()})` : ''}{' '}
              {confirmedBy ? `| ${confirmedBy}` : ''}
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

      {/* 新增房间 */}
      {canEdit && (
        <div className="border border-[#dee0e3] rounded-lg p-4 bg-[#fcfcfd]">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-[#646a73] mb-1">建筑名称</label>
              <input
                className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                value={newRow.buildingName}
                onChange={e => setNewRow(p => ({ ...p, buildingName: e.target.value }))}
                placeholder="如：理科实验楼A座"
              />
            </div>
            <div>
              <label className="block text-xs text-[#646a73] mb-1">楼层</label>
              <select
                className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                value={newRow.floor}
                onChange={e => setNewRow(p => ({ ...p, floor: e.target.value }))}
                disabled={!floorCount || floorCount <= 0}
              >
                <option value="">选择楼层</option>
                {(() => {
                  const n = Number(floorCount || 0);
                  if (!Number.isFinite(n) || n <= 0) return null;
                  return Array.from({ length: n }, (_, i) => String(i + 1)).map(f => (
                    <option key={f} value={f}>
                      {f}F
                    </option>
                  ));
                })()}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#646a73] mb-1">房间号</label>
              <input
                className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                value={newRow.roomNo}
                onChange={e => setNewRow(p => ({ ...p, roomNo: e.target.value }))}
                placeholder="如：305"
              />
            </div>
            <div>
              <label className="block text-xs text-[#646a73] mb-1">面积(㎡)</label>
              <input
                type="number"
                className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                value={newRow.area}
                onChange={e => setNewRow(p => ({ ...p, area: e.target.value }))}
                placeholder="如：85"
                min={0}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addRow}
                className="w-full px-3 py-2 bg-[#3370ff] text-white rounded text-sm hover:bg-[#285cc9] flex items-center justify-center gap-1"
              >
                <Plus size={14} /> 添加房间
              </button>
            </div>
          </div>
          <div className="text-xs text-[#8f959e] mt-2">说明：已归档后仍可新增/删除房间，并继续维护主类/亚类。</div>
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
              <th className="px-4 py-2 text-left">主类</th>
              <th className="px-4 py-2 text-left">亚类</th>
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
                      <option value="">请选择</option>
                      {mains.map(m => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
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
                      disabled={!r.mainCategory}
                    >
                      <option value="">请选择</option>
                      {r.mainCategory
                        ? getSubCategories(r.mainCategory as any).map(s => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))
                        : null}
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
                <td className="px-4 py-2 text-center">
                  {canEdit ? (
                    <button
                      type="button"
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
                <td colSpan={7} className="px-4 py-8 text-center text-[#8f959e]">
                  暂无房间功能划分数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomFunctionPlanTab;
