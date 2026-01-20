import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { MOCK_QUOTA_CONFIGS } from '../constants';

export type DeptType = '教学院系' | '行政职能部门' | '科研平台' | '教辅单位' | '后勤保障单位';

type ComplianceStatus = '完全合规' | '部分超额' | '严重超额';

type RoomDistItem = {
  type: string;
  count: number;
  areaPercent: number;
};

export interface DeptOverviewRow {
  id: string;
  deptCode: string;
  deptName: string;
  deptType: DeptType;
  staffingQuota: number;
  quotaArea: number;
  actualArea: number;
  roomCount: number;
  roomDistribution: RoomDistItem[];
  usedArea: number;
  idleRoomCount: number;
  idleArea: number;
  complianceStatus: ComplianceStatus;
  remark: string;
}

type DeptOverviewForm = {
  deptCode: string;
  deptName: string;
  deptType: DeptType;
  staffingQuota: number;
  actualArea: number;
  roomCount: number;
  roomDistributionText: string;
  usedArea: number;
  idleRoomCount: number;
  idleArea: number;
  remark: string;
};

const DEPT_TYPES: DeptType[] = ['教学院系', '行政职能部门', '科研平台', '教辅单位', '后勤保障单位'];
const DEPT_NAMES: string[] = ['计算机学院', '机械学院', '土木学院', '电气学院', '党政办公室', '信息化与网络中心', '后勤处', '人事处', '财务处', '科研院'];

const formatArea = (n: number) => `${n.toFixed(0)}㎡`;

