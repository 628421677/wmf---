import React, { useMemo, useState } from 'react';
import { Search, Eye, Bell, Edit2, Plus, Trash2, ArrowUpDown, X } from 'lucide-react';
import { FeeStatus, PaymentRecord, ReminderRecord } from '../types';
import { getPersonQuotaArea } from '../utils/personQuota';
import { MOCK_PERSON_USAGES } from '../constants/personFeeData';

export interface PersonUsage {
  id: string;
  personId: string;
  personName: string;
  title: string; // 教授/副教授/讲师
  departmentName: string;
  actualArea: number;
  basePrice: number; // 元/m²/年
}

type SortKey = 'remaining' | 'excessArea' | 'progress' | 'department' | 'name';

interface PersonFeeManagementProps {
  year: number;
  personUsages: PersonUsage[];
  setPersonUsages: (updater: any) => void;
  departmentFees: any[];
  setDepartmentFees: (updater: any) => void;
  payments: PaymentRecord[];
  setPayments: (updater: any) => void;
  reminders: ReminderRecord[];
  setReminders: (updater: any) => void;
  isAssetAdmin: boolean;
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    }
  };
  return [storedValue, setValue] as const;
}



const PersonFeeManagement: React.FC<PersonFeeManagementProps> = ({
  year,
  departmentFees,
  setDepartmentFees,
  payments,
  setPayments,
  reminders,
  setReminders,
  isAssetAdmin,
}) => {
  const [personUsages, setPersonUsages] = useLocalStorage<PersonUsage[]>('person-usages-v1', MOCK_PERSON_USAGES);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('remaining');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [detail, setDetail] = useState<any | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<PersonUsage | null>(null);
  const [form, setForm] = useState({
    personName: '',
    title: '讲师',
    departmentName: '',
    actualArea: 0,
    basePrice: 120,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ personName: '', title: '讲师', departmentName: '', actualArea: 0, basePrice: 120 });
    setEditModalOpen(true);
  };

  const openEdit = (u: PersonUsage) => {
    setEditing(u);
    setForm({
      personName: u.personName,
      title: u.title,
      departmentName: u.departmentName,
      actualArea: u.actualArea,
      basePrice: u.basePrice,
    });
    setEditModalOpen(true);
  };

  const handleDelete = (u: PersonUsage) => {
    if (!confirm(`确定删除人员：${u.personName}？`)) return;
    setPersonUsages(prev => prev.filter(p => p.id !== u.id));

    // 只删除台账，不删除历史缴费/催缴记录（保留审计痕迹）
    alert('已删除人员台账');
  };

  const handleSave = () => {
    if (!form.personName.trim() || !form.departmentName.trim()) return;

    const title = form.title as PersonUsage['title'];
    const actualArea = Number(form.actualArea) || 0;
    const basePrice = Number(form.basePrice) || 0;

    if (editing) {
      setPersonUsages(prev => prev.map(p => p.id === editing.id ? {
        ...p,
        personName: form.personName.trim(),
        title,
        departmentName: form.departmentName.trim(),
        actualArea,
        basePrice,
      } : p));
    } else {
      const id = `PU-${Date.now()}`;
      const personId = `P-${Date.now().toString().slice(-6)}`;
      const item: PersonUsage = {
        id,
        personId,
        personName: form.personName.trim(),
        title,
        departmentName: form.departmentName.trim(),
        actualArea,
        basePrice,
      };
      setPersonUsages(prev => [item, ...prev]);
    }

    setEditModalOpen(false);
    setEditing(null);
  };

  const computedRows = useMemo(() => {
    return personUsages.map(u => {
      const quotaArea = getPersonQuotaArea(u.title);
      const excessArea = Math.max(0, u.actualArea - quotaArea);
      const tierMultiplier = excessArea > 0 ? 1.5 : 1.0;
      const totalCost = Math.round(excessArea * u.basePrice * tierMultiplier);

      const personPayments = payments.filter(p => p.personId === u.personId && p.status === 'Confirmed');
      const paidAmount = personPayments.reduce((s, p) => s + p.amount, 0);
      const remainingAmount = Math.max(0, totalCost - paidAmount);
      const progress = totalCost > 0 ? paidAmount / totalCost : 1;

      return {
        ...u,
        quotaArea,
        excessArea,
        tierMultiplier,
        totalCost,
        paidAmount,
        remainingAmount,
        progress,
        status: remainingAmount <= 0 ? FeeStatus.Completed : FeeStatus.BillGenerated,
      };
    });
  }, [payments, personUsages]);

  const rows = useMemo(() => {
    const filtered = computedRows.filter(r => {
      if (!search.trim()) return true;
      const s = search.trim();
      return r.personName.includes(s) || r.departmentName.includes(s) || r.title.includes(s);
    });

    return [...filtered].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'remaining':
          return (a.remainingAmount - b.remainingAmount) * dir;
        case 'excessArea':
          return (a.excessArea - b.excessArea) * dir;
        case 'progress':
          return (a.progress - b.progress) * dir;
        case 'department':
          return a.departmentName.localeCompare(b.departmentName) * dir;
        case 'name':
          return a.personName.localeCompare(b.personName) * dir;
        default:
          return 0;
      }
    });
  }, [computedRows, search, sortKey, sortDir]);

  const handleSendReminder = (row: any) => {
    const newReminder: ReminderRecord = {
      id: `REM-P-${Date.now()}`,
      billId: `PBILL-${row.personId}-${year}`,
      billNo: `P-GF-${year}-${row.personId}`,
      departmentName: row.departmentName,
      personId: row.personId,
      personName: row.personName,
      reminderType: 'System',
      content: `【个人催缴】${row.personName}(${row.departmentName}) ${year}年度超额用房费用待缴 ¥${row.remainingAmount.toLocaleString()}。`,
      sentAt: new Date().toISOString(),
      sentBy: '资产处管理员',
      isRead: false,
    };
    setReminders((prev: ReminderRecord[]) => [newReminder, ...prev]);
    alert('已发送个人催缴通知');
  };

  return (
    <div>
      <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm"
              placeholder="搜索人员/学院/职称..."
            />
          </div>

          <button
            onClick={() => {
              if (sortKey === 'remaining') setSortDir(d => d === 'asc' ? 'desc' : 'asc');
              else { setSortKey('remaining'); setSortDir('desc'); }
            }}
            className="text-xs px-3 py-2 border border-[#dee0e3] rounded flex items-center gap-1 hover:bg-gray-50"
          >
            <ArrowUpDown size={14} /> 按未缴排序
          </button>

          <button
            onClick={() => {
              if (sortKey === 'excessArea') setSortDir(d => d === 'asc' ? 'desc' : 'asc');
              else { setSortKey('excessArea'); setSortDir('desc'); }
            }}
            className="text-xs px-3 py-2 border border-[#dee0e3] rounded flex items-center gap-1 hover:bg-gray-50"
          >
            <ArrowUpDown size={14} /> 按超标排序
          </button>

          <button
            onClick={() => {
              if (sortKey === 'progress') setSortDir(d => d === 'asc' ? 'desc' : 'asc');
              else { setSortKey('progress'); setSortDir('asc'); }
            }}
            className="text-xs px-3 py-2 border border-[#dee0e3] rounded flex items-center gap-1 hover:bg-gray-50"
          >
            <ArrowUpDown size={14} /> 按进度排序
          </button>

          {isAssetAdmin && (
            <button
              onClick={openCreate}
              className="text-xs px-3 py-2 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9]"
            >
              <Plus size={14} /> 新增
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f6f7] text-[#646a73]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">人员</th>
              <th className="px-4 py-3 text-left font-medium">学院</th>
              <th className="px-4 py-3 text-right font-medium">定额/实占</th>
              <th className="px-4 py-3 text-right font-medium">超标面积</th>
              <th className="px-4 py-3 text-right font-medium">应缴金额</th>
              <th className="px-4 py-3 text-right font-medium">未缴金额</th>
              <th className="px-4 py-3 text-left font-medium">缴费进度</th>
              <th className="px-4 py-3 text-center font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dee0e3]">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-[#f9fafb]">
                <td className="px-4 py-3">
                  <div className="font-medium text-[#1f2329]">{r.personName}</div>
                  <div className="text-xs text-[#8f959e]">{r.title}</div>
                </td>
                <td className="px-4 py-3">{r.departmentName}</td>
                <td className="px-4 py-3 text-right">{r.quotaArea} / {r.actualArea}㎡</td>
                <td className="px-4 py-3 text-right">
                  <span className={r.excessArea > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                    {r.excessArea}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">¥{r.totalCost.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-medium">
                  <span className={r.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                    ¥{r.remainingAmount.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="w-28 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${r.progress >= 1 ? 'bg-green-500' : 'bg-[#3370ff]'}`} style={{ width: `${Math.min(100, Math.round(r.progress * 100))}%` }} />
                  </div>
                  <div className="text-xs text-[#8f959e] mt-1">{Math.round(r.progress * 100)}%</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setDetail(r)} className="text-[#3370ff] hover:text-[#285cc9]" title="详情"><Eye size={16} /></button>
                    {isAssetAdmin && r.remainingAmount > 0 && (
                      <button onClick={() => handleSendReminder(r)} className="text-amber-600 hover:text-amber-700" title="催缴"><Bell size={16} /></button>
                    )}
                    {isAssetAdmin && (
                      <button onClick={() => openEdit(r)} className="text-[#8f959e] hover:text-[#1f2329]" title="编辑"><Edit2 size={16} /></button>
                    )}
                    {isAssetAdmin && (
                      <button onClick={() => handleDelete(r)} className="text-red-600 hover:text-red-700" title="删除"><Trash2 size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 详情弹窗 */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-lg w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">个人缴费详情 - {detail.personName}</h3>
              <button onClick={() => setDetail(null)} className="text-[#8f959e] hover:text-[#1f2329]"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#646a73]">学院</span><span className="font-medium">{detail.departmentName}</span></div>
              <div className="flex justify-between"><span className="text-[#646a73]">职称</span><span className="font-medium">{detail.title}</span></div>
              <div className="flex justify-between"><span className="text-[#646a73]">定额/实占</span><span className="font-medium">{detail.quotaArea} / {detail.actualArea}㎡</span></div>
              <div className="flex justify-between"><span className="text-[#646a73]">超标面积</span><span className={`font-medium ${detail.excessArea>0?'text-red-600':'text-green-600'}`}>{detail.excessArea}㎡</span></div>
              <div className="flex justify-between"><span className="text-[#646a73]">应缴金额</span><span className="font-medium">¥{detail.totalCost.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[#646a73]">已缴金额</span><span className="font-medium text-green-600">¥{detail.paidAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[#646a73]">未缴金额</span><span className="font-medium text-red-600">¥{detail.remainingAmount.toLocaleString()}</span></div>
              <div>
                <div className="text-[#646a73] mb-1">缴费进度</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${detail.progress>=1?'bg-green-500':'bg-[#3370ff]'}`} style={{ width: `${Math.min(100, Math.round(detail.progress*100))}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-[#dee0e3]">
                <div className="text-[#646a73] mb-1">缴费记录（财务系统对接后自动同步）</div>
                <div className="space-y-1">
                  {payments.filter(p => p.personId === detail.personId).slice(0, 6).map(p => (
                    <div key={p.id} className="flex justify-between text-xs text-[#646a73]">
                      <span>{p.paymentDate} {p.paymentMethod}</span>
                      <span className="font-medium">¥{p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {payments.filter(p => p.personId === detail.personId).length === 0 && (
                    <div className="text-xs text-[#8f959e]">暂无缴费记录</div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end">
              <button onClick={() => setDetail(null)} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditModalOpen(false)}>
          <div className="bg-white rounded-lg w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">{editing ? '编辑人员台账' : '新增人员台账'}</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-[#8f959e] hover:text-[#1f2329]"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">姓名 *</label>
                <input className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={form.personName} onChange={e => setForm(p => ({ ...p, personName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">学院 *</label>
                <input className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={form.departmentName} onChange={e => setForm(p => ({ ...p, departmentName: e.target.value }))} placeholder="如：机械工程学院" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">职称</label>
                <select className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}>
                  <option value="教授">教授</option>
                  <option value="副教授">副教授</option>
                  <option value="讲师">讲师</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">实占面积(㎡)</label>
                  <input type="number" className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={form.actualArea} onChange={e => setForm(p => ({ ...p, actualArea: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">单价(元/㎡/年)</label>
                  <input type="number" className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={form.basePrice} onChange={e => setForm(p => ({ ...p, basePrice: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="text-xs text-[#8f959e]">
                定额面积将从“规则引擎/人员系数”中按职称自动计算。
              </div>
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end gap-3">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9]">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonFeeManagement;
