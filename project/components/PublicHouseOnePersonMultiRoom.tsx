import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { MOCK_QUOTA_CONFIGS } from '../constants';

export type ComplianceStatus = '完全合规' | '部分违规' | '完全违规';
export type ViolationType = '无' | '超标准占用' | '无依据占用' | '擅自改变用途' | '闲置浪费' | '转借他人';
export type TitleRank = '教授' | '副教授' | '讲师' | '助理' | '其他';
export type PublicHouseType = '办公用房' | '科研用房' | '教学用房' | '库房' | '其他';
export type DepartmentOption = '计算机学院' | '机械学院' | '土木学院' | '电气学院' | '后勤处' | '图书馆' | '党政办公室';

export interface OnePersonMultiRoomRow {
  id: string;
  staffNo: string;
  teacherName: string;
  deptName: DepartmentOption;
  title: TitleRank;
  roomType: PublicHouseType;
  rooms: { building: string; floor: string; roomNo: string }[];
  quotaArea: number;
  actualArea: number;
  complianceStatus: ComplianceStatus;
  violationTypes: ViolationType[];
}

type OnePersonMultiRoomForm = {
  staffNo: string;
  teacherName: string;
  deptName: DepartmentOption;
  title: TitleRank;
  roomType: PublicHouseType;
  building: string;
  floor: string;
  roomNo: string;
  actualArea: number;
  violationTypes: ViolationType[];
};

const DEPT_OPTIONS: DepartmentOption[] = ['计算机学院', '机械学院', '土木学院', '电气学院', '后勤处', '图书馆', '党政办公室'];
const ROOM_TYPE_OPTIONS: PublicHouseType[] = ['办公用房', '科研用房', '教学用房', '库房', '其他'];
const TITLE_OPTIONS: TitleRank[] = ['教授', '副教授', '讲师', '助理', '其他'];
const VIOLATION_OPTIONS: ViolationType[] = ['无', '超标准占用', '无依据占用', '擅自改变用途', '闲置浪费', '转借他人'];

const formatArea = (n: number) => `${n.toFixed(0)}㎡`;

const getComplianceBadgeClass = (status: ComplianceStatus) => {
  switch (status) {
    case '完全合规':
      return 'bg-green-50 text-green-700 border-green-200';
    case '部分违规':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case '完全违规':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const normalizeViolationTypes = (violationTypes: ViolationType[]): ViolationType[] => {
  const set = new Set<ViolationType>(violationTypes);
  if (set.has('无') && set.size > 1) {
    set.delete('无');
  }
  if (set.size === 0) set.add('无');
  return Array.from(set);
};

const computeComplianceStatus = (violationTypes: ViolationType[]): ComplianceStatus => {
  const nonNone = violationTypes.filter(v => v !== '无');
  if (nonNone.length === 0) return '完全合规';
  if (nonNone.length >= 2) return '完全违规';
  return '部分违规';
};

const deriveQuotaAreaFromRuleEngine = (title: TitleRank): number => {
  const prof = MOCK_QUOTA_CONFIGS.find(q => q.id === 'Q-01')?.value ?? 24;
  const assocProf = MOCK_QUOTA_CONFIGS.find(q => q.id === 'Q-02')?.value ?? 16;
  const mid = MOCK_QUOTA_CONFIGS.find(q => q.id === 'Q-03')?.value ?? 9;

  if (title === '教授') return prof;
  if (title === '副教授') return assocProf;
  return mid;
};

const buildInitialRows = (): OnePersonMultiRoomRow[] => {
  const r1Title: TitleRank = '教授';
  const r2Title: TitleRank = '副教授';
  const r3Title: TitleRank = '讲师';

  return [
    {
      id: '1',
      staffNo: 'T2023001',
      teacherName: '张三',
      deptName: '计算机学院',
      title: r1Title,
      roomType: '科研用房',
      rooms: [
        { building: '理科实验楼A座', floor: '3F', roomNo: '301' },
        { building: '理科实验楼A座', floor: '3F', roomNo: '302' },
        { building: '创新中心B栋', floor: '2F', roomNo: '205' },
      ],
      quotaArea: deriveQuotaAreaFromRuleEngine(r1Title),
      actualArea: 78,
      complianceStatus: computeComplianceStatus(['超标准占用']),
      violationTypes: ['超标准占用'],
    },
    {
      id: '2',
      staffNo: 'T2021018',
      teacherName: '李四',
      deptName: '机械学院',
      title: r2Title,
      roomType: '办公用房',
      rooms: [
        { building: '行政楼', floor: '5F', roomNo: '502' },
        { building: '行政楼', floor: '5F', roomNo: '503' },
      ],
      quotaArea: deriveQuotaAreaFromRuleEngine(r2Title),
      actualArea: 40,
      complianceStatus: computeComplianceStatus(['无']),
      violationTypes: ['无'],
    },
    {
      id: '3',
      staffNo: 'T2019044',
      teacherName: '王五',
      deptName: '土木学院',
      title: r3Title,
      roomType: '科研用房',
      rooms: [
        { building: '实训中心B栋', floor: '2F', roomNo: '201' },
        { building: '实训中心B栋', floor: '2F', roomNo: '202' },
        { building: '实训中心B栋', floor: '2F', roomNo: '203' },
        { building: '实训中心B栋', floor: '2F', roomNo: '204' },
      ],
      quotaArea: deriveQuotaAreaFromRuleEngine(r3Title),
      actualArea: 92,
      complianceStatus: computeComplianceStatus(['超标准占用', '无依据占用', '擅自改变用途']),
      violationTypes: ['超标准占用', '无依据占用', '擅自改变用途'],
    },
  ];
};

const Tags = <T extends string>({
  values,
  getClassName,
  emptyText = '-',
}: {
  values: T[];
  getClassName: (v: T) => string;
  emptyText?: string;
}) => {
  if (!values.length) {
    return <span className="text-[#8f959e]">{emptyText}</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {values.map(v => (
        <span key={v} className={`px-2 py-0.5 rounded-full text-xs border ${getClassName(v)}`}>
          {v}
        </span>
      ))}
    </div>
  );
};

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
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden" onClick={e => e.stopPropagation()}>
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
          <button onClick={onCancel} className="px-4 py-2 border rounded hover:bg-slate-50 text-sm">
            取消
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium">
            删除
          </button>
        </div>
      </div>
    </div>
  );
};