const getComplianceBadgeClass = (status: ComplianceStatus) => {
  switch (status) {
    case '完全合规':
      return 'bg-green-50 text-green-700 border-green-200';
    case '部分超额':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case '严重超额':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const computeComplianceStatus = (quotaArea: number, actualArea: number): ComplianceStatus => {
  if (quotaArea <= 0) return '部分超额';
  const exceed = actualArea - quotaArea;
  if (exceed <= 0) return '完全合规';
  if (exceed / quotaArea <= 0.1) return '部分超额';
  return '严重超额';
};

const parseRoomDistribution = (text: string): RoomDistItem[] => {
  // format example: 办公室 30%、实验室 40%、库房 10%、其他 20%
  const parts = text
    .split(/[，,]/)
    .map(s => s.trim())
    .filter(Boolean);

  const items: RoomDistItem[] = [];
  for (const p of parts) {
    const m = p.match(/^(.+?)\s*(\d+(?:\.\d+)?)%$/);
    if (!m) continue;
    const type = m[1].trim();
    const areaPercent = Number(m[2]);
    if (!type || Number.isNaN(areaPercent)) continue;
    items.push({ type, count: 0, areaPercent });
  }
  return items;
};

const deriveDeptQuotaAreaFromRuleEngine = (deptType: DeptType, staffingQuota: number): number => {
  // 当前“规则引擎”里没有部门定额的独立配置项（只有人员系数/学生系数/学科系数）。
  // 这里做一个可演进的“规则占位实现”：按部门类型给一个人均面积系数，再乘以编制人数。
  // 后续若你们在 RuleEngine 增加 Department 类配置项，可替换这段逻辑为真实配置读取。
  const basePerPerson = (() => {
    switch (deptType) {
      case '行政职能部门':
        return 18;
      case '后勤保障单位':
        return 20;
      case '教辅单位':
        return 16;
      case '科研平台':
        return 22;
      case '教学院系':
      default:
        return 24;
    }
  })();

  const perPersonAdj = (MOCK_QUOTA_CONFIGS.find(q => q.id === 'Q-03')?.value ?? 9) / 9; // 作为轻量的规则引擎联动占位
  return Math.round(staffingQuota * basePerPerson * perPersonAdj);
};

const mockRows: DeptOverviewRow[] = [
  {
    id: '1',
    deptCode: 'DEPT-001',
    deptName: '计算机学院',
    deptType: '教学院系',
    staffingQuota: 85,
    quotaArea: 3360,
    actualArea: 3100,
    roomCount: 68,
    roomDistribution: [
      { type: '办公室', count: 28, areaPercent: 30 },
      { type: '实验室', count: 30, areaPercent: 45 },
      { type: '库房', count: 4, areaPercent: 8 },
      { type: '其他', count: 6, areaPercent: 17 },
    ],
    usedArea: 2850,
    idleRoomCount: 3,
    idleArea: 120,
    complianceStatus: '完全合规',
    remark: '实验室使用率较高，建议持续监测安全与能耗。',
  },
  {
    id: '2',
    deptCode: 'DEPT-002',
    deptName: '机械学院',
    deptType: '教学院系',
    staffingQuota: 72,
    quotaArea: 2880,
    actualArea: 3200,
    roomCount: 74,
    roomDistribution: [
      { type: '办公室', count: 22, areaPercent: 20 },
      { type: '实验室', count: 40, areaPercent: 55 },
      { type: '库房', count: 6, areaPercent: 10 },
      { type: '其他', count: 6, areaPercent: 15 },
    ],
    usedArea: 2980,
    idleRoomCount: 2,
    idleArea: 60,
    complianceStatus: '部分超额',
    remark: '存在超额占用，建议盘点腾退闲置库房。',
  },
  {
    id: '3',
    deptCode: 'DEPT-003',
    deptName: '党政办公室',
    deptType: '行政职能部门',
    staffingQuota: 30,
    quotaArea: 900,
    actualArea: 980,
    roomCount: 18,
    roomDistribution: [
      { type: '办公室', count: 14, areaPercent: 70 },
      { type: '会议室', count: 2, areaPercent: 20 },
      { type: '库房', count: 1, areaPercent: 5 },
      { type: '其他', count: 1, areaPercent: 5 },
    ],
    usedArea: 860,
    idleRoomCount: 1,
    idleArea: 45,
    complianceStatus: '部分超额',
    remark: '会议室存在共享可能，需明确备案与使用边界。',
  },
  {
    id: '4',
    deptCode: 'DEPT-004',
    deptName: '信息化与网络中心',
    deptType: '教辅单位',
    staffingQuota: 25,
    quotaArea: 700,
    actualArea: 660,
    roomCount: 14,
    roomDistribution: [
      { type: '办公室', count: 8, areaPercent: 45 },
      { type: '机房', count: 3, areaPercent: 40 },
      { type: '库房', count: 1, areaPercent: 5 },
      { type: '其他', count: 2, areaPercent: 10 },
    ],
    usedArea: 620,
    idleRoomCount: 0,
    idleArea: 0,
    complianceStatus: '完全合规',
    remark: '机房面积稳定，建议纳入年度能耗核算。',
  },
  {
    id: '5',
    deptCode: 'DEPT-005',
    deptName: '后勤处',
    deptType: '后勤保障单位',
    staffingQuota: 110,
    quotaArea: 3200,
    actualArea: 3600,
    roomCount: 90,
    roomDistribution: [
      { type: '办公室', count: 20, areaPercent: 20 },
      { type: '库房', count: 35, areaPercent: 45 },
      { type: '维修用房', count: 25, areaPercent: 25 },
      { type: '其他', count: 10, areaPercent: 10 },
    ],
    usedArea: 2800,
    idleRoomCount: 12,
    idleArea: 380,
    complianceStatus: '严重超额',
    remark: '闲置偏多且超额明显，建议专项核查库房与维修用房。',
  },
];

const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer: React.ReactNode }> = ({
  open,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h4 className="font-bold">{title}</h4>
          <button onClick={onClose} className="text-[#646a73] hover:text-[#1f2329]">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex justify-end gap-2 p-4 border-t bg-[#fcfcfd]">{footer}</div>
      </div>
    </div>
  );
};

const ConfirmDialog: React.FC<{ open: boolean; title: string; message: React.ReactNode; onCancel: () => void; onConfirm: () => void }> = ({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b">
          <h4 className="font-bold">{title}</h4>
        </div>
        <div className="p-4 text-sm text-[#1f2329]">{message}</div>
        <div className="flex justify-end gap-2 p-4 border-t bg-[#fcfcfd]">
          <button onClick={onCancel} className="px-4 py-2 border rounded hover:bg-slate-50 text-sm">取消</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium">删除</button>
        </div>
      </div>
    </div>
  );
};

export interface PublicHouseDeptOverviewProps {
  keyword: string;
}

const PublicHouseDeptOverview: React.FC<PublicHouseDeptOverviewProps> = ({ keyword }) => {
  const [rows, setRows] = useState<DeptOverviewRow[]>(() => mockRows);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeptOverviewRow | null>(null);

  const editingRow = useMemo(() => rows.find(r => r.id === editingId) ?? null, [editingId, rows]);

  const initialForm: DeptOverviewForm = useMemo(() => {
    if (!editingRow) {
      return {
        deptCode: `DEPT-${String(rows.length + 1).padStart(3, '0')}`,
        deptName: DEPT_NAMES[0],
        deptType: DEPT_TYPES[0],
        staffingQuota: 0,
        actualArea: 0,
        roomCount: 0,
        roomDistributionText: '办公室 30%、实验室 40%、库房 10%、其他 20%',
        usedArea: 0,
        idleRoomCount: 0,
        idleArea: 0,
        remark: '',
      };
    }

    const roomDistributionText = editingRow.roomDistribution.map(d => `${d.type} ${d.areaPercent}%`).join('、');

    return {
      deptCode: editingRow.deptCode,
      deptName: editingRow.deptName,
      deptType: editingRow.deptType,
      staffingQuota: editingRow.staffingQuota,
      actualArea: editingRow.actualArea,
      roomCount: editingRow.roomCount,
      roomDistributionText,
      usedArea: editingRow.usedArea,
      idleRoomCount: editingRow.idleRoomCount,
      idleArea: editingRow.idleArea,
      remark: editingRow.remark,
    };
  }, [editingRow, rows.length]);

  const [form, setForm] = useState<DeptOverviewForm>(initialForm);

  useEffect(() => {
    if (isFormOpen) setForm(initialForm);
  }, [isFormOpen, initialForm]);

  const quotaAreaPreview = useMemo(() => {
    return deriveDeptQuotaAreaFromRuleEngine(form.deptType, Number(form.staffingQuota) || 0);
  }, [form.deptType, form.staffingQuota]);

  const usageRatePreview = useMemo(() => {
    const actual = Number(form.actualArea) || 0;
    const used = Number(form.usedArea) || 0;
    if (actual <= 0) return 0;
    return (used / actual) * 100;
  }, [form.actualArea, form.usedArea]);

  const filteredRows = useMemo(() => {
    const k = keyword.trim();
    if (!k) return rows;
    return rows.filter(r => r.deptCode.includes(k) || r.deptName.includes(k) || r.deptType.includes(k));
  }, [keyword, rows]);

  const save = () => {
    const deptCode = form.deptCode.trim();
    if (!deptCode) return;

    const quotaArea = quotaAreaPreview;
    const actualArea = Number(form.actualArea) || 0;
    const complianceStatus = computeComplianceStatus(quotaArea, actualArea);

    const nextRow: DeptOverviewRow = {
      id: editingId ?? `DOV-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      deptCode,
      deptName: form.deptName,
      deptType: form.deptType,
      staffingQuota: Number(form.staffingQuota) || 0,
      quotaArea,
      actualArea,
      roomCount: Number(form.roomCount) || 0,
      roomDistribution: parseRoomDistribution(form.roomDistributionText),
      usedArea: Number(form.usedArea) || 0,
      idleRoomCount: Number(form.idleRoomCount) || 0,
      idleArea: Number(form.idleArea) || 0,
      complianceStatus,
      remark: form.remark,
    };

    if (!editingId) {
      setRows(prev => [nextRow, ...prev]);
    } else {
      setRows(prev => prev.map(r => (r.id === editingId ? nextRow : r)));
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    setRows(prev => prev.filter(r => r.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#1f2329]">部门概况（按学院/行政部门等单位）</h3>
          <p className="text-sm text-[#646a73] mt-1">支持增删改；核定用房面积由规则引擎计算；使用率系统自动计算。</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9] text-sm font-medium"
        >
          <Plus size={16} /> 新增
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[#646a73]">
            <tr>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">序号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">部门编号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">部门名称</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">部门类型</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">核定编制人数</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">核定用房面积（㎡）</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">实际占用总面积（㎡）</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">占用房间总数</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">房源类型分布</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">用房使用率（%）</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">闲置房间数 / 面积</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">合规状态</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">备注</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRows.map((row, idx) => {
              const usageRate = row.actualArea > 0 ? (row.usedArea / row.actualArea) * 100 : 0;

              return (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-[#1f2329]">{row.deptCode}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.deptName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.deptType}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{row.staffingQuota}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{formatArea(row.quotaArea)}</td>
                  <td className={`px-4 py-3 text-right whitespace-nowrap ${row.actualArea > row.quotaArea ? 'text-red-600 font-medium' : ''}`}>
                    {formatArea(row.actualArea)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{row.roomCount}</td>
                  <td className="px-4 py-3 min-w-[320px]">
                    <div className="flex flex-wrap gap-1">
                      {row.roomDistribution.map(d => (
                        <span key={d.type} className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 text-xs border border-slate-200">
                          {d.type} {d.areaPercent}%
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{usageRate.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {row.idleRoomCount} / {formatArea(row.idleArea)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded border text-xs font-medium ${getComplianceBadgeClass(row.complianceStatus)}`}>
                      {row.complianceStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 min-w-[260px] text-[#1f2329]">{row.remark || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(row.id);
                          setIsFormOpen(true);
                        }}
                        className="text-xs px-2 py-1 border rounded hover:bg-slate-50 text-[#1f2329] flex items-center gap-1"
                      >
                        <Edit size={14} /> 编辑
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(row)}
                        className="text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50 text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={14} /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingId(null);
        }}
        title={`${editingId ? '编辑' : '新增'}部门概况`}
        footer={
          <>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
              }}
              className="px-4 py-2 border rounded hover:bg-slate-50 text-sm"
            >
              取消
            </button>
            <button onClick={save} className="px-4 py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9] text-sm font-medium">
              保存
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">部门编号</label>
              <input value={form.deptCode} onChange={e => setForm(prev => ({ ...prev, deptCode: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" placeholder="如：DEPT-001" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">部门名称</label>
              <select value={form.deptName} onChange={e => setForm(prev => ({ ...prev, deptName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
                {DEPT_NAMES.map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">部门类型</label>
              <select value={form.deptType} onChange={e => setForm(prev => ({ ...prev, deptType: e.target.value as DeptType }))} className="w-full border rounded px-3 py-2 text-sm">
                {DEPT_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">核定编制人数</label>
              <input type="number" value={form.staffingQuota} onChange={e => setForm(prev => ({ ...prev, staffingQuota: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm" min={0} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">核定用房面积（自动）</label>
              <div className="w-full border rounded px-3 py-2 text-sm bg-slate-50 text-[#1f2329] font-medium">
                {formatArea(quotaAreaPreview)}
              </div>
              <div className="text-xs text-[#646a73] mt-1">由规则引擎（占位规则）根据部门类型与编制人数生成。</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">实际占用总面积（㎡）</label>
              <input type="number" value={form.actualArea} onChange={e => setForm(prev => ({ ...prev, actualArea: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm" min={0} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">占用房间总数</label>
              <input type="number" value={form.roomCount} onChange={e => setForm(prev => ({ ...prev, roomCount: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm" min={0} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">闲置房间数</label>
              <input type="number" value={form.idleRoomCount} onChange={e => setForm(prev => ({ ...prev, idleRoomCount: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm" min={0} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">闲置面积（㎡）</label>
              <input type="number" value={form.idleArea} onChange={e => setForm(prev => ({ ...prev, idleArea: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm" min={0} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">房源类型分布（可同步/可手填）</label>
              <input
                value={form.roomDistributionText}
                onChange={e => setForm(prev => ({ ...prev, roomDistributionText: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="例如：办公室 30%、实验室 40%、库房 10%、其他 20%"
              />
              <div className="text-xs text-[#646a73] mt-1">后续可从其他模块同步，这里先支持手填占比。</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">实际使用面积（㎡）</label>
              <input type="number" value={form.usedArea} onChange={e => setForm(prev => ({ ...prev, usedArea: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm" min={0} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">用房使用率（系统计算）</label>
              <div className="w-full border rounded px-3 py-2 text-sm bg-slate-50 text-[#1f2329] font-medium">{usageRatePreview.toFixed(1)}%</div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">备注</label>
              <textarea value={form.remark} onChange={e => setForm(prev => ({ ...prev, remark: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm h-20" placeholder="可填写超额原因、整改建议、同步状态等" />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="确认删除"
        message={
          <>
            确定要删除 <span className="font-medium">{deleteConfirm?.deptName}</span>（{deleteConfirm?.deptCode}）的记录吗？
          </>
        }
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PublicHouseDeptOverview;
