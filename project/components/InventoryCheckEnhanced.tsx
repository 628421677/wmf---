import React, { useState } from 'react';
import {
  ClipboardCheck, Plus, QrCode, Camera, AlertOctagon, FileDiff, CheckCircle2, X, ChevronRight,
  Calendar, Users, Building2, MapPin, Clock, Bell, Download, BarChart3, Filter, Search,
  ChevronDown, Eye, Edit, Trash2, Send, FileText, AlertTriangle, Home, RefreshCw, History,
  Target, TrendingUp, PieChart, ArrowRight, CheckSquare, XCircle, Image, Navigation
} from 'lucide-react';

// --- 类型定义 ---
type TaskStatus = '进行中' | '已完成' | '待发布' | '已逾期';
type DiscrepancyType = '面积不符' | '用途变更' | '私自转租' | '空置闲置' | '私自隔断' | '其他';
type DiscrepancyStatus = '待处理' | '已下发整改通知' | '整改中' | '待复核' | '已闭环' | '已逾期';
type ProcessStep = '发现问题' | '下发通知' | '整改执行' | '复核验收' | '闭环归档';

interface Department {
  id: string;
  name: string;
  contact: string;
  phone: string;
}

interface InventoryTask {
  id: string;
  name: string;
  type: '年度全面盘点' | '部门自查' | '科研用房专项' | '商业用房专项';
  status: TaskStatus;
  progress: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  totalProperties: number;
  checkedProperties: number;
  assignedDepts: string[];
  description?: string;
}

interface DiscrepancyReport {
  id: string;
  taskId: string;
  location: string;
  building: string;
  room: string;
  discrepancyType: DiscrepancyType;
  issue: string;
  reporter: string;
  reporterDept: string;
  reportTime: string;
  images: string[];
  status: DiscrepancyStatus;
  responsibleDept: string;
  responsiblePerson: string;
  deadline?: string;
  currentStep: ProcessStep;
  processHistory: ProcessRecord[];
  accountInfo: string;
  actualInfo: string;
}

interface ProcessRecord {
  step: ProcessStep;
  operator: string;
  time: string;
  remark: string;
  attachments?: string[];
}

interface CheckRecord {
  id: string;
  propertyId: string;
  location: string;
  checkTime: string;
  checker: string;
  result: '账实相符' | '存在差异';
  gpsLocation?: { lat: number; lng: number };
  images: string[];
  remark?: string;
}

interface DeptProgress {
  deptId: string;
  deptName: string;
  total: number;
  checked: number;
  matched: number;
  discrepancy: number;
  progress: number;
}

// --- 模拟数据 ---
const departments: Department[] = [
  { id: 'D001', name: '计算机学院', contact: '王主任', phone: '0591-83121001' },
  { id: 'D002', name: '机械学院', contact: '李主任', phone: '0591-83121002' },
  { id: 'D003', name: '土木学院', contact: '张主任', phone: '0591-83121003' },
  { id: 'D004', name: '电气学院', contact: '陈主任', phone: '0591-83121004' },
  { id: 'D005', name: '后勤处', contact: '刘处长', phone: '0591-83121005' },
  { id: 'D006', name: '图书馆', contact: '赵馆长', phone: '0591-83121006' },
];

const initTasks: InventoryTask[] = [
  {
    id: 'TSK-001', name: '2024年度全面盘点', type: '年度全面盘点', status: '进行中',
    progress: 75, startDate: '2024-03-01', endDate: '2024-04-30', createdBy: '资产处-林科长',
    totalProperties: 1280, checkedProperties: 960, assignedDepts: ['D001', 'D002', 'D003', 'D004', 'D005', 'D006'],
    description: '对全校所有房产进行年度盘点核查，重点关注用途变更和空置情况'
  },
  {
    id: 'TSK-002', name: '科研用房专项核查', type: '科研用房专项', status: '已完成',
    progress: 100, startDate: '2024-01-15', endDate: '2024-02-28', createdBy: '资产处-林科长',
    totalProperties: 320, checkedProperties: 320, assignedDepts: ['D001', 'D002', 'D003', 'D004'],
    description: '针对科研用房使用效率进行专项核查'
  },
  {
    id: 'TSK-003', name: '2025年第一季度部门自查', type: '部门自查', status: '待发布',
    progress: 0, startDate: '2025-01-01', endDate: '2025-01-31', createdBy: '资产处-林科长',
    totalProperties: 1280, checkedProperties: 0, assignedDepts: [],
    description: '各部门自行组织的季度盘点'
  },
  {
    id: 'TSK-004', name: '商业用房专项清查', type: '商业用房专项', status: '已逾期',
    progress: 45, startDate: '2024-02-01', endDate: '2024-02-29', createdBy: '资产处-林科长',
    totalProperties: 86, checkedProperties: 39, assignedDepts: ['D005'],
    description: '对校内商业用房进行专项清查，核实租赁合同执行情况'
  },
];

