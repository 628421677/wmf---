import React, { useEffect, useMemo, useState } from 'react';
import CommercialOverviewOccupancyDonut from './CommercialOverviewOccupancyDonut';

export type BusinessTenantType = '校内企业' | '校外企业' | '个体工商户' | '合作机构';
export type RoomRentStatus = '空房' | '已出租';
export type BusinessComplianceStatus = '完全合规' | '超范围经营' | '欠缴租金' | '合同到期未续签' | '违规转租';

export interface CommercialSpaceItem {
  id: string;
  name: string;
  area: number;
  status: '公开招租' | '招租结束' | '已出租' | '维修中';
  monthlyRent?: number;
}

export interface CommercialContractItem {
  id: string;
  contractNo: string;
  spaceId: string;
  spaceName: string;
  area: number;
  tenant: string;
  tenantContact: string;
  rentPerMonth: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'Terminated';
  totalRentReceived: number;
  outstandingRent: number;
  performanceRating?: number;
}

export interface CommercialRentBill {
  id: string;
  contractId: string;
  spaceName: string;
  tenant: string;
  period: string;
  rentAmount: number;
  lateFee: number;
  totalAmount: number;
  dueDate: string;
  status: 'Unpaid' | 'PartialPaid' | 'Paid' | 'Overdue';
  paidAmount: number;
  paidDate?: string;
  paymentMethod?: string;
  transactionNo?: string;
  reminderCount: number;
  lastReminderDate?: string;
}

export interface CommercialOverviewRow {
  id: string;
  roomId: string;
  building: string;
  floor: string;
  roomNo: string;
  department: string;
  roomNature: string;
  area: number;
  status: RoomRentStatus;
  monthlyRent: number | '';
  tenantName: string;
  tenantType: BusinessTenantType | '';
  contactPhone: string;
  approvedBusiness: string;
  actualBusiness: string;
  businessCategory: string;
  contractNo: string;
  leaseRange: string;
  rentStandard: string;
  paymentCycle: string;
  avgMonthlyIncome: string;
  complianceStatus: BusinessComplianceStatus;
  remark: string;
}

export interface CreateFromOverviewPayload {
  roomId: string;
  building: string;
  floor: string;
  roomNo: string;
  area: number;
  monthlyRent: number;
  tenantName: string;
  tenantContact: string;
  startDate: string;
  endDate: string;
  contractNo: string;
}

export interface CommercialHousingOverviewProps {
  spaces: CommercialSpaceItem[];
  contracts: CommercialContractItem[];
  rentBills: CommercialRentBill[];
  onCreateFromOverview?: (payload: CreateFromOverviewPayload) => void;
}

const COOKIE_KEY = 'commercial_overview_rows_v1';

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : '';
};

