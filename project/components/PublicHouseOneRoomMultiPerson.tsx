import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';

export type PublicHouseType = '办公用房' | '科研用房' | '教学用房' | '库房' | '其他';
export type DepartmentOption = '计算机学院' | '机械学院' | '土木学院' | '电气学院' | '后勤处' | '图书馆' | '党政办公室';

export type OpmComplianceStatus = '完全合规' | '超员占用' | '部分无依据' | '擅自共用';
export type OpmViolationType = '无' | '超核定人数占用' | '部分人员无分配依据' | '擅自接纳非备案人员使用';

export type OccupantDutyScope =
  | '实验操作 / 实验台A区'
  | '实验操作 / 实验台B区'
  | '行政办公 / 靠窗工位'
  | '行政办公 / 中间工位'
  | '行政办公 / 靠门工位'
  | '临时协作 / 临时工位'
  | '设备维护 / 设备间'
  | '其他';

export interface RoomOccupant {
  subjectNo: string;
  name: string;
  deptName: DepartmentOption;
  dutyScope: OccupantDutyScope;
  isRegistered: boolean;
}

export interface OneRoomMultiPersonRow {
  id: string;
  seqNo: string;
  roomCode: string;
  location: string;
  roomType: PublicHouseType;
  area: number;
  approvedOccupancy: number;
  actualOccupancy: number;
  occupants: RoomOccupant[];
  complianceStatuses: OpmComplianceStatus[];
  violationTypes: OpmViolationType[];
}

type OneRoomMultiPersonForm = {
  seqNo: string;
  roomCode: string;
  location: string;
  roomType: PublicHouseType;
  area: number;
  approvedOccupancy: number;
  violationTypes: OpmViolationType[];
  occupants: RoomOccupant[];
};

const DEPT_OPTIONS: DepartmentOption[] = ['计算机学院', '机械学院', '土木学院', '电气学院', '后勤处', '图书馆', '党政办公室'];
const ROOM_TYPE_OPTIONS: PublicHouseType[] = ['办公用房', '科研用房', '教学用房', '库房', '其他'];

const OPM_VIOLATION_OPTIONS: OpmViolationType[] = ['无', '超核定人数占用', '部分人员无分配依据', '擅自接纳非备案人员使用'];
const OPM_DUTY_SCOPE_OPTIONS: OccupantDutyScope[] = [
  '实验操作 / 实验台A区',
  '实验操作 / 实验台B区',
  '行政办公 / 靠窗工位',
  '行政办公 / 中间工位',
  '行政办公 / 靠门工位',
  '临时协作 / 临时工位',
  '设备维护 / 设备间',
  '其他',
];

const formatArea = (n: number) => `${n.toFixed(0)}㎡`;