const initReports: DiscrepancyReport[] = [
  {
    id: 'REP-001', taskId: 'TSK-001', location: '理科实验楼 A座 301', building: '理科实验楼A座', room: '301',
    discrepancyType: '私自隔断', issue: '私自隔断，面积与图纸不符，原80㎡被隔成两间',
    reporter: '张三', reporterDept: '资产处', reportTime: '2024-03-15 14:30',
    images: ['/placeholder1.jpg', '/placeholder2.jpg'], status: '整改中',
    responsibleDept: '计算机学院', responsiblePerson: '王老师', deadline: '2024-04-15',
    currentStep: '整改执行', accountInfo: '科研用房-计算机学院-80㎡', actualInfo: '被隔断为两间，各约40㎡',
    processHistory: [
      { step: '发现问题', operator: '张三', time: '2024-03-15 14:30', remark: '现场盘点发现私自隔断' },
      { step: '下发通知', operator: '林科长', time: '2024-03-16 09:00', remark: '已下发整改通知书，要求15日内恢复原状' },
    ]
  },
  {
    id: 'REP-002', taskId: 'TSK-001', location: '学生宿舍三期 101', building: '学生宿舍三期', room: '101',
    discrepancyType: '私自转租', issue: '转租给校外人员使用，用于经营快递代收点',
    reporter: '李四', reporterDept: '后勤处', reportTime: '2024-03-18 10:15',
    images: ['/placeholder3.jpg'], status: '已下发整改通知',
    responsibleDept: '后勤处', responsiblePerson: '刘主管', deadline: '2024-04-01',
    currentStep: '下发通知', accountInfo: '学生宿舍-后勤处管理', actualInfo: '被转租用于快递代收',
    processHistory: [
      { step: '发现问题', operator: '李四', time: '2024-03-18 10:15', remark: '巡查发现违规转租' },
      { step: '下发通知', operator: '林科长', time: '2024-03-19 08:30', remark: '已下发整改通知，要求立即清退' },
    ]
  },
  {
    id: 'REP-003', taskId: 'TSK-001', location: '行政楼 502', building: '行政楼', room: '502',
    discrepancyType: '空置闲置', issue: '房间长期空置，无人使用超过6个月',
    reporter: '王五', reporterDept: '资产处', reportTime: '2024-03-20 16:00',
    images: [], status: '待处理',
    responsibleDept: '校办', responsiblePerson: '待确认', deadline: undefined,
    currentStep: '发现问题', accountInfo: '办公用房-校办-45㎡', actualInfo: '空置闲置',
    processHistory: [
      { step: '发现问题', operator: '王五', time: '2024-03-20 16:00', remark: '盘点发现长期空置' },
    ]
  },
  {
    id: 'REP-004', taskId: 'TSK-001', location: '实训中心 B栋 201', building: '实训中心B栋', room: '201',
    discrepancyType: '用途变更', issue: '原实训室改为仓库使用，未经审批',
    reporter: '赵六', reporterDept: '机械学院', reportTime: '2024-03-22 11:30',
    images: ['/placeholder4.jpg', '/placeholder5.jpg'], status: '待复核',
    responsibleDept: '机械学院', responsiblePerson: '李老师', deadline: '2024-04-10',
    currentStep: '复核验收', accountInfo: '实训用房-机械学院-120㎡', actualInfo: '改为仓库存放设备',
    processHistory: [
      { step: '发现问题', operator: '赵六', time: '2024-03-22 11:30', remark: '自查发现用途变更' },
      { step: '下发通知', operator: '林科长', time: '2024-03-23 09:00', remark: '要求恢复原用途或补办变更手续' },
      { step: '整改执行', operator: '李老师', time: '2024-04-05 15:00', remark: '已清理仓储物品，恢复实训功能' },
    ]
  },
];

