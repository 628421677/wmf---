import React, { useState, useEffect, useMemo } from 'react';
import ApartmentHousingOverview from './ApartmentHousingOverview';
import {
  Building2, Home, FileText, AlertTriangle, Plus, X, Eye, Trash2, UserPlus,
  DollarSign, Calendar, Bell, TrendingUp, TrendingDown, Download, Search,
  CheckCircle, XCircle, Clock, AlertCircle, Users, BarChart3, Receipt,
  Phone, Mail, Star, Key, Droplet, Zap, Edit2, RefreshCw, Send, Filter,
  ChevronRight, ChevronDown, Award, Printer, CreditCard, History
} from 'lucide-react';
import { UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from 'recharts';
import CommercialHousingOverview, { CreateFromOverviewPayload } from './CommercialHousingOverview';
import { ContractUpsertModal, DeleteConfirmationModal } from './ContractModals';
import { BidListModal } from './BidModals';
import type { BidItem } from './BidModals';

// ==================== 数据类型定义 ====================

export interface SpaceItem {
  id: string;
  name: string;
  area: number;
  vrUrl?: string;
  bids: BidItem[];
  status: '公开招租' | '招租结束' | '已出租' | '维修中';
  monthlyRent?: number;
  photos?: string[];
}



export interface ContractItem {
  id: string;
  contractNo: string;
  spaceId: string;
  spaceName: string;
  area: number;
  tenant: string;
  tenantContact: string;
  tenantLicense?: string;
  rentPerMonth: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'Terminated';
  signDate: string;
  totalRentReceived: number;
  outstandingRent: number;
  performanceRating?: number;
}

interface RentBill {
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

interface ApartmentApplication {
  id: string;
  applicant: string;
  applicantId: string;
  department: string;
  phone: string;
  title: string;
  familyMembers: number;
  applyDate: string;
  expectedMoveInDate: string;
  reason: string;
  status: 'Draft' | 'PendingHR' | 'PendingAsset' | 'Approved' | 'Rejected' | 'CheckedIn' | 'CheckedOut';
  currentApprover?: string;
  approvalRecords: ApprovalRecord[];
  allocatedRoomId?: string;
  allocatedRoomNo?: string;
  checkInDate?: string;
  checkOutDate?: string;
  utilitiesCost?: number;
  depositReturned?: boolean;
}

interface ApprovalRecord {
  id: string;
  level: number;
  approverRole: string;
  approverName: string;
  action: 'Approve' | 'Reject' | 'Return';
  comment: string;
  timestamp: string;
}

interface ApartmentRoom {
  id: string;
  roomNo: string;
  building: string;
  floor: number;
  area: number;
  layout: string;
  facilities: string[];
  monthlyRent: number;
  deposit: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  currentTenant?: string;
  occupiedSince?: string;
}

interface UtilityReading {
  id: string;
  roomId: string;
  roomNo: string;
  tenant: string;
  meterType: 'Water' | 'Electric';
  readingDate: string;
  previousReading: number;
  currentReading: number;
  usage: number;
  unitPrice: number;
  amount: number;
  reader: string;
}

interface UtilityBill {
  id: string;
  roomId: string;
  roomNo: string;
  tenant: string;
  period: string;
  waterUsage: number;
  waterAmount: number;
  electricUsage: number;
  electricAmount: number;
  totalAmount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid';
  paidDate?: string;
}

interface DepositRecord {
  id: string;
  tenant: string;
  roomNo: string;
  depositAmount: number;
  paidDate: string;
  status: 'Held' | 'Returned' | 'Forfeited';
  deductions: { type: string; amount: number; description: string }[];
  returnAmount?: number;
  returnDate?: string;
}

// ==================== 初始数据 ====================

const initSpaces: SpaceItem[] = [
  {
    id: 'SP-001',
    name: '一层 101 商铺',
    area: 120,
    status: '公开招租',
    monthlyRent: 9600,
    bids: [
      {
        id: 'BID-SP-001-001',
        company: '福州星河餐饮管理有限公司',
        contactPerson: '张经理',
        contactPhone: '13800138001',
        amount: 9800,
        depositPaid: true,
        bidDate: '2025-01-12',
        status: 'Valid',
      },
      {
        id: 'BID-SP-001-002',
        company: '福建德胜便利商业有限公司',
        contactPerson: '李总',
        contactPhone: '13900139002',
        amount: 10200,
        depositPaid: true,
        bidDate: '2025-01-13',
        status: 'Valid',
      },
      {
        id: 'BID-SP-001-003',
        company: '福州悦享咖啡有限公司',
        contactPerson: '王主管',
        contactPhone: '13700137003',
        amount: 9500,
        depositPaid: false,
        bidDate: '2025-01-14',
        status: 'Valid',
      },
      {
        id: 'BID-SP-001-004',
        company: '福建校园优选超市有限公司',
        contactPerson: '赵经理',
        contactPhone: '18600186001',
        amount: 11000,
        depositPaid: true,
        bidDate: '2025-01-15',
        status: 'Valid',
      },
      {
        id: 'BID-SP-001-005',
        company: '福州轻食研究所餐饮有限公司',
        contactPerson: '林总',
        contactPhone: '18800188002',
        amount: 10600,
        depositPaid: true,
        bidDate: '2025-01-16',
        status: 'Valid',
      },
      {
        id: 'BID-SP-001-006',
        company: '福建乐享烘焙有限公司',
        contactPerson: '黄主管',
        contactPhone: '18500185003',
        amount: 9200,
        depositPaid: true,
        bidDate: '2025-01-17',
        status: 'Valid',
      },
      {
        id: 'BID-SP-001-007',
        company: '福州小满茶饮有限公司',
        contactPerson: '吴经理',
        contactPhone: '18700187004',
        amount: 11400,
        depositPaid: false,
        bidDate: '2025-01-18',
        status: 'Valid',
      },
      {
        id: 'BID-SP-001-008',
        company: '福建佳味餐饮有限公司',
        contactPerson: '孙经理',
        contactPhone: '18900189005',
        amount: 11800,
        depositPaid: true,
        bidDate: '2025-01-19',
        status: 'Valid',
      },
      {
        id: 'BID-SP-001-009',
        company: '福州拾光甜品有限公司',
        contactPerson: '周经理',
        contactPhone: '13300133006',
        amount: 10000,
        depositPaid: true,
        bidDate: '2025-01-20',
        status: 'Valid',
      },
      {
        id: 'BID-SP-001-010',
        company: '福建百味小吃管理有限公司',
        contactPerson: '郑主管',
        contactPhone: '13400134007',
        amount: 10800,
        depositPaid: false,
        bidDate: '2025-01-21',
        status: 'Valid',
      },
    ],
  },
  {
    id: 'SP-002',
    name: '二层 201 办公室',
    area: 150,
    status: '公开招租',
    monthlyRent: 12000,
    bids: [
      {
        id: 'BID-SP-002-001',
        company: '福建海岳咨询服务有限公司',
        contactPerson: '陈经理',
        contactPhone: '13600136001',
        amount: 12500,
        depositPaid: true,
        bidDate: '2025-01-10',
        status: 'Valid',
      },
      {
        id: 'BID-SP-002-002',
        company: '福州新航科技有限公司',
        contactPerson: '周总',
        contactPhone: '13500135002',
        amount: 13200,
        depositPaid: true,
        bidDate: '2025-01-11',
        status: 'Valid',
      },
    ],
  },
  {
    id: 'SP-003',
    name: '一层 103 商铺',
    area: 80,
    status: '公开招租',
    monthlyRent: 8000,
    bids: [
      {
        id: 'BID-SP-003-001',
        company: '福州鲜果优选有限公司',
        contactPerson: '林主管',
        contactPhone: '15800158001',
        amount: 8200,
        depositPaid: true,
        bidDate: '2025-01-09',
        status: 'Valid',
      },
      {
        id: 'BID-SP-003-002',
        company: '福建暖心便利商业有限公司',
        contactPerson: '黄经理',
        contactPhone: '15900159002',
        amount: 8600,
        depositPaid: false,
        bidDate: '2025-01-10',
        status: 'Valid',
      },
      {
        id: 'BID-SP-003-003',
        company: '福州学府文创有限公司',
        contactPerson: '吴总',
        contactPhone: '15000150003',
        amount: 9000,
        depositPaid: true,
        bidDate: '2025-01-11',
        status: 'Valid',
      },
    ],
  },
  {
    id: 'SP-004',
    name: '三层 301-305 培训中心',
    area: 500,
    status: '公开招租',
    monthlyRent: 50000,
    bids: [
      {
        id: 'BID-SP-004-001',
        company: '福建启航教育科技有限公司',
        contactPerson: '许主任',
        contactPhone: '13100131001',
        amount: 52000,
        depositPaid: true,
        bidDate: '2025-01-08',
        status: 'Valid',
      },
      {
        id: 'BID-SP-004-002',
        company: '福州未来之星培训中心',
        contactPerson: '郑老师',
        contactPhone: '13200132002',
        amount: 50500,
        depositPaid: true,
        bidDate: '2025-01-09',
        status: 'Valid',
      },
    ],
  },
];

const initContracts: ContractItem[] = [
  {
    id: 'CT-2024-001', contractNo: 'JYXF-2024-001', spaceId: 'SP-002', spaceName: '二层 201 办公室', area: 150,
    tenant: '福建星火科技有限公司', tenantContact: '张经理 13800138001', tenantLicense: '91350100MA2XYZ123',
    rentPerMonth: 12000, startDate: '2024-01-01', endDate: '2026-12-31', status: 'Active', signDate: '2023-12-15',
    totalRentReceived: 144000, outstandingRent: 0, performanceRating: 5
  },
  {
    id: 'CT-2023-005', contractNo: 'JYXF-2023-005', spaceId: 'SP-003', spaceName: '一层 103 商铺', area: 80,
    tenant: '福州美食坊餐饮管理有限公司', tenantContact: '李老板 13900139001', tenantLicense: '91350100MA2ABC456',
    rentPerMonth: 8000, startDate: '2023-06-01', endDate: '2025-02-28', status: 'Expiring', signDate: '2023-05-10',
    totalRentReceived: 140000, outstandingRent: 16240, performanceRating: 3
  },
  {
    id: 'CT-2024-008', contractNo: 'JYXF-2024-008', spaceId: 'SP-004', spaceName: '三层 301-305 培训中心', area: 500,
    tenant: '福建教育培训集团', tenantContact: '陈主任 13700137001', tenantLicense: '91350100MA2DEF789',
    rentPerMonth: 50000, startDate: '2024-09-01', endDate: '2027-08-31', status: 'Active', signDate: '2024-08-15',
    totalRentReceived: 200000, outstandingRent: 0, performanceRating: 5
  },
];

const initRentBills: RentBill[] = [
  { id: 'RB-2025-001', contractId: 'CT-2024-001', spaceName: '二层 201 办公室', tenant: '福建星火科技有限公司', period: '2025-01', rentAmount: 12000, lateFee: 0, totalAmount: 12000, dueDate: '2025-01-05', status: 'Paid', paidAmount: 12000, paidDate: '2025-01-03', paymentMethod: '银行转账', transactionNo: 'TXN-20250103-001', reminderCount: 0 },
  { id: 'RB-2025-002', contractId: 'CT-2023-005', spaceName: '一层 103 商铺', tenant: '福州美食坊餐饮管理有限公司', period: '2025-01', rentAmount: 8000, lateFee: 0, totalAmount: 8000, dueDate: '2025-01-05', status: 'Unpaid', paidAmount: 0, reminderCount: 2, lastReminderDate: '2025-01-10' },
  { id: 'RB-2024-012', contractId: 'CT-2023-005', spaceName: '一层 103 商铺', tenant: '福州美食坊餐饮管理有限公司', period: '2024-12', rentAmount: 8000, lateFee: 240, totalAmount: 8240, dueDate: '2024-12-05', status: 'Overdue', paidAmount: 0, reminderCount: 3, lastReminderDate: '2025-01-05' },
  { id: 'RB-2025-003', contractId: 'CT-2024-008', spaceName: '三层 301-305 培训中心', tenant: '福建教育培训集团', period: '2025-01', rentAmount: 50000, lateFee: 0, totalAmount: 50000, dueDate: '2025-01-05', status: 'Paid', paidAmount: 50000, paidDate: '2025-01-02', paymentMethod: '银行转账', transactionNo: 'TXN-20250102-005', reminderCount: 0 },
];

const initApartmentApps: ApartmentApplication[] = [
  {
    id: 'APT-001', applicant: '王老师', applicantId: 'T001', department: '计算机学院', phone: '13800138001',
    title: '副教授', familyMembers: 3, applyDate: '2023-08-15', expectedMoveInDate: '2023-09-01',
    reason: '新入职教师，需要周转房', status: 'CheckedIn', checkInDate: '2023-09-01',
    allocatedRoomId: 'AR-101', allocatedRoomNo: 'A栋101',
    approvalRecords: [
      { id: 'APR-001', level: 1, approverRole: '人事处', approverName: '张处长', action: 'Approve', comment: '符合入住条件，同意', timestamp: '2023-08-16 10:30' },
      { id: 'APR-002', level: 2, approverRole: '资产处', approverName: '李处长', action: 'Approve', comment: '已分配房间，同意入住', timestamp: '2023-08-18 14:00' },
    ]
  },
  {
    id: 'APT-002', applicant: '李教授', applicantId: 'T002', department: '机械工程学院', phone: '13900139002',
    title: '教授', familyMembers: 4, applyDate: '2025-01-10', expectedMoveInDate: '2025-02-01',
    reason: '家属来榕，需要临时住房', status: 'PendingAsset', currentApprover: '资产处',
    approvalRecords: [
      { id: 'APR-003', level: 1, approverRole: '人事处', approverName: '张处长', action: 'Approve', comment: '教授职称，优先安排', timestamp: '2025-01-11 09:00' },
    ]
  },
  {
    id: 'APT-003', applicant: '赵老师', applicantId: 'T003', department: '外国语学院', phone: '13700137003',
    title: '讲师', familyMembers: 2, applyDate: '2025-01-12', expectedMoveInDate: '2025-03-01',
    reason: '新入职教师', status: 'PendingHR', currentApprover: '人事处',
    approvalRecords: []
  },
];

const initApartmentRooms: ApartmentRoom[] = [
  { id: 'AR-101', roomNo: 'A栋101', building: '教师公寓A栋', floor: 1, area: 60, layout: '两室一厅', facilities: ['空调', '热水器', '燃气灶', '油烟机', '衣柜', '床'], monthlyRent: 800, deposit: 1600, status: 'Occupied', currentTenant: '王老师', occupiedSince: '2023-09-01' },
  { id: 'AR-102', roomNo: 'A栋102', building: '教师公寓A栋', floor: 1, area: 45, layout: '一室一厅', facilities: ['空调', '热水器', '燃气灶', '油烟机', '衣柜', '床'], monthlyRent: 600, deposit: 1200, status: 'Available' },
  { id: 'AR-201', roomNo: 'A栋201', building: '教师公寓A栋', floor: 2, area: 75, layout: '三室一厅', facilities: ['空调', '热水器', '燃气灶', '油烟机', '衣柜', '床', '书桌'], monthlyRent: 1000, deposit: 2000, status: 'Available' },
  { id: 'AR-202', roomNo: 'A栋202', building: '教师公寓A栋', floor: 2, area: 60, layout: '两室一厅', facilities: ['空调', '热水器', '燃气灶', '油烟机', '衣柜', '床'], monthlyRent: 800, deposit: 1600, status: 'Maintenance' },
  { id: 'AR-301', roomNo: 'B栋301', building: '教师公寓B栋', floor: 3, area: 50, layout: '一室一厅', facilities: ['空调', '热水器', '燃气灶', '衣柜', '床'], monthlyRent: 650, deposit: 1300, status: 'Reserved' },
];

const initUtilityReadings: UtilityReading[] = [
  { id: 'UR-001', roomId: 'AR-101', roomNo: 'A栋101', tenant: '王老师', meterType: 'Water', readingDate: '2025-01-01', previousReading: 1250, currentReading: 1268, usage: 18, unitPrice: 3.5, amount: 63, reader: '物业-张师傅' },
  { id: 'UR-002', roomId: 'AR-101', roomNo: 'A栋101', tenant: '王老师', meterType: 'Electric', readingDate: '2025-01-01', previousReading: 5420, currentReading: 5580, usage: 160, unitPrice: 0.6, amount: 96, reader: '物业-张师傅' },
];

const initUtilityBills: UtilityBill[] = [
  { id: 'UB-001', roomId: 'AR-101', roomNo: 'A栋101', tenant: '王老师', period: '2024-12', waterUsage: 18, waterAmount: 63, electricUsage: 170, electricAmount: 102, totalAmount: 165, dueDate: '2025-01-10', status: 'Paid', paidDate: '2025-01-05' },
  { id: 'UB-002', roomId: 'AR-101', roomNo: 'A栋101', tenant: '王老师', period: '2025-01', waterUsage: 18, waterAmount: 63, electricUsage: 160, electricAmount: 96, totalAmount: 159, dueDate: '2025-02-10', status: 'Unpaid' },
];

const initDeposits: DepositRecord[] = [
  { id: 'DEP-001', tenant: '王老师', roomNo: 'A栋101', depositAmount: 1600, paidDate: '2023-08-30', status: 'Held', deductions: [] },
];

// ==================== localStorage Hook ====================

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
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

// ==================== 统计卡片组件 ====================

const StatCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; isUp: boolean };
}> = ({ icon, iconBg, iconColor, title, value, subtitle, trend }) => (
  <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
    <div className="flex items-start justify-between">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      {trend && (
        <span className={`text-xs flex items-center gap-1 ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend.value}%
        </span>
      )}
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-[#1f2329]">{value}</p>
      <p className="text-xs text-[#8f959e] mt-1">{title}</p>
      {subtitle && <p className="text-xs text-[#646a73] mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ==================== 主组件 ====================

interface CommercialHousingProps {
  userRole: UserRole;
}

type CommercialTab = 'overview' | 'spaces' | 'contracts' | 'rent' | 'analytics';
type ApartmentTab = 'overview' | 'applications' | 'rooms' | 'utilities' | 'deposits';

const parseSpaceKeyFromName = (name: string) => {
  const m = String(name || '').trim().match(/^(.+?)层\s+(\d+)\s+/);
  return { floor: m?.[1]?.trim() || '', roomNo: m?.[2]?.trim() || '' };
};

const isDuplicateSpaceKey = (a: string, b: string) => {
  const ka = parseSpaceKeyFromName(a);
  const kb = parseSpaceKeyFromName(b);
  if (!ka.floor || !ka.roomNo || !kb.floor || !kb.roomNo) return false;
  return ka.floor === kb.floor && ka.roomNo === kb.roomNo;
};

const CommercialHousing: React.FC<CommercialHousingProps> = ({ userRole }) => {
  const [mainTab, setMainTab] = useState<'commercial' | 'apartment'>('commercial');
  const [commercialTab, setCommercialTab] = useState<CommercialTab>('overview');
  const [apartmentTab, setApartmentTab] = useState<ApartmentTab>('overview');

  // 数据状态
  const [spaces, setSpaces] = useLocalStorage<SpaceItem[]>('commercial-spaces-v2', initSpaces);
  const [contracts, setContracts] = useLocalStorage<ContractItem[]>('commercial-contracts-v2', initContracts);
  const [rentBills, setRentBills] = useLocalStorage<RentBill[]>('rent-bills-v2', initRentBills);
  const [apartmentApps, setApartmentApps] = useLocalStorage<ApartmentApplication[]>('apartment-apps-v2', initApartmentApps);
  const [apartmentRooms, setApartmentRooms] = useLocalStorage<ApartmentRoom[]>('apartment-rooms-v2', initApartmentRooms);
  const [utilityReadings, setUtilityReadings] = useLocalStorage<UtilityReading[]>('utility-readings-v2', initUtilityReadings);
  const [utilityBills, setUtilityBills] = useLocalStorage<UtilityBill[]>('utility-bills-v2', initUtilityBills);
  const [deposits, setDeposits] = useLocalStorage<DepositRecord[]>('deposits-v2', initDeposits);

  // UI状态
  const [showAddSpace, setShowAddSpace] = useState(false);
  const [editingSpace, setEditingSpace] = useState<SpaceItem | null>(null);
  const [showRentPayment, setShowRentPayment] = useState(false);
  const [showContractDetail, setShowContractDetail] = useState(false);
  const [showContractUpsert, setShowContractUpsert] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractItem | null>(null);
  const [deletingContract, setDeletingContract] = useState<ContractItem | null>(null);
  const [showApprovalDetail, setShowApprovalDetail] = useState(false);
  const [showUtilityReading, setShowUtilityReading] = useState(false);
  const [showApartmentApply, setShowApartmentApply] = useState(false);
  const [showRoomAllocation, setShowRoomAllocation] = useState(false);
  const [selectedBill, setSelectedBill] = useState<RentBill | null>(null);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [selectedApp, setSelectedApp] = useState<ApartmentApplication | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<ApartmentRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingBidsForSpace, setViewingBidsForSpace] = useState<SpaceItem | null>(null);

  const handleConfirmBidWinner = (bid: BidItem) => {
    if (!viewingBidsForSpace) return;

    // 1) 竞标状态联动：当前中标，其他未中标
    setSpaces(prev => prev.map(s => {
      if (s.id !== viewingBidsForSpace.id) return s;
      return {
        ...s,
        bids: (s.bids || []).map(b => ({
          ...b,
          status: b.id === bid.id ? 'Winner' : 'Loser',
        })),
      };
    }));

    // 2) 打开签订合同弹窗并预填
    setEditingContract({
      id: `CT-${Date.now()}`,
      contractNo: genContractNo(),
      spaceId: viewingBidsForSpace.id,
      spaceName: viewingBidsForSpace.name,
      area: viewingBidsForSpace.area,
      tenant: bid.company,
      tenantContact: `${bid.contactPerson} ${bid.contactPhone}`,
      tenantLicense: '',
      rentPerMonth: bid.amount,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      status: 'Active',
      signDate: new Date().toISOString().split('T')[0],
      totalRentReceived: 0,
      outstandingRent: bid.amount,
      performanceRating: 5,
    });
    setShowContractUpsert(true);

    // 3) 关闭竞标弹窗
    setViewingBidsForSpace(null);
  };

  // 统计数据
  const commercialStats = useMemo(() => ({
    activeContracts: contracts.filter(c => c.status === 'Active').length,
    expiringContracts: contracts.filter(c => c.status === 'Expiring').length,
    totalRentReceivable: rentBills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.totalAmount - b.paidAmount, 0),
    overdueAmount: rentBills.filter(b => b.status === 'Overdue').reduce((sum, b) => sum + b.totalAmount - b.paidAmount, 0),
    monthlyIncome: rentBills.filter(b => b.period === '2025-01' && b.status === 'Paid').reduce((sum, b) => sum + b.paidAmount, 0),
    availableSpaces: spaces.filter(s => s.status === '公开招租').length,
  }), [contracts, rentBills, spaces]);

  const apartmentStats = useMemo(() => ({
    totalRooms: apartmentRooms.length,
    occupiedRooms: apartmentRooms.filter(r => r.status === 'Occupied').length,
    availableRooms: apartmentRooms.filter(r => r.status === 'Available').length,
    pendingApplications: apartmentApps.filter(a => a.status === 'PendingHR' || a.status === 'PendingAsset').length,
    occupancyRate: ((apartmentRooms.filter(r => r.status === 'Occupied').length / apartmentRooms.length) * 100).toFixed(1),
    unpaidUtilities: utilityBills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + b.totalAmount, 0),
  }), [apartmentRooms, apartmentApps, utilityBills]);

  // 合同到期天数计算
  const getDaysToExpiry = (endDate: string) => {
    return Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleCreateFromOverview = (payload: CreateFromOverviewPayload) => {
    // 合并逻辑：
    // - 总览“新增”入口不再自己弹窗，而是交由这里打开“房源管理-发布房源”
    // - 仍保留原“从总览新增已出租台账 -> 自动生成合同/账单”的能力
    if (!payload.contractNo || !payload.roomId) {
      setCommercialTab('spaces');
      if (isAssetAdmin) setShowAddSpace(true);
      return;
    }

    // 避免重复创建
    const existedContract = contracts.find(c => c.contractNo === payload.contractNo);
    if (existedContract) return;

    const now = new Date();
    const ym = now.toISOString().slice(0, 7);
    const dueDate = `${ym}-05`;

    // space
    const spaceName = `${payload.floor} ${payload.roomNo} 商铺`;
    const nextSpaces = (() => {
      const existed = spaces.find(s => s.id === payload.roomId);
      if (existed) {
        return spaces.map(s => s.id === payload.roomId ? { ...s, name: existed.name || spaceName, area: payload.area, status: '已出租', monthlyRent: payload.monthlyRent } : s);
      }
      const newSpace: SpaceItem = {
        id: payload.roomId,
        name: spaceName,
        area: payload.area,
        status: '已出租',
        bids: [],
        monthlyRent: payload.monthlyRent,
      };
      return [...spaces, newSpace];
    })();

    // contract
    const newContract: ContractItem = {
      id: `CT-${Date.now()}`,
      contractNo: payload.contractNo,
      spaceId: payload.roomId,
      spaceName: spaceName,
      area: payload.area,
      tenant: payload.tenantName,
      tenantContact: payload.tenantContact,
      rentPerMonth: payload.monthlyRent,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: 'Active',
      signDate: new Date().toISOString().split('T')[0],
      totalRentReceived: 0,
      outstandingRent: payload.monthlyRent,
      performanceRating: 5,
    };

    // rent bill (当月)
    const existedBill = rentBills.find(b => b.contractId === newContract.id && b.period === ym);
    const newBill: RentBill | null = existedBill
      ? null
      : {
          id: `RB-${Date.now()}`,
          contractId: newContract.id,
          spaceName: newContract.spaceName,
          tenant: newContract.tenant,
          period: ym,
          rentAmount: payload.monthlyRent,
          lateFee: 0,
          totalAmount: payload.monthlyRent,
          dueDate,
          status: 'Unpaid',
          paidAmount: 0,
          reminderCount: 0,
        };

    setSpaces(nextSpaces as SpaceItem[]);
    setContracts(prev => [...prev, newContract]);
    if (newBill) {
      setRentBills(prev => [...prev, newBill]);
    }
  };

  // 租金催缴
  const handleSendReminder = (bill: RentBill) => {
    setRentBills(prev => prev.map(b => b.id === bill.id ? {
      ...b,
      reminderCount: b.reminderCount + 1,
      lastReminderDate: new Date().toISOString().split('T')[0],
    } : b));
    alert(`已向 ${bill.tenant} 发送第 ${bill.reminderCount + 1} 次催缴通知`);
  };

  // 租金缴纳
  const genContractNo = () => {
    const year = new Date().getFullYear();
    let idx = 1;
    while (idx < 9999) {
      const no = `JYXF-${year}-${String(idx).padStart(3, '0')}`;
      const exists = contracts.some(c => c.contractNo === no);
      if (!exists) return no;
      idx++;
    }
    return `JYXF-${year}-${Date.now()}`;
  };

  const handleUpsertContract = (data: {
    contractNo: string;
    spaceId: string;
    tenant: string;
    tenantContact: string;
    tenantLicense?: string;
    rentPerMonth: number;
    startDate: string;
    endDate: string;
    status: ContractItem['status'];
    performanceRating?: number;
  }) => {
    const space = spaces.find(s => s.id === data.spaceId);
    if (!space) return;

    // 合同编号唯一性校验（编辑时排除自身）
    const conflict = contracts.find(c => c.contractNo === data.contractNo && c.id !== (editingContract?.id || ''));
    if (conflict) {
      alert('合同编号已存在，请更换合同编号');
      return;
    }

    if (editingContract) {
      setContracts(prev => prev.map(c => c.id === editingContract.id ? {
        ...c,
        contractNo: data.contractNo,
        spaceId: data.spaceId,
        spaceName: space.name,
        area: space.area,
        tenant: data.tenant,
        tenantContact: data.tenantContact,
        tenantLicense: data.tenantLicense,
        rentPerMonth: data.rentPerMonth,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        performanceRating: data.performanceRating,
      } : c));

      // 联动当期未缴账单（仅示例：更新空间名/承租方/租金）
      setRentBills(prev => prev.map(b => b.contractId === editingContract.id && b.status !== 'Paid' ? {
        ...b,
        spaceName: space.name,
        tenant: data.tenant,
        rentAmount: data.rentPerMonth,
        totalAmount: data.rentPerMonth,
      } : b));
    } else {
      const newContract: ContractItem = {
        id: `CT-${Date.now()}`,
        contractNo: data.contractNo,
        spaceId: data.spaceId,
        spaceName: space.name,
        area: space.area,
        tenant: data.tenant,
        tenantContact: data.tenantContact,
        tenantLicense: data.tenantLicense,
        rentPerMonth: data.rentPerMonth,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        signDate: new Date().toISOString().split('T')[0],
        totalRentReceived: 0,
        outstandingRent: data.rentPerMonth,
        performanceRating: data.performanceRating,
      };

      setContracts(prev => [...prev, newContract]);

      // 房源状态联动：签合同后默认已出租
      setSpaces(prev => prev.map(s => s.id === data.spaceId ? { ...s, status: '已出租', monthlyRent: data.rentPerMonth } : s));

      // 可选：生成当月一笔待缴租金账单
      const ym = new Date().toISOString().slice(0, 7);
      const dueDate = `${ym}-05`;
      const existedBill = rentBills.some(b => b.contractId === newContract.id && b.period === ym);
      if (!existedBill) {
        const newBill: RentBill = {
          id: `RB-${Date.now()}`,
          contractId: newContract.id,
          spaceName: newContract.spaceName,
          tenant: newContract.tenant,
          period: ym,
          rentAmount: data.rentPerMonth,
          lateFee: 0,
          totalAmount: data.rentPerMonth,
          dueDate,
          status: 'Unpaid',
          paidAmount: 0,
          reminderCount: 0,
        };
        setRentBills(prev => [...prev, newBill]);
      }
    }

    setShowContractUpsert(false);
    setEditingContract(null);
  };

  const handleDeleteContract = (contract: ContractItem) => {
    const hasUnpaid = rentBills.some(b => b.contractId === contract.id && b.status !== 'Paid');
    if (hasUnpaid) {
      alert('该合同存在未缴账单，请先处理账单再删除合同');
      return;
    }

    // 删除合同
    setContracts(prev => prev.filter(c => c.id !== contract.id));

    // 删除关联账单（保险起见：仅删除该合同的账单）
    setRentBills(prev => prev.filter(b => b.contractId !== contract.id));

    // 房源状态回退：若该房源没有其他合同，则回到公开招租
    const stillHasOther = contracts.some(c => c.spaceId === contract.spaceId && c.id !== contract.id);
    if (!stillHasOther) {
      setSpaces(prev => prev.map(s => s.id === contract.spaceId ? { ...s, status: '公开招租' } : s));
    }

    setDeletingContract(null);
  };

  const handlePayRent = (bill: RentBill, amount: number, method: string, transactionNo: string) => {
    const newPaidAmount = bill.paidAmount + amount;
    const newStatus = newPaidAmount >= bill.totalAmount ? 'Paid' : 'PartialPaid';
    
    setRentBills(prev => prev.map(b => b.id === bill.id ? {
      ...b,
      paidAmount: newPaidAmount,
      status: newStatus as any,
      paidDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : b.paidDate,
      paymentMethod: method,
      transactionNo,
    } : b));

    setContracts(prev => prev.map(c => c.id === bill.contractId ? {
      ...c,
      totalRentReceived: c.totalRentReceived + amount,
      outstandingRent: Math.max(0, c.outstandingRent - amount),
    } : c));

    setShowRentPayment(false);
    setSelectedBill(null);
  };

  // 审批操作
  const handleApprove = (app: ApartmentApplication, comment: string) => {
    const currentLevel = app.status === 'PendingHR' ? 1 : 2;
    const newRecord: ApprovalRecord = {
      id: `APR-${Date.now()}`,
      level: currentLevel,
      approverRole: currentLevel === 1 ? '人事处' : '资产处',
      approverName: '当前用户',
      action: 'Approve',
      comment,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    const nextStatus = currentLevel === 1 ? 'PendingAsset' : 'Approved';
    
    setApartmentApps(prev => prev.map(a => a.id === app.id ? {
      ...a,
      status: nextStatus as any,
      currentApprover: nextStatus === 'PendingAsset' ? '资产处' : undefined,
      approvalRecords: [...a.approvalRecords, newRecord],
    } : a));

    setShowApprovalDetail(false);
    setSelectedApp(null);
  };

  const handleReject = (app: ApartmentApplication, comment: string) => {
    const currentLevel = app.status === 'PendingHR' ? 1 : 2;
    const newRecord: ApprovalRecord = {
      id: `APR-${Date.now()}`,
      level: currentLevel,
      approverRole: currentLevel === 1 ? '人事处' : '资产处',
      approverName: '当前用户',
      action: 'Reject',
      comment,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setApartmentApps(prev => prev.map(a => a.id === app.id ? {
      ...a,
      status: 'Rejected',
      approvalRecords: [...a.approvalRecords, newRecord],
    } : a));

    setShowApprovalDetail(false);
    setSelectedApp(null);
  };

  // 分配房间
  const handleAllocateRoom = (app: ApartmentApplication, room: ApartmentRoom) => {
    setApartmentApps(prev => prev.map(a => a.id === app.id ? {
      ...a,
      allocatedRoomId: room.id,
      allocatedRoomNo: room.roomNo,
      status: 'CheckedIn',
      checkInDate: new Date().toISOString().split('T')[0],
    } : a));

    setApartmentRooms(prev => prev.map(r => r.id === room.id ? {
      ...r,
      status: 'Occupied',
      currentTenant: app.applicant,
      occupiedSince: new Date().toISOString().split('T')[0],
    } : r));

    // 创建押金记录
    setDeposits(prev => [...prev, {
      id: `DEP-${Date.now()}`,
      tenant: app.applicant,
      roomNo: room.roomNo,
      depositAmount: room.deposit,
      paidDate: new Date().toISOString().split('T')[0],
      status: 'Held',
      deductions: [],
    }]);

    setShowRoomAllocation(false);
    setSelectedApp(null);
  };

  // 水电抄表
  const handleAddUtilityReading = (reading: Omit<UtilityReading, 'id'>) => {
    const newReading: UtilityReading = {
      ...reading,
      id: `UR-${Date.now()}`,
    };
    setUtilityReadings(prev => [...prev, newReading]);
    setShowUtilityReading(false);
    setSelectedRoom(null);
  };

  // 生成水电账单
  const handleGenerateUtilityBill = (roomId: string) => {
    const room = apartmentRooms.find(r => r.id === roomId);
    if (!room || room.status !== 'Occupied') return;

    const waterReading = utilityReadings.filter(r => r.roomId === roomId && r.meterType === 'Water').slice(-1)[0];
    const electricReading = utilityReadings.filter(r => r.roomId === roomId && r.meterType === 'Electric').slice(-1)[0];

    if (!waterReading || !electricReading) {
      alert('请先完成水电表抄表');
      return;
    }

    const period = new Date().toISOString().slice(0, 7);
    const existingBill = utilityBills.find(b => b.roomId === roomId && b.period === period);
    if (existingBill) {
      alert('本月账单已生成');
      return;
    }

    const newBill: UtilityBill = {
      id: `UB-${Date.now()}`,
      roomId,
      roomNo: room.roomNo,
      tenant: room.currentTenant || '',
      period,
      waterUsage: waterReading.usage,
      waterAmount: waterReading.amount,
      electricUsage: electricReading.usage,
      electricAmount: electricReading.amount,
      totalAmount: waterReading.amount + electricReading.amount,
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1, 10)).toISOString().split('T')[0],
      status: 'Unpaid',
    };

    setUtilityBills(prev => [...prev, newBill]);
    alert('水电费账单已生成');
  };

  // 退房结算
  const handleCheckout = (app: ApartmentApplication) => {
    const deposit = deposits.find(d => d.tenant === app.applicant && d.status === 'Held');
    const unpaidBills = utilityBills.filter(b => b.roomNo === app.allocatedRoomNo && b.status === 'Unpaid');
    const unpaidAmount = unpaidBills.reduce((sum, b) => sum + b.totalAmount, 0);

    if (deposit) {
      const returnAmount = Math.max(0, deposit.depositAmount - unpaidAmount);
      setDeposits(prev => prev.map(d => d.id === deposit.id ? {
        ...d,
        status: 'Returned',
        deductions: unpaidAmount > 0 ? [{ type: '水电费', amount: unpaidAmount, description: '未缴水电费抵扣' }] : [],
        returnAmount,
        returnDate: new Date().toISOString().split('T')[0],
      } : d));
    }

    // 更新水电账单状态
    setUtilityBills(prev => prev.map(b => 
      b.roomNo === app.allocatedRoomNo && b.status === 'Unpaid' 
        ? { ...b, status: 'Paid', paidDate: new Date().toISOString().split('T')[0] } 
        : b
    ));

    // 更新房间状态
    setApartmentRooms(prev => prev.map(r => r.id === app.allocatedRoomId ? {
      ...r,
      status: 'Available',
      currentTenant: undefined,
      occupiedSince: undefined,
    } : r));

    // 更新申请状态
    setApartmentApps(prev => prev.map(a => a.id === app.id ? {
      ...a,
      status: 'CheckedOut',
      checkOutDate: new Date().toISOString().split('T')[0],
      utilitiesCost: unpaidAmount,
      depositReturned: true,
    } : a));
  };

  // 图表数据
  const rentChartData = useMemo(() => {
    const months = ['2024-10', '2024-11', '2024-12', '2025-01'];
    return months.map(month => ({
      month: month.slice(5),
      应收: contracts.reduce((sum, c) => sum + c.rentPerMonth, 0) / 10000,
      实收: rentBills.filter(b => b.period === month && b.status === 'Paid').reduce((sum, b) => sum + b.paidAmount, 0) / 10000,
    }));
  }, [contracts, rentBills]);


  const isAssetAdmin = userRole === UserRole.AssetAdmin;
  const isTeacher = userRole === UserRole.Teacher;

  const handleExportContracts = () => {
    const filtered = contracts
      .filter(c => statusFilter === 'all' || c.status === statusFilter)
      .filter(c => !searchTerm || c.tenant.includes(searchTerm));

    const headers = [
      '合同编号',
      '房源',
      '承租方',
      '联系方式',
      '统一社会信用代码',
      '面积(㎡)',
      '月租金(元)',
      '开始日期',
      '结束日期',
      '状态',
      '签订日期',
      '已收租金',
      '待收租金',
      '履约评分',
    ];

    const escape = (val: any) => {
      const s = String(val ?? '');
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows = filtered.map(c => [
      escape(c.contractNo),
      escape(c.spaceName),
      escape(c.tenant),
      escape(c.tenantContact),
      escape(c.tenantLicense || ''),
      escape(c.area),
      escape(c.rentPerMonth),
      escape(c.startDate),
      escape(c.endDate),
      escape(c.status === 'Active' ? '履约中' : c.status === 'Expiring' ? '即将到期' : c.status === 'Expired' ? '已到期' : '已终止'),
      escape(c.signDate),
      escape(c.totalRentReceived),
      escape(c.outstandingRent),
      escape(c.performanceRating ?? ''),
    ]);

    const csv = [headers.map(escape).join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `合同管理_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ContractUpsertModal
        isOpen={showContractUpsert}
        onClose={() => {
          setShowContractUpsert(false);
          setEditingContract(null);
        }}
        onSave={handleUpsertContract}
        editingContract={editingContract}
        spaces={spaces}
        genContractNo={genContractNo}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingContract}
        onClose={() => setDeletingContract(null)}
        onConfirm={() => {
          if (deletingContract) handleDeleteContract(deletingContract);
        }}
        contract={deletingContract}
      />

      <BidListModal
        isOpen={!!viewingBidsForSpace}
        space={viewingBidsForSpace}
        onClose={() => setViewingBidsForSpace(null)}
        onConfirmWinner={handleConfirmBidWinner}
      />
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 size={24} className="text-[#3370ff]" />
          <div>
            <h2 className="text-2xl font-bold text-[#1f2329]">经营性用房与周转房管理</h2>
            <p className="text-sm text-[#8f959e]">租金收缴、合同管理、公寓分配、水电结算全流程</p>
          </div>
        </div>
        <div className="flex gap-2 text-sm font-medium bg-[#f5f6f7] p-1 rounded">
          <button 
            onClick={() => setMainTab('commercial')} 
            className={`px-4 py-1.5 rounded transition ${mainTab === 'commercial' ? 'bg-white shadow text-[#3370ff]' : 'text-[#646a73] hover:text-[#1f2329]'}`}
          >
            商业/产业用房
          </button>
          {userRole !== UserRole.Guest && (
            <button 
              onClick={() => setMainTab('apartment')} 
              className={`px-4 py-1.5 rounded transition ${mainTab === 'apartment' ? 'bg-white shadow text-[#3370ff]' : 'text-[#646a73] hover:text-[#1f2329]'}`}
            >
              教师公寓周转房
            </button>
          )}
        </div>
      </div>

      {/* ==================== 商业用房管理 ==================== */}
      {mainTab === 'commercial' && (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard icon={<FileText size={20} />} iconBg="bg-blue-50" iconColor="text-blue-600" title="活跃合同" value={commercialStats.activeContracts} />
            <StatCard icon={<AlertCircle size={20} />} iconBg="bg-amber-50" iconColor="text-amber-600" title="即将到期" value={commercialStats.expiringContracts} />
            <StatCard icon={<Building2 size={20} />} iconBg="bg-purple-50" iconColor="text-purple-600" title="待租房源" value={commercialStats.availableSpaces} />
            <StatCard icon={<DollarSign size={20} />} iconBg="bg-green-50" iconColor="text-green-600" title="本月收入" value={`¥${(commercialStats.monthlyIncome / 10000).toFixed(1)}万`} />
            <StatCard icon={<Clock size={20} />} iconBg="bg-orange-50" iconColor="text-orange-600" title="应收租金" value={`¥${(commercialStats.totalRentReceivable / 10000).toFixed(1)}万`} />
            <StatCard icon={<AlertTriangle size={20} />} iconBg="bg-red-50" iconColor="text-red-600" title="逾期欠费" value={`¥${(commercialStats.overdueAmount / 10000).toFixed(2)}万`} />
          </div>

          {/* 合同到期预警 */}
          {contracts.filter(c => c.status === 'Expiring').length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-2">合同到期提醒</h4>
                  <div className="space-y-2">
                    {contracts.filter(c => c.status === 'Expiring').map(contract => {
                      const days = getDaysToExpiry(contract.endDate);
                      return (
                        <div key={contract.id} className="flex justify-between items-center text-sm">
                          <span>
                            <span className="font-medium">{contract.tenant}</span>
                            <span className="text-[#8f959e] ml-2">({contract.spaceName})</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            days <= 7 ? 'bg-red-100 text-red-700' :
                            days <= 30 ? 'bg-orange-100 text-orange-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {days}天后到期 ({contract.endDate})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 子Tab导航 */}
          <div className="border-b border-[#dee0e3]">
            <div className="flex gap-1">
              {[
                { id: 'overview', label: '总览', icon: <BarChart3 size={16} /> },
                { id: 'spaces', label: '房源管理', icon: <Building2 size={16} /> },
                { id: 'contracts', label: '合同管理', icon: <FileText size={16} /> },
                { id: 'rent', label: '租金收缴', icon: <Receipt size={16} />, badge: rentBills.filter(b => b.status !== 'Paid').length },
                { id: 'analytics', label: '收益分析', icon: <TrendingUp size={16} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCommercialTab(tab.id as CommercialTab)}
                  className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                    commercialTab === tab.id ? 'border-[#3370ff] text-[#3370ff]' : 'border-transparent text-[#646a73] hover:text-[#1f2329]'
                  }`}
                >
                  {tab.icon} {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${commercialTab === tab.id ? 'bg-[#3370ff] text-white' : 'bg-red-100 text-red-600'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 总览 */}
          {commercialTab === 'overview' && (
            <CommercialHousingOverview 
              spaces={spaces} 
              contracts={contracts} 
              rentBills={rentBills} 
              onCreateFromOverview={handleCreateFromOverview}
            />
          )}

          {/* 房源管理 */}
          {commercialTab === 'spaces' && (
            <div className="bg-white rounded-lg border border-[#dee0e3]">
              <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
                <span className="text-sm text-[#646a73]">共 {spaces.length} 处房源</span>
                {isAssetAdmin && (
                  <button onClick={() => { setEditingSpace(null); setShowAddSpace(true); }} className="flex items-center gap-1 text-sm font-medium bg-[#3370ff] hover:bg-[#285cc9] text-white px-3 py-1.5 rounded">
                    <Plus size={16} /> 发布房源
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {spaces.map(space => {
                  const hasContract = contracts.some(c => c.spaceId === space.id);
                  const displayStatus = hasContract ? '已出租' : space.status;

                  return (
                  <div key={space.id} className="border border-[#dee0e3] rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-[#1f2329]">{space.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        displayStatus === '已出租' ? 'bg-green-100 text-green-700' :
                        displayStatus === '公开招租' ? 'bg-blue-100 text-blue-700' :
                        displayStatus === '维修中' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {displayStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#8f959e]">面积</span>
                        <span>{space.area} m²</span>
                      </div>
                      {space.monthlyRent && (
                        <div className="flex justify-between">
                          <span className="text-[#8f959e]">月租金</span>
                          <span className="font-medium text-[#3370ff]">¥{space.monthlyRent.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#8f959e]">竞标数</span>
                        <span>{space.bids.length} 条</span>
                      </div>
                    </div>
                    {isAssetAdmin && (
                      <div className="mt-3 pt-3 border-t border-[#dee0e3] flex gap-2">
                        <button
                          onClick={() => {
                            setEditingSpace(space);
                            setShowAddSpace(true);
                          }}
                          className="flex-1 text-xs py-1.5 border border-[#dee0e3] rounded hover:bg-gray-50"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => {
                            // localStorage 里可能已有旧数据（bids 为空），导致弹窗显示“暂无竞标数据”
                            // 这里用当前 state 中的最新 space 引用，避免使用 map 闭包中的旧对象
                            const latest = spaces.find(s => s.id === space.id) ?? space;
                            setViewingBidsForSpace(latest);
                          }}
                          className="flex-1 text-xs py-1.5 border border-[#dee0e3] rounded hover:bg-gray-50"
                        >
                          查看竞标 ({space.bids.length})
                        </button>
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            </div>
          )}

          {/* 合同管理 */}
          {commercialTab === 'contracts' && (
            <div className="bg-white rounded-lg border border-[#dee0e3]">
              <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
                    <input
                      type="text"
                      placeholder="搜索承租方..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm w-64"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">全部状态</option>
                    <option value="Active">履约中</option>
                    <option value="Expiring">即将到期</option>
                    <option value="Expired">已到期</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  {isAssetAdmin && (
                    <button
                      onClick={() => {
                        setEditingContract(null);
                        setShowContractUpsert(true);
                      }}
                      className="text-xs px-3 py-1.5 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9]"
                    >
                      <Plus size={14} /> 新增合同
                    </button>
                  )}
                  <button
                    onClick={handleExportContracts}
                    className="text-xs px-3 py-1.5 border border-[#dee0e3] rounded flex items-center gap-1 hover:bg-gray-50"
                  >
                    <Download size={14} /> 导出
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f6f7] text-[#646a73]">
                    <tr>
                      <th className="px-4 py-3 text-left">合同编号</th>
                      <th className="px-4 py-3 text-left">房源</th>
                      <th className="px-4 py-3 text-left">承租方</th>
                      <th className="px-4 py-3 text-left">月租金</th>
                      <th className="px-4 py-3 text-left">合同期限</th>
                      <th className="px-4 py-3 text-left">状态</th>
                      <th className="px-4 py-3 text-left">履约评分</th>
                      <th className="px-4 py-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dee0e3]">
                    {contracts
                      .filter(c => statusFilter === 'all' || c.status === statusFilter)
                      .filter(c => !searchTerm || c.tenant.includes(searchTerm))
                      .map(contract => (
                        <tr key={contract.id} className="hover:bg-[#f9fafb]">
                          <td className="px-4 py-3 font-medium">{contract.contractNo}</td>
                          <td className="px-4 py-3">{contract.spaceName}</td>
                          <td className="px-4 py-3">
                            <div>{contract.tenant}</div>
                            <div className="text-xs text-[#8f959e]">{contract.tenantContact}</div>
                          </td>
                          <td className="px-4 py-3 font-medium">¥{contract.rentPerMonth.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div>{contract.startDate}</div>
                            <div className="text-xs text-[#8f959e]">至 {contract.endDate}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              contract.status === 'Active' ? 'bg-green-100 text-green-700' :
                              contract.status === 'Expiring' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {contract.status === 'Active' ? '履约中' : contract.status === 'Expiring' ? '即将到期' : '已到期'}
                            </span>
                            {contract.status === 'Expiring' && (
                              <div className="text-xs text-amber-600 mt-1">{getDaysToExpiry(contract.endDate)}天后到期</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={14} className={i <= (contract.performanceRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => { setSelectedContract(contract); setShowContractDetail(true); }}
                                className="text-[#3370ff] hover:underline text-xs"
                              >
                                详情
                              </button>
                              {isAssetAdmin && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingContract(contract);
                                      setShowContractUpsert(true);
                                    }}
                                    className="text-[#3370ff] hover:underline text-xs"
                                  >
                                    编辑
                                  </button>
                                  <button
                                    onClick={() => setDeletingContract(contract)}
                                    className="text-red-600 hover:underline text-xs"
                                  >
                                    删除
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 租金收缴 */}
          {commercialTab === 'rent' && (
            <div className="bg-white rounded-lg border border-[#dee0e3]">
              <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">全部状态</option>
                    <option value="Unpaid">待缴</option>
                    <option value="Overdue">逾期</option>
                    <option value="Paid">已缴</option>
                  </select>
                </div>
                {isAssetAdmin && (
                  <button className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded flex items-center gap-1 hover:bg-amber-600">
                    <Bell size={14} /> 批量催缴
                  </button>
                )}
              </div>
              <div className="divide-y divide-[#dee0e3]">
                {rentBills
                  .filter(b => statusFilter === 'all' || b.status === statusFilter)
                  .map(bill => (
                    <div key={bill.id} className="p-4 hover:bg-[#f9fafb]">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-[#1f2329]">{bill.tenant}</span>
                            <span className="text-sm text-[#8f959e]">{bill.spaceName}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              bill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                              bill.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                              bill.status === 'PartialPaid' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {bill.status === 'Paid' ? '已缴清' : bill.status === 'Overdue' ? '已逾期' : bill.status === 'PartialPaid' ? '部分缴纳' : '待缴纳'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <p className="text-[#8f959e] text-xs">账期</p>
                              <p className="font-medium">{bill.period}</p>
                            </div>
                            <div>
                              <p className="text-[#8f959e] text-xs">租金</p>
                              <p className="font-medium">¥{bill.rentAmount.toLocaleString()}</p>
                            </div>
                            {bill.lateFee > 0 && (
                              <div>
                                <p className="text-[#8f959e] text-xs">滞纳金</p>
                                <p className="font-medium text-red-600">¥{bill.lateFee.toLocaleString()}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-[#8f959e] text-xs">应缴总额</p>
                              <p className="font-medium">¥{bill.totalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[#8f959e] text-xs">待缴金额</p>
                              <p className={`font-medium ${bill.totalAmount - bill.paidAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ¥{(bill.totalAmount - bill.paidAmount).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {bill.status !== 'Paid' && bill.reminderCount > 0 && (
                            <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                              <Bell size={12} /> 已催缴 {bill.reminderCount} 次 {bill.lastReminderDate && `(最近: ${bill.lastReminderDate})`}
                            </div>
                          )}
                          {bill.status === 'Paid' && (
                            <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle size={12} /> 已于 {bill.paidDate} 缴清 | {bill.paymentMethod} | 流水号: {bill.transactionNo}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {bill.status !== 'Paid' && isAssetAdmin && (
                            <>
                              <button
                                onClick={() => handleSendReminder(bill)}
                                className="text-xs px-3 py-1.5 border border-amber-500 text-amber-600 rounded hover:bg-amber-50 flex items-center gap-1"
                              >
                                <Send size={12} /> 催缴
                              </button>
                              <button
                                onClick={() => { setSelectedBill(bill); setShowRentPayment(true); }}
                                className="text-xs px-3 py-1.5 bg-[#3370ff] text-white rounded hover:bg-[#285cc9] flex items-center gap-1"
                              >
                                <CreditCard size={12} /> 登记缴费
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 收益分析 */}
          {commercialTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 租金收入趋势 */}
                <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
                  <h3 className="font-semibold text-[#1f2329] mb-4">租金收入趋势 (万元)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rentChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f3f5" />
                        <XAxis dataKey="month" stroke="#8f959e" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#8f959e" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee0e3' }} />
                        <Legend />
                        <Bar dataKey="实收" fill="#3370ff" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="应收" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 收缴率统计 */}
                <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
                  <h3 className="font-semibold text-[#1f2329] mb-4">本月收缴情况</h3>
                  <div className="space-y-4">
                    {contracts.map(contract => {
                      const bills = rentBills.filter(b => b.contractId === contract.id && b.period === '2025-01');
                      const paid = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.paidAmount, 0);
                      const total = bills.reduce((sum, b) => sum + b.totalAmount, 0);
                      const rate = total > 0 ? (paid / total * 100) : 100;
                      return (
                        <div key={contract.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-[#646a73]">{contract.tenant}</span>
                            <span className={rate >= 100 ? 'text-green-600' : 'text-amber-600'}>{rate.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${rate >= 100 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(rate, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 承租方排名 */}
              <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
                <h3 className="font-semibold text-[#1f2329] mb-4">承租方贡献排名</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f5f6f7] text-[#646a73]">
                      <tr>
                        <th className="px-4 py-2 text-left">排名</th>
                        <th className="px-4 py-2 text-left">承租方</th>
                        <th className="px-4 py-2 text-left">房源</th>
                        <th className="px-4 py-2 text-right">累计租金</th>
                        <th className="px-4 py-2 text-right">欠费金额</th>
                        <th className="px-4 py-2 text-center">履约评分</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dee0e3]">
                      {[...contracts].sort((a, b) => b.totalRentReceived - a.totalRentReceived).map((contract, index) => (
                        <tr key={contract.id} className="hover:bg-[#f9fafb]">
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-white text-gray-500'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-medium">{contract.tenant}</td>
                          <td className="px-4 py-2 text-[#646a73]">{contract.spaceName}</td>
                          <td className="px-4 py-2 text-right font-medium text-green-600">¥{contract.totalRentReceived.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-medium text-red-600">
                            {contract.outstandingRent > 0 ? `¥${contract.outstandingRent.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={12} className={i <= (contract.performanceRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ==================== 教师公寓管理 ==================== */}
      {mainTab === 'apartment' && (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard icon={<Home size={20} />} iconBg="bg-blue-50" iconColor="text-blue-600" title="总房源" value={apartmentStats.totalRooms} />
            <StatCard icon={<Users size={20} />} iconBg="bg-green-50" iconColor="text-green-600" title="已入住" value={apartmentStats.occupiedRooms} />
            <StatCard icon={<Key size={20} />} iconBg="bg-purple-50" iconColor="text-purple-600" title="空置房" value={apartmentStats.availableRooms} />
            <StatCard icon={<Clock size={20} />} iconBg="bg-amber-50" iconColor="text-amber-600" title="待审批" value={apartmentStats.pendingApplications} />
            <StatCard icon={<TrendingUp size={20} />} iconBg="bg-cyan-50" iconColor="text-cyan-600" title="入住率" value={`${apartmentStats.occupancyRate}%`} />
            <StatCard icon={<Droplet size={20} />} iconBg="bg-orange-50" iconColor="text-orange-600" title="待缴水电" value={`¥${apartmentStats.unpaidUtilities}`} />
          </div>

          {/* 子Tab导航 */}
          <div className="border-b border-[#dee0e3]">
            <div className="flex gap-1">
              {[
                { id: 'overview', label: '总览', icon: <BarChart3 size={16} /> },
                { id: 'applications', label: '入住申请', icon: <FileText size={16} />, badge: apartmentStats.pendingApplications },
                { id: 'rooms', label: '房源管理', icon: <Home size={16} /> },
                { id: 'utilities', label: '水电管理', icon: <Zap size={16} /> },
                { id: 'deposits', label: '押金管理', icon: <CreditCard size={16} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setApartmentTab(tab.id as ApartmentTab)}
                  className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                    apartmentTab === tab.id ? 'border-[#3370ff] text-[#3370ff]' : 'border-transparent text-[#646a73] hover:text-[#1f2329]'
                  }`}
                >
                  {tab.icon} {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${apartmentTab === tab.id ? 'bg-[#3370ff] text-white' : 'bg-amber-100 text-amber-600'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 概览 */}
          {apartmentTab === 'overview' && (
            <ApartmentHousingOverview
              apartmentRooms={apartmentRooms}
              apartmentApps={apartmentApps}
              utilityBills={utilityBills}
            />
          )}


          {/* 入住申请 */}
          {apartmentTab === 'applications' && (
            <div className="bg-white rounded-lg border border-[#dee0e3]">
              <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
                <span className="text-sm text-[#646a73]">共 {apartmentApps.length} 条申请</span>
                {isTeacher && (
                  <button onClick={() => setShowApartmentApply(true)} className="flex items-center gap-1 text-sm font-medium bg-[#3370ff] hover:bg-[#285cc9] text-white px-3 py-1.5 rounded">
                    <UserPlus size={16} /> 申请入住
                  </button>
                )}
              </div>
              <div className="divide-y divide-[#dee0e3]">
                {apartmentApps.map(app => (
                  <div key={app.id} className="p-4 hover:bg-[#f9fafb]">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-[#1f2329]">{app.applicant}</span>
                          <span className="text-sm text-[#8f959e]">{app.department} · {app.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            app.status === 'CheckedIn' ? 'bg-green-100 text-green-700' :
                            app.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            app.status === 'CheckedOut' ? 'bg-gray-100 text-gray-600' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status === 'PendingHR' ? '待人事处审核' :
                             app.status === 'PendingAsset' ? '待资产处审核' :
                             app.status === 'Approved' ? '已批准待入住' :
                             app.status === 'Rejected' ? '已驳回' :
                             app.status === 'CheckedIn' ? '已入住' :
                             app.status === 'CheckedOut' ? '已退房' : '草稿'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-[#8f959e] text-xs">申请日期</p>
                            <p>{app.applyDate}</p>
                          </div>
                          <div>
                            <p className="text-[#8f959e] text-xs">家庭人数</p>
                            <p>{app.familyMembers} 人</p>
                          </div>
                          <div>
                            <p className="text-[#8f959e] text-xs">期望入住</p>
                            <p>{app.expectedMoveInDate}</p>
                          </div>
                          {app.allocatedRoomNo && (
                            <div>
                              <p className="text-[#8f959e] text-xs">分配房间</p>
                              <p className="text-[#3370ff]">{app.allocatedRoomNo}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-[#646a73]">
                          <span className="text-[#8f959e]">申请理由:</span> {app.reason}
                        </div>

                        {/* 审批流程时间线 */}
                        {app.approvalRecords.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-[#dee0e3]">
                            <p className="text-xs text-[#8f959e] mb-2">审批进度</p>
                            <div className="flex items-center gap-2">
                              {app.approvalRecords.map((record, index) => (
                                <React.Fragment key={record.id}>
                                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                    record.action === 'Approve' ? 'bg-green-50 text-green-700' :
                                    record.action === 'Reject' ? 'bg-red-50 text-red-700' :
                                    'bg-amber-50 text-amber-700'
                                  }`}>
                                    {record.action === 'Approve' ? <CheckCircle size={12} /> : record.action === 'Reject' ? <XCircle size={12} /> : <Clock size={12} />}
                                    <span>{record.approverRole}</span>
                                  </div>
                                  {index < app.approvalRecords.length - 1 && <ChevronRight size={14} className="text-[#8f959e]" />}
                                </React.Fragment>
                              ))}
                              {(app.status === 'PendingHR' || app.status === 'PendingAsset') && (
                                <>
                                  <ChevronRight size={14} className="text-[#8f959e]" />
                                  <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">
                                    <Clock size={12} />
                                    <span>{app.currentApprover}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {isAssetAdmin && (app.status === 'PendingHR' || app.status === 'PendingAsset') && (
                          <button
                            onClick={() => { setSelectedApp(app); setShowApprovalDetail(true); }}
                            className="text-xs px-3 py-1.5 bg-[#3370ff] text-white rounded hover:bg-[#285cc9]"
                          >
                            审批
                          </button>
                        )}
                        {isAssetAdmin && app.status === 'Approved' && (
                          <button
                            onClick={() => { setSelectedApp(app); setShowRoomAllocation(true); }}
                            className="text-xs px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            分配房间
                          </button>
                        )}
                        {isTeacher && app.status === 'CheckedIn' && app.applicant === '王老师' && (
                          <button
                            onClick={() => handleCheckout(app)}
                            className="text-xs px-3 py-1.5 border border-red-500 text-red-600 rounded hover:bg-red-50"
                          >
                            申请退房
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 房源管理 */}
          {apartmentTab === 'rooms' && (
            <div className="bg-white rounded-lg border border-[#dee0e3]">
              <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#646a73]">入住率: {apartmentStats.occupancyRate}%</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {apartmentRooms.map(room => (
                  <div key={room.id} className={`border rounded-lg p-4 ${
                    room.status === 'Occupied' ? 'border-green-200 bg-green-50' :
                    room.status === 'Available' ? 'border-blue-200 bg-blue-50' :
                    room.status === 'Maintenance' ? 'border-orange-200 bg-orange-50' :
                    'border-purple-200 bg-purple-50'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-[#1f2329]">{room.roomNo}</h3>
                        <p className="text-xs text-[#8f959e]">{room.building}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        room.status === 'Occupied' ? 'bg-green-100 text-green-700' :
                        room.status === 'Available' ? 'bg-blue-100 text-blue-700' :
                        room.status === 'Maintenance' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {room.status === 'Occupied' ? '已入住' :
                         room.status === 'Available' ? '空置' :
                         room.status === 'Maintenance' ? '维修中' : '已预留'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#8f959e]">户型</span>
                        <span>{room.layout}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8f959e]">面积</span>
                        <span>{room.area} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8f959e]">月租</span>
                        <span className="font-medium">¥{room.monthlyRent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8f959e]">押金</span>
                        <span>¥{room.deposit}</span>
                      </div>
                      {room.currentTenant && (
                        <div className="flex justify-between">
                          <span className="text-[#8f959e]">住户</span>
                          <span className="text-[#3370ff]">{room.currentTenant}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#dee0e3]">
                      <div className="flex flex-wrap gap-1">
                        {room.facilities.slice(0, 4).map((f, i) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 bg-white rounded">{f}</span>
                        ))}
                        {room.facilities.length > 4 && (
                          <span className="text-xs text-[#8f959e]">+{room.facilities.length - 4}</span>
                        )}
                      </div>
                    </div>
                    {isAssetAdmin && room.status === 'Occupied' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => { setSelectedRoom(room); setShowUtilityReading(true); }}
                          className="flex-1 text-xs py-1.5 border border-[#dee0e3] rounded hover:bg-white flex items-center justify-center gap-1"
                        >
                          <Droplet size={12} /> 抄表
                        </button>
                        <button
                          onClick={() => handleGenerateUtilityBill(room.id)}
                          className="flex-1 text-xs py-1.5 border border-[#dee0e3] rounded hover:bg-white flex items-center justify-center gap-1"
                        >
                          <Receipt size={12} /> 生成账单
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 水电管理 */}
          {apartmentTab === 'utilities' && (
            <div className="space-y-6">
              {/* 水电账单 */}
              <div className="bg-white rounded-lg border border-[#dee0e3]">
                <div className="p-4 border-b border-[#dee0e3]">
                  <h3 className="font-semibold text-[#1f2329]">水电费账单</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f5f6f7] text-[#646a73]">
                      <tr>
                        <th className="px-4 py-2 text-left">房间</th>
                        <th className="px-4 py-2 text-left">住户</th>
                        <th className="px-4 py-2 text-left">账期</th>
                        <th className="px-4 py-2 text-right">水费</th>
                        <th className="px-4 py-2 text-right">电费</th>
                        <th className="px-4 py-2 text-right">合计</th>
                        <th className="px-4 py-2 text-center">状态</th>
                        <th className="px-4 py-2 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dee0e3]">
                      {utilityBills.map(bill => (
                        <tr key={bill.id} className="hover:bg-[#f9fafb]">
                          <td className="px-4 py-2 font-medium">{bill.roomNo}</td>
                          <td className="px-4 py-2">{bill.tenant}</td>
                          <td className="px-4 py-2">{bill.period}</td>
                          <td className="px-4 py-2 text-right">
                            <div>¥{bill.waterAmount.toFixed(2)}</div>
                            <div className="text-xs text-[#8f959e]">{bill.waterUsage}吨</div>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div>¥{bill.electricAmount.toFixed(2)}</div>
                            <div className="text-xs text-[#8f959e]">{bill.electricUsage}度</div>
                          </td>
                          <td className="px-4 py-2 text-right font-medium">¥{bill.totalAmount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              bill.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {bill.status === 'Paid' ? '已缴' : '待缴'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {bill.status === 'Unpaid' && isAssetAdmin && (
                              <button className="text-xs text-[#3370ff] hover:underline">催缴</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 抄表记录 */}
              <div className="bg-white rounded-lg border border-[#dee0e3]">
                <div className="p-4 border-b border-[#dee0e3]">
                  <h3 className="font-semibold text-[#1f2329]">抄表记录</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f5f6f7] text-[#646a73]">
                      <tr>
                        <th className="px-4 py-2 text-left">房间</th>
                        <th className="px-4 py-2 text-left">类型</th>
                        <th className="px-4 py-2 text-left">抄表日期</th>
                        <th className="px-4 py-2 text-right">上次读数</th>
                        <th className="px-4 py-2 text-right">本次读数</th>
                        <th className="px-4 py-2 text-right">用量</th>
                        <th className="px-4 py-2 text-right">金额</th>
                        <th className="px-4 py-2 text-left">抄表人</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dee0e3]">
                      {utilityReadings.map(reading => (
                        <tr key={reading.id} className="hover:bg-[#f9fafb]">
                          <td className="px-4 py-2 font-medium">{reading.roomNo}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center gap-1 ${reading.meterType === 'Water' ? 'text-blue-600' : 'text-yellow-600'}`}>
                              {reading.meterType === 'Water' ? <Droplet size={14} /> : <Zap size={14} />}
                              {reading.meterType === 'Water' ? '水表' : '电表'}
                            </span>
                          </td>
                          <td className="px-4 py-2">{reading.readingDate}</td>
                          <td className="px-4 py-2 text-right">{reading.previousReading}</td>
                          <td className="px-4 py-2 text-right">{reading.currentReading}</td>
                          <td className="px-4 py-2 text-right">{reading.usage} {reading.meterType === 'Water' ? '吨' : '度'}</td>
                          <td className="px-4 py-2 text-right font-medium">¥{reading.amount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-[#8f959e]">{reading.reader}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 押金管理 */}
          {apartmentTab === 'deposits' && (
            <div className="bg-white rounded-lg border border-[#dee0e3]">
              <div className="p-4 border-b border-[#dee0e3]">
                <h3 className="font-semibold text-[#1f2329]">押金记录</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f6f7] text-[#646a73]">
                    <tr>
                      <th className="px-4 py-2 text-left">住户</th>
                      <th className="px-4 py-2 text-left">房间</th>
                      <th className="px-4 py-2 text-right">押金金额</th>
                      <th className="px-4 py-2 text-left">缴纳日期</th>
                      <th className="px-4 py-2 text-center">状态</th>
                      <th className="px-4 py-2 text-right">扣除金额</th>
                      <th className="px-4 py-2 text-right">退还金额</th>
                      <th className="px-4 py-2 text-left">退还日期</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dee0e3]">
                    {deposits.map(deposit => (
                      <tr key={deposit.id} className="hover:bg-[#f9fafb]">
                        <td className="px-4 py-2 font-medium">{deposit.tenant}</td>
                        <td className="px-4 py-2">{deposit.roomNo}</td>
                        <td className="px-4 py-2 text-right">¥{deposit.depositAmount.toLocaleString()}</td>
                        <td className="px-4 py-2">{deposit.paidDate}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            deposit.status === 'Held' ? 'bg-blue-100 text-blue-700' :
                            deposit.status === 'Returned' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {deposit.status === 'Held' ? '持有中' : deposit.status === 'Returned' ? '已退还' : '已没收'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-red-600">
                          {deposit.deductions.length > 0 ? `¥${deposit.deductions.reduce((sum, d) => sum + d.amount, 0)}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-right text-green-600">
                          {deposit.returnAmount !== undefined ? `¥${deposit.returnAmount}` : '-'}
                        </td>
                        <td className="px-4 py-2">{deposit.returnDate || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ==================== 弹窗组件 ==================== */}

      {/* 租金缴纳弹窗 */}
      {showRentPayment && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowRentPayment(false); setSelectedBill(null); }}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">登记租金缴纳</h3>
              <button onClick={() => { setShowRentPayment(false); setSelectedBill(null); }}><X size={18} /></button>
            </div>
            <RentPaymentForm
              bill={selectedBill}
              onSubmit={(amount, method, transactionNo) => handlePayRent(selectedBill, amount, method, transactionNo)}
              onCancel={() => { setShowRentPayment(false); setSelectedBill(null); }}
            />
          </div>
        </div>
      )}

      {/* 合同详情弹窗 */}
      {showContractDetail && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowContractDetail(false); setSelectedContract(null); }}>
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-semibold text-lg">合同详情</h3>
              <button onClick={() => { setShowContractDetail(false); setSelectedContract(null); }}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[#8f959e] text-sm">合同编号</p><p className="font-medium">{selectedContract.contractNo}</p></div>
                <div><p className="text-[#8f959e] text-sm">房源</p><p className="font-medium">{selectedContract.spaceName}</p></div>
                <div><p className="text-[#8f959e] text-sm">承租方</p><p className="font-medium">{selectedContract.tenant}</p></div>
                <div><p className="text-[#8f959e] text-sm">联系方式</p><p className="font-medium">{selectedContract.tenantContact}</p></div>
                <div><p className="text-[#8f959e] text-sm">营业执照</p><p className="font-medium">{selectedContract.tenantLicense || '-'}</p></div>
                <div><p className="text-[#8f959e] text-sm">月租金</p><p className="font-medium text-[#3370ff]">¥{selectedContract.rentPerMonth.toLocaleString()}</p></div>
                <div><p className="text-[#8f959e] text-sm">合同期限</p><p className="font-medium">{selectedContract.startDate} 至 {selectedContract.endDate}</p></div>
                <div><p className="text-[#8f959e] text-sm">签约日期</p><p className="font-medium">{selectedContract.signDate}</p></div>
                <div><p className="text-[#8f959e] text-sm">累计收款</p><p className="font-medium text-green-600">¥{selectedContract.totalRentReceived.toLocaleString()}</p></div>
                <div><p className="text-[#8f959e] text-sm">欠费金额</p><p className="font-medium text-red-600">{selectedContract.outstandingRent > 0 ? `¥${selectedContract.outstandingRent.toLocaleString()}` : '-'}</p></div>
              </div>
              <div>
                <p className="text-[#8f959e] text-sm mb-2">履约评分</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={20} className={i <= (selectedContract.performanceRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t flex justify-end">
              <button onClick={() => { setShowContractDetail(false); setSelectedContract(null); }} className="px-4 py-2 border border-[#dee0e3] rounded hover:bg-gray-50">关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 审批弹窗 */}
      {showApprovalDetail && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowApprovalDetail(false); setSelectedApp(null); }}>
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">审批入住申请</h3>
              <button onClick={() => { setShowApprovalDetail(false); setSelectedApp(null); }}><X size={18} /></button>
            </div>
            <ApprovalForm
              app={selectedApp}
              onApprove={(comment) => handleApprove(selectedApp, comment)}
              onReject={(comment) => handleReject(selectedApp, comment)}
              onCancel={() => { setShowApprovalDetail(false); setSelectedApp(null); }}
            />
          </div>
        </div>
      )}

      {/* 房间分配弹窗 */}
      {showRoomAllocation && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowRoomAllocation(false); setSelectedApp(null); }}>
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-semibold text-lg">分配房间 - {selectedApp.applicant}</h3>
              <button onClick={() => { setShowRoomAllocation(false); setSelectedApp(null); }}><X size={18} /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#646a73] mb-4">家庭人数: {selectedApp.familyMembers} 人 | 期望入住: {selectedApp.expectedMoveInDate}</p>
              <div className="space-y-3">
                {apartmentRooms.filter(r => r.status === 'Available').map(room => (
                  <div key={room.id} className="border border-[#dee0e3] rounded-lg p-4 hover:border-[#3370ff] cursor-pointer" onClick={() => handleAllocateRoom(selectedApp, room)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{room.roomNo}</h4>
                        <p className="text-sm text-[#8f959e]">{room.building} · {room.layout} · {room.area}m²</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#3370ff]">¥{room.monthlyRent}/月</p>
                        <p className="text-xs text-[#8f959e]">押金 ¥{room.deposit}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {room.facilities.map((f, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 bg-[#f5f6f7] rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {apartmentRooms.filter(r => r.status === 'Available').length === 0 && (
                  <p className="text-center text-[#8f959e] py-8">暂无可分配房源</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 水电抄表弹窗 */}
      {showUtilityReading && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowUtilityReading(false); setSelectedRoom(null); }}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">抄表录入 - {selectedRoom.roomNo}</h3>
              <button onClick={() => { setShowUtilityReading(false); setSelectedRoom(null); }}><X size={18} /></button>
            </div>
            <UtilityReadingForm
              room={selectedRoom}
              onSubmit={handleAddUtilityReading}
              onCancel={() => { setShowUtilityReading(false); setSelectedRoom(null); }}
            />
          </div>
        </div>
      )}

      {/* 入住申请弹窗 */}
      {showApartmentApply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowApartmentApply(false)}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">教师公寓入住申请</h3>
              <button onClick={() => setShowApartmentApply(false)}><X size={18} /></button>
            </div>
            <ApartmentApplyForm
              onSubmit={(data) => {
                const newApp: ApartmentApplication = {
                  id: `APT-${Date.now().toString().slice(-6)}`,
                  ...data,
                  applicantId: `T-${Date.now()}`,
                  applyDate: new Date().toISOString().split('T')[0],
                  status: 'PendingHR',
                  currentApprover: '人事处',
                  approvalRecords: [],
                };
                setApartmentApps(prev => [newApp, ...prev]);
                setShowApartmentApply(false);
              }}
              onCancel={() => setShowApartmentApply(false)}
            />
          </div>
        </div>
      )}

      {/* 发布房源弹窗 */}
      {showAddSpace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowAddSpace(false); setEditingSpace(null); }}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">{editingSpace ? '编辑房源' : '发布房源'}</h3>
              <button onClick={() => { setShowAddSpace(false); setEditingSpace(null); }}><X size={18} /></button>
            </div>
            <AddSpaceForm
              initial={editingSpace}
              onSubmit={(space) => {
                const exists = spaces.some(s => {
                  if (editingSpace && s.id === editingSpace.id) return false;
                  if (!(s.status === '公开招租' || s.status === '已出租')) return false;
                  return isDuplicateSpaceKey(s.name, space.name);
                });

                if (exists) {
                  alert('该房源（同楼层+同房号）已存在且处于“公开招租/已出租”状态，不能重复发布。');
                  return;
                }

                if (editingSpace) {
                  setSpaces(prev => prev.map(s => s.id === editingSpace.id ? { ...s, ...space, id: s.id, bids: s.bids, status: s.status } : s));
                } else {
                  setSpaces(prev => [...prev, { ...space, id: `SP-${Date.now()}`, bids: [], status: '公开招租' }]);
                }

                setShowAddSpace(false);
                setEditingSpace(null);
              }}
              onCancel={() => { setShowAddSpace(false); setEditingSpace(null); }}
            />
          </div>
        </div>
      )}

      <div className="text-xs text-[#8f959e] mt-4 flex items-center gap-1">
        <AlertTriangle size={12} /> 本页面为增强版原型，包含租金收缴、合同管理、审批流程、水电结算等完整功能。
      </div>
    </div>
  );
};

// ==================== 表单组件 ====================

const RentPaymentForm: React.FC<{
  bill: RentBill;
  onSubmit: (amount: number, method: string, transactionNo: string) => void;
  onCancel: () => void;
}> = ({ bill, onSubmit, onCancel }) => {
  const [amount, setAmount] = useState(bill.totalAmount - bill.paidAmount);
  const [method, setMethod] = useState('银行转账');
  const [transactionNo, setTransactionNo] = useState('');

  return (
    <div className="p-6 space-y-4">
      <div className="bg-[#f5f6f7] p-4 rounded">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-[#8f959e]">承租方:</span> {bill.tenant}</div>
          <div><span className="text-[#8f959e]">账期:</span> {bill.period}</div>
          <div><span className="text-[#8f959e]">应缴总额:</span> ¥{bill.totalAmount.toLocaleString()}</div>
          <div><span className="text-[#8f959e]">已缴金额:</span> ¥{bill.paidAmount.toLocaleString()}</div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">缴纳金额 (元)</label>
        <input
          type="number"
          className="w-full border border-[#dee0e3] rounded px-3 py-2"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          max={bill.totalAmount - bill.paidAmount}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">支付方式</label>
        <select className="w-full border border-[#dee0e3] rounded px-3 py-2" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="银行转账">银行转账</option>
          <option value="现金">现金</option>
          <option value="支票">支票</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">交易流水号</label>
        <input
          type="text"
          className="w-full border border-[#dee0e3] rounded px-3 py-2"
          value={transactionNo}
          onChange={e => setTransactionNo(e.target.value)}
          placeholder="请输入银行流水号或收据编号"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button onClick={onCancel} className="flex-1 px-4 py-2 border border-[#dee0e3] rounded hover:bg-gray-50">取消</button>
        <button
          onClick={() => onSubmit(amount, method, transactionNo)}
          className="flex-1 px-4 py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9]"
          disabled={!amount || !transactionNo}
        >
          确认登记
        </button>
      </div>
    </div>
  );
};

const ApprovalForm: React.FC<{
  app: ApartmentApplication;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
  onCancel: () => void;
}> = ({ app, onApprove, onReject, onCancel }) => {
  const [comment, setComment] = useState('');

  return (
    <div className="p-6 space-y-4">
      <div className="bg-[#f5f6f7] p-4 rounded space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-[#8f959e]">申请人:</span><span>{app.applicant}</span></div>
        <div className="flex justify-between"><span className="text-[#8f959e]">部门:</span><span>{app.department}</span></div>
        <div className="flex justify-between"><span className="text-[#8f959e]">职称:</span><span>{app.title}</span></div>
        <div className="flex justify-between"><span className="text-[#8f959e]">家庭人数:</span><span>{app.familyMembers}人</span></div>
        <div className="flex justify-between"><span className="text-[#8f959e]">期望入住:</span><span>{app.expectedMoveInDate}</span></div>
        <div><span className="text-[#8f959e]">申请理由:</span><p className="mt-1">{app.reason}</p></div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">审批意见</label>
        <textarea
          className="w-full border border-[#dee0e3] rounded px-3 py-2 h-24"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="请输入审批意见..."
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button onClick={onCancel} className="flex-1 px-4 py-2 border border-[#dee0e3] rounded hover:bg-gray-50">取消</button>
        <button
          onClick={() => onReject(comment || '不符合条件')}
          className="flex-1 px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50"
        >
          驳回
        </button>
        <button
          onClick={() => onApprove(comment || '同意')}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          通过
        </button>
      </div>
    </div>
  );
};

const UtilityReadingForm: React.FC<{
  room: ApartmentRoom;
  onSubmit: (reading: Omit<UtilityReading, 'id'>) => void;
  onCancel: () => void;
}> = ({ room, onSubmit, onCancel }) => {
  const [meterType, setMeterType] = useState<'Water' | 'Electric'>('Water');
  const [currentReading, setCurrentReading] = useState('');
  const [previousReading, setPreviousReading] = useState(0);
  const unitPrice = meterType === 'Water' ? 3.5 : 0.6;
  const usage = currentReading ? Number(currentReading) - previousReading : 0;
  const amount = usage * unitPrice;

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">表计类型</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={meterType === 'Water'} onChange={() => setMeterType('Water')} />
            <Droplet size={16} className="text-blue-500" />
            <span>水表</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={meterType === 'Electric'} onChange={() => setMeterType('Electric')} />
            <Zap size={16} className="text-yellow-500" />
            <span>电表</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">上次读数</label>
        <input
          type="number"
          className="w-full border border-[#dee0e3] rounded px-3 py-2 bg-[#f5f6f7]"
          value={previousReading}
          onChange={e => setPreviousReading(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">本次读数</label>
        <input
          type="number"
          className="w-full border border-[#dee0e3] rounded px-3 py-2"
          value={currentReading}
          onChange={e => setCurrentReading(e.target.value)}
          placeholder="请输入当前表计读数"
        />
      </div>
      <div className="bg-[#f5f6f7] p-4 rounded space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#8f959e]">用量:</span>
          <span className="font-medium">{usage.toFixed(2)} {meterType === 'Water' ? '吨' : '度'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#8f959e]">单价:</span>
          <span className="font-medium">¥{unitPrice} / {meterType === 'Water' ? '吨' : '度'}</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>应缴金额:</span>
          <span className="text-[#3370ff]">¥{amount.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <button onClick={onCancel} className="flex-1 px-4 py-2 border border-[#dee0e3] rounded hover:bg-gray-50">取消</button>
        <button
          onClick={() => onSubmit({
            roomId: room.id,
            roomNo: room.roomNo,
            tenant: room.currentTenant || '',
            meterType,
            readingDate: new Date().toISOString().split('T')[0],
            previousReading,
            currentReading: Number(currentReading),
            usage,
            unitPrice,
            amount,
            reader: '当前用户',
          })}
          className="flex-1 px-4 py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9]"
          disabled={!currentReading || Number(currentReading) <= previousReading}
        >
          确认录入
        </button>
      </div>
    </div>
  );
};

const ApartmentApplyForm: React.FC<{
  onSubmit: (data: Omit<ApartmentApplication, 'id' | 'applicantId' | 'applyDate' | 'status' | 'currentApprover' | 'approvalRecords'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    applicant: '',
    department: '',
    phone: '',
    title: '讲师',
    familyMembers: 1,
    expectedMoveInDate: '',
    reason: '',
  });

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">姓名</label>
          <input className="w-full border border-[#dee0e3] rounded px-3 py-2" value={formData.applicant} onChange={e => setFormData({ ...formData, applicant: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">联系电话</label>
          <input className="w-full border border-[#dee0e3] rounded px-3 py-2" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">所属部门</label>
          <input className="w-full border border-[#dee0e3] rounded px-3 py-2" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">职称</label>
          <select className="w-full border border-[#dee0e3] rounded px-3 py-2" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}>
            <option value="教授">教授</option>
            <option value="副教授">副教授</option>
            <option value="讲师">讲师</option>
            <option value="助教">助教</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">家庭人数</label>
          <input type="number" min="1" className="w-full border border-[#dee0e3] rounded px-3 py-2" value={formData.familyMembers} onChange={e => setFormData({ ...formData, familyMembers: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">期望入住日期</label>
          <input type="date" className="w-full border border-[#dee0e3] rounded px-3 py-2" value={formData.expectedMoveInDate} onChange={e => setFormData({ ...formData, expectedMoveInDate: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">申请理由</label>
        <textarea className="w-full border border-[#dee0e3] rounded px-3 py-2 h-20" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="请说明申请入住的原因..." />
      </div>
      <div className="flex gap-2 pt-4">
        <button onClick={onCancel} className="flex-1 px-4 py-2 border border-[#dee0e3] rounded hover:bg-gray-50">取消</button>
        <button
          onClick={() => onSubmit(formData as any)}
          className="flex-1 px-4 py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9]"
          disabled={!formData.applicant || !formData.department || !formData.reason}
        >
          提交申请
        </button>
      </div>
    </div>
  );
};

const AddSpaceForm: React.FC<{
  initial?: SpaceItem | null;
  onSubmit: (space: { name: string; area: number; monthlyRent: number }) => void;
  onCancel: () => void;
}> = ({ initial, onSubmit, onCancel }) => {
  const initKey = parseSpaceKeyFromName(initial?.name || '');

  const [floor, setFloor] = useState(initKey.floor || '一');
  const [roomNumber, setRoomNumber] = useState(initKey.roomNo || '101');
  const [purpose, setPurpose] = useState(() => {
    const raw = String(initial?.name || '').trim();
    const m = raw.match(/\d+\s+(.*)$/);
    return (m?.[1]?.trim() || '商铺');
  });
  const [area, setArea] = useState(initial?.area ? String(initial.area) : '');
  const [monthlyRent, setMonthlyRent] = useState(initial?.monthlyRent ? String(initial.monthlyRent) : '');

  const floorOptions = ['一', '二', '三', '四', '五', '六', '七'];
  const roomNumberOptions = Array.from({ length: 20 }, (_, i) => `${floorOptions.indexOf(floor) + 1}${String(i + 1).padStart(2, '0')}`);

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">楼层</label>
          <select value={floor} onChange={e => setFloor(e.target.value)} className="w-full border border-[#dee0e3] rounded px-3 py-2">
            {floorOptions.map(f => <option key={f} value={f}>{f}层</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">房间号</label>
          <select value={roomNumber} onChange={e => setRoomNumber(e.target.value)} className="w-full border border-[#dee0e3] rounded px-3 py-2">
            {roomNumberOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">用途</label>
          <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full border border-[#dee0e3] rounded px-3 py-2">
            <option value="商铺">商铺</option>
            <option value="办公室">办公室</option>
            <option value="培训中心">培训中心</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">建筑面积 (m²)</label>
          <input type="number" className="w-full border border-[#dee0e3] rounded px-3 py-2" value={area} onChange={e => setArea(e.target.value)} placeholder="120" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">参考月租 (元)</label>
          <input type="number" className="w-full border border-[#dee0e3] rounded px-3 py-2" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} placeholder="10000" />
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <button onClick={onCancel} className="flex-1 px-4 py-2 border border-[#dee0e3] rounded hover:bg-gray-50">取消</button>
        <button
          onClick={() => onSubmit({
            name: `${floor}层 ${roomNumber} ${purpose}`,
            area: Number(area),
            monthlyRent: Number(monthlyRent),
          })}
          className="flex-1 px-4 py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9]"
          disabled={!area}
        >
          确认发布
        </button>
      </div>
    </div>
  );
};

export default CommercialHousing;
