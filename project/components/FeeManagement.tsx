import React, { useState, useMemo } from 'react';
import {
  DollarSign, AlertTriangle, FileText, Bot, Bell, Calendar, Upload, Settings,
  Search, Filter, Download, Plus, X, Check, Clock, Eye, Edit2, Trash2,
  Send, MessageSquare, AlertCircle, CheckCircle, XCircle, TrendingUp, TrendingDown,
  Building, Users, BarChart3, PieChart, RefreshCw, Printer, FileSpreadsheet,
  ChevronDown, ChevronRight, History, Ban, CreditCard, Receipt, Scale
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, PieChart as RechartsPie, Pie } from 'recharts';
import { generateFeeAnalysisReport } from '../services/geminiService';
import { PersonUsage, PersonFeeBill } from '../types';
import ReactMarkdown from 'react-markdown';
import {
  UserRole, FeeStatus, RoomUseType,
  FeeStandard, FeeTierRule, FeeBill, PaymentRecord, ReminderRecord,
  VerificationRecord, DisputeRecord, ExtendedDepartmentFee
} from '../types';
import PersonFeeManagement from './PersonFeeManagement';
import {
  MOCK_FEE_STANDARDS, MOCK_FEE_TIER_RULES, MOCK_FEE_BILLS,
  MOCK_PAYMENT_RECORDS, MOCK_REMINDER_RECORDS, MOCK_VERIFICATION_RECORDS,
  MOCK_DISPUTE_RECORDS, MOCK_EXTENDED_FEES
} from '../constants';
import { MOCK_PERSON_USAGES } from '../constants/personFeeData';
import { getPersonQuotaArea } from '../utils/personQuota';

interface FeeManagementProps {
  userRole: UserRole;
}

// localStorage hook
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

type TabType = 'overview' | 'persons' | 'bills' | 'payments' | 'reminders' | 'disputes' | 'settings';