const deptProgressData: DeptProgress[] = [
  { deptId: 'D001', deptName: '计算机学院', total: 180, checked: 165, matched: 158, discrepancy: 7, progress: 92 },
  { deptId: 'D002', deptName: '机械学院', total: 220, checked: 180, matched: 172, discrepancy: 8, progress: 82 },
  { deptId: 'D003', deptName: '土木学院', total: 200, checked: 150, matched: 145, discrepancy: 5, progress: 75 },
  { deptId: 'D004', deptName: '电气学院', total: 160, checked: 140, matched: 136, discrepancy: 4, progress: 88 },
  { deptId: 'D005', deptName: '后勤处', total: 320, checked: 200, matched: 185, discrepancy: 15, progress: 63 },
  { deptId: 'D006', deptName: '图书馆', total: 200, checked: 125, matched: 122, discrepancy: 3, progress: 63 },
];

const checkHistory: CheckRecord[] = [
  { id: 'CHK-001', propertyId: 'P001', location: '理科实验楼 A座 301', checkTime: '2024-03-15 14:30', checker: '张三', result: '存在差异', images: ['/img1.jpg'], gpsLocation: { lat: 26.0745, lng: 119.2965 } },
  { id: 'CHK-002', propertyId: 'P002', location: '理科实验楼 A座 302', checkTime: '2024-03-15 14:45', checker: '张三', result: '账实相符', images: ['/img2.jpg'], gpsLocation: { lat: 26.0745, lng: 119.2965 } },
  { id: 'CHK-003', propertyId: 'P003', location: '理科实验楼 A座 303', checkTime: '2024-03-15 15:00', checker: '张三', result: '账实相符', images: ['/img3.jpg'], gpsLocation: { lat: 26.0745, lng: 119.2965 } },
];

