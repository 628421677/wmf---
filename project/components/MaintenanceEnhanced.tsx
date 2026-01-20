import React, { useState, useEffect, useMemo } from 'react';
import { 
  PenTool, Camera, MapPin, Clock, Send, User, Bell, X, Search, Filter, 
  AlertTriangle, CheckCircle, Wrench, TrendingUp, BarChart3, Star, 
  MessageSquare, DollarSign, Users, Building, Trash2, Phone, Mail,
  ChevronDown, ChevronUp, Calendar, FileText, Plus, RefreshCw
} from 'lucide-react';
import { suggestRepairAction } from '../services/geminiService';
import { UserRole } from '../types';

// ========== 扩展类型定义 ==========

// 工单优先级
type TicketPriority = 'Urgent' | 'High' | 'Normal' | 'Low';

// 工单分类
type TicketCategory = 'HVAC' | 'Electrical' | 'Plumbing' | 'Door_Window' | 'Furniture' | 'Network' | 'Cleaning' | 'Security' | 'Greening' | 'Other';

// 维修组
interface RepairTeam {
  id: string;
  name: string;
  leader: string;
  phone: string;
  specialties: TicketCategory[];
  currentLoad: number; // 当前工单数
}

// 扩展的维修工单
interface EnhancedRepairTicket {
  id: string;
  location: string;
  building: string;
  floor: string;
  roomNo: string;
  issue: string;
  category: TicketCategory;
  priority: TicketPriority;
  reporter: string;
  reporterPhone: string;
  reporterDept: string;
  status: 'Open' | 'Dispatched' | 'InProgress' | 'Completed' | 'Closed';
  imageUrls: string[];
  date: string;
  expectedDate?: string;
  completedDate?: string;
  assignedTeam?: string;
  assignedPerson?: string;
  progress: ProgressRecord[];
  isUrged: boolean;
  urgeCount: number;
  rating?: number;
  feedback?: string;
  cost?: TicketCost;
  internalNotes: InternalNote[];
}

// 进度记录
interface ProgressRecord {
  timestamp: string;
  status: string;
  notes: string;
  operator?: string;
}

// 费用记录
interface TicketCost {
  laborCost: number;
  materialCost: number;
  otherCost: number;
  totalCost: number;
  materials: { name: string; quantity: number; unitPrice: number }[];
}

// 内部备注
interface InternalNote {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

// 物业服务申请
interface PropertyServiceRequest {
  id: string;
  type: 'Cleaning' | 'Greening' | 'Security' | 'Moving' | 'Other';
  location: string;
  description: string;
  applicant: string;
  applicantDept: string;
  applicantPhone: string;
  expectedDate: string;
  status: 'Pending' | 'Approved' | 'InProgress' | 'Completed' | 'Rejected';
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  notes?: string;
}

// 统计数据
interface MaintenanceStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  avgProcessTime: number; // 小时
  completionRate: number;
  satisfactionRate: number;
  overdueTickets: number;
}

interface MaintenanceEnhancedProps {
  userRole: UserRole;
}

// ========== Mock 数据 ==========