const FeeManagement: React.FC<FeeManagementProps> = ({ userRole }) => {
  // 数据状态
  const [fees, setFees] = useLocalStorage<ExtendedDepartmentFee[]>('extended-fees', MOCK_EXTENDED_FEES);
  const [bills, setBills] = useLocalStorage<FeeBill[]>('fee-bills', MOCK_FEE_BILLS);
  const [payments, setPayments] = useLocalStorage<PaymentRecord[]>('payment-records', MOCK_PAYMENT_RECORDS);
  const [reminders, setReminders] = useLocalStorage<ReminderRecord[]>('reminder-records', MOCK_REMINDER_RECORDS);
  const [disputes, setDisputes] = useLocalStorage<DisputeRecord[]>('dispute-records', MOCK_DISPUTE_RECORDS);
  const [standards, setStandards] = useLocalStorage<FeeStandard[]>('fee-standards', MOCK_FEE_STANDARDS);
  const [tierRules, setTierRules] = useLocalStorage<FeeTierRule[]>('tier-rules', MOCK_FEE_TIER_RULES);
  const [verifications] = useState<VerificationRecord[]>(MOCK_VERIFICATION_RECORDS);
  const [personUsages, setPersonUsages] = useLocalStorage<PersonUsage[]>('person-usages-v1', MOCK_PERSON_USAGES);
  const [personBills, setPersonBills] = useLocalStorage<PersonFeeBill[]>('person-fee-bills-v1', []);

  const [billMonth, setBillMonth] = useState<string>('2025-01');
  const [selectedDepartmentForDetail, setSelectedDepartmentForDetail] = useState<string | null>(null);
  const [isCollegeDetailOpen, setIsCollegeDetailOpen] = useState(false);

  // UI 状态
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeeStatus | 'all'>('all');
  const [yearFilter, setYearFilter] = useState<number>(2025);
  const [selectedBill, setSelectedBill] = useState<FeeBill | null>(null);
  const [selectedFee, setSelectedFee] = useState<ExtendedDepartmentFee | null>(null);

  // 模态框状态
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isStandardModalOpen, setIsStandardModalOpen] = useState(false);
  const [isGenerateBillModalOpen, setIsGenerateBillModalOpen] = useState(false);

  // AI 报告
  const [aiReport, setAiReport] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // 用户部门
  const myDepartmentName = userRole === UserRole.CollegeAdmin ? '机械工程学院' : userRole === UserRole.Teacher ? '计算机学院' : '资产处';
  const isAssetAdmin = userRole === UserRole.AssetAdmin;

  // 统计数据
  const stats = useMemo(() => {
    const currentYearFees = fees.filter(f => f.year === yearFilter);
    return {
      totalDepartments: currentYearFees.length,
      totalAmount: currentYearFees.reduce((acc, f) => acc + f.totalCost, 0),
      paidAmount: currentYearFees.reduce((acc, f) => acc + f.paidAmount, 0),
      pendingAmount: currentYearFees.reduce((acc, f) => acc + f.remainingAmount, 0),
      completedCount: currentYearFees.filter(f => f.status === FeeStatus.Completed).length,
      pendingCount: currentYearFees.filter(f => [FeeStatus.BillGenerated, FeeStatus.PendingConfirm].includes(f.status)).length,
      disputeCount: currentYearFees.filter(f => f.status === FeeStatus.Disputed).length,
      blacklistCount: currentYearFees.filter(f => f.isBlacklisted).length,
      overQuotaCount: currentYearFees.filter(f => f.excessArea > 0).length,
    };
  }, [fees, yearFilter]);

  // 筛选后的费用列表
  const filteredFees = useMemo(() => {
    return fees.filter(f => {
      const matchSearch = f.departmentName.includes(searchTerm);
      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      const matchYear = f.year === yearFilter;
      const matchDept = isAssetAdmin || f.departmentName === myDepartmentName;
      return matchSearch && matchStatus && matchYear && matchDept;
    });
  }, [fees, searchTerm, statusFilter, yearFilter, isAssetAdmin, myDepartmentName]);

  // 辅助函数
  const getStatusLabel = (status: FeeStatus) => {
    const labels: Record<FeeStatus, string> = {
      [FeeStatus.Verifying]: '数据核对中',
      [FeeStatus.BillGenerated]: '账单已生成',
      [FeeStatus.PendingConfirm]: '待学院确认',
      [FeeStatus.Disputed]: '争议处理中',
      [FeeStatus.FinanceProcessing]: '财务处理中',
      [FeeStatus.Completed]: '已完结',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: FeeStatus) => {
    const colors: Record<FeeStatus, string> = {
      [FeeStatus.Verifying]: 'bg-gray-100 text-gray-600',
      [FeeStatus.BillGenerated]: 'bg-blue-100 text-blue-700',
      [FeeStatus.PendingConfirm]: 'bg-amber-100 text-amber-700',
      [FeeStatus.Disputed]: 'bg-red-100 text-red-700',
      [FeeStatus.FinanceProcessing]: 'bg-purple-100 text-purple-700',
      [FeeStatus.Completed]: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getUseTypeLabel = (t: RoomUseType) => {
    const labels: Record<RoomUseType, string> = {
      [RoomUseType.Office]: '行政办公',
      [RoomUseType.Teaching]: '教学用房',
      [RoomUseType.Lab]: '科研实验室',
      [RoomUseType.Student]: '学生用房',
      [RoomUseType.Meeting]: '会议室',
      [RoomUseType.Storage]: '库房',
      [RoomUseType.Other]: '其他',
    };
    return labels[t];
  };

  const getTierColor = (percent: number) => {
    if (percent <= 10) return 'text-green-600';
    if (percent <= 30) return 'text-amber-600';
    if (percent <= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTierLabel = (percent: number) => {
    if (percent <= 10) return '基础费率';
    if (percent <= 30) return '1.5倍费率';
    if (percent <= 50) return '2倍费率';
    return '熔断费率(3倍)';
  };

  // 操作函数
  const handleGenerateReport = async () => {
    setLoadingAi(true);
    setAiReport('');
    const report = await generateFeeAnalysisReport(fees);
    setAiReport(report);
    setLoadingAi(false);
  };

  const handleSendReminder = (fee: ExtendedDepartmentFee, type: ReminderRecord['reminderType']) => {
    const newReminder: ReminderRecord = {
      id: `REM-${Date.now()}`,
      billId: `BILL-${fee.id}`,
      billNo: `GF-${fee.year}-${fee.id.split('-')[1]}`,
      departmentName: fee.departmentName,
      reminderType: type,
      content: type === 'System' 
        ? `您的${fee.year}年度公房使用费账单待处理，超额费用${fee.totalCost.toLocaleString()}元，请及时确认并缴费。`
        : `【催缴通知】贵院${fee.year}年度公房超额使用费${fee.totalCost.toLocaleString()}元尚未缴纳，请于月底前完成缴费。`,
      sentAt: new Date().toISOString(),
      sentBy: isAssetAdmin ? '资产处管理员' : '系统',
      isRead: false,
    };
    setReminders(prev => [newReminder, ...prev]);
    setFees(prev => prev.map(f => f.id === fee.id ? {
      ...f,
      hasReminder: true,
      reminderCount: f.reminderCount + 1,
      lastReminderAt: new Date().toISOString().split('T')[0],
    } : f));
    setIsReminderModalOpen(false);
    setSelectedFee(null);
  };

  const handleConfirmBill = (fee: ExtendedDepartmentFee) => {
    setFees(prev => prev.map(f => f.id === fee.id ? {
      ...f,
      status: FeeStatus.FinanceProcessing,
      confirmedAt: new Date().toISOString().split('T')[0],
    } : f));
    setBills(prev => prev.map(b => b.departmentName === fee.departmentName && b.year === fee.year ? {
      ...b,
      status: FeeStatus.FinanceProcessing,
      confirmedAt: new Date().toISOString().split('T')[0],
    } : b));
  };

  const handleFinanceDeduction = (fee: ExtendedDepartmentFee) => {
    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      billId: `BILL-${fee.id}`,
      billNo: `GF-${fee.year}-${fee.id.split('-')[1]}`,
      departmentName: fee.departmentName,
      amount: fee.remainingAmount,
      paymentMethod: 'FinanceDeduction',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionNo: `TXN-${Date.now()}`,
      operator: '财务处',
      status: 'Confirmed',
      confirmedBy: '财务处',
      confirmedAt: new Date().toISOString().split('T')[0],
    };
    setPayments(prev => [newPayment, ...prev]);
    setFees(prev => prev.map(f => f.id === fee.id ? {
      ...f,
      status: FeeStatus.Completed,
      isPaid: true,
      paidAmount: f.totalCost,
      remainingAmount: 0,
      paidAt: new Date().toISOString().split('T')[0],
    } : f));
  };

  const handleSubmitDispute = (fee: ExtendedDepartmentFee, description: string, disputeType: DisputeRecord['disputeType']) => {
    const newDispute: DisputeRecord = {
      id: `DIS-${Date.now()}`,
      billId: `BILL-${fee.id}`,
      billNo: `GF-${fee.year}-${fee.id.split('-')[1]}`,
      departmentName: fee.departmentName,
      disputeType,
      description,
      status: 'Open',
      submittedBy: myDepartmentName,
      submittedAt: new Date().toISOString(),
    };
    setDisputes(prev => [newDispute, ...prev]);
    setFees(prev => prev.map(f => f.id === fee.id ? {
      ...f,
      status: FeeStatus.Disputed,
    } : f));
    setIsDisputeModalOpen(false);
    setSelectedFee(null);
  };

  const handleResolveDispute = (dispute: DisputeRecord, resolution: string, approved: boolean) => {
    setDisputes(prev => prev.map(d => d.id === dispute.id ? {
      ...d,
      status: approved ? 'Resolved' : 'Rejected',
      resolution,
      resolvedBy: '资产处管理员',
      resolvedAt: new Date().toISOString(),
    } : d));
    if (approved) {
      setFees(prev => prev.map(f => f.departmentName === dispute.departmentName ? {
        ...f,
        status: FeeStatus.PendingConfirm,
      } : f));
    } else {
      setFees(prev => prev.map(f => f.departmentName === dispute.departmentName ? {
        ...f,
        status: FeeStatus.BillGenerated,
      } : f));
    }
  };

  const handleAddToBlacklist = (fee: ExtendedDepartmentFee) => {
    setFees(prev => prev.map(f => f.id === fee.id ? { ...f, isBlacklisted: true } : f));
  };

  const handleRemoveFromBlacklist = (fee: ExtendedDepartmentFee) => {
    setFees(prev => prev.map(f => f.id === fee.id ? { ...f, isBlacklisted: false } : f));
  };

  const handleGenerateBills = (month: string) => {
    const now = new Date().toISOString();
    const year = Number(month.slice(0, 4));
    const basePrice = standards.find(s => s.isActive)?.basePrice ?? (MOCK_FEE_STANDARDS[0]?.basePrice ?? 120);

    // 1) 生成个人账单（按月）
    const rawPersonBills: PersonFeeBill[] = personUsages.map(u => {
      const quotaArea = getPersonQuotaArea(u.title);
      const excessArea = Math.max(0, u.actualArea - quotaArea);

      const baseCost = excessArea * u.basePrice;
      const tierMultiplier = excessArea > 0 ? 1.5 : 1.0;
      const tierCost = baseCost * (tierMultiplier - 1);
      const totalCost = Math.round(baseCost + tierCost);

      return {
        id: `PBILL-${u.personId}-${month}`,
        collegeBillId: `BILL-${u.departmentName}-${month}`,
        personId: u.personId,
        personName: u.personName,
        departmentName: u.departmentName,
        year,
        month,
        quotaArea,
        actualArea: u.actualArea,
        excessArea,
        basePrice: u.basePrice,
        tierMultiplier,
        baseCost: Math.round(baseCost),
        tierCost: Math.round(tierCost),
        amount: totalCost,
        status: FeeStatus.BillGenerated,
        generatedAt: now,
      };
    }).filter(bill => bill.amount > 0);

    // 2) 汇总学院总账单（B）
    const departmentAggregates: Record<string, {
      quotaArea: number;
      actualArea: number;
      excessArea: number;
      baseCost: number;
      tierCost: number;
      totalCost: number;
    }> = {};

    rawPersonBills.forEach(pb => {
      if (!departmentAggregates[pb.departmentName]) {
        departmentAggregates[pb.departmentName] = { quotaArea: 0, actualArea: 0, excessArea: 0, baseCost: 0, tierCost: 0, totalCost: 0 };
      }
      const agg = departmentAggregates[pb.departmentName];
      agg.quotaArea += pb.quotaArea;
      agg.actualArea += pb.actualArea;
      agg.excessArea += pb.excessArea;
      agg.baseCost += pb.baseCost;
      agg.tierCost += pb.tierCost;
      agg.totalCost += pb.amount;
    });

    const newCollegeBills: FeeBill[] = [];
    const newExtendedFees: ExtendedDepartmentFee[] = [];

    Object.entries(departmentAggregates).forEach(([deptName, agg]) => {
      const collegeBillId = `BILL-${deptName}-${month}`;
      const excessPercent = agg.quotaArea > 0 ? (agg.excessArea / agg.quotaArea) * 100 : 0;
      const tierMultiplier = agg.baseCost > 0 ? (agg.totalCost / agg.baseCost) : 1;

      newCollegeBills.push({
        id: collegeBillId,
        billNo: `GF-${month}-${deptName.slice(0, 4)}`,
        year,
        month,
        departmentId: `DEPT-${deptName}`,
        departmentName: deptName,
        quotaArea: Math.round(agg.quotaArea * 100) / 100,
        actualArea: Math.round(agg.actualArea * 100) / 100,
        excessArea: Math.round(agg.excessArea * 100) / 100,
        basePrice,
        tierMultiplier: Math.round(tierMultiplier * 100) / 100,
        calculatedAmount: Math.round(agg.totalCost),
        status: FeeStatus.PendingConfirm,
        generatedAt: now,
        operator: '系统',
        items: [
          { code: 'excess_area', name: '超额面积', amount: Math.round(agg.excessArea * 100) / 100, unit: '㎡' },
          { code: 'base_cost', name: '基础费用', amount: Math.round(agg.baseCost), unit: '元' },
          { code: 'tier_cost', name: '阶梯加收', amount: Math.round(agg.tierCost), unit: '元' },
          { code: 'total', name: '合计', amount: Math.round(agg.totalCost), unit: '元' },
        ],
      } as any);

      newExtendedFees.push({
        id: `FEE-${deptName}-${month}`,
        departmentName: deptName,
        year,
        month,
        quotaArea: Math.round(agg.quotaArea * 100) / 100,
        actualArea: Math.round(agg.actualArea * 100) / 100,
        excessArea: Math.round(agg.excessArea * 100) / 100,
        excessPercent,
        basePrice,
        tierMultiplier: Math.round(tierMultiplier * 100) / 100,
        baseCost: Math.round(agg.baseCost),
        tierCost: Math.round(agg.tierCost),
        totalCost: Math.round(agg.totalCost),
        excessCost: Math.round(agg.totalCost),
        paidAmount: 0,
        remainingAmount: Math.round(agg.totalCost),
        status: FeeStatus.PendingConfirm,
        isPaid: false,
        hasReminder: false,
        reminderCount: 0,
        isBlacklisted: false,
      } as any);
    });

    // 3) 写入 state：按 month 覆盖（避免重复生成）
    setPersonBills(prev => [...prev.filter(b => (b as any).month !== month), ...rawPersonBills]);
    setBills(prev => [...prev.filter(b => (b as any).month !== month), ...newCollegeBills]);
    setFees(prev => [...prev.filter(f => (f as any).month !== month), ...newExtendedFees]);

    alert(`${month} 账单已生成！\n- 个人账单: ${rawPersonBills.length}条\n- 学院总账单: ${newCollegeBills.length}条`);
    setIsGenerateBillModalOpen(false);
  };

  // 新增收费标准
  const [newStandard, setNewStandard] = useState<Partial<FeeStandard>>({
    name: '', useType: RoomUseType.Office, basePrice: 0, effectiveDate: '', isActive: true
  });

  const handleAddStandard = () => {
    if (!newStandard.name || !newStandard.basePrice) return;
    const standard: FeeStandard = {
      id: `FS-${Date.now()}`,
      name: newStandard.name!,
      useType: newStandard.useType!,
      basePrice: newStandard.basePrice!,
      effectiveDate: newStandard.effectiveDate || new Date().toISOString().split('T')[0],
      isActive: true,
      description: newStandard.description,
    };
    setStandards(prev => [...prev, standard]);
    setIsStandardModalOpen(false);
    setNewStandard({ name: '', useType: RoomUseType.Office, basePrice: 0, effectiveDate: '', isActive: true });
  };

  // 导出功能
  const handleExport = (type: 'fees' | 'bills' | 'payments') => {
    let data: any[] = [];
    let filename = '';
    
    if (type === 'fees') {
      data = filteredFees.map(f => ({
        部门: f.departmentName,
        年度: f.year,
        定额面积: f.quotaArea,
        实际面积: f.actualArea,
        超额面积: f.excessArea,
        超额比例: `${f.excessPercent.toFixed(1)}%`,
        基础费用: f.baseCost,
        阶梯加收: f.tierCost,
        总费用: f.totalCost,
        已缴金额: f.paidAmount,
        待缴金额: f.remainingAmount,
        状态: getStatusLabel(f.status),
      }));
      filename = `公房收费汇总_${yearFilter}`;
    } else if (type === 'payments') {
      data = payments.map(p => ({
        账单编号: p.billNo,
        部门: p.departmentName,
        金额: p.amount,
        支付方式: p.paymentMethod === 'BankTransfer' ? '银行转账' : p.paymentMethod === 'FinanceDeduction' ? '财务扣款' : '其他',
        支付日期: p.paymentDate,
        流水号: p.transactionNo || '-',
        状态: p.status === 'Confirmed' ? '已确认' : p.status === 'Pending' ? '待确认' : '已拒绝',
      }));
      filename = '缴费记录';
    }
    
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(','), ...data.map(row => headers.map(h => row[h]).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Tab 配置
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number; adminOnly?: boolean }[] = [
    { id: 'overview', label: '费用总览', icon: <BarChart3 size={16} /> },
    { id: 'persons', label: '个人缴费', icon: <Users size={16} /> },
    { id: 'bills', label: '账单管理', icon: <Receipt size={16} />, badge: stats.pendingCount },
    { id: 'payments', label: '缴费记录', icon: <CreditCard size={16} /> },
    { id: 'reminders', label: '催缴管理', icon: <Bell size={16} />, adminOnly: true },
    { id: 'disputes', label: '争议处理', icon: <Scale size={16} />, badge: stats.disputeCount },
    { id: 'settings', label: '收费设置', icon: <Settings size={16} />, adminOnly: true },
  ];

  // 图表数据
  const chartData = filteredFees.map(f => ({
    name: f.departmentName.replace('学院', ''),
    定额: f.quotaArea,
    实占: f.actualArea,
    超额: f.excessArea,
    费用: f.totalCost / 1000,
  }));

  const pieData = [
    { name: '已完结', value: stats.completedCount, color: '#22c55e' },
    { name: '待处理', value: stats.pendingCount, color: '#f59e0b' },
    { name: '争议中', value: stats.disputeCount, color: '#ef4444' },
    { name: '处理中', value: fees.filter(f => f.status === FeeStatus.FinanceProcessing).length, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329]">校内公用房使用收费管理</h2>
          <p className="text-[#646a73]">年度收费核算、账单管理、催缴跟踪、争议处理全流程</p>
        </div>
        <div className="flex gap-3">
          {isAssetAdmin && (
            <>
              <button
                onClick={() => setIsGenerateBillModalOpen(true)}
                className="px-4 py-2 border border-[#dee0e3] text-[#646a73] rounded-md flex items-center gap-2 text-sm hover:bg-[#f5f6f7]"
              >
                <FileSpreadsheet size={16} /> 生成账单
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={loadingAi}
                className="bg-[#3370ff] hover:bg-[#285cc9] disabled:opacity-50 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm text-sm font-medium"
              >
                <Bot size={18} />
                <span>{loadingAi ? '分析中...' : 'AI 智能分析'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 黑名单警告 */}
      {!isAssetAdmin && fees.find(f => f.departmentName === myDepartmentName)?.isBlacklisted && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-3">
          <Ban className="flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-sm">您的用房申请权限已被冻结</p>
            <p className="text-xs mt-1">因公房使用费长期未缴清，您的新增用房申请权限已被冻结。请尽快完成缴费以恢复权限。</p>
          </div>
        </div>
      )}

      {/* AI 分析报告 */}
      {aiReport && (
        <div className="bg-[#eff6ff] border border-[#dbeafe] p-6 rounded-lg animate-fade-in">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-[#3370ff] flex items-center gap-2">
              <Bot size={20} /> Gemini 智能分析报告
            </h3>
            <button onClick={() => setAiReport('')} className="text-[#8f959e] hover:text-[#1f2329]">
              <X size={18} />
            </button>
          </div>
          <div className="prose prose-sm text-[#1f2329] max-w-none">
            <ReactMarkdown>{aiReport}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* 统计卡片 */}
      {isAssetAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-blue-50">
                <DollarSign size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-[#1f2329]">¥{(stats.totalAmount / 10000).toFixed(1)}万</p>
              <p className="text-xs text-[#8f959e] mt-1">应收总额</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <span className="text-xs flex items-center gap-1 text-green-600">
                <TrendingUp size={12} />
                {stats.totalAmount > 0 ? ((stats.paidAmount / stats.totalAmount) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-[#1f2329]">¥{(stats.paidAmount / 10000).toFixed(1)}万</p>
              <p className="text-xs text-[#8f959e] mt-1">已收金额</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-amber-50">
                <Clock size={20} className="text-amber-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-[#1f2329]">{stats.pendingCount}</p>
              <p className="text-xs text-[#8f959e] mt-1">待处理账单</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-red-50">
                <Ban size={20} className="text-red-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-[#1f2329]">{stats.blacklistCount}</p>
              <p className="text-xs text-[#8f959e] mt-1">黑名单单位</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 导航 */}
      <div className="border-b border-[#dee0e3]">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.filter(tab => !tab.adminOnly || isAssetAdmin).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id ? 'border-[#3370ff] text-[#3370ff]' : 'border-transparent text-[#646a73] hover:text-[#1f2329]'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-[#3370ff] text-white' : 'bg-[#f2f3f5] text-[#646a73]'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 内容 */}
      <div className="bg-white rounded-lg border border-[#dee0e3] overflow-hidden">
        {/* ========== 个人缴费 Tab ========== */}
        {activeTab === 'persons' && (
          <PersonFeeManagement
            year={yearFilter}
            departmentFees={fees}
            setDepartmentFees={setFees}
            payments={payments}
            setPayments={setPayments}
            reminders={reminders}
            setReminders={setReminders}
            isAssetAdmin={isAssetAdmin}
          />
        )}

        {/* ========== 费用总览 Tab ========== */}
        {activeTab === 'overview' && (
          <div>
            {/* 筛选栏 */}
            <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
                  <input
                    type="text"
                    placeholder="搜索部门名称..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm focus:border-[#3370ff] outline-none"
                  />
                </div>
                <select
                  value={yearFilter}
                  onChange={e => setYearFilter(Number(e.target.value))}
                  className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                >
                  <option value={2025}>2025年度</option>
                  <option value={2024}>2024年度</option>
                  <option value={2023}>2023年度</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as FeeStatus | 'all')}
                  className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">全部状态</option>
                  {Object.values(FeeStatus).map(s => (
                    <option key={s} value={s}>{getStatusLabel(s)}</option>
                  ))}
                </select>
                {isAssetAdmin && (
                  <button onClick={() => handleExport('fees')} className="text-xs px-3 py-2 border border-[#dee0e3] rounded flex items-center gap-1 hover:bg-gray-50">
                    <Download size={14} /> 导出
                  </button>
                )}
              </div>
            </div>

            {/* 图表区域 */}
            {isAssetAdmin && (
              <div className="p-4 border-b border-[#dee0e3]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 柱状图 */}
                  <div className="lg:col-span-2">
                    <h3 className="font-medium text-[#1f2329] mb-4">各单位定额与实占对比</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f3f5" />
                          <XAxis dataKey="name" stroke="#8f959e" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#8f959e" tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee0e3' }} />
                          <Legend />
                          <Bar dataKey="定额" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="实占" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.超额 > 0 ? '#f54a45' : '#3370ff'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* 饼图 */}
                  <div>
                    <h3 className="font-medium text-[#1f2329] mb-4">账单状态分布</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 费用列表 */}
            <div className="divide-y divide-[#dee0e3]">
              {filteredFees.length === 0 ? (
                <div className="p-8 text-center text-[#8f959e]">暂无费用记录</div>
              ) : (
                filteredFees.map(fee => (
                  <div key={fee.id} className={`p-4 hover:bg-[#f9fafb] transition ${fee.isBlacklisted ? 'bg-red-50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-[#1f2329]">{fee.departmentName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(fee.status)}`}>
                            {getStatusLabel(fee.status)}
                          </span>
                          {fee.isBlacklisted && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded flex items-center gap-1">
                              <Ban size={10} /> 黑名单
                            </span>
                          )}
                          {fee.excessPercent >= 50 && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded flex items-center gap-1">
                              <AlertTriangle size={10} /> 熔断预警
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-[#8f959e] text-xs">定额/实占</p>
                            <p className="font-medium">{fee.quotaArea} / <span className={fee.excessArea > 0 ? 'text-red-600' : ''}>{fee.actualArea}</span> m²</p>
                          </div>
                          <div>
                            <p className="text-[#8f959e] text-xs">超额面积</p>
                            <p className={`font-medium ${fee.excessArea > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {fee.excessArea > 0 ? `+${fee.excessArea}` : fee.excessArea} m² ({fee.excessPercent.toFixed(1)}%)
                            </p>
                          </div>
                          <div>
                            <p className="text-[#8f959e] text-xs">适用费率</p>
                            <p className={`font-medium ${getTierColor(fee.excessPercent)}`}>
                              {getTierLabel(fee.excessPercent)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#8f959e] text-xs">应缴费用</p>
                            <p className="font-medium text-[#1f2329]">¥{fee.totalCost.toLocaleString()}</p>
                          </div>
                        </div>
                        {fee.remainingAmount > 0 && fee.remainingAmount !== fee.totalCost && (
                          <div className="mt-2 text-xs text-[#646a73]">
                            已缴: ¥{fee.paidAmount.toLocaleString()} | 待缴: <span className="text-red-600 font-medium">¥{fee.remainingAmount.toLocaleString()}</span>
                          </div>
                        )}
                        {fee.hasReminder && (
                          <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                            <Bell size={12} /> 已催缴 {fee.reminderCount} 次，最近: {fee.lastReminderAt}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => { setSelectedFee(fee); setIsDetailModalOpen(true); }}
                          className="text-[#3370ff] hover:text-[#285cc9] p-1"
                          title="查看详情"
                        >
                          <Eye size={18} />
                        </button>
                        {/* 资产处操作 */}
                        {isAssetAdmin && (
                          <>
                            {[FeeStatus.BillGenerated, FeeStatus.PendingConfirm].includes(fee.status) && (
                              <button
                                onClick={() => { setSelectedFee(fee); setIsReminderModalOpen(true); }}
                                className="text-xs px-2 py-1 border border-amber-300 text-amber-600 rounded hover:bg-amber-50 flex items-center gap-1"
                              >
                                <Bell size={12} /> 催缴
                              </button>
                            )}
                            {fee.status === FeeStatus.FinanceProcessing && (
                              <button
                                onClick={() => handleFinanceDeduction(fee)}
                                className="text-xs px-2 py-1 bg-[#3370ff] text-white rounded hover:bg-[#285cc9] flex items-center gap-1"
                              >
                                <CreditCard size={12} /> 确认扣款
                              </button>
                            )}
                            {!fee.isBlacklisted && fee.remainingAmount > 0 && fee.reminderCount >= 3 && (
                              <button
                                onClick={() => handleAddToBlacklist(fee)}
                                className="text-xs px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                              >
                                <Ban size={12} /> 加入黑名单
                              </button>
                            )}
                            {fee.isBlacklisted && (
                              <button
                                onClick={() => handleRemoveFromBlacklist(fee)}
                                className="text-xs px-2 py-1 border border-green-300 text-green-600 rounded hover:bg-green-50"
                              >
                                移出黑名单
                              </button>
                            )}
                          </>
                        )}
                        {/* 学院操作 */}
                        {!isAssetAdmin && fee.departmentName === myDepartmentName && (
                          <>
                            {fee.status === FeeStatus.PendingConfirm && (
                              <button
                                onClick={() => handleConfirmBill(fee)}
                                className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                              >
                                <Check size={12} /> 确认账单
                              </button>
                            )}
                            {[FeeStatus.BillGenerated, FeeStatus.PendingConfirm].includes(fee.status) && (
                              <button
                                onClick={() => { setSelectedFee(fee); setIsDisputeModalOpen(true); }}
                                className="text-xs px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                              >
                                <AlertCircle size={12} /> 提出异议
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========== 账单管理 Tab ========== */}
        {activeTab === 'bills' && (
          <div>
            <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-[#1f2329]">{yearFilter}年度账单列表</h3>
                <div className="flex gap-2">
                  <select
                    value={yearFilter}
                    onChange={e => setYearFilter(Number(e.target.value))}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  >
                    <option value={2025}>2025年度</option>
                    <option value={2024}>2024年度</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f5f6f7] text-[#646a73]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">账单编号</th>
                    <th className="px-4 py-3 text-left font-medium">部门</th>
                    <th className="px-4 py-3 text-left font-medium">定额面积</th>
                    <th className="px-4 py-3 text-left font-medium">实际面积</th>
                    <th className="px-4 py-3 text-left font-medium">超额面积</th>
                    <th className="px-4 py-3 text-left font-medium">费率倍数</th>
                    <th className="px-4 py-3 text-left font-medium">应缴金额</th>
                    <th className="px-4 py-3 text-left font-medium">状态</th>
                    <th className="px-4 py-3 text-left font-medium">生成时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dee0e3]">
                  {bills.filter(b => b.year === yearFilter && (!billMonth || (b as any).month === billMonth)).map(bill => (
                    <tr key={bill.id} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 font-medium text-[#3370ff]">{bill.billNo}</td>
                      <td className="px-4 py-3">{bill.departmentName}</td>
                      <td className="px-4 py-3">{bill.quotaArea} m²</td>
                      <td className="px-4 py-3">{bill.actualArea} m²</td>
                      <td className="px-4 py-3">
                        <span className={bill.excessArea > 0 ? 'text-red-600' : 'text-green-600'}>
                          {bill.excessArea > 0 ? `+${bill.excessArea}` : bill.excessArea} m²
                        </span>
                      </td>
                      <td className="px-4 py-3">{bill.tierMultiplier}x</td>
                      <td className="px-4 py-3 font-medium">¥{bill.calculatedAmount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(bill.status)}`}>
                          {getStatusLabel(bill.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8f959e]">{bill.generatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== 缴费记录 Tab ========== */}
        {activeTab === 'payments' && (
          <div>
            <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd] flex justify-between items-center">
              <h3 className="font-medium text-[#1f2329]">缴费记录</h3>
              {isAssetAdmin && (
                <button onClick={() => handleExport('payments')} className="text-xs px-3 py-1.5 border border-[#dee0e3] rounded flex items-center gap-1 hover:bg-gray-50">
                  <Download size={14} /> 导出
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f5f6f7] text-[#646a73]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">账单编号</th>
                    <th className="px-4 py-3 text-left font-medium">部门</th>
                    <th className="px-4 py-3 text-left font-medium">金额</th>
                    <th className="px-4 py-3 text-left font-medium">支付方式</th>
                    <th className="px-4 py-3 text-left font-medium">支付日期</th>
                    <th className="px-4 py-3 text-left font-medium">流水号</th>
                    <th className="px-4 py-3 text-left font-medium">状态</th>
                    <th className="px-4 py-3 text-left font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dee0e3]">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 font-medium text-[#3370ff]">{payment.billNo}</td>
                      <td className="px-4 py-3">{payment.departmentName}</td>
                      <td className="px-4 py-3 font-medium">¥{payment.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {payment.paymentMethod === 'BankTransfer' ? '银行转账' : 
                         payment.paymentMethod === 'FinanceDeduction' ? '财务扣款' : '其他'}
                      </td>
                      <td className="px-4 py-3">{payment.paymentDate}</td>
                      <td className="px-4 py-3 text-[#8f959e]">{payment.transactionNo || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          payment.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          payment.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {payment.status === 'Confirmed' ? '已确认' : payment.status === 'Pending' ? '待确认' : '已拒绝'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {payment.voucherUrl && (
                          <button className="text-[#3370ff] hover:underline text-xs flex items-center gap-1">
                            <FileText size={12} /> 查看凭证
                          </button>
                        )}
                        {isAssetAdmin && payment.status === 'Pending' && (
                          <div className="flex gap-2 mt-1">
                            <button className="text-xs text-green-600 hover:underline">确认</button>
                            <button className="text-xs text-red-600 hover:underline">拒绝</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== 催缴管理 Tab ========== */}
        {activeTab === 'reminders' && isAssetAdmin && (
          <div>
            <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-[#1f2329]">催缴记录</h3>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">系统通知</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">OA通知</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">短信</span>
                </div>
              </div>
            </div>
            <div className="divide-y divide-[#dee0e3]">
              {reminders.length === 0 ? (
                <div className="p-8 text-center text-[#8f959e]">暂无催缴记录</div>
              ) : (
                reminders.map(reminder => (
                  <div key={reminder.id} className="p-4 hover:bg-[#f9fafb]">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-[#1f2329]">{reminder.departmentName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            reminder.reminderType === 'System' ? 'bg-blue-100 text-blue-700' :
                            reminder.reminderType === 'OA' ? 'bg-purple-100 text-purple-700' :
                            reminder.reminderType === 'SMS' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {reminder.reminderType === 'System' ? '系统通知' :
                             reminder.reminderType === 'OA' ? 'OA通知' :
                             reminder.reminderType === 'SMS' ? '短信' : reminder.reminderType}
                          </span>
                          {reminder.isRead ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle size={12} /> 已读
                            </span>
                          ) : (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <Clock size={12} /> 未读
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#646a73] mb-2">{reminder.content}</p>
                        <div className="flex items-center gap-4 text-xs text-[#8f959e]">
                          <span>账单: {reminder.billNo}</span>
                          <span>发送人: {reminder.sentBy}</span>
                          <span>发送时间: {new Date(reminder.sentAt).toLocaleString()}</span>
                          {reminder.readAt && <span>阅读时间: {new Date(reminder.readAt).toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========== 争议处理 Tab ========== */}
        {activeTab === 'disputes' && (
          <div>
            <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
              <h3 className="font-medium text-[#1f2329]">争议记录</h3>
            </div>
            <div className="divide-y divide-[#dee0e3]">
              {disputes.length === 0 ? (
                <div className="p-8 text-center text-[#8f959e]">暂无争议记录</div>
              ) : (
                disputes.filter(d => isAssetAdmin || d.departmentName === myDepartmentName).map(dispute => (
                  <div key={dispute.id} className="p-4 hover:bg-[#f9fafb]">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-[#1f2329]">{dispute.departmentName}</span>
                          <span className="text-xs text-[#8f959e]">{dispute.billNo}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            dispute.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                            dispute.status === 'UnderReview' ? 'bg-amber-100 text-amber-700' :
                            dispute.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {dispute.status === 'Open' ? '待处理' :
                             dispute.status === 'UnderReview' ? '审核中' :
                             dispute.status === 'Resolved' ? '已解决' : '已驳回'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            dispute.disputeType === 'AreaDispute' ? 'bg-purple-100 text-purple-700' :
                            dispute.disputeType === 'PriceDispute' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {dispute.disputeType === 'AreaDispute' ? '面积争议' :
                             dispute.disputeType === 'PriceDispute' ? '价格争议' :
                             dispute.disputeType === 'QuotaDispute' ? '定额争议' : '其他'}
                          </span>
                        </div>
                        <p className="text-sm text-[#646a73] mb-2">{dispute.description}</p>
                        {dispute.evidence && dispute.evidence.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-[#8f959e]">附件:</span>
                            {dispute.evidence.map((e, i) => (
                              <span key={i} className="text-xs text-[#3370ff] hover:underline cursor-pointer flex items-center gap-1">
                                <FileText size={12} /> {e}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[#8f959e]">
                          <span>提交人: {dispute.submittedBy}</span>
                          <span>提交时间: {new Date(dispute.submittedAt).toLocaleString()}</span>
                        </div>
                        {dispute.resolution && (
                          <div className="mt-2 p-2 bg-[#f5f6f7] rounded text-sm">
                            <p className="text-[#646a73]"><span className="font-medium">处理结果:</span> {dispute.resolution}</p>
                            <p className="text-xs text-[#8f959e] mt-1">处理人: {dispute.resolvedBy} | {dispute.resolvedAt && new Date(dispute.resolvedAt).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      {isAssetAdmin && ['Open', 'UnderReview'].includes(dispute.status) && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleResolveDispute(dispute, '经核实，同意调整', true)}
                            className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            同意
                          </button>
                          <button
                            onClick={() => handleResolveDispute(dispute, '经核实，数据无误', false)}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            驳回
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========== 收费设置 Tab ========== */}
        {activeTab === 'settings' && isAssetAdmin && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 收费标准 */}
              <div className="border border-[#dee0e3] rounded-lg">
                <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
                  <h3 className="font-medium text-[#1f2329]">收费标准配置</h3>
                  <button
                    onClick={() => setIsStandardModalOpen(true)}
                    className="text-xs px-3 py-1.5 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9]"
                  >
                    <Plus size={14} /> 新增标准
                  </button>
                </div>
                <div className="divide-y divide-[#dee0e3]">
                  {standards.map(std => (
                    <div key={std.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-[#1f2329]">{std.name}</p>
                        <p className="text-xs text-[#8f959e] mt-1">
                          适用: {getUseTypeLabel(std.useType)} | 单价: ¥{std.basePrice}/m²/年
                        </p>
                        <p className="text-xs text-[#8f959e]">生效日期: {std.effectiveDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${std.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {std.isActive ? '生效中' : '已停用'}
                        </span>
                        <button className="text-[#8f959e] hover:text-[#1f2329]">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 阶梯费率 */}
              <div className="border border-[#dee0e3] rounded-lg">
                <div className="p-4 border-b border-[#dee0e3]">
                  <h3 className="font-medium text-[#1f2329]">阶梯费率规则</h3>
                  <p className="text-xs text-[#8f959e] mt-1">根据超额比例自动适用不同费率倍数</p>
                </div>
                <div className="divide-y divide-[#dee0e3]">
                  {tierRules.map(rule => (
                    <div key={rule.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-[#1f2329]">
                            超额 {rule.minExcessPercent}% - {rule.maxExcessPercent ? `${rule.maxExcessPercent}%` : '以上'}
                          </p>
                          <p className="text-xs text-[#8f959e] mt-1">{rule.description}</p>
                        </div>
                        <span className={`text-lg font-bold ${
                          rule.multiplier === 1 ? 'text-green-600' :
                          rule.multiplier === 1.5 ? 'text-amber-600' :
                          rule.multiplier === 2 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {rule.multiplier}x
                        </span>
                      </div>
                      {/* 进度条示意 */}
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            rule.multiplier === 1 ? 'bg-green-500' :
                            rule.multiplier === 1.5 ? 'bg-amber-500' :
                            rule.multiplier === 2 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${rule.maxExcessPercent ? (rule.maxExcessPercent - rule.minExcessPercent) * 2 : 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 熔断机制说明 */}
              <div className="lg:col-span-2 border border-[#dee0e3] rounded-lg p-4 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-red-700">熔断机制说明</h4>
                    <ul className="text-sm text-red-600 mt-2 space-y-1">
                      <li>• 超额比例达到50%以上，自动适用3倍熔断费率</li>
                      <li>• 催缴3次以上仍未缴费的单位，将被加入黑名单</li>
                      <li>• 黑名单单位的新增用房申请权限将被冻结</li>
                      <li>• 缴费截止日期: 每年1月31日，逾期将产生滞纳金</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* ========== 模态框 ========== */}

      {/* 费用详情模态框 */}
      {isDetailModalOpen && selectedFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">费用详情 - {selectedFee.departmentName}</h3>
              <button onClick={() => { setIsDetailModalOpen(false); setSelectedFee(null); }} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-[#8f959e]">年度</p>
                  <p className="font-medium">{selectedFee.year}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8f959e]">状态</p>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(selectedFee.status)}`}>
                    {getStatusLabel(selectedFee.status)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#8f959e]">定额面积</p>
                  <p className="font-medium">{selectedFee.quotaArea} m²</p>
                </div>
                <div>
                  <p className="text-xs text-[#8f959e]">实际占用</p>
                  <p className="font-medium">{selectedFee.actualArea} m²</p>
                </div>
                <div>
                  <p className="text-xs text-[#8f959e]">超额面积</p>
                  <p className={`font-medium ${selectedFee.excessArea > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedFee.excessArea > 0 ? '+' : ''}{selectedFee.excessArea} m² ({selectedFee.excessPercent.toFixed(1)}%)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8f959e]">适用费率</p>
                  <p className={`font-medium ${getTierColor(selectedFee.excessPercent)}`}>
                    {selectedFee.tierMultiplier}x ({getTierLabel(selectedFee.excessPercent)})
                  </p>
                </div>
              </div>

              {/* 费用明细 */}
              <div className="bg-[#f5f6f7] rounded-lg p-4 mb-6">
                <h4 className="font-medium text-[#1f2329] mb-3">费用计算明细</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#646a73]">基础单价</span>
                    <span>¥{selectedFee.basePrice}/m²/年</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#646a73]">超额面积</span>
                    <span>{selectedFee.excessArea} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#646a73]">基础费用 ({selectedFee.excessArea} × {selectedFee.basePrice})</span>
                    <span>¥{selectedFee.baseCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#646a73]">阶梯加收 ({selectedFee.tierMultiplier}x - 1)</span>
                    <span>¥{selectedFee.tierCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#dee0e3] font-medium">
                    <span>应缴总额</span>
                    <span className="text-[#3370ff]">¥{selectedFee.totalCost.toLocaleString()}</span>
                  </div>
                  {selectedFee.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>已缴金额</span>
                        <span>-¥{selectedFee.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium text-red-600">
                        <span>待缴金额</span>
                        <span>¥{selectedFee.remainingAmount.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 时间线 */}
              <div>
                <h4 className="font-medium text-[#1f2329] mb-3 flex items-center gap-2">
                  <History size={16} /> 处理进度
                </h4>
                <div className="relative pl-6 border-l-2 border-[#dee0e3] space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-green-500 border-2 border-green-500" />
                    <div className="bg-[#f9fafb] rounded-md p-3">
                      <p className="font-medium text-sm">账单生成</p>
                      <p className="text-xs text-[#8f959e] mt-1">系统自动生成年度账单</p>
                    </div>
                  </div>
                  {selectedFee.confirmedAt && (
                    <div className="relative">
                      <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-500" />
                      <div className="bg-[#f9fafb] rounded-md p-3">
                        <p className="font-medium text-sm">学院确认</p>
                        <p className="text-xs text-[#8f959e] mt-1">{selectedFee.confirmedAt}</p>
                      </div>
                    </div>
                  )}
                  {selectedFee.paidAt && (
                    <div className="relative">
                      <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-green-500 border-2 border-green-500" />
                      <div className="bg-[#f9fafb] rounded-md p-3">
                        <p className="font-medium text-sm">缴费完成</p>
                        <p className="text-xs text-[#8f959e] mt-1">{selectedFee.paidAt}</p>
                      </div>
                    </div>
                  )}
                  {!selectedFee.paidAt && selectedFee.status !== FeeStatus.Completed && (
                    <div className="relative">
                      <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-300" />
                      <div className="bg-[#f9fafb] rounded-md p-3">
                        <p className="font-medium text-sm text-[#8f959e]">待完成</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end">
              <button onClick={() => { setIsDetailModalOpen(false); setSelectedFee(null); }} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 催缴通知模态框 */}
      {isReminderModalOpen && selectedFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">发送催缴通知</h3>
              <button onClick={() => { setIsReminderModalOpen(false); setSelectedFee(null); }} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                <p className="text-sm text-amber-700">
                  <span className="font-medium">{selectedFee.departmentName}</span> 尚有 
                  <span className="font-bold"> ¥{selectedFee.remainingAmount.toLocaleString()} </span>
                  待缴费用
                </p>
                {selectedFee.hasReminder && (
                  <p className="text-xs text-amber-600 mt-1">
                    已催缴 {selectedFee.reminderCount} 次，最近: {selectedFee.lastReminderAt}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm text-[#646a73] mb-3">选择通知方式:</p>
                <button
                  onClick={() => handleSendReminder(selectedFee, 'System')}
                  className="w-full p-3 border border-[#dee0e3] rounded-md hover:bg-[#f5f6f7] text-left flex items-center gap-3"
                >
                  <div className="p-2 bg-blue-50 rounded">
                    <Bell size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">系统通知</p>
                    <p className="text-xs text-[#8f959e]">发送站内消息通知</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSendReminder(selectedFee, 'OA')}
                  className="w-full p-3 border border-[#dee0e3] rounded-md hover:bg-[#f5f6f7] text-left flex items-center gap-3"
                >
                  <div className="p-2 bg-purple-50 rounded">
                    <MessageSquare size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">OA通知</p>
                    <p className="text-xs text-[#8f959e]">通过办公自动化系统发送</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSendReminder(selectedFee, 'SMS')}
                  className="w-full p-3 border border-[#dee0e3] rounded-md hover:bg-[#f5f6f7] text-left flex items-center gap-3"
                >
                  <div className="p-2 bg-green-50 rounded">
                    <Send size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">短信通知</p>
                    <p className="text-xs text-[#8f959e]">发送短信到负责人手机</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSendReminder(selectedFee, 'Email')}
                  className="w-full p-3 border border-[#dee0e3] rounded-md hover:bg-[#f5f6f7] text-left flex items-center gap-3"
                >
                  <div className="p-2 bg-orange-50 rounded">
                    <FileText size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">邮件通知</p>
                    <p className="text-xs text-[#8f959e]">发送正式催缴函到邮箱</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end">
              <button onClick={() => { setIsReminderModalOpen(false); setSelectedFee(null); }} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提出异议模态框 */}
      {isDisputeModalOpen && selectedFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4">
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">提出账单异议</h3>
              <button onClick={() => { setIsDisputeModalOpen(false); setSelectedFee(null); }} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">{selectedFee.departmentName}</span> - {selectedFee.year}年度账单
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  应缴金额: ¥{selectedFee.totalCost.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">异议类型 *</label>
                <select
                  id="disputeType"
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                >
                  <option value="AreaDispute">面积数据有误</option>
                  <option value="PriceDispute">收费标准有误</option>
                  <option value="QuotaDispute">定额核算有误</option>
                  <option value="Other">其他问题</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">异议说明 *</label>
                <textarea
                  id="disputeDescription"
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm h-24"
                  placeholder="请详细说明异议内容，并提供相关依据..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">附件证明</label>
                <div className="border-2 border-dashed border-[#dee0e3] rounded-md p-4 text-center">
                  <Upload size={24} className="mx-auto text-[#8f959e] mb-2" />
                  <p className="text-sm text-[#646a73]">点击上传或拖拽文件到此处</p>
                  <p className="text-xs text-[#8f959e] mt-1">支持 PDF、图片等格式，最大10MB</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end gap-3">
              <button onClick={() => { setIsDisputeModalOpen(false); setSelectedFee(null); }} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">
                取消
              </button>
              <button
                onClick={() => {
                  const description = (document.getElementById('disputeDescription') as HTMLTextAreaElement)?.value;
                  const disputeType = (document.getElementById('disputeType') as HTMLSelectElement)?.value as DisputeRecord['disputeType'];
                  if (description) {
                    handleSubmitDispute(selectedFee, description, disputeType);
                  }
                }}
                className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9]"
              >
                提交异议
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增收费标准模态框 */}
      {isStandardModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4">
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">新增收费标准</h3>
              <button onClick={() => setIsStandardModalOpen(false)} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">标准名称 *</label>
                <input
                  type="text"
                  value={newStandard.name || ''}
                  onChange={e => setNewStandard(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  placeholder="如: 行政办公用房标准"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">适用房间类型 *</label>
                <select
                  value={newStandard.useType}
                  onChange={e => setNewStandard(p => ({ ...p, useType: e.target.value as RoomUseType }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                >
                  {Object.values(RoomUseType).map(t => (
                    <option key={t} value={t}>{getUseTypeLabel(t)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">基础单价 (元/m²/年) *</label>
                <input
                  type="number"
                  value={newStandard.basePrice || ''}
                  onChange={e => setNewStandard(p => ({ ...p, basePrice: Number(e.target.value) }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  placeholder="如: 120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">生效日期 *</label>
                <input
                  type="date"
                  value={newStandard.effectiveDate || ''}
                  onChange={e => setNewStandard(p => ({ ...p, effectiveDate: e.target.value }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">说明</label>
                <textarea
                  value={newStandard.description || ''}
                  onChange={e => setNewStandard(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm h-20"
                  placeholder="可选，填写标准的适用说明"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end gap-3">
              <button onClick={() => setIsStandardModalOpen(false)} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">
                取消
              </button>
              <button
                onClick={handleAddStandard}
                disabled={!newStandard.name || !newStandard.basePrice}
                className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 生成账单模态框 */}
      {isGenerateBillModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">批量生成账单</h3>
              <button onClick={() => setIsGenerateBillModalOpen(false)} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">账单生成说明</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• 按月份为每位人员生成个人账单</li>
                      <li>• 个人账单会绑定到对应学院的“总账单（B）”</li>
                      <li>• 学院总账单包含拆项明细：超额面积、基础费用、阶梯加收等</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">账单月份 *</label>
                <input
                  type="month"
                  value={billMonth}
                  onChange={e => setBillMonth(e.target.value)}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                />
                <p className="text-xs text-[#8f959e] mt-1">例如：2025-01</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-xs text-amber-700">
                  <span className="font-medium">预计生成:</span> 个人账单 {personUsages.length} 条（超额为 0 的人员将不生成）
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end gap-3">
              <button onClick={() => setIsGenerateBillModalOpen(false)} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">
                取消
              </button>
              <button
                onClick={() => handleGenerateBills(billMonth)}
                className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9]"
              >
                确认生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