// --- 主组件 ---
const InventoryCheckEnhanced: React.FC = () => {
  const [tasks, setTasks] = useState<InventoryTask[]>(initTasks);
  const [reports, setReports] = useState<DiscrepancyReport[]>(initReports);
  const [activeTab, setActiveTab] = useState<'tasks' | 'reports' | 'statistics'>('tasks');
  const [selectedTask, setSelectedTask] = useState<InventoryTask | null>(null);
  const [selectedReport, setSelectedReport] = useState<DiscrepancyReport | null>(null);
  const [isScanModalOpen, setScanModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isReportDetailOpen, setReportDetailOpen] = useState(false);
  const [isProcessModalOpen, setProcessModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 新建任务表单状态
  const [newTask, setNewTask] = useState({
    name: '', type: '年度全面盘点' as InventoryTask['type'],
    startDate: '', endDate: '', description: '', assignedDepts: [] as string[]
  });

  const getStatusBadge = (status: TaskStatus | DiscrepancyStatus) => {
    const styles: Record<string, string> = {
      '进行中': 'bg-blue-100 text-blue-700',
      '已完成': 'bg-green-100 text-green-700',
      '已闭环': 'bg-green-100 text-green-700',
      '待发布': 'bg-gray-100 text-gray-600',
      '待处理': 'bg-yellow-100 text-yellow-700',
      '已逾期': 'bg-red-100 text-red-700',
      '整改中': 'bg-purple-100 text-purple-700',
      '已下发整改通知': 'bg-orange-100 text-orange-700',
      '待复核': 'bg-cyan-100 text-cyan-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  const getDiscrepancyTypeBadge = (type: DiscrepancyType) => {
    const styles: Record<DiscrepancyType, string> = {
      '面积不符': 'bg-blue-50 text-blue-600 border-blue-200',
      '用途变更': 'bg-amber-50 text-amber-600 border-amber-200',
      '私自转租': 'bg-red-50 text-red-600 border-red-200',
      '空置闲置': 'bg-gray-50 text-gray-600 border-gray-200',
      '私自隔断': 'bg-purple-50 text-purple-600 border-purple-200',
      '其他': 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return styles[type];
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterType !== 'all' && task.type !== filterType) return false;
    if (searchKeyword && !task.name.includes(searchKeyword)) return false;
    return true;
  });

  const filteredReports = reports.filter(report => {
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    if (filterType !== 'all' && report.discrepancyType !== filterType) return false;
    if (searchKeyword && !report.location.includes(searchKeyword) && !report.issue.includes(searchKeyword)) return false;
    return true;
  });

  // 发送催办通知
  const sendReminder = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    alert(`已向 ${dept?.name} ${dept?.contact} 发送催办通知！`);
  };

  // 发布任务
  const publishTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: '进行中' as TaskStatus } : t));
  };

  // 创建新任务
  const createTask = () => {
    const task: InventoryTask = {
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      ...newTask,
      status: '待发布',
      progress: 0,
      createdBy: '资产处-当前用户',
      totalProperties: Math.floor(Math.random() * 500) + 100,
      checkedProperties: 0,
    };
    setTasks(prev => [...prev, task]);
    setTaskModalOpen(false);
    setNewTask({ name: '', type: '年度全面盘点', startDate: '', endDate: '', description: '', assignedDepts: [] });
  };

  // 处理差异 - 推进流程
  const advanceProcess = (reportId: string, nextStep: ProcessStep, remark: string) => {
    const statusMap: Record<ProcessStep, DiscrepancyStatus> = {
      '发现问题': '待处理',
      '下发通知': '已下发整改通知',
      '整改执行': '整改中',
      '复核验收': '待复核',
      '闭环归档': '已闭环',
    };
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          currentStep: nextStep,
          status: statusMap[nextStep],
          processHistory: [...r.processHistory, {
            step: nextStep, operator: '当前用户', time: new Date().toLocaleString('zh-CN'), remark
          }]
        };
      }
      return r;
    }));
    setProcessModalOpen(false);
  };

  // 统计数据
  const stats = {
    totalTasks: tasks.length,
    activeTasks: tasks.filter(t => t.status === '进行中').length,
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === '待处理').length,
    overdueReports: reports.filter(r => r.status === '已逾期').length,
    closedReports: reports.filter(r => r.status === '已闭环').length,
    discrepancyByType: {
      '面积不符': reports.filter(r => r.discrepancyType === '面积不符').length,
      '用途变更': reports.filter(r => r.discrepancyType === '用途变更').length,
      '私自转租': reports.filter(r => r.discrepancyType === '私自转租').length,
      '空置闲置': reports.filter(r => r.discrepancyType === '空置闲置').length,
      '私自隔断': reports.filter(r => r.discrepancyType === '私自隔断').length,
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329] flex items-center gap-2">
            <ClipboardCheck size={24} className="text-[#3370ff]" />
            房产盘点核查
          </h2>
          <p className="text-[#646a73]">解决账实不符问题，支持常态化盘点与专项核查，全流程闭环管理。</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTaskModalOpen(true)} className="flex items-center gap-2 text-sm font-medium bg-[#3370ff] hover:bg-[#285cc9] text-white px-4 py-2 rounded">
            <Plus size={18} /> 发布盘点任务
          </button>
          <button className="flex items-center gap-2 text-sm font-medium border border-[#3370ff] text-[#3370ff] hover:bg-blue-50 px-4 py-2 rounded">
            <Download size={18} /> 导出报告
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#646a73]">进行中任务</p>
              <p className="text-2xl font-bold text-[#3370ff]">{stats.activeTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Target size={24} className="text-[#3370ff]" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#646a73]">待处理差异</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#646a73]">已逾期问题</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueReports}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <Clock size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#646a73]">已闭环处理</p>
              <p className="text-2xl font-bold text-green-600">{stats.closedReports}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {[
          { key: 'tasks', label: '盘点任务', icon: ClipboardCheck },
          { key: 'reports', label: '差异处理', icon: FileDiff },
          { key: 'statistics', label: '统计分析', icon: BarChart3 },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white text-[#3370ff] shadow-sm' : 'text-[#646a73] hover:text-[#1f2329]'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* 盘点任务Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* 筛选栏 */}
          <div className="flex gap-4 items-center bg-white border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#646a73]" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="border rounded px-3 py-1.5 text-sm">
                <option value="all">全部状态</option>
                <option value="进行中">进行中</option>
                <option value="已完成">已完成</option>
                <option value="待发布">待发布</option>
                <option value="已逾期">已逾期</option>
              </select>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="border rounded px-3 py-1.5 text-sm">
                <option value="all">全部类型</option>
                <option value="年度全面盘点">年度全面盘点</option>
                <option value="部门自查">部门自查</option>
                <option value="科研用房专项">科研用房专项</option>
                <option value="商业用房专项">商业用房专项</option>
              </select>
            </div>
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a73]" />
              <input type="text" placeholder="搜索任务名称..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border rounded text-sm" />
            </div>
          </div>

          {/* 任务列表 */}
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="space-y-0 divide-y">
              {filteredTasks.map(task => (
                <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-[#1f2329]">{task.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>{task.status}</span>
                        <span className="text-xs text-[#646a73] bg-slate-100 px-2 py-0.5 rounded">{task.type}</span>
                      </div>
                      <p className="text-sm text-[#646a73] mt-1">{task.description}</p>
                      <div className="flex items-center gap-6 mt-2 text-xs text-[#646a73]">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {task.startDate} ~ {task.endDate}</span>
                        <span className="flex items-center gap-1"><Users size={12} /> {task.assignedDepts.length} 个部门</span>
                        <span className="flex items-center gap-1"><Building2 size={12} /> {task.totalProperties} 处房产</span>
                        <span className="flex items-center gap-1"><FileText size={12} /> 创建人: {task.createdBy}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="w-32 h-2 bg-slate-200 rounded-full">
                          <div className={`h-2 rounded-full ${task.status === '已逾期' ? 'bg-red-500' : 'bg-[#3370ff]'}`} style={{ width: `${task.progress}%` }} />
                        </div>
                        <p className="text-xs mt-1 text-[#646a73]">{task.checkedProperties}/{task.totalProperties} ({task.progress}%)</p>
                      </div>
                      <div className="flex gap-2">
                        {task.status === '待发布' && (
                          <button onClick={() => publishTask(task.id)} className="text-xs px-3 py-1.5 bg-[#3370ff] text-white rounded hover:bg-[#285cc9]">发布</button>
                        )}
                        {task.status === '进行中' && (
                          <>
                            <button onClick={() => { setSelectedTask(task); setScanModalOpen(true); }} className="text-xs px-3 py-1.5 bg-[#3370ff] text-white rounded hover:bg-[#285cc9] flex items-center gap-1">
                              <QrCode size={12} /> 执行盘点
                            </button>
                            <button onClick={() => setSelectedTask(task)} className="text-xs px-3 py-1.5 border text-[#3370ff] rounded hover:bg-blue-50 flex items-center gap-1">
                              <Eye size={12} /> 查看进度
                            </button>
                          </>
                        )}
                        {task.status === '已完成' && (
                          <button className="text-xs px-3 py-1.5 border text-[#646a73] rounded hover:bg-slate-50 flex items-center gap-1">
                            <Download size={12} /> 导出报告
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 差异处理Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* 筛选栏 */}
          <div className="flex gap-4 items-center bg-white border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#646a73]" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
                <option value="all">全部状态</option>
                <option value="待处理">待处理</option>
                <option value="已下发整改通知">已下发整改通知</option>
                <option value="整改中">整改中</option>
                <option value="待复核">待复核</option>
                <option value="已闭环">已闭环</option>
              </select>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
                <option value="all">全部类型</option>
                <option value="面积不符">面积不符</option>
                <option value="用途变更">用途变更</option>
                <option value="私自转租">私自转租</option>
                <option value="空置闲置">空置闲置</option>
                <option value="私自隔断">私自隔断</option>
              </select>
            </div>
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a73]" />
              <input type="text" placeholder="搜索位置或问题描述..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border rounded text-sm" />
            </div>
          </div>

          {/* 差异报告列表 */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[#646a73]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">位置</th>
                  <th className="px-4 py-3 text-left font-medium">问题类型</th>
                  <th className="px-4 py-3 text-left font-medium">问题描述</th>
                  <th className="px-4 py-3 text-left font-medium">责任单位</th>
                  <th className="px-4 py-3 text-left font-medium">整改期限</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1f2329]">{report.location}</div>
                      <div className="text-xs text-[#646a73]">{report.reportTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded border text-xs font-medium ${getDiscrepancyTypeBadge(report.discrepancyType)}`}>
                        {report.discrepancyType}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate" title={report.issue}>{report.issue}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>{report.responsibleDept}</div>
                      <div className="text-xs text-[#646a73]">{report.responsiblePerson}</div>
                    </td>
                    <td className="px-4 py-3">
                      {report.deadline ? (
                        <span className={new Date(report.deadline) < new Date() ? 'text-red-600' : ''}>{report.deadline}</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>{report.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedReport(report); setReportDetailOpen(true); }}
                          className="text-xs text-[#3370ff] hover:underline">详情</button>
                        {report.status !== '已闭环' && (
                          <button onClick={() => { setSelectedReport(report); setProcessModalOpen(true); }}
                            className="text-xs text-[#3370ff] hover:underline">处理</button>
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

      {/* 统计分析Tab */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          {/* 各部门盘点进度 */}
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-[#1f2329] flex items-center gap-2">
                <TrendingUp size={18} /> 各部门盘点进度
              </h3>
              <button className="text-sm text-[#3370ff] hover:underline flex items-center gap-1">
                <RefreshCw size={14} /> 刷新数据
              </button>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[#646a73]">
                  <tr>
                    <th className="px-4 py-2 text-left">部门</th>
                    <th className="px-4 py-2 text-center">应盘数</th>
                    <th className="px-4 py-2 text-center">已盘数</th>
                    <th className="px-4 py-2 text-center">账实相符</th>
                    <th className="px-4 py-2 text-center">存在差异</th>
                    <th className="px-4 py-2 text-left">完成进度</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {deptProgressData.map(dept => (
                    <tr key={dept.deptId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{dept.deptName}</td>
                      <td className="px-4 py-3 text-center">{dept.total}</td>
                      <td className="px-4 py-3 text-center">{dept.checked}</td>
                      <td className="px-4 py-3 text-center text-green-600">{dept.matched}</td>
                      <td className="px-4 py-3 text-center text-red-600">{dept.discrepancy}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full">
                            <div className={`h-2 rounded-full ${dept.progress < 70 ? 'bg-red-500' : dept.progress < 90 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${dept.progress}%` }} />
                          </div>
                          <span className="text-xs w-10">{dept.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {dept.progress < 80 && (
                          <button onClick={() => sendReminder(dept.deptId)}
                            className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 flex items-center gap-1 mx-auto">
                            <Bell size={12} /> 催办
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 差异类型分布 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-[#1f2329] flex items-center gap-2 mb-4">
                <PieChart size={18} /> 差异类型分布
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.discrepancyByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-200 rounded-full">
                        <div className="h-2 bg-[#3370ff] rounded-full" style={{ width: `${(count / stats.totalReports) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-[#1f2329] flex items-center gap-2 mb-4">
                <BarChart3 size={18} /> 处理状态统计
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
                  <p className="text-xs text-[#646a73]">待处理</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{reports.filter(r => r.status === '整改中').length}</p>
                  <p className="text-xs text-[#646a73]">整改中</p>
                </div>
                <div className="text-center p-3 bg-cyan-50 rounded-lg">
                  <p className="text-2xl font-bold text-cyan-600">{reports.filter(r => r.status === '待复核').length}</p>
                  <p className="text-xs text-[#646a73]">待复核</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.closedReports}</p>
                  <p className="text-xs text-[#646a73]">已闭环</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 任务详情进度弹窗 */}
      {selectedTask && !isScanModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedTask(null)}>
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold text-lg">{selectedTask.name} - 盘点进度</h4>
              <button onClick={() => setSelectedTask(null)}><X size={20} /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-[#3370ff]">{selectedTask.totalProperties}</p>
                  <p className="text-xs text-[#646a73]">应盘总数</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedTask.checkedProperties}</p>
                  <p className="text-xs text-[#646a73]">已盘数量</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">{selectedTask.totalProperties - selectedTask.checkedProperties}</p>
                  <p className="text-xs text-[#646a73]">未盘数量</p>
                </div>
              </div>
              <h5 className="font-medium mb-2">各部门进度</h5>
              <div className="space-y-2">
                {deptProgressData.filter(d => selectedTask.assignedDepts.includes(d.deptId)).map(dept => (
                  <div key={dept.deptId} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{dept.deptName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#646a73]">{dept.checked}/{dept.total}</span>
                      <div className="w-24 h-2 bg-slate-200 rounded-full">
                        <div className={`h-2 rounded-full ${dept.progress < 70 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${dept.progress}%` }} />
                      </div>
                      <span className="text-sm w-10">{dept.progress}%</span>
                      {dept.progress < 80 && (
                        <button onClick={() => sendReminder(dept.deptId)} className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded">
                          <Bell size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 移动盘点弹窗 - 增强版 */}
      {isScanModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setScanModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold">移动盘点</h4>
              <button onClick={() => setScanModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="p-4">
              {/* 扫码区域 */}
              <div className="aspect-video bg-slate-800 rounded-lg flex flex-col items-center justify-center text-white mb-4">
                <QrCode size={48} />
                <p className="mt-2 text-sm">请扫描门牌二维码</p>
                <p className="text-xs text-slate-400 mt-1">或手动输入房间编号</p>
              </div>

              {/* GPS定位状态 */}
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded mb-4">
                <Navigation size={16} className="text-green-600" />
                <span className="text-sm text-green-700">GPS定位成功: 福建理工大学旗山校区</span>
                <CheckCircle2 size={14} className="text-green-600 ml-auto" />
              </div>

              {/* 房产信息 */}
              <div className="border rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">理科实验楼 A座 301</span>
                  <button className="text-xs text-[#3370ff] flex items-center gap-1">
                    <History size={12} /> 历史记录
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[#646a73]">账面用途</p>
                    <p>科研用房</p>
                  </div>
                  <div>
                    <p className="text-[#646a73]">使用单位</p>
                    <p>计算机学院</p>
                  </div>
                  <div>
                    <p className="text-[#646a73]">账面面积</p>
                    <p>80㎡</p>
                  </div>
                  <div>
                    <p className="text-[#646a73]">使用人</p>
                    <p>王老师</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-[#646a73]">上次盘点: 2023-12-15 账实相符</p>
                </div>
              </div>

              {/* 拍照上传 */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">现场照片 <span className="text-red-500">*</span></p>
                <div className="flex gap-2">
                  <div className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-[#646a73] cursor-pointer hover:border-[#3370ff]">
                    <Camera size={24} />
                    <span className="text-xs mt-1">拍照</span>
                  </div>
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Image size={24} className="text-[#646a73]" />
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                  <CheckCircle2 size={18} /> 账实相符
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                  <AlertOctagon size={18} /> 异常上报
                </button>
              </div>

              {/* 离线模式提示 */}
              <p className="text-xs text-center text-[#646a73] mt-3">
                支持离线盘点，联网后自动同步
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 新建任务弹窗 */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setTaskModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold">发布盘点任务</h4>
              <button onClick={() => setTaskModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">任务名称 <span className="text-red-500">*</span></label>
                <input type="text" value={newTask.name} onChange={e => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded px-3 py-2" placeholder="如：2024年度全面盘点" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">盘点类型 <span className="text-red-500">*</span></label>
                <select value={newTask.type} onChange={e => setNewTask(prev => ({ ...prev, type: e.target.value as InventoryTask['type'] }))}
                  className="w-full border rounded px-3 py-2">
                  <option value="年度全面盘点">年度全面盘点</option>
                  <option value="部门自查">部门自查</option>
                  <option value="科研用房专项">科研用房专项</option>
                  <option value="商业用房专项">商业用房专项</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">开始日期 <span className="text-red-500">*</span></label>
                  <input type="date" value={newTask.startDate} onChange={e => setNewTask(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">截止日期 <span className="text-red-500">*</span></label>
                  <input type="date" value={newTask.endDate} onChange={e => setNewTask(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">任务描述</label>
                <textarea value={newTask.description} onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border rounded px-3 py-2 h-20" placeholder="请输入任务说明..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分配部门 <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {departments.map(dept => (
                    <label key={dept.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={newTask.assignedDepts.includes(dept.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewTask(prev => ({ ...prev, assignedDepts: [...prev.assignedDepts, dept.id] }));
                          } else {
                            setNewTask(prev => ({ ...prev, assignedDepts: prev.assignedDepts.filter(id => id !== dept.id) }));
                          }
                        }} />
                      {dept.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setTaskModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50">取消</button>
              <button onClick={createTask} className="px-4 py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9]">创建任务</button>
            </div>
          </div>
        </div>
      )}

      {/* 差异详情弹窗 */}
      {isReportDetailOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setReportDetailOpen(false)}>
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold">差异详情 - {selectedReport.id}</h4>
              <button onClick={() => setReportDetailOpen(false)}><X size={18} /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-[#646a73]">位置</p>
                  <p className="font-medium">{selectedReport.location}</p>
                </div>
                <div>
                  <p className="text-sm text-[#646a73]">问题类型</p>
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${getDiscrepancyTypeBadge(selectedReport.discrepancyType)}`}>
                    {selectedReport.discrepancyType}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#646a73]">账面信息</p>
                  <p>{selectedReport.accountInfo}</p>
                </div>
                <div>
                  <p className="text-sm text-[#646a73]">实际情况</p>
                  <p className="text-red-600">{selectedReport.actualInfo}</p>
                </div>
                <div>
                  <p className="text-sm text-[#646a73]">责任单位</p>
                  <p>{selectedReport.responsibleDept} - {selectedReport.responsiblePerson}</p>
                </div>
                <div>
                  <p className="text-sm text-[#646a73]">整改期限</p>
                  <p className={selectedReport.deadline && new Date(selectedReport.deadline) < new Date() ? 'text-red-600' : ''}>
                    {selectedReport.deadline || '未设置'}
                  </p>
                </div>
              </div>

              {/* 问题描述 */}
              <div className="mb-4">
                <p className="text-sm text-[#646a73] mb-1">问题描述</p>
                <p className="p-3 bg-slate-50 rounded">{selectedReport.issue}</p>
              </div>

              {/* 现场照片 */}
              {selectedReport.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-[#646a73] mb-2">现场照片</p>
                  <div className="flex gap-2">
                    {selectedReport.images.map((img, idx) => (
                      <div key={idx} className="w-24 h-24 bg-slate-200 rounded flex items-center justify-center">
                        <Image size={32} className="text-[#646a73]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 处理流程 */}
              <div>
                <p className="text-sm text-[#646a73] mb-2">处理流程</p>
                <div className="relative">
                  {/* 流程步骤指示器 */}
                  <div className="flex items-center justify-between mb-4 px-4">
                    {(['发现问题', '下发通知', '整改执行', '复核验收', '闭环归档'] as ProcessStep[]).map((step, idx) => {
                      const isCompleted = selectedReport.processHistory.some(h => h.step === step);
                      const isCurrent = selectedReport.currentStep === step;
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                            ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-[#3370ff] text-white' : 'bg-slate-200 text-[#646a73]'}`}>
                            {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                          </div>
                          <span className={`text-xs mt-1 ${isCurrent ? 'text-[#3370ff] font-medium' : 'text-[#646a73]'}`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 处理记录 */}
                  <div className="space-y-2 border-l-2 border-slate-200 ml-4 pl-4">
                    {selectedReport.processHistory.map((record, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] w-3 h-3 bg-[#3370ff] rounded-full border-2 border-white" />
                        <div className="bg-slate-50 rounded p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{record.step}</span>
                            <span className="text-xs text-[#646a73]">{record.time}</span>
                          </div>
                          <p className="text-sm">{record.remark}</p>
                          <p className="text-xs text-[#646a73] mt-1">操作人: {record.operator}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 差异处理弹窗 */}
      {isProcessModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setProcessModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold">处理差异 - {selectedReport.location}</h4>
              <button onClick={() => setProcessModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-[#646a73]">当前状态</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
              </div>

              {selectedReport.currentStep === '发现问题' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">责任单位</label>
                    <select className="w-full border rounded px-3 py-2">
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">整改期限</label>
                    <input type="date" className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">整改要求</label>
                    <textarea className="w-full border rounded px-3 py-2 h-20" placeholder="请输入整改要求..." />
                  </div>
                  <button onClick={() => advanceProcess(selectedReport.id, '下发通知', '已下发整改通知书')}
                    className="w-full py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9] flex items-center justify-center gap-2">
                    <Send size={16} /> 下发整改通知
                  </button>
                </div>
              )}

              {selectedReport.currentStep === '下发通知' && (
                <div className="space-y-4">
                  <p className="text-sm text-[#646a73]">等待责任单位整改中...</p>
                  <div>
                    <label className="block text-sm font-medium mb-1">整改进展备注</label>
                    <textarea className="w-full border rounded px-3 py-2 h-20" placeholder="记录整改进展..." />
                  </div>
                  <button onClick={() => advanceProcess(selectedReport.id, '整改执行', '责任单位已开始整改')}
                    className="w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                    确认开始整改
                  </button>
                </div>
              )}

              {selectedReport.currentStep === '整改执行' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">整改完成情况</label>
                    <textarea className="w-full border rounded px-3 py-2 h-20" placeholder="描述整改完成情况..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">整改后照片</label>
                    <div className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-[#646a73] cursor-pointer">
                      <Camera size={24} />
                      <span className="text-xs mt-1">上传</span>
                    </div>
                  </div>
                  <button onClick={() => advanceProcess(selectedReport.id, '复核验收', '整改完成，提交复核')}
                    className="w-full py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600">
                    提交复核
                  </button>
                </div>
              )}

              {selectedReport.currentStep === '复核验收' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">复核意见</label>
                    <textarea className="w-full border rounded px-3 py-2 h-20" placeholder="请输入复核意见..." />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => advanceProcess(selectedReport.id, '整改执行', '复核不通过，需重新整改')}
                      className="py-2 border border-red-500 text-red-500 rounded hover:bg-red-50">
                      不通过
                    </button>
                    <button onClick={() => advanceProcess(selectedReport.id, '闭环归档', '复核通过，问题已解决')}
                      className="py-2 bg-green-500 text-white rounded hover:bg-green-600">
                      通过并闭环
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryCheckEnhanced;