const getOpmComplianceBadgeClass = (status: OpmComplianceStatus) => {
  switch (status) {
    case '完全合规':
      return 'bg-green-50 text-green-700 border-green-200';
    case '超员占用':
      return 'bg-red-50 text-red-700 border-red-200';
    case '部分无依据':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case '擅自共用':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const normalizeOpmViolationTypes = (violationTypes: OpmViolationType[]): OpmViolationType[] => {
  const set = new Set<OpmViolationType>(violationTypes);
  if (set.has('无') && set.size > 1) {
    set.delete('无');
  }
  if (set.size === 0) set.add('无');
  return Array.from(set);
};

const computeOpmComplianceStatuses = (opts: {
  approvedOccupancy: number;
  occupants: RoomOccupant[];
  violationTypes: OpmViolationType[];
}): OpmComplianceStatus[] => {
  const normalizedViolations = normalizeOpmViolationTypes(opts.violationTypes);
  const nonNone = normalizedViolations.filter(v => v !== '无');

  const actualOccupancy = opts.occupants.length;
  const allNotRegistered = opts.occupants.length > 0 && opts.occupants.every(o => !o.isRegistered);
  const crossDept = new Set(opts.occupants.map(o => o.deptName)).size > 1;
  const unauthorizedShared = allNotRegistered || crossDept;

  const statuses = new Set<OpmComplianceStatus>();

  if (nonNone.length === 0) statuses.add('完全合规');
  for (const v of nonNone) {
    if (v === '超核定人数占用') statuses.add('超员占用');
    if (v === '部分人员无分配依据') statuses.add('部分无依据');
    if (v === '擅自接纳非备案人员使用') statuses.add('擅自共用');
  }

  if (actualOccupancy > opts.approvedOccupancy) statuses.add('超员占用');
  if (unauthorizedShared) statuses.add('擅自共用');

  if (statuses.size > 1 && statuses.has('完全合规')) statuses.delete('完全合规');

  return Array.from(statuses);
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

const buildOneRoomMockRows = (): OneRoomMultiPersonRow[] => {
  const raw: Omit<OneRoomMultiPersonRow, 'actualOccupancy' | 'complianceStatuses'>[] = [
    {
      id: 'R-1',
      seqNo: 'R-000001',
      roomCode: 'RM-INFO-201',
      location: '信息楼 2F 201',
      roomType: '办公用房',
      area: 25,
      approvedOccupancy: 2,
      occupants: [
        {
          subjectNo: 'T2018006',
          name: '赵老师',
          deptName: '计算机学院',
          dutyScope: '行政办公 / 靠窗工位',
          isRegistered: true,
        },
        {
          subjectNo: 'T2020012',
          name: '孙老师',
          deptName: '计算机学院',
          dutyScope: '行政办公 / 中间工位',
          isRegistered: true,
        },
      ],
      violationTypes: ['无'],
    },
    {
      id: 'R-2',
      seqNo: 'R-000002',
      roomCode: 'RM-MECH-305',
      location: '机械工程实验楼 3F 305',
      roomType: '科研用房',
      area: 240,
      approvedOccupancy: 3,
      occupants: [
        {
          subjectNo: 'P001',
          name: '张教授',
          deptName: '机械学院',
          dutyScope: '实验操作 / 实验台A区',
          isRegistered: true,
        },
        {
          subjectNo: 'P002',
          name: '李副教授',
          deptName: '机械学院',
          dutyScope: '实验操作 / 实验台B区',
          isRegistered: true,
        },
        {
          subjectNo: 'P003',
          name: '王讲师',
          deptName: '机械学院',
          dutyScope: '设备维护 / 设备间',
          isRegistered: true,
        },
        {
          subjectNo: 'EXT-901',
          name: '外协人员A',
          deptName: '机械学院',
          dutyScope: '临时协作 / 临时工位',
          isRegistered: false,
        },
        {
          subjectNo: 'EXT-902',
          name: '外协人员B',
          deptName: '机械学院',
          dutyScope: '临时协作 / 临时工位',
          isRegistered: false,
        },
      ],
      violationTypes: ['超核定人数占用', '擅自接纳非备案人员使用'],
    },
    {
      id: 'R-3',
      seqNo: 'R-000003',
      roomCode: 'RM-ADM-502',
      location: '行政楼 5F 502',
      roomType: '办公用房',
      area: 60,
      approvedOccupancy: 4,
      occupants: [
        {
          subjectNo: 'A001',
          name: '刘主任',
          deptName: '党政办公室',
          dutyScope: '行政办公 / 靠窗工位',
          isRegistered: true,
        },
        {
          subjectNo: 'A002',
          name: '陈副主任',
          deptName: '党政办公室',
          dutyScope: '行政办公 / 中间工位',
          isRegistered: true,
        },
        {
          subjectNo: 'A003',
          name: '周老师',
          deptName: '党政办公室',
          dutyScope: '行政办公 / 靠门工位',
          isRegistered: false,
        },
        {
          subjectNo: 'A004',
          name: '钱老师',
          deptName: '党政办公室',
          dutyScope: '行政办公 / 中间工位',
          isRegistered: false,
        },
      ],
      violationTypes: ['部分人员无分配依据'],
    },
  ];

  return raw.map(r => {
    const actual = r.occupants.length;
    const statuses = computeOpmComplianceStatuses({
      approvedOccupancy: r.approvedOccupancy,
      occupants: r.occupants,
      violationTypes: r.violationTypes,
    });

    return {
      ...r,
      actualOccupancy: actual,
      complianceStatuses: statuses,
    };
  });
};

const mergeRoom = (existing: OneRoomMultiPersonRow, incoming: { form: OneRoomMultiPersonForm; occupants: RoomOccupant[]; violations: OpmViolationType[] }) => {
  const combinedOccupants = [...existing.occupants];
  for (const o of incoming.occupants) {
    const key = `${o.subjectNo}::${o.name}`;
    const exists = combinedOccupants.some(x => `${x.subjectNo}::${x.name}` === key);
    if (!exists) combinedOccupants.push(o);
  }

  const combinedViolations = normalizeOpmViolationTypes([...existing.violationTypes, ...incoming.violations]);
  const nextActual = combinedOccupants.length;
  const statuses = computeOpmComplianceStatuses({
    approvedOccupancy: Number(incoming.form.approvedOccupancy) || existing.approvedOccupancy,
    occupants: combinedOccupants,
    violationTypes: combinedViolations,
  });

  return {
    ...existing,
    location: incoming.form.location.trim() || existing.location,
    roomType: incoming.form.roomType,
    area: Number(incoming.form.area) || existing.area,
    approvedOccupancy: Number(incoming.form.approvedOccupancy) || existing.approvedOccupancy,
    occupants: combinedOccupants,
    actualOccupancy: nextActual,
    violationTypes: combinedViolations,
    complianceStatuses: statuses,
  };
};

const OccupantEditor: React.FC<{
  occupants: RoomOccupant[];
  onChange: (next: RoomOccupant[]) => void;
}> = ({ occupants, onChange }) => {
  const add = () => {
    onChange([
      ...occupants,
      {
        subjectNo: '',
        name: '',
        deptName: DEPT_OPTIONS[0],
        dutyScope: OPM_DUTY_SCOPE_OPTIONS[0],
        isRegistered: true,
      },
    ]);
  };

  const remove = (idx: number) => {
    const next = occupants.slice();
    next.splice(idx, 1);
    onChange(next.length ? next : occupants);
  };

  const update = (idx: number, patch: Partial<RoomOccupant>) => {
    const next = occupants.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium">占用主体列表</div>
          <div className="text-xs text-[#646a73] mt-1">支持新增/删除占用主体；部门、职责/范围可选择；可标记是否已备案。</div>
        </div>
        <button onClick={add} className="px-3 py-1.5 bg-[#3370ff] text-white rounded text-sm hover:bg-[#285cc9] flex items-center gap-1">
          <Plus size={14} /> 添加主体
        </button>
      </div>

      <div className="space-y-3">
        {occupants.map((o, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center border rounded p-2">
            <div className="col-span-2">
              <input
                value={o.subjectNo}
                onChange={e => update(idx, { subjectNo: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
                placeholder="编号"
              />
            </div>
            <div className="col-span-2">
              <input
                value={o.name}
                onChange={e => update(idx, { name: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
                placeholder="姓名"
              />
            </div>
            <div className="col-span-2">
              <select
                value={o.deptName}
                onChange={e => update(idx, { deptName: e.target.value as DepartmentOption })}
                className="w-full border rounded px-2 py-1 text-xs"
              >
                {DEPT_OPTIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-4">
              <select
                value={o.dutyScope}
                onChange={e => update(idx, { dutyScope: e.target.value as OccupantDutyScope })}
                className="w-full border rounded px-2 py-1 text-xs"
              >
                {OPM_DUTY_SCOPE_OPTIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1 flex items-center gap-1">
              <input type="checkbox" checked={o.isRegistered} onChange={e => update(idx, { isRegistered: e.target.checked })} />
              <span className="text-xs">备案</span>
            </div>
            <div className="col-span-1 flex justify-end">
              {occupants.length > 1 && (
                <button onClick={() => remove(idx)} className="text-red-600 hover:text-red-700" title="删除主体">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ViolationSelector: React.FC<{
  value: OpmViolationType[];
  onChange: (next: OpmViolationType[]) => void;
  compliancePreview: OpmComplianceStatus[];
}> = ({ value, onChange, compliancePreview }) => {
  const toggle = (v: OpmViolationType) => {
    const next = value.includes(v) ? value.filter(x => x !== v) : [...value, v];
    onChange(normalizeOpmViolationTypes(next));
  };

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium">违规类型</div>
          <div className="text-xs text-[#646a73] mt-1">选择“无”表示完全合规；可多选并自动映射合规状态（多标签）。</div>
        </div>
        <div className="min-w-[220px] flex justify-end">
          <Tags values={compliancePreview} getClassName={v => getOpmComplianceBadgeClass(v)} emptyText="完全合规" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {OPM_VIOLATION_OPTIONS.map(v => (
          <label key={v} className="flex items-center gap-2 text-sm border rounded px-2 py-1 hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={value.includes(v)} onChange={() => toggle(v)} />
            <span>{v}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export interface PublicHouseOneRoomMultiPersonProps {
  keyword: string;
}

const PublicHouseOneRoomMultiPerson: React.FC<PublicHouseOneRoomMultiPersonProps> = ({ keyword }) => {
  const [rows, setRows] = useState<OneRoomMultiPersonRow[]>(() => buildOneRoomMockRows());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<OneRoomMultiPersonRow | null>(null);

  const editingRow = useMemo(() => rows.find(r => r.id === editingId) ?? null, [editingId, rows]);

  const initialForm: OneRoomMultiPersonForm = useMemo(() => {
    if (!editingRow) {
      return {
        seqNo: `R-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        roomCode: '',
        location: '',
        roomType: ROOM_TYPE_OPTIONS[0],
        area: 0,
        approvedOccupancy: 0,
        violationTypes: ['无'],
        occupants: [
          {
            subjectNo: '',
            name: '',
            deptName: DEPT_OPTIONS[0],
            dutyScope: OPM_DUTY_SCOPE_OPTIONS[0],
            isRegistered: true,
          },
        ],
      };
    }

    return {
      seqNo: editingRow.seqNo,
      roomCode: editingRow.roomCode,
      location: editingRow.location,
      roomType: editingRow.roomType,
      area: editingRow.area,
      approvedOccupancy: editingRow.approvedOccupancy,
      violationTypes: editingRow.violationTypes.length ? editingRow.violationTypes : ['无'],
      occupants: editingRow.occupants.length
        ? editingRow.occupants
        : [
            {
              subjectNo: '',
              name: '',
              deptName: DEPT_OPTIONS[0],
              dutyScope: OPM_DUTY_SCOPE_OPTIONS[0],
              isRegistered: true,
            },
          ],
    };
  }, [editingRow]);

  const [form, setForm] = useState<OneRoomMultiPersonForm>(initialForm);

  useEffect(() => {
    if (isFormOpen) setForm(initialForm);
  }, [isFormOpen, initialForm]);

  const cleanedOccupants = useMemo(() => {
    return form.occupants
      .map(o => ({ ...o, subjectNo: o.subjectNo.trim(), name: o.name.trim() }))
      .filter(o => o.subjectNo || o.name);
  }, [form.occupants]);

  const compliancePreview = useMemo(() => {
    return computeOpmComplianceStatuses({
      approvedOccupancy: form.approvedOccupancy,
      occupants: cleanedOccupants,
      violationTypes: form.violationTypes,
    });
  }, [cleanedOccupants, form.approvedOccupancy, form.violationTypes]);

  const filteredRows = useMemo(() => {
    const k = keyword.trim();
    if (!k) return rows;
    return rows.filter(r => r.seqNo.includes(k) || r.roomCode.includes(k) || r.location.includes(k));
  }, [keyword, rows]);

  const save = () => {
    const roomCode = form.roomCode.trim();
    if (!roomCode) return;

    const occupants = cleanedOccupants;
    const violations = normalizeOpmViolationTypes(form.violationTypes);

    if (!editingId) {
      const existing = rows.find(r => r.roomCode === roomCode);
      if (existing) {
        setRows(prev => prev.map(r => (r.id === existing.id ? mergeRoom(r, { form, occupants, violations }) : r)));
        setIsFormOpen(false);
        return;
      }

      const statuses = computeOpmComplianceStatuses({
        approvedOccupancy: Number(form.approvedOccupancy) || 0,
        occupants,
        violationTypes: violations,
      });

      const newRow: OneRoomMultiPersonRow = {
        id: `ORMP-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        seqNo: form.seqNo,
        roomCode,
        location: form.location.trim(),
        roomType: form.roomType,
        area: Number(form.area) || 0,
        approvedOccupancy: Number(form.approvedOccupancy) || 0,
        occupants,
        actualOccupancy: occupants.length,
        violationTypes: violations,
        complianceStatuses: statuses,
      };

      setRows(prev => [newRow, ...prev]);
      setIsFormOpen(false);
      return;
    }

    setRows(prev =>
      prev.map(r => {
        if (r.id !== editingId) return r;
        const statuses = computeOpmComplianceStatuses({
          approvedOccupancy: Number(form.approvedOccupancy) || 0,
          occupants,
          violationTypes: violations,
        });

        return {
          ...r,
          seqNo: form.seqNo,
          roomCode,
          location: form.location.trim(),
          roomType: form.roomType,
          area: Number(form.area) || 0,
          approvedOccupancy: Number(form.approvedOccupancy) || 0,
          occupants,
          actualOccupancy: occupants.length,
          violationTypes: violations,
          complianceStatuses: statuses,
        };
      })
    );

    setRows(prev => {
      const current = prev.find(r => r.id === editingId);
      if (!current) return prev;
      const conflict = prev.find(r => r.id !== editingId && r.roomCode === current.roomCode);
      if (!conflict) return prev;

      const mergedRow = mergeRoom(conflict, { form, occupants, violations });
      return prev.filter(r => r.id !== editingId).map(r => (r.id === conflict.id ? mergedRow : r));
    });

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
          <h3 className="font-bold text-[#1f2329]">一房多人（按房间维度）</h3>
          <p className="text-sm text-[#646a73] mt-1">支持增删改；同一“公用房编号”会自动整合到已有记录，并自动更新合规状态。</p>
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
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">公用房编号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">公用房位置</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">公用房类型</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">面积</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">核定占用人数</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">实际占用总人数</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">占用主体编号 / 姓名 / 部门</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">占用主体职责 / 使用范围</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">合规状态</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">违规类型</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRows.map(row => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{row.seqNo}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-[#1f2329]">{row.roomCode}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.location}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.roomType}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">{formatArea(row.area)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">{row.approvedOccupancy}</td>
                <td className={`px-4 py-3 text-right whitespace-nowrap ${row.actualOccupancy > row.approvedOccupancy ? 'text-red-600 font-medium' : ''}`}>
                  {row.actualOccupancy}
                </td>
                <td className="px-4 py-3 min-w-[260px]">
                  <div className="flex flex-col gap-1">
                    {row.occupants.map((o, idx) => (
                      <div key={`${row.id}-o-${idx}`} className="text-xs text-[#1f2329]">
                        {o.subjectNo} / {o.name} / {o.deptName}{o.isRegistered ? '' : '（未备案）'}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 min-w-[260px]">
                  <div className="flex flex-col gap-1">
                    {row.occupants.map((o, idx) => (
                      <div key={`${row.id}-d-${idx}`} className="text-xs text-[#1f2329]">
                        {o.dutyScope}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 min-w-[220px]">
                  <Tags values={row.complianceStatuses} getClassName={v => getOpmComplianceBadgeClass(v)} emptyText="完全合规" />
                </td>
                <td className="px-4 py-3 min-w-[260px]">
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
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingId(null);
        }}
        title={`${editingId ? '编辑' : '新增'}一房多人记录`}
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
              <label className="block text-sm font-medium mb-1">序号</label>
              <input value={form.seqNo} onChange={e => setForm(prev => ({ ...prev, seqNo: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">公用房编号 <span className="text-red-500">*</span></label>
              <input
                value={form.roomCode}
                onChange={e => setForm(prev => ({ ...prev, roomCode: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="如：RM-ADM-502"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">公用房位置</label>
              <input
                value={form.location}
                onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="如：行政楼 5F 502"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">公用房类型</label>
              <select
                value={form.roomType}
                onChange={e => setForm(prev => ({ ...prev, roomType: e.target.value as PublicHouseType }))}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {ROOM_TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">面积</label>
              <input type="number" value={form.area} onChange={e => setForm(prev => ({ ...prev, area: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">核定占用人数</label>
              <input
                type="number"
                value={form.approvedOccupancy}
                onChange={e => setForm(prev => ({ ...prev, approvedOccupancy: Number(e.target.value) }))}
                className="w-full border rounded px-3 py-2 text-sm"
                min={0}
              />
            </div>
          </div>

          <ViolationSelector
            value={form.violationTypes}
            onChange={next => setForm(prev => ({ ...prev, violationTypes: next }))}
            compliancePreview={compliancePreview}
          />

          <OccupantEditor
            occupants={form.occupants}
            onChange={next => setForm(prev => ({ ...prev, occupants: next }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="确认删除"
        message={
          <>
            确定要删除 <span className="font-medium">{deleteConfirm?.roomCode}</span> 的记录吗？
          </>
        }
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PublicHouseOneRoomMultiPerson;