const setCookie = (name: string, value: string, days = 30) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const loadRowsFromCookie = (): CommercialOverviewRow[] => {
  try {
    const raw = getCookie(COOKIE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveRowsToCookie = (rows: CommercialOverviewRow[]) => {
  try {
    setCookie(COOKIE_KEY, JSON.stringify(rows));
  } catch {
    // ignore
  }
};

const formatYmdRange = (start?: string, end?: string) => {
  if (!start || !end) return '';
  return `${start} ~ ${end}`;
};

const calcRentStandard = (rentPerMonth?: number, area?: number) => {
  if (!rentPerMonth || !area) return '';
  const v = rentPerMonth / area;
  return `${v.toFixed(2)}（不含税）`;
};

const getComplianceBadgeClass = (status: BusinessComplianceStatus) => {
  switch (status) {
    case '完全合规':
      return 'bg-green-50 text-green-700 border-green-200';
    case '超范围经营':
    case '违规转租':
      return 'bg-red-50 text-red-700 border-red-200';
    case '欠缴租金':
    case '合同到期未续签':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const inferPhone = (tenantContact: string) => {
  const m = tenantContact.match(/(1\d{10})/);
  return m ? m[1] : '';
};

const inferTenantType = (tenant: string): BusinessTenantType => {
  if (tenant.includes('合作') || tenant.includes('集团')) return '合作机构';
  if (tenant.includes('有限公司') || tenant.includes('公司')) return '校外企业';
  return '个体工商户';
};

const inferBusinessCategory = (actual: string): string => {
  if (actual.includes('咖啡') || actual.includes('餐') || actual.includes('美食')) return '餐饮服务';
  if (actual.includes('培训') || actual.includes('教育')) return '教育培训';
  if (actual.includes('文具') || actual.includes('打印') || actual.includes('零售')) return '零售服务';
  return '其他';
};

const inferApprovedBusiness = (spaceName: string): string => {
  if (spaceName.includes('商铺')) return '文具店';
  if (spaceName.includes('培训')) return '教育培训';
  if (spaceName.includes('办公室')) return '办公服务';
  return '待备案';
};

const inferActualBusiness = (tenant: string, spaceName: string): string => {
  if (tenant.includes('餐饮') || spaceName.includes('商铺')) return '咖啡店';
  if (spaceName.includes('培训')) return '教育培训';
  return inferApprovedBusiness(spaceName);
};

const computeComplianceStatus = (
  contract: CommercialContractItem | undefined,
  approved: string,
  actual: string,
  hasArrearsBill: boolean
): BusinessComplianceStatus => {
  if (contract) {
    if (hasArrearsBill || contract.outstandingRent > 0) return '欠缴租金';
    if (new Date(contract.endDate).getTime() < Date.now()) return '合同到期未续签';
  }
  if (approved && actual && approved !== actual) return '超范围经营';
  return '完全合规';
};

const calcAvgMonthlyIncomeFromBills = (contractId: string, rentBills: CommercialRentBill[]) => {
  const paidBills = rentBills.filter(b => b.contractId === contractId && b.status === 'Paid' && b.paidAmount > 0);
  if (paidBills.length === 0) return '';
  const total = paidBills.reduce((sum, b) => sum + b.paidAmount, 0);
  return String(Math.round(total / paidBills.length));
};

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-[#1f2329] mb-1">{children}</label>
);

const RowUpsertModal: React.FC<{
  initial: CommercialOverviewRow | null;
  floorOptions: string[];
  departmentOptions: string[];
  roomNatureOptions: string[];
  tenantTypeOptions: (BusinessTenantType | '')[];
  statusOptions: RoomRentStatus[];
  paymentCycleOptions: string[];
  approvedBusinessOptions: string[];
  businessCategoryOptions: string[];
  genContractNo: () => string;
  calcAvgMonthlyIncome: (contractNo: string) => string;
  onClose: () => void;
  onSubmit: (row: CommercialOverviewRow) => void;
}> = ({
  initial,
  floorOptions,
  departmentOptions,
  roomNatureOptions,
  tenantTypeOptions,
  statusOptions,
  paymentCycleOptions,
  approvedBusinessOptions,
  businessCategoryOptions,
  genContractNo,
  calcAvgMonthlyIncome,
  onClose,
  onSubmit,
}) => {
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');

  const [form, setForm] = useState<CommercialOverviewRow>(() =>
    initial || {
      id: `OV-${Date.now()}`,
      roomId: '',
      building: '',
      floor: floorOptions[0] || '1F',
      roomNo: '',
      department: departmentOptions[0] || '资产经营公司',
      roomNature: roomNatureOptions[0] || '商业/产业用房',
      area: 0,
      status: '空房',
      monthlyRent: '',
      tenantName: '',
      tenantType: '',
      contactPhone: '',
      approvedBusiness: approvedBusinessOptions[0] || '',
      actualBusiness: '',
      businessCategory: businessCategoryOptions[0] || '',
      contractNo: '',
      leaseRange: '',
      rentStandard: '',
      paymentCycle: '',
      avgMonthlyIncome: '',
      complianceStatus: '完全合规',
      remark: '',
    }
  );

  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setForm(initial);
      const parts = (initial.leaseRange || '').split('~').map(s => s.trim());
      setLeaseStart(parts[0] || '');
      setLeaseEnd(parts[1] || '');
    } else {
      setForm(prev => ({
        ...prev,
        contractNo: genContractNo(),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      leaseRange: leaseStart && leaseEnd ? formatYmdRange(leaseStart, leaseEnd) : '',
    }));
  }, [leaseStart, leaseEnd]);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      avgMonthlyIncome: prev.contractNo ? calcAvgMonthlyIncome(prev.contractNo) : '',
    }));
  }, [form.contractNo, calcAvgMonthlyIncome]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-[#1f2329]">{isEdit ? '编辑' : '新增'}房间台账</h3>
          <button type="button" className="text-sm text-[#646a73] hover:text-[#1f2329]" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>房间编号</FieldLabel>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.roomId}
              onChange={e => setForm(prev => ({ ...prev, roomId: e.target.value }))}
              placeholder="例如 SP-005 / 自定义编码"
            />
          </div>

          <div>
            <FieldLabel>楼栋</FieldLabel>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.building}
              onChange={e => setForm(prev => ({ ...prev, building: e.target.value }))}
              placeholder="例如 商业楼"
            />
          </div>

          <div>
            <FieldLabel>楼层</FieldLabel>
            <select
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.floor}
              onChange={e => setForm(prev => ({ ...prev, floor: e.target.value }))}
            >
              {floorOptions.map(o => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>房间号</FieldLabel>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.roomNo}
              onChange={e => setForm(prev => ({ ...prev, roomNo: e.target.value }))}
              placeholder="例如 101"
            />
          </div>

          <div>
            <FieldLabel>所属部门</FieldLabel>
            <select
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.department}
              onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
            >
              {departmentOptions.map(o => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>房间性质</FieldLabel>
            <select
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.roomNature}
              onChange={e => setForm(prev => ({ ...prev, roomNature: e.target.value }))}
            >
              {roomNatureOptions.map(o => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>承租方类型</FieldLabel>
            <select
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.tenantType}
              onChange={e => setForm(prev => ({ ...prev, tenantType: e.target.value as any }))}
            >
              {tenantTypeOptions.map(o => (
                <option key={o || 'empty'} value={o}>
                  {o || '—'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>状态（空房/已出租）</FieldLabel>
            <select
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.status}
              onChange={e => setForm(prev => ({ ...prev, status: e.target.value as RoomRentStatus }))}
            >
              {statusOptions.map(o => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>租赁起始日期</FieldLabel>
            <input
              type="date"
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={leaseStart}
              onChange={e => setLeaseStart(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>租赁结束日期</FieldLabel>
            <input
              type="date"
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={leaseEnd}
              onChange={e => setLeaseEnd(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>合同编号（自动生成）</FieldLabel>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm bg-[#f5f6f7]"
              value={form.contractNo}
              readOnly
            />
          </div>

          <div>
            <FieldLabel>租金支付方式 / 周期</FieldLabel>
            <select
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.paymentCycle}
              onChange={e => setForm(prev => ({ ...prev, paymentCycle: e.target.value }))}
            >
              {paymentCycleOptions.map(o => (
                <option key={o || 'empty'} value={o}>
                  {o || '—'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>面积（㎡）</FieldLabel>
            <input
              type="number"
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.area}
              onChange={e => setForm(prev => ({ ...prev, area: Number(e.target.value) }))}
              min={0}
            />
          </div>

          <div>
            <FieldLabel>月租金（元）</FieldLabel>
            <input
              type="number"
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.monthlyRent === '' ? '' : form.monthlyRent}
              onChange={e => {
                const v = e.target.value;
                setForm(prev => ({ ...prev, monthlyRent: v === '' ? '' : Number(v) }));
              }}
              min={0}
            />
          </div>

          <div>
            <FieldLabel>租金标准（元/㎡/月）</FieldLabel>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.rentStandard}
              onChange={e => setForm(prev => ({ ...prev, rentStandard: e.target.value }))}
              placeholder="例如 80.00（不含税）"
            />
          </div>

          <div>
            <FieldLabel>租户名</FieldLabel>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.tenantName}
              onChange={e => setForm(prev => ({ ...prev, tenantName: e.target.value }))}
              placeholder="空房可不填"
            />
          </div>

          <div>
            <FieldLabel>联系电话</FieldLabel>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.contactPhone}
              onChange={e => setForm(prev => ({ ...prev, contactPhone: e.target.value }))}
              placeholder="例如 13800138000"
            />
          </div>

          <div>
            <FieldLabel>核定经营项目</FieldLabel>
            <select
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.approvedBusiness}
              onChange={e => setForm(prev => ({ ...prev, approvedBusiness: e.target.value }))}
            >
              {approvedBusinessOptions.map(o => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>实际经营项目</FieldLabel>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.actualBusiness}
              onChange={e => setForm(prev => ({ ...prev, actualBusiness: e.target.value }))}
            />
          </div>

          <div>
            <FieldLabel>经营业态分类</FieldLabel>
            <select
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={form.businessCategory}
              onChange={e => setForm(prev => ({ ...prev, businessCategory: e.target.value }))}
            >
              {businessCategoryOptions.map(o => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>月均租金收入（元，系统计算）</FieldLabel>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm bg-[#f5f6f7]"
              value={form.avgMonthlyIncome}
              readOnly
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>备注</FieldLabel>
            <textarea
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm h-20"
              value={form.remark}
              onChange={e => setForm(prev => ({ ...prev, remark: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2 text-xs text-[#8f959e]">
            合规状态将根据“租金收缴”自动判定：如存在待缴/逾期账单，会自动显示为“欠缴租金”。
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[#dee0e3] rounded text-sm hover:bg-slate-50">
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              if (!form.contractNo && !isEdit) {
                setForm(prev => ({ ...prev, contractNo: genContractNo() }));
              }
              onSubmit(form);
            }}
            className="px-4 py-2 bg-[#3370ff] hover:bg-[#285cc9] text-white rounded text-sm"
            disabled={!form.roomId || !form.building || !form.roomNo}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteModal: React.FC<{ onCancel: () => void; onConfirm: () => void }> = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onCancel}>
    <div className="bg-white w-full max-w-sm rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-[#1f2329]">确认删除</h3>
      </div>
      <div className="p-4 text-sm text-[#646a73]">删除后不可恢复，是否继续？</div>
      <div className="p-4 border-t flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-[#dee0e3] rounded text-sm hover:bg-slate-50">
          取消
        </button>
        <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
          删除
        </button>
      </div>
    </div>
  </div>
);

const CommercialHousingOverview: React.FC<CommercialHousingOverviewProps> = ({ spaces, contracts, rentBills, onCreateFromOverview }) => {
  const derivedRows = useMemo<CommercialOverviewRow[]>(() => {
    const contractBySpaceId = new Map<string, CommercialContractItem>();
    contracts.forEach(c => contractBySpaceId.set(c.spaceId, c));

    const billsByContractId = new Map<string, CommercialRentBill[]>();
    rentBills.forEach(b => {
      const list = billsByContractId.get(b.contractId) || [];
      list.push(b);
      billsByContractId.set(b.contractId, list);
    });

    return spaces.map((s) => {
      const contract = contractBySpaceId.get(s.id);
      const rented = s.status === '已出租' && !!contract;

      const approvedBusiness = inferApprovedBusiness(s.name);
      const actualBusiness = rented ? inferActualBusiness(contract!.tenant, s.name) : '';

      const hasArrearsBill =
        !!contract &&
        (billsByContractId.get(contract.id) || []).some(b => b.status === 'Unpaid' || b.status === 'Overdue');
      const complianceStatus = computeComplianceStatus(contract, approvedBusiness, actualBusiness, hasArrearsBill);

      return {
        id: s.id,
        roomId: s.id,
        building: '商业楼',
        floor: '1F',
        roomNo: s.name,
        department: '资产经营公司',
        roomNature: '商业/产业用房',
        area: s.area,
        status: rented ? '已出租' : '空房',
        monthlyRent: rented ? contract!.rentPerMonth : '',
        tenantName: rented ? contract!.tenant : '',
        tenantType: rented ? inferTenantType(contract!.tenant) : '',
        contactPhone: rented ? inferPhone(contract!.tenantContact) : '',
        approvedBusiness: approvedBusiness,
        actualBusiness: actualBusiness,
        businessCategory: rented ? inferBusinessCategory(actualBusiness) : '',
        contractNo: rented ? contract!.contractNo : '',
        leaseRange: rented ? formatYmdRange(contract!.startDate, contract!.endDate) : '',
        rentStandard: rented ? calcRentStandard(contract!.rentPerMonth, contract!.area) : '',
        paymentCycle: rented ? '按月支付 / 转账' : '',
        avgMonthlyIncome: rented && contract ? calcAvgMonthlyIncomeFromBills(contract.id, rentBills) || String(contract.rentPerMonth) : '',
        complianceStatus,
        remark: '',
      };
    });
  }, [spaces, contracts, rentBills]);

  const [rows, setRows] = useState<CommercialOverviewRow[]>(() => {
    const saved = loadRowsFromCookie();
    return saved.length > 0 ? saved : derivedRows;
  });

  const [showRowModal, setShowRowModal] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);

  useEffect(() => {
    // 若 cookie 为空，则用系统派生数据初始化一次
    const saved = loadRowsFromCookie();
    if (saved.length === 0) {
      setRows(derivedRows);
      saveRowsToCookie(derivedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveRowsToCookie(rows);
  }, [rows]);

  const contractByNo = useMemo(() => {
    const m = new Map<string, CommercialContractItem>();
    contracts.forEach(c => m.set(c.contractNo, c));
    return m;
  }, [contracts]);

  const billsByContractId = useMemo(() => {
    const m = new Map<string, CommercialRentBill[]>();
    rentBills.forEach(b => {
      const list = m.get(b.contractId) || [];
      list.push(b);
      m.set(b.contractId, list);
    });
    return m;
  }, [rentBills]);

  const genContractNo = () => {
    const year = new Date().getFullYear();
    let idx = 1;
    while (idx < 9999) {
      const no = `JYXF-${year}-${String(idx).padStart(3, '0')}`;
      const exists = rows.some(r => r.contractNo === no) || contracts.some(c => c.contractNo === no);
      if (!exists) return no;
      idx++;
    }
    return `JYXF-${year}-${Date.now()}`;
  };

  const calcAvgMonthlyIncomeByContractNo = (contractNo: string) => {
    const c = contractByNo.get(contractNo);
    if (!c) return '';
    return calcAvgMonthlyIncomeFromBills(c.id, rentBills) || String(c.rentPerMonth);
  };

  const occupiedCount = useMemo(() => {
    const countFromSpaces = spaces.filter(s => s.status === '已出租').length;
    const countFromContracts = contracts.length;
    return Math.max(countFromSpaces, countFromContracts);
  }, [spaces, contracts]);

  const vacantCount = useMemo(() => {
    const total = 10;
    return Math.max(0, total - occupiedCount);
  }, [occupiedCount]);

  const computedRows = useMemo(() => {
    return rows.map(r => {
      const contract = r.contractNo ? contractByNo.get(r.contractNo) : undefined;
      const hasArrearsBill =
        !!contract &&
        (billsByContractId.get(contract.id) || []).some(b => b.status === 'Unpaid' || b.status === 'Overdue');
      const complianceStatus = computeComplianceStatus(contract, r.approvedBusiness, r.actualBusiness, hasArrearsBill);

      const avgMonthlyIncome = r.contractNo ? calcAvgMonthlyIncomeByContractNo(r.contractNo) : '';

      return {
        ...r,
        complianceStatus,
        avgMonthlyIncome,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, contractByNo, billsByContractId]);

  const getEditingRow = () => {
    if (!editingRowId) return null;
    return rows.find(r => r.id === editingRowId) || null;
  };

  const floorOptions = ['1F', '2F', '3F', '4F', '5F', '6F', '7F'];
  const departmentOptions = ['资产经营公司', '后勤保障处', '资产管理处', '信息化部门'];
  const roomNatureOptions = ['商业/产业用房', '商业用房', '产业用房'];
  const tenantTypeOptions: (BusinessTenantType | '')[] = ['', '校内企业', '校外企业', '个体工商户', '合作机构'];
  const statusOptions: RoomRentStatus[] = ['空房', '已出租'];
  const paymentCycleOptions = ['', '按月支付 / 转账', '按季支付 / 转账', '按月支付 / 现金', '按季支付 / 现金'];
  const approvedBusinessOptions = ['文具店', '咖啡店', '餐饮服务', '教育培训', '办公服务', '零售服务', '待备案'];
  const businessCategoryOptions = ['餐饮服务', '教育培训', '零售服务', '其他'];



  const openEditModal = (id: string) => {
    setEditingRowId(id);
    setShowRowModal(true);
  };

  const closeModal = () => {
    setShowRowModal(false);
    setEditingRowId(null);
  };

  const handleUpsert = (next: CommercialOverviewRow) => {
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === next.id);
      if (idx >= 0) {
        const cp = [...prev];
        cp[idx] = next;
        return cp;
      }
      return [next, ...prev];
    });

    if (!editingRowId && onCreateFromOverview && next.status === '已出租') {
      const startDate = (next.leaseRange || '').split('~')[0]?.trim() || '';
      const endDate = (next.leaseRange || '').split('~')[1]?.trim() || '';
      const monthlyRent = typeof next.monthlyRent === 'number' ? next.monthlyRent : 0;
      if (startDate && endDate && monthlyRent > 0) {
        onCreateFromOverview({
          roomId: next.roomId,
          building: next.building,
          floor: next.floor,
          roomNo: next.roomNo,
          area: next.area,
          monthlyRent,
          tenantName: next.tenantName,
          tenantContact: next.contactPhone,
          startDate,
          endDate,
          contractNo: next.contractNo,
        });
      }
    }

    closeModal();
  };

  const handleConfirmDelete = () => {
    if (!deletingRowId) return;
    setRows(prev => prev.filter(r => r.id !== deletingRowId));
    setDeletingRowId(null);
  };

  return (
    <div className="bg-white rounded-lg border border-[#dee0e3] overflow-hidden">
      <div className="p-4 border-b flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#1f2329]">商业/产业用房总览（按房间维度）</h3>
          <p className="text-sm text-[#646a73] mt-1">字段可逐步对接合同台账/租金收缴/经营备案与巡查记录。</p>
        </div>

      </div>

      <div className="px-4 py-4 border-b bg-white">
        <CommercialOverviewOccupancyDonut total={10} occupied={occupiedCount} vacant={vacantCount} />
        <div className="mt-2 text-xs text-[#8f959e]">总数暂定 10 间（预留接口：后续可从“资产建设与转固”模块对接总房间数）</div>
      </div>

      {showRowModal && (
        <RowUpsertModal
          initial={getEditingRow()}
          floorOptions={floorOptions}
          departmentOptions={departmentOptions}
          roomNatureOptions={roomNatureOptions}
          tenantTypeOptions={tenantTypeOptions}
          statusOptions={statusOptions}
          paymentCycleOptions={paymentCycleOptions}
          approvedBusinessOptions={approvedBusinessOptions}
          businessCategoryOptions={businessCategoryOptions}
          genContractNo={genContractNo}
          calcAvgMonthlyIncome={calcAvgMonthlyIncomeByContractNo}
          onClose={closeModal}
          onSubmit={handleUpsert}
        />
      )}

      {deletingRowId && (
        <ConfirmDeleteModal onCancel={() => setDeletingRowId(null)} onConfirm={handleConfirmDelete} />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[#646a73]">
            <tr>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">序号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">房间编号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">楼栋</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">楼层</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">房间号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">所属部门</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">房间性质</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">面积</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">状态（空房/已出租）</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">月租金</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">租户名</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">承租方类型</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">联系电话</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">核定经营项目</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">实际经营项目</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">经营业态分类</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">租赁合同编号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">租赁起止日期</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">租金标准（元/㎡/月）</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">租金支付方式 / 周期</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">月均租金收入（元）</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">合规状态</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">备注</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {computedRows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-[#1f2329]">{row.roomId}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.building}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.floor}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.roomNo}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.department}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.roomNature}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">{row.area}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.status}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {row.monthlyRent === '' ? '-' : row.monthlyRent.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{row.tenantName || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.tenantType || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.contactPhone || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.approvedBusiness || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.actualBusiness || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.businessCategory || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.contractNo || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.leaseRange || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.rentStandard || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.paymentCycle || '-'}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">{row.avgMonthlyIncome || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded border text-xs font-medium ${getComplianceBadgeClass(row.complianceStatus)}`}
                  >
                    {row.complianceStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{row.remark || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => openEditModal(row.id)} className="text-xs text-[#3370ff] hover:underline">
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingRowId(row.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommercialHousingOverview;