export interface PublicHouseOnePersonMultiRoomProps {
  keyword: string;
}

const PublicHouseOnePersonMultiRoom: React.FC<PublicHouseOnePersonMultiRoomProps> = ({ keyword }) => {
  const [rows, setRows] = useState<OnePersonMultiRoomRow[]>(() => buildInitialRows());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<OnePersonMultiRoomRow | null>(null);

  const editingRow = useMemo(() => rows.find(r => r.id === editingId) ?? null, [editingId, rows]);

  const initialForm: OnePersonMultiRoomForm = useMemo(() => {
    if (!editingRow) {
      return {
        staffNo: '',
        teacherName: '',
        deptName: DEPT_OPTIONS[0],
        title: TITLE_OPTIONS[0],
        roomType: ROOM_TYPE_OPTIONS[0],
        building: '',
        floor: '',
        roomNo: '',
        actualArea: 0,
        violationTypes: ['无'],
      };
    }

    const firstRoom = editingRow.rooms[0] ?? { building: '', floor: '', roomNo: '' };
    return {
      staffNo: editingRow.staffNo,
      teacherName: editingRow.teacherName,
      deptName: editingRow.deptName,
      title: editingRow.title,
      roomType: editingRow.roomType,
      building: firstRoom.building,
      floor: firstRoom.floor,
      roomNo: firstRoom.roomNo,
      actualArea: editingRow.actualArea,
      violationTypes: editingRow.violationTypes.length ? editingRow.violationTypes : ['无'],
    };
  }, [editingRow]);

  const [form, setForm] = useState<OnePersonMultiRoomForm>(initialForm);

  useEffect(() => {
    if (isFormOpen) setForm(initialForm);
  }, [isFormOpen, initialForm]);

  const filteredRows = useMemo(() => {
    const k = keyword.trim();
    if (!k) return rows;
    return rows.filter(r => r.staffNo.includes(k) || r.teacherName.includes(k) || r.deptName.includes(k));
  }, [keyword, rows]);

  const quotaAreaPreview = useMemo(() => deriveQuotaAreaFromRuleEngine(form.title), [form.title]);
  const compliancePreview = useMemo(() => computeComplianceStatus(form.violationTypes), [form.violationTypes]);

  const toggleViolation = (v: ViolationType) => {
    setForm(prev => {
      const list = prev.violationTypes.includes(v) ? prev.violationTypes.filter(x => x !== v) : [...prev.violationTypes, v];
      return { ...prev, violationTypes: normalizeViolationTypes(list) };
    });
  };

  const save = () => {
    if (!form.staffNo.trim() || !form.teacherName.trim()) return;

    const violations = normalizeViolationTypes(form.violationTypes);
    const complianceStatus = computeComplianceStatus(violations);
    const quotaArea = deriveQuotaAreaFromRuleEngine(form.title);

    const nextRow: OnePersonMultiRoomRow = {
      id: editingId ?? `OPMR-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      staffNo: form.staffNo.trim(),
      teacherName: form.teacherName.trim(),
      deptName: form.deptName,
      title: form.title,
      roomType: form.roomType,
      rooms: [{ building: form.building.trim(), floor: form.floor.trim(), roomNo: form.roomNo.trim() }].filter(r => r.building || r.floor || r.roomNo),
      quotaArea,
      actualArea: Number(form.actualArea) || 0,
      complianceStatus,
      violationTypes: violations,
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
          <h3 className="font-bold text-[#1f2329]">一人多房（按老师维度）</h3>
          <p className="text-sm text-[#646a73] mt-1">定额面积自动读取“规则引擎-定额核算模型”中的人员系数（Q-01/Q-02/Q-03）。</p>
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
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">人员编号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">教师姓名</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">所属部门</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">职称</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">公用房类型</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">楼栋/楼层/房间号</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">定额面积</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">实际面积</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">共计房间数</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">超额面积</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">合规状态</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">违规类型</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRows.map((row, idx) => {
              const roomCount = row.rooms.length;
              const exceedArea = Math.max(0, row.actualArea - row.quotaArea);
              return (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-[#1f2329]">{row.staffNo}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.teacherName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.deptName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.roomType}</td>
                  <td className="px-4 py-3 min-w-[320px]">
                    <div className="flex flex-col gap-1">
                      {row.rooms.map((r, i) => (
                        <div key={`${row.id}-${i}`} className="text-xs text-[#1f2329]">
                          {r.building} / {r.floor} / {r.roomNo}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{formatArea(row.quotaArea)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{formatArea(row.actualArea)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{roomCount}</td>
                  <td className={`px-4 py-3 text-right whitespace-nowrap ${exceedArea > 0 ? 'text-red-600 font-medium' : ''}`}>
                    {formatArea(exceedArea)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded border text-xs font-medium ${getComplianceBadgeClass(row.complianceStatus)}`}>
                      {row.complianceStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 min-w-[240px]">
                    {row.violationTypes.filter(v => v !== '无').length === 0 ? (
                      <span className="text-[#8f959e]">-</span>
                    ) : (
                      <Tags values={row.violationTypes.filter(v => v !== '无')} getClassName={() => 'bg-red-50 text-red-700 border-red-200'} />
                    )}
                  </td>
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
        title={`${editingId ? '编辑' : '新增'}一人多房记录`}
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
              <label className="block text-sm font-medium mb-1">人员编号</label>
              <input value={form.staffNo} onChange={e => setForm(prev => ({ ...prev, staffNo: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" placeholder="如：T2023001" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">教师姓名</label>
              <input value={form.teacherName} onChange={e => setForm(prev => ({ ...prev, teacherName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" placeholder="如：张三" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">所属部门</label>
              <select value={form.deptName} onChange={e => setForm(prev => ({ ...prev, deptName: e.target.value as DepartmentOption }))} className="w-full border rounded px-3 py-2 text-sm">
                {DEPT_OPTIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">职称</label>
              <select value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value as TitleRank }))} className="w-full border rounded px-3 py-2 text-sm">
                {TITLE_OPTIONS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">公用房类型</label>
              <select value={form.roomType} onChange={e => setForm(prev => ({ ...prev, roomType: e.target.value as PublicHouseType }))} className="w-full border rounded px-3 py-2 text-sm">
                {ROOM_TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">实际面积</label>
              <input type="number" value={form.actualArea} onChange={e => setForm(prev => ({ ...prev, actualArea: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm" min={0} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">楼栋</label>
              <input value={form.building} onChange={e => setForm(prev => ({ ...prev, building: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" placeholder="如：行政楼" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">楼层</label>
              <input value={form.floor} onChange={e => setForm(prev => ({ ...prev, floor: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" placeholder="如：5F" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">房间号</label>
              <input value={form.roomNo} onChange={e => setForm(prev => ({ ...prev, roomNo: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" placeholder="如：502" />
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">定额面积（自动）</div>
                <div className="text-xs text-[#646a73] mt-1">从“规则引擎-定额核算模型”读取：教授/副教授/中级及以下</div>
              </div>
              <div className="text-lg font-bold text-[#3370ff]">{formatArea(quotaAreaPreview)}</div>
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-medium">违规类型</div>
                <div className="text-xs text-[#646a73] mt-1">选择“无”表示完全合规；若选择两项及以上（不含“无”）则判定为完全违规。</div>
              </div>
              <div>
                <span className={`px-2 py-1 rounded border text-xs font-medium ${getComplianceBadgeClass(compliancePreview)}`}>
                  {compliancePreview}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {VIOLATION_OPTIONS.map(v => (
                <label key={v} className="flex items-center gap-2 text-sm border rounded px-2 py-1 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" checked={form.violationTypes.includes(v)} onChange={() => toggleViolation(v)} />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="确认删除"
        message={
          <>
            确定要删除 <span className="font-medium">{deleteConfirm?.teacherName}</span>（{deleteConfirm?.staffNo}）的记录吗？
          </>
        }
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PublicHouseOnePersonMultiRoom;