const MOCK_REPAIR_TEAMS: RepairTeam[] = [
  { id: 'TEAM-01', name: '维修一组（水电）', leader: '张师傅', phone: '13800001001', specialties: ['Electrical', 'Plumbing'], currentLoad: 3 },
  { id: 'TEAM-02', name: '维修二组（暖通）', leader: '李师傅', phone: '13800001002', specialties: ['HVAC'], currentLoad: 2 },
  { id: 'TEAM-03', name: '维修三组（土建）', leader: '王师傅', phone: '13800001003', specialties: ['Door_Window', 'Furniture'], currentLoad: 4 },
  { id: 'TEAM-04', name: '网络运维组', leader: '赵工', phone: '13800001004', specialties: ['Network'], currentLoad: 1 },
  { id: 'TEAM-05', name: '物业服务组', leader: '刘主管', phone: '13800001005', specialties: ['Cleaning', 'Security', 'Greening'], currentLoad: 5 },
];

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  HVAC: '暖通空调', Electrical: '电气照明', Plumbing: '给排水',
  Door_Window: '门窗五金', Furniture: '家具设施', Network: '网络通信',
  Cleaning: '保洁服务', Security: '安保服务', Greening: '绿化养护', Other: '其他'
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; bgColor: string }> = {
  Urgent: { label: '紧急', color: 'text-red-700', bgColor: 'bg-red-100' },
  High: { label: '高', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  Normal: { label: '普通', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  Low: { label: '低', color: 'text-gray-700', bgColor: 'bg-gray-100' }
};

const BUILDINGS = ['行政办公大楼', '图书馆', '理科实验楼A座', '理科实验楼B座', '机械工程实验楼', '信息楼', '学生公寓1号楼', '学生公寓2号楼', '食堂'];

const INITIAL_TICKETS: EnhancedRepairTicket[] = [
  {
    id: 'TKT-5521', location: '图书馆 304 室', building: '图书馆', floor: '3', roomNo: '304',
    issue: '中央空调漏水，地面已有积水', category: 'HVAC', priority: 'Urgent',
    reporter: '张老师', reporterPhone: '13800138001', reporterDept: '图书馆',
    status: 'Dispatched', imageUrls: ['https://picsum.photos/id/101/200/200'],
    date: '2023-11-10', expectedDate: '2023-11-11', assignedTeam: 'TEAM-02', assignedPerson: '李师傅',
    progress: [
      { timestamp: '2023-11-10 09:30', status: '已提交', notes: '用户通过移动端提交报修。', operator: '张老师' },
      { timestamp: '2023-11-10 09:45', status: '已派单', notes: '系统智能派单至维修二组（暖通）。', operator: '系统' },
    ],
    isUrged: false, urgeCount: 0, internalNotes: []
  },
  {
    id: 'TKT-5520', location: '行政楼 102 室', building: '行政办公大楼', floor: '1', roomNo: '102',
    issue: '门把手损坏，无法正常开关', category: 'Door_Window', priority: 'Normal',
    reporter: '李主任', reporterPhone: '13800138002', reporterDept: '财务处',
    status: 'Completed', imageUrls: ['https://picsum.photos/id/102/200/200'],
    date: '2023-11-09', completedDate: '2023-11-09', assignedTeam: 'TEAM-03', assignedPerson: '王师傅',
    progress: [
      { timestamp: '2023-11-09 14:00', status: '已提交', notes: '用户提交报修。', operator: '李主任' },
      { timestamp: '2023-11-09 14:10', status: '已派单', notes: '派单至维修三组。', operator: '系统' },
      { timestamp: '2023-11-09 16:30', status: '已完成', notes: '维修师傅已更换门把手。', operator: '王师傅' },
    ],
    isUrged: false, urgeCount: 0, rating: 5, feedback: '维修及时，服务态度好！',
    cost: { laborCost: 50, materialCost: 35, otherCost: 0, totalCost: 85, materials: [{ name: '门把手', quantity: 1, unitPrice: 35 }] },
    internalNotes: []
  },
  {
    id: 'TKT-5519', location: '理科楼A座 201 室', building: '理科实验楼A座', floor: '2', roomNo: '201',
    issue: '日光灯闪烁，影响正常教学', category: 'Electrical', priority: 'High',
    reporter: '王教授', reporterPhone: '13800138003', reporterDept: '物理学院',
    status: 'InProgress', imageUrls: ['https://picsum.photos/id/103/200/200'],
    date: '2023-11-10', expectedDate: '2023-11-10', assignedTeam: 'TEAM-01', assignedPerson: '张师傅',
    progress: [
      { timestamp: '2023-11-10 08:00', status: '已提交', notes: '教室灯光问题，急需处理。', operator: '王教授' },
      { timestamp: '2023-11-10 08:15', status: '已派单', notes: '派单至维修一组。', operator: '系统' },
      { timestamp: '2023-11-10 09:00', status: '处理中', notes: '维修人员已到达现场，正在检查。', operator: '张师傅' },
    ],
    isUrged: true, urgeCount: 1, internalNotes: [{ id: 'N1', content: '需要更换整流器，已联系采购', author: '张师傅', timestamp: '2023-11-10 09:30' }]
  },
  {
    id: 'TKT-5518', location: '学生公寓1号楼 503 室', building: '学生公寓1号楼', floor: '5', roomNo: '503',
    issue: '水龙头漏水', category: 'Plumbing', priority: 'Normal',
    reporter: '学生小李', reporterPhone: '13800138004', reporterDept: '学工处',
    status: 'Open', imageUrls: [], date: '2023-11-10',
    progress: [{ timestamp: '2023-11-10 10:30', status: '已提交', notes: '宿舍水龙头漏水，请尽快处理。', operator: '学生小李' }],
    isUrged: false, urgeCount: 0, internalNotes: []
  }
];

const INITIAL_PROPERTY_SERVICES: PropertyServiceRequest[] = [
  { id: 'PS-001', type: 'Cleaning', location: '行政办公大楼 5楼走廊', description: '会议结束后需要深度清洁', applicant: '办公室主任', applicantDept: '党政办公室', applicantPhone: '13800139001', expectedDate: '2023-11-11', status: 'Approved', createdAt: '2023-11-10 14:00', approvedAt: '2023-11-10 15:00' },
  { id: 'PS-002', type: 'Greening', location: '图书馆前广场', description: '花坛杂草较多，需要清理修剪', applicant: '张老师', applicantDept: '图书馆', applicantPhone: '13800139002', expectedDate: '2023-11-15', status: 'Pending', createdAt: '2023-11-10 16:00' },
  { id: 'PS-003', type: 'Moving', location: '信息楼 302 → 信息楼 501', description: '办公室搬迁，约20件办公家具', applicant: '李主任', applicantDept: '计算机学院', applicantPhone: '13800139003', expectedDate: '2023-11-20', status: 'InProgress', createdAt: '2023-11-08', approvedAt: '2023-11-09' },
];

const SERVICE_TYPE_LABELS: Record<PropertyServiceRequest['type'], string> = {
  Cleaning: '保洁服务', Greening: '绿化养护', Security: '安保服务', Moving: '搬迁服务', Other: '其他服务'
};

// ========== 主组件 ==========

const MaintenanceEnhanced: React.FC<MaintenanceEnhancedProps> = ({ userRole }) => {
  // 状态管理
  const [tickets, setTickets] = useState<EnhancedRepairTicket[]>(() => {
    const saved = localStorage.getItem('uniassets-enhanced-tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });
  const [propertyServices, setPropertyServices] = useState<PropertyServiceRequest[]>(() => {
    const saved = localStorage.getItem('uniassets-property-services');
    return saved ? JSON.parse(saved) : INITIAL_PROPERTY_SERVICES;
  });

  // UI 状态
  const [activeTab, setActiveTab] = useState<'repair' | 'property' | 'stats'>('repair');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<EnhancedRepairTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  // 新工单表单
  const [newTicket, setNewTicket] = useState({
    building: '', floor: '', roomNo: '', issue: '', category: 'Other' as TicketCategory, priority: 'Normal' as TicketPriority
  });
  const [aiSuggestion, setAiSuggestion] = useState('');

  // 持久化
  useEffect(() => {
    localStorage.setItem('uniassets-enhanced-tickets', JSON.stringify(tickets));
  }, [tickets]);
  useEffect(() => {
    localStorage.setItem('uniassets-property-services', JSON.stringify(propertyServices));
  }, [propertyServices]);

  // 计算统计数据
  const stats: MaintenanceStats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'Open').length;
    const inProgress = tickets.filter(t => t.status === 'Dispatched' || t.status === 'InProgress').length;
    const completed = tickets.filter(t => t.status === 'Completed' || t.status === 'Closed').length;
    const rated = tickets.filter(t => t.rating);
    const avgRating = rated.length > 0 ? rated.reduce((sum, t) => sum + (t.rating || 0), 0) / rated.length : 0;
    const overdue = tickets.filter(t => t.expectedDate && new Date(t.expectedDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed').length;
    
    return {
      totalTickets: total,
      openTickets: open,
      inProgressTickets: inProgress,
      completedTickets: completed,
      avgProcessTime: 4.5, // 模拟数据
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      satisfactionRate: avgRating * 20,
      overdueTickets: overdue
    };
  }, [tickets]);

  // 筛选和排序工单
  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    
    // 搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(query) ||
        t.issue.toLowerCase().includes(query) ||
        t.location.toLowerCase().includes(query) ||
        t.reporter.toLowerCase().includes(query)
      );
    }
    
    // 筛选
    if (filterStatus !== 'all') result = result.filter(t => t.status === filterStatus);
    if (filterCategory !== 'all') result = result.filter(t => t.category === filterCategory);
    if (filterPriority !== 'all') result = result.filter(t => t.priority === filterPriority);
    
    // 教师只看自己的
    if (userRole === UserRole.Teacher) {
      result = result.filter(t => t.reporter === '张老师'); // 模拟当前用户
    }
    
    // 排序
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return result;
  }, [tickets, searchQuery, filterStatus, filterCategory, filterPriority, sortBy, userRole]);

  // AI 智能分诊
  const handleAiAssist = async () => {
    if (!newTicket.issue) return;
    setAiSuggestion('AI 正在分析故障描述...');
    const result = await suggestRepairAction(newTicket.issue);
    setAiSuggestion(result);
    
    // 自动识别分类
    const issueText = newTicket.issue.toLowerCase();
    if (issueText.includes('空调') || issueText.includes('暖气') || issueText.includes('通风')) {
      setNewTicket(prev => ({ ...prev, category: 'HVAC' }));
    } else if (issueText.includes('灯') || issueText.includes('电') || issueText.includes('插座')) {
      setNewTicket(prev => ({ ...prev, category: 'Electrical' }));
    } else if (issueText.includes('水') || issueText.includes('漏') || issueText.includes('管道')) {
      setNewTicket(prev => ({ ...prev, category: 'Plumbing' }));
    } else if (issueText.includes('门') || issueText.includes('窗') || issueText.includes('锁')) {
      setNewTicket(prev => ({ ...prev, category: 'Door_Window' }));
    } else if (issueText.includes('网络') || issueText.includes('wifi') || issueText.includes('网线')) {
      setNewTicket(prev => ({ ...prev, category: 'Network' }));
    }
    
    // 自动识别优先级
    if (issueText.includes('漏水') || issueText.includes('停电') || issueText.includes('紧急') || issueText.includes('安全')) {
      setNewTicket(prev => ({ ...prev, priority: 'Urgent' }));
    }
  };

  // 提交新工单
  const handleSubmitTicket = () => {
    if (!newTicket.building || !newTicket.issue) {
      alert('请填写完整信息');
      return;
    }
    
    const ticket: EnhancedRepairTicket = {
      id: `TKT-${Math.floor(Math.random() * 10000)}`,
      location: `${newTicket.building} ${newTicket.floor}楼 ${newTicket.roomNo}室`,
      building: newTicket.building,
      floor: newTicket.floor,
      roomNo: newTicket.roomNo,
      issue: newTicket.issue,
      category: newTicket.category,
      priority: newTicket.priority,
      reporter: '张老师', // 模拟当前用户
      reporterPhone: '13800138001',
      reporterDept: '物理学院',
      status: 'Open',
      imageUrls: [],
      date: new Date().toISOString().split('T')[0],
      progress: [{ timestamp: new Date().toLocaleString(), status: '已提交', notes: '用户通过系统提交报修。', operator: '张老师' }],
      isUrged: false,
      urgeCount: 0,
      internalNotes: []
    };
    
    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ building: '', floor: '', roomNo: '', issue: '', category: 'Other', priority: 'Normal' });
    setAiSuggestion('');
    setShowNewTicketForm(false);
    alert('报修提交成功！');
  };

  // 智能派单
  const handleDispatch = (ticketId: string, teamId?: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // 自动匹配维修组
    let assignedTeam = teamId;
    if (!assignedTeam) {
      const matchingTeam = MOCK_REPAIR_TEAMS.find(team => team.specialties.includes(ticket.category));
      assignedTeam = matchingTeam?.id || 'TEAM-01';
    }
    
    const team = MOCK_REPAIR_TEAMS.find(t => t.id === assignedTeam);
    
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      status: 'Dispatched',
      assignedTeam: assignedTeam,
      assignedPerson: team?.leader,
      expectedDate: new Date(Date.now() + (t.priority === 'Urgent' ? 4 : 24) * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: [...t.progress, { timestamp: new Date().toLocaleString(), status: '已派单', notes: `系统派单至${team?.name || '维修组'}，负责人：${team?.leader}`, operator: '系统' }]
    } : t));
  };

  // 批量派单
  const handleBatchDispatch = () => {
    const openTickets = tickets.filter(t => t.status === 'Open');
    openTickets.forEach(ticket => handleDispatch(ticket.id));
    alert(`已批量派单 ${openTickets.length} 个工单`);
  };

  // 更新状态
  const handleUpdateStatus = (ticketId: string, newStatus: EnhancedRepairTicket['status'], notes?: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      status: newStatus,
      completedDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : t.completedDate,
      progress: [...t.progress, { timestamp: new Date().toLocaleString(), status: newStatus === 'InProgress' ? '处理中' : newStatus === 'Completed' ? '已完成' : '已关闭', notes: notes || '', operator: '管理员' }]
    } : t));
  };

  // 催修
  const handleUrge = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, isUrged: true, urgeCount: t.urgeCount + 1 } : t));
    alert('已发送催修提醒');
  };

  // 评价
  const handleRate = (ticketId: string, rating: number, feedback: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, rating, feedback, status: 'Closed' } : t));
    setViewingTicket(null);
    alert('感谢您的评价！');
  };

  // 添加内部备注
  const handleAddNote = (ticketId: string, content: string) => {
    const note: InternalNote = { id: `N-${Date.now()}`, content, author: '管理员', timestamp: new Date().toLocaleString() };
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, internalNotes: [...t.internalNotes, note] } : t));
  };

  // 记录费用
  const handleRecordCost = (ticketId: string, cost: TicketCost) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, cost } : t));
  };

  // 转派工单
  const handleTransfer = (ticketId: string, newTeamId: string) => {
    const team = MOCK_REPAIR_TEAMS.find(t => t.id === newTeamId);
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      assignedTeam: newTeamId,
      assignedPerson: team?.leader,
      progress: [...t.progress, { timestamp: new Date().toLocaleString(), status: '已转派', notes: `工单转派至${team?.name}`, operator: '管理员' }]
    } : t));
  };

  // ========== 渲染 ==========
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页头 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329]">维修与物业服务</h2>
          <p className="text-[#646a73]">智能报修、派单、物业服务一站式管理</p>
        </div>
        <div className="flex gap-2">
          {userRole === UserRole.AssetAdmin && (
            <button onClick={handleBatchDispatch} className="px-4 py-2 bg-[#1f2329] text-white rounded-lg hover:bg-[#3d4043] flex items-center gap-2">
              <RefreshCw size={16} /> 批量派单
            </button>
          )}
          <button onClick={() => userRole === UserRole.Teacher ? setShowNewTicketForm(true) : setShowNewServiceForm(true)} className="px-4 py-2 bg-[#3370ff] text-white rounded-lg hover:bg-[#285cc9] flex items-center gap-2">
            <Plus size={16} /> {userRole === UserRole.Teacher ? '新建报修' : '新建服务申请'}
          </button>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-[#f5f6f7] p-1 rounded-lg w-fit">
        {[
          { key: 'repair', label: '维修工单', icon: Wrench },
          { key: 'property', label: '物业服务', icon: Building },
          { key: 'stats', label: '数据统计', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${activeTab === tab.key ? 'bg-white shadow-sm text-[#3370ff]' : 'text-[#646a73] hover:text-[#1f2329]'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* 统计卡片 - 管理员视图 */}
      {userRole === UserRole.AssetAdmin && activeTab === 'repair' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="总工单" value={stats.totalTickets} color="blue" />
          <StatCard icon={Clock} label="待处理" value={stats.openTickets} color="orange" subValue={stats.overdueTickets > 0 ? `${stats.overdueTickets}个超时` : undefined} />
          <StatCard icon={Wrench} label="处理中" value={stats.inProgressTickets} color="yellow" />
          <StatCard icon={CheckCircle} label="已完成" value={stats.completedTickets} color="green" subValue={`完成率 ${stats.completionRate.toFixed(0)}%`} />
        </div>
      )}

      {/* 维修工单列表 */}
      {activeTab === 'repair' && (
        <div className="space-y-4">
          {/* 搜索和筛选 */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-[#dee0e3] flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
              <input
                type="text"
                placeholder="搜索工单号、问题描述、位置..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#dee0e3] rounded-md focus:ring-1 focus:ring-[#3370ff] focus:border-[#3370ff] outline-none"
              />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-[#dee0e3] rounded-md outline-none">
              <option value="all">全部状态</option>
              <option value="Open">待处理</option>
              <option value="Dispatched">已派单</option>
              <option value="InProgress">处理中</option>
              <option value="Completed">已完成</option>
              <option value="Closed">已关闭</option>
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 border border-[#dee0e3] rounded-md outline-none">
              <option value="all">全部分类</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2 border border-[#dee0e3] rounded-md outline-none">
              <option value="all">全部优先级</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-3 py-2 border border-[#dee0e3] rounded-md outline-none">
              <option value="date">按时间排序</option>
              <option value="priority">按优先级排序</option>
            </select>
          </div>

          {/* 工单列表 */}
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-10 text-[#8f959e]">暂无符合条件的工单</div>
            ) : (
              filteredTickets.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  userRole={userRole}
                  onView={() => setViewingTicket(ticket)}
                  onDispatch={() => handleDispatch(ticket.id)}
                  onComplete={() => handleUpdateStatus(ticket.id, 'Completed', '维修完成')}
                  onUrge={() => handleUrge(ticket.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* 物业服务 */}
      {activeTab === 'property' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propertyServices.map(service => (
              <div key={service.id} className="bg-white p-4 rounded-lg shadow-sm border border-[#dee0e3]">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-[#e1eaff] text-[#3370ff] text-xs rounded">{SERVICE_TYPE_LABELS[service.type]}</span>
                  <StatusBadge status={service.status} />
                </div>
                <p className="font-medium text-[#1f2329] mb-2">{service.description}</p>
                <p className="text-sm text-[#646a73] flex items-center gap-1 mb-1"><MapPin size={14} /> {service.location}</p>
                <p className="text-sm text-[#646a73] flex items-center gap-1 mb-1"><User size={14} /> {service.applicant} ({service.applicantDept})</p>
                <p className="text-sm text-[#646a73] flex items-center gap-1"><Calendar size={14} /> 期望日期: {service.expectedDate}</p>
                {userRole === UserRole.AssetAdmin && service.status === 'Pending' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setPropertyServices(prev => prev.map(s => s.id === service.id ? { ...s, status: 'Approved', approvedAt: new Date().toISOString() } : s))} className="flex-1 py-1.5 bg-[#3370ff] text-white text-sm rounded hover:bg-[#285cc9]">批准</button>
                    <button onClick={() => setPropertyServices(prev => prev.map(s => s.id === service.id ? { ...s, status: 'Rejected' } : s))} className="flex-1 py-1.5 border border-[#dee0e3] text-[#646a73] text-sm rounded hover:bg-[#f5f6f7]">驳回</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 数据统计 */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 概览 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3]">
            <h3 className="font-semibold text-[#1f2329] mb-4 flex items-center gap-2"><TrendingUp size={18} /> 本月概览</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#f5f6f7] rounded-lg">
                <p className="text-2xl font-bold text-[#3370ff]">{stats.totalTickets}</p>
                <p className="text-sm text-[#646a73]">总工单数</p>
              </div>
              <div className="p-4 bg-[#f5f6f7] rounded-lg">
                <p className="text-2xl font-bold text-[#059669]">{stats.completionRate.toFixed(0)}%</p>
                <p className="text-sm text-[#646a73]">完成率</p>
              </div>
              <div className="p-4 bg-[#f5f6f7] rounded-lg">
                <p className="text-2xl font-bold text-[#d97706]">{stats.avgProcessTime}h</p>
                <p className="text-sm text-[#646a73]">平均处理时长</p>
              </div>
              <div className="p-4 bg-[#f5f6f7] rounded-lg">
                <p className="text-2xl font-bold text-[#8b5cf6]">{stats.satisfactionRate.toFixed(0)}%</p>
                <p className="text-sm text-[#646a73]">满意度</p>
              </div>
            </div>
          </div>

          {/* 分类统计 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3]">
            <h3 className="font-semibold text-[#1f2329] mb-4 flex items-center gap-2"><BarChart3 size={18} /> 分类统计</h3>
            <div className="space-y-3">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const count = tickets.filter(t => t.category === key).length;
                const percent = tickets.length > 0 ? (count / tickets.length) * 100 : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-[#646a73]">{label}</span>
                    <div className="flex-1 h-6 bg-[#f5f6f7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3370ff] rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-12 text-sm text-[#1f2329] text-right">{count}件</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 区域热力图 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3]">
            <h3 className="font-semibold text-[#1f2329] mb-4 flex items-center gap-2"><MapPin size={18} /> 报修热点区域</h3>
            <div className="space-y-2">
              {BUILDINGS.map(building => {
                const count = tickets.filter(t => t.building === building).length;
                return count > 0 ? (
                  <div key={building} className="flex justify-between items-center p-2 bg-[#f5f6f7] rounded">
                    <span className="text-sm">{building}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${count >= 3 ? 'bg-red-100 text-red-700' : count >= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{count}件</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* 维修组工作量 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3]">
            <h3 className="font-semibold text-[#1f2329] mb-4 flex items-center gap-2"><Users size={18} /> 维修组工作量</h3>
            <div className="space-y-3">
              {MOCK_REPAIR_TEAMS.map(team => (
                <div key={team.id} className="flex items-center justify-between p-3 bg-[#f5f6f7] rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{team.name}</p>
                    <p className="text-xs text-[#646a73]">{team.leader} · {team.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#3370ff]">{team.currentLoad}</p>
                    <p className="text-xs text-[#646a73]">当前工单</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 新建报修表单弹窗 */}
      {showNewTicketForm && (
        <Modal title="新建报修工单" onClose={() => setShowNewTicketForm(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">楼栋 *</label>
                <select value={newTicket.building} onChange={e => setNewTicket(prev => ({ ...prev, building: e.target.value }))} className="w-full p-2 border border-[#dee0e3] rounded-md outline-none">
                  <option value="">请选择</option>
                  {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">楼层</label>
                <input type="text" value={newTicket.floor} onChange={e => setNewTicket(prev => ({ ...prev, floor: e.target.value }))} placeholder="如: 3" className="w-full p-2 border border-[#dee0e3] rounded-md outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">房间号</label>
                <input type="text" value={newTicket.roomNo} onChange={e => setNewTicket(prev => ({ ...prev, roomNo: e.target.value }))} placeholder="如: 302" className="w-full p-2 border border-[#dee0e3] rounded-md outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1f2329] mb-1">故障描述 *</label>
              <textarea value={newTicket.issue} onChange={e => setNewTicket(prev => ({ ...prev, issue: e.target.value }))} rows={3} placeholder="请详细描述故障情况..." className="w-full p-2 border border-[#dee0e3] rounded-md outline-none resize-none" />
              <button onClick={handleAiAssist} className="text-xs text-[#3370ff] font-medium mt-1 hover:underline flex items-center gap-1">
                <BotIcon /> AI 智能分诊
              </button>
              {aiSuggestion && <div className="mt-2 p-2 bg-[#eff6ff] text-[#3370ff] text-xs rounded border border-[#dbeafe]">{aiSuggestion}</div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">故障分类</label>
                <select value={newTicket.category} onChange={e => setNewTicket(prev => ({ ...prev, category: e.target.value as TicketCategory }))} className="w-full p-2 border border-[#dee0e3] rounded-md outline-none">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">优先级</label>
                <select value={newTicket.priority} onChange={e => setNewTicket(prev => ({ ...prev, priority: e.target.value as TicketPriority }))} className="w-full p-2 border border-[#dee0e3] rounded-md outline-none">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#f5f6f7] rounded-md">
              <Camera size={20} className="text-[#646a73]" />
              <span className="text-sm text-[#646a73]">点击上传故障照片（可选）</span>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowNewTicketForm(false)} className="px-4 py-2 border border-[#dee0e3] rounded-md hover:bg-[#f5f6f7]">取消</button>
              <button onClick={handleSubmitTicket} className="px-4 py-2 bg-[#3370ff] text-white rounded-md hover:bg-[#285cc9]">提交报修</button>
            </div>
          </div>
        </Modal>
      )}

      {/* 工单详情弹窗 */}
      {viewingTicket && (
        <TicketDetailModal
          ticket={viewingTicket}
          userRole={userRole}
          onClose={() => setViewingTicket(null)}
          onDispatch={(teamId) => { handleDispatch(viewingTicket.id, teamId); setViewingTicket(null); }}
          onUpdateStatus={(status, notes) => { handleUpdateStatus(viewingTicket.id, status, notes); setViewingTicket({ ...viewingTicket, status }); }}
          onUrge={() => { handleUrge(viewingTicket.id); setViewingTicket({ ...viewingTicket, isUrged: true, urgeCount: viewingTicket.urgeCount + 1 }); }}
          onRate={(rating, feedback) => handleRate(viewingTicket.id, rating, feedback)}
          onAddNote={(content) => { handleAddNote(viewingTicket.id, content); setViewingTicket({ ...viewingTicket, internalNotes: [...viewingTicket.internalNotes, { id: `N-${Date.now()}`, content, author: '管理员', timestamp: new Date().toLocaleString() }] }); }}
          onTransfer={(teamId) => { handleTransfer(viewingTicket.id, teamId); setViewingTicket(null); }}
          onRecordCost={(cost) => { handleRecordCost(viewingTicket.id, cost); setViewingTicket({ ...viewingTicket, cost }); }}
        />
      )}
    </div>
  );
};

// ========== 子组件 ==========

// 统计卡片
const StatCard: React.FC<{ icon: any; label: string; value: number; color: string; subValue?: string }> = ({ icon: Icon, label, value, color, subValue }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600'
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-[#dee0e3]">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}><Icon size={20} /></div>
        <div>
          <p className="text-2xl font-bold text-[#1f2329]">{value}</p>
          <p className="text-sm text-[#646a73]">{label}</p>
          {subValue && <p className="text-xs text-[#8f959e]">{subValue}</p>}
        </div>
      </div>
    </div>
  );
};

// 工单卡片
const TicketCard: React.FC<{
  ticket: EnhancedRepairTicket;
  userRole: UserRole;
  onView: () => void;
  onDispatch: () => void;
  onComplete: () => void;
  onUrge: () => void;
}> = ({ ticket, userRole, onView, onDispatch, onComplete, onUrge }) => {
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];
  
  return (
    <div 
      className={`bg-white p-4 rounded-lg shadow-sm border flex gap-4 transition-all hover:shadow-md cursor-pointer ${ticket.isUrged ? 'border-red-400 ring-1 ring-red-100' : 'border-[#dee0e3]'}`}
      onClick={onView}
    >
      {/* 图片 */}
      <div className="w-24 h-24 bg-[#f2f3f5] rounded-lg overflow-hidden flex-shrink-0">
        {ticket.imageUrls[0] ? (
          <img src={ticket.imageUrls[0]} alt="Issue" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8f959e]"><Camera size={24} /></div>
        )}
      </div>
      
      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#8f959e]">{ticket.id}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${priorityConfig.bgColor} ${priorityConfig.color}`}>{priorityConfig.label}</span>
              <span className="px-1.5 py-0.5 bg-[#f5f6f7] text-[#646a73] rounded text-xs">{CATEGORY_LABELS[ticket.category]}</span>
              {ticket.isUrged && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs flex items-center gap-0.5"><Bell size={10} /> 催修{ticket.urgeCount > 1 ? `×${ticket.urgeCount}` : ''}</span>}
            </div>
            <h4 className="font-semibold text-[#1f2329] truncate">{ticket.issue}</h4>
            <p className="text-sm text-[#646a73] flex items-center gap-1 mt-1"><MapPin size={14} /> {ticket.location}</p>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs text-[#8f959e] border-t border-[#f5f6f7] pt-3">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Clock size={14} /> {ticket.date}</span>
            <span className="flex items-center gap-1"><User size={14} /> {ticket.reporter}</span>
            {ticket.assignedPerson && <span className="flex items-center gap-1"><Wrench size={14} /> {ticket.assignedPerson}</span>}
          </div>
          
          {userRole === UserRole.AssetAdmin && (
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              {ticket.status === 'Open' && (
                <button onClick={onDispatch} className="text-[#3370ff] font-medium hover:bg-[#e1eaff] px-2 py-1 rounded transition-colors">智能派单</button>
              )}
              {(ticket.status === 'Dispatched' || ticket.status === 'InProgress') && (
                <button onClick={onComplete} className="text-[#059669] font-medium hover:bg-[#ecfdf5] px-2 py-1 rounded transition-colors">确认完成</button>
              )}
            </div>
          )}
          
          {userRole === UserRole.Teacher && ticket.status !== 'Completed' && ticket.status !== 'Closed' && (
            <button onClick={(e) => { e.stopPropagation(); onUrge(); }} disabled={ticket.isUrged} className="text-red-500 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Bell size={14} className="inline mr-1" /> 催修
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 工单详情弹窗
const TicketDetailModal: React.FC<{
  ticket: EnhancedRepairTicket;
  userRole: UserRole;
  onClose: () => void;
  onDispatch: (teamId?: string) => void;
  onUpdateStatus: (status: EnhancedRepairTicket['status'], notes?: string) => void;
  onUrge: () => void;
  onRate: (rating: number, feedback: string) => void;
  onAddNote: (content: string) => void;
  onTransfer: (teamId: string) => void;
  onRecordCost: (cost: TicketCost) => void;
}> = ({ ticket, userRole, onClose, onDispatch, onUpdateStatus, onUrge, onRate, onAddNote, onTransfer, onRecordCost }) => {
  const [activeDetailTab, setActiveDetailTab] = useState<'progress' | 'notes' | 'cost' | 'rate'>('progress');
  const [newNote, setNewNote] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(ticket.assignedTeam || '');
  const [costForm, setCostForm] = useState<TicketCost>(ticket.cost || { laborCost: 0, materialCost: 0, otherCost: 0, totalCost: 0, materials: [] });

  const priorityConfig = PRIORITY_CONFIG[ticket.priority];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="p-4 border-b flex justify-between items-center bg-[#f5f6f7]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[#646a73]">{ticket.id}</span>
            <span className={`px-2 py-0.5 rounded text-xs ${priorityConfig.bgColor} ${priorityConfig.color}`}>{priorityConfig.label}</span>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#dee0e3] rounded"><X size={18} /></button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-lg text-[#1f2329] mb-2">{ticket.issue}</h3>
              <p className="text-sm text-[#646a73] flex items-center gap-1 mb-1"><MapPin size={14} /> {ticket.location}</p>
              <p className="text-sm text-[#646a73] flex items-center gap-1 mb-1"><User size={14} /> {ticket.reporter} ({ticket.reporterDept})</p>
              <p className="text-sm text-[#646a73] flex items-center gap-1 mb-1"><Phone size={14} /> {ticket.reporterPhone}</p>
              <p className="text-sm text-[#646a73] flex items-center gap-1"><Clock size={14} /> 提交时间: {ticket.date}</p>
            </div>
            <div>
              <p className="text-sm text-[#646a73] mb-1">故障分类: <span className="text-[#1f2329]">{CATEGORY_LABELS[ticket.category]}</span></p>
              {ticket.assignedTeam && <p className="text-sm text-[#646a73] mb-1">维修组: <span className="text-[#1f2329]">{MOCK_REPAIR_TEAMS.find(t => t.id === ticket.assignedTeam)?.name}</span></p>}
              {ticket.assignedPerson && <p className="text-sm text-[#646a73] mb-1">负责人: <span className="text-[#1f2329]">{ticket.assignedPerson}</span></p>}
              {ticket.expectedDate && <p className="text-sm text-[#646a73] mb-1">预计完成: <span className="text-[#1f2329]">{ticket.expectedDate}</span></p>}
              {ticket.completedDate && <p className="text-sm text-[#646a73]">完成时间: <span className="text-[#059669]">{ticket.completedDate}</span></p>}
            </div>
          </div>

          {/* Tab 切换 */}
          <div className="flex gap-1 bg-[#f5f6f7] p-1 rounded-lg mb-4">
            {[
              { key: 'progress', label: '进度追踪' },
              ...(userRole === UserRole.AssetAdmin ? [{ key: 'notes', label: '内部备注' }, { key: 'cost', label: '费用记录' }] : []),
              ...(ticket.status === 'Completed' && userRole === UserRole.Teacher && !ticket.rating ? [{ key: 'rate', label: '评价' }] : [])
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveDetailTab(tab.key as any)} className={`px-3 py-1.5 rounded text-sm transition-colors ${activeDetailTab === tab.key ? 'bg-white shadow-sm text-[#3370ff]' : 'text-[#646a73]'}`}>{tab.label}</button>
            ))}
          </div>

          {/* 进度追踪 */}
          {activeDetailTab === 'progress' && (
            <div className="border-l-2 border-gray-200 pl-4 space-y-4">
              {ticket.progress.map((p, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full ${i === ticket.progress.length - 1 ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-gray-300'}`} />
                  <p className="font-semibold text-sm">{p.status}</p>
                  <p className="text-xs text-gray-500">{p.timestamp} {p.operator && `· ${p.operator}`}</p>
                  <p className="text-sm mt-1">{p.notes}</p>
                </div>
              ))}
            </div>
          )}

          {/* 内部备注 */}
          {activeDetailTab === 'notes' && userRole === UserRole.AssetAdmin && (
            <div className="space-y-4">
              {ticket.internalNotes.length === 0 && <p className="text-[#8f959e] text-sm">暂无内部备注</p>}
              {ticket.internalNotes.map(note => (
                <div key={note.id} className="p-3 bg-[#fffbeb] border border-[#fef3c7] rounded-lg">
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-[#8f959e] mt-1">{note.author} · {note.timestamp}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="添加内部备注..." className="flex-1 p-2 border border-[#dee0e3] rounded-md outline-none text-sm" />
                <button onClick={() => { if (newNote) { onAddNote(newNote); setNewNote(''); } }} className="px-3 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9]">添加</button>
              </div>
            </div>
          )}

          {/* 费用记录 */}
          {activeDetailTab === 'cost' && userRole === UserRole.AssetAdmin && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-[#646a73] mb-1">人工费 (元)</label>
                  <input type="number" value={costForm.laborCost} onChange={e => setCostForm(prev => ({ ...prev, laborCost: +e.target.value, totalCost: +e.target.value + prev.materialCost + prev.otherCost }))} className="w-full p-2 border border-[#dee0e3] rounded-md outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#646a73] mb-1">材料费 (元)</label>
                  <input type="number" value={costForm.materialCost} onChange={e => setCostForm(prev => ({ ...prev, materialCost: +e.target.value, totalCost: prev.laborCost + +e.target.value + prev.otherCost }))} className="w-full p-2 border border-[#dee0e3] rounded-md outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#646a73] mb-1">其他费用 (元)</label>
                  <input type="number" value={costForm.otherCost} onChange={e => setCostForm(prev => ({ ...prev, otherCost: +e.target.value, totalCost: prev.laborCost + prev.materialCost + +e.target.value }))} className="w-full p-2 border border-[#dee0e3] rounded-md outline-none" />
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#f5f6f7] rounded-lg">
                <span className="font-medium">合计费用</span>
                <span className="text-xl font-bold text-[#3370ff]">¥{costForm.totalCost.toFixed(2)}</span>
              </div>
              <button onClick={() => onRecordCost(costForm)} className="w-full py-2 bg-[#3370ff] text-white rounded-md hover:bg-[#285cc9]">保存费用记录</button>
            </div>
          )}

          {/* 评价 */}
          {activeDetailTab === 'rate' && userRole === UserRole.Teacher && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-2">服务评分</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className={`p-1 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                      <Star size={28} fill={rating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">评价内容</label>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} placeholder="请输入您的评价..." className="w-full p-2 border border-[#dee0e3] rounded-md outline-none resize-none" />
              </div>
              <button onClick={() => onRate(rating, feedback)} className="w-full py-2 bg-[#3370ff] text-white rounded-md hover:bg-[#285cc9]">提交评价</button>
            </div>
          )}

          {/* 已有评价展示 */}
          {ticket.rating && (
            <div className="mt-4 p-4 bg-[#f5f6f7] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">用户评价:</span>
                <div className="flex">{[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} className={ticket.rating! >= star ? 'text-yellow-400' : 'text-gray-300'} fill={ticket.rating! >= star ? 'currentColor' : 'none'} />)}</div>
              </div>
              {ticket.feedback && <p className="text-sm text-[#646a73]">"{ticket.feedback}"</p>}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="p-4 bg-[#f5f6f7] border-t flex justify-between items-center">
          {userRole === UserRole.AssetAdmin && (
            <div className="flex gap-2">
              {ticket.status === 'Open' && (
                <>
                  <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="px-3 py-2 border border-[#dee0e3] rounded-md outline-none text-sm">
                    <option value="">自动匹配维修组</option>
                    {MOCK_REPAIR_TEAMS.map(team => <option key={team.id} value={team.id}>{team.name} (当前{team.currentLoad}单)</option>)}
                  </select>
                  <button onClick={() => onDispatch(selectedTeam || undefined)} className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9]">派单</button>
                </>
              )}
              {(ticket.status === 'Dispatched' || ticket.status === 'InProgress') && (
                <>
                  <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="px-3 py-2 border border-[#dee0e3] rounded-md outline-none text-sm">
                    <option value="">转派至...</option>
                    {MOCK_REPAIR_TEAMS.filter(t => t.id !== ticket.assignedTeam).map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </select>
                  {selectedTeam && <button onClick={() => onTransfer(selectedTeam)} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-white">转派</button>}
                  <button onClick={() => onUpdateStatus('InProgress', '维修人员开始处理')} className="px-4 py-2 bg-[#d97706] text-white rounded-md text-sm hover:bg-[#b45309]">开始处理</button>
                  <button onClick={() => onUpdateStatus('Completed', '维修完成')} className="px-4 py-2 bg-[#059669] text-white rounded-md text-sm hover:bg-[#047857]">确认完成</button>
                </>
              )}
            </div>
          )}
          
          {userRole === UserRole.Teacher && ticket.status !== 'Completed' && ticket.status !== 'Closed' && (
            <button onClick={onUrge} disabled={ticket.isUrged} className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1">
              <Bell size={16} /> {ticket.isUrged ? '已催修' : '催修'}
            </button>
          )}
          
          <button onClick={onClose} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-white">关闭</button>
        </div>
      </div>
    </div>
  );
};

// 通用弹窗
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white w-full max-w-lg rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-[#f5f6f7] rounded"><X size={18} /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// 工单状态徽章
const TicketStatusBadge: React.FC<{ status: EnhancedRepairTicket['status'] }> = ({ status }) => {
  const config: Record<string, { label: string; color: string }> = {
    Open: { label: '待处理', color: 'bg-[#eff6ff] text-[#3370ff]' },
    Dispatched: { label: '已派单', color: 'bg-[#fef3c7] text-[#d97706]' },
    InProgress: { label: '处理中', color: 'bg-[#fff7ed] text-[#ea580c]' },
    Completed: { label: '已完成', color: 'bg-[#ecfdf5] text-[#059669]' },
    Closed: { label: '已关闭', color: 'bg-[#f5f6f7] text-[#646a73]' }
  };
  const { label, color } = config[status];
  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>;
};

// 物业服务状态徽章
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { label: string; color: string }> = {
    Pending: { label: '待审批', color: 'bg-[#eff6ff] text-[#3370ff]' },
    Approved: { label: '已批准', color: 'bg-[#ecfdf5] text-[#059669]' },
    InProgress: { label: '进行中', color: 'bg-[#fff7ed] text-[#d97706]' },
    Completed: { label: '已完成', color: 'bg-[#f5f6f7] text-[#646a73]' },
    Rejected: { label: '已驳回', color: 'bg-[#fef2f2] text-[#dc2626]' }
  };
  const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>;
};

// AI 图标
const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a5 5 0 0 0-5-5H5a5 5 0 0 0-5 5v2H1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a7 7 0 0 1 7-7V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
  </svg>
);

export default MaintenanceEnhanced;
