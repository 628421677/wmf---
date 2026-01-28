import React, { useMemo, useState } from 'react';
import {
  Calendar,
  ClipboardCheck,
  Download,
  Eye,
  Filter,
  Plus,
  QrCode,
  Search,
  Users,
  Building2,
  FileText,
  X,
  Camera,
  AlertOctagon,
  CheckCircle2,
  History,
  Image,
  Navigation
} from 'lucide-react';

type TaskStatus = '进行中' | '已完成' | '待发布' | '已逾期';

type InventoryTaskType = '年度全面盘点' | '部门自查' | '科研用房专项' | '商业用房专项';

interface Department {
  id: string;
  name: string;
  contact: string;
  phone: string;
}

interface InventoryTask {
  id: string;
  name: string;
  type: InventoryTaskType;
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
    id: 'TSK-001',
    name: '2024年度全面盘点',
    type: '年度全面盘点',
    status: '进行中',
    progress: 75,
    startDate: '2024-03-01',
    endDate: '2024-04-30',
    createdBy: '资产处-林科长',
    totalProperties: 1280,
    checkedProperties: 960,
    assignedDepts: ['D001', 'D002', 'D003', 'D004', 'D005', 'D006'],
    description: '对全校所有房产进行年度盘点核查，重点关注用途变更和空置情况',
  },
  {
    id: 'TSK-002',
    name: '科研用房专项核查',
    type: '科研用房专项',
    status: '已完成',
    progress: 100,
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    createdBy: '资产处-林科长',
    totalProperties: 320,
    checkedProperties: 320,
    assignedDepts: ['D001', 'D002', 'D003', 'D004'],
    description: '针对科研用房使用效率进行专项核查',
  },
  {
    id: 'TSK-003',
    name: '2025年第一季度部门自查',
    type: '部门自查',
    status: '待发布',
    progress: 0,
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    createdBy: '资产处-林科长',
    totalProperties: 1280,
    checkedProperties: 0,
    assignedDepts: [],
    description: '各部门自行组织的季度盘点',
  },
  {
    id: 'TSK-004',
    name: '商业用房专项清查',
    type: '商业用房专项',
    status: '已逾期',
    progress: 45,
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    createdBy: '资产处-林科长',
    totalProperties: 86,
    checkedProperties: 39,
    assignedDepts: ['D005'],
    description: '对校内商业用房进行专项清查，核实租赁合同执行情况',
  },
];

const InventoryTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<InventoryTask[]>(initTasks);

  const [selectedTask, setSelectedTask] = useState<InventoryTask | null>(null);
  const [isScanModalOpen, setScanModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [newTask, setNewTask] = useState({
    name: '',
    type: '年度全面盘点' as InventoryTaskType,
    startDate: '',
    endDate: '',
    description: '',
    assignedDepts: [] as string[],
  });

  const getStatusBadge = (status: TaskStatus) => {
    const styles: Record<string, string> = {
      '进行中': 'bg-blue-100 text-blue-700',
      '已完成': 'bg-green-100 text-green-700',
      '待发布': 'bg-gray-100 text-gray-600',
      '已逾期': 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterType !== 'all' && task.type !== filterType) return false;
      if (searchKeyword && !task.name.includes(searchKeyword)) return false;
      return true;
    });
  }, [tasks, filterStatus, filterType, searchKeyword]);

  const publishTask = (taskId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: '进行中' as TaskStatus } : t)));
  };

  const createTask = () => {
    const task: InventoryTask = {
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      name: newTask.name,
      type: newTask.type,
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      description: newTask.description,
      assignedDepts: newTask.assignedDepts,
      status: '待发布',
      progress: 0,
      createdBy: '资产处-当前用户',
      totalProperties: Math.floor(Math.random() * 500) + 100,
      checkedProperties: 0,
    };

    setTasks((prev) => [...prev, task]);
    setTaskModalOpen(false);
    setNewTask({ name: '', type: '年度全面盘点', startDate: '', endDate: '', description: '', assignedDepts: [] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">进行中任务</p>
          <p className="text-2xl font-bold text-[#3370ff]">{tasks.filter(t => t.status === '进行中').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">待发布任务</p>
          <p className="text-2xl font-bold text-[#1f2329]">{tasks.filter(t => t.status === '待发布').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">已完成任务</p>
          <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === '已完成').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">逾期任务</p>
          <p className="text-2xl font-bold text-red-600">{tasks.filter(t => t.status === '已逾期').length}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329] flex items-center gap-2">
            <ClipboardCheck size={24} className="text-[#3370ff]" />
            盘点任务
          </h2>
          <p className="text-[#646a73]">发布、跟踪和管理所有房产盘点任务。</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium bg-[#3370ff] hover:bg-[#285cc9] text-white px-4 py-2 rounded"
          >
            <Plus size={18} /> 发布新任务
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 items-center bg-white border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#646a73]" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
              <option value="all">全部状态</option>
              <option value="进行中">进行中</option>
              <option value="已完成">已完成</option>
              <option value="待发布">待发布</option>
              <option value="已逾期">已逾期</option>
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
              <option value="all">全部类型</option>
              <option value="年度全面盘点">年度全面盘点</option>
              <option value="部门自查">部门自查</option>
              <option value="科研用房专项">科研用房专项</option>
              <option value="商业用房专项">商业用房专项</option>
            </select>
          </div>
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a73]" />
            <input
              type="text"
              placeholder="搜索任务名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border rounded text-sm"
            />
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm">
          <div className="space-y-0 divide-y">
            {filteredTasks.map((task) => (
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
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {task.startDate} ~ {task.endDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {task.assignedDepts.length} 个部门
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 size={12} /> {task.totalProperties} 处房产
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={12} /> 创建人: {task.createdBy}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <div className="w-32 h-2 bg-slate-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${task.status === '已逾期' ? 'bg-red-500' : 'bg-[#3370ff]'}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-[#646a73]">
                        {task.checkedProperties}/{task.totalProperties} ({task.progress}%)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {task.status === '待发布' && (
                        <button
                          onClick={() => publishTask(task.id)}
                          className="text-xs px-3 py-1.5 bg-[#3370ff] text-white rounded hover:bg-[#285cc9]"
                        >
                          发布
                        </button>
                      )}
                      {task.status === '进行中' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setScanModalOpen(true);
                            }}
                            className="text-xs px-3 py-1.5 bg-[#3370ff] text-white rounded hover:bg-[#285cc9] flex items-center gap-1"
                          >
                            <QrCode size={12} /> 执行盘点
                          </button>
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="text-xs px-3 py-1.5 border text-[#3370ff] rounded hover:bg-blue-50 flex items-center gap-1"
                          >
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

      {selectedTask && !isScanModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedTask(null)}>
          <div
            className="bg-white w-full max-w-3xl rounded-lg shadow-lg max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold text-lg">{selectedTask.name} - 盘点进度</h4>
              <button onClick={() => setSelectedTask(null)}>
                <X size={20} />
              </button>
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
              <h5 className="font-medium mb-2">各部门进度（示例）</h5>
              <p className="text-sm text-[#646a73]">此处可接入各部门实际进度明细。</p>
            </div>
          </div>
        </div>
      )}

      {isScanModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setScanModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold">移动盘点</h4>
              <button onClick={() => setScanModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-slate-800 rounded-lg flex flex-col items-center justify-center text-white mb-4">
                <QrCode size={48} />
                <p className="mt-2 text-sm">请扫描门牌二维码</p>
                <p className="text-xs text-slate-400 mt-1">或手动输入房间编号</p>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded mb-4">
                <Navigation size={16} className="text-green-600" />
                <span className="text-sm text-green-700">GPS定位成功: 福建理工大学旗山校区</span>
                <CheckCircle2 size={14} className="text-green-600 ml-auto" />
              </div>
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
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">
                  现场照片 <span className="text-red-500">*</span>
                </p>
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
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                  <CheckCircle2 size={18} /> 账实相符
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                  <AlertOctagon size={18} /> 异常上报
                </button>
              </div>
              <p className="text-xs text-center text-[#646a73] mt-3">支持离线盘点，联网后自动同步</p>
            </div>
          </div>
        </div>
      )}

      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setTaskModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold">发布盘点任务</h4>
              <button onClick={() => setTaskModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  任务名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="如：2024年度全面盘点"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  盘点类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, type: e.target.value as InventoryTaskType }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="年度全面盘点">年度全面盘点</option>
                  <option value="部门自查">部门自查</option>
                  <option value="科研用房专项">科研用房专项</option>
                  <option value="商业用房专项">商业用房专项</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    开始日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    截止日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newTask.endDate}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">任务描述</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full border rounded px-3 py-2 h-20"
                  placeholder="请输入任务说明..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  分配部门 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {departments.map((dept) => (
                    <label key={dept.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newTask.assignedDepts.includes(dept.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTask((prev) => ({ ...prev, assignedDepts: [...prev.assignedDepts, dept.id] }));
                          } else {
                            setNewTask((prev) => ({
                              ...prev,
                              assignedDepts: prev.assignedDepts.filter((id) => id !== dept.id),
                            }));
                          }
                        }}
                      />
                      {dept.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setTaskModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50">
                取消
              </button>
              <button onClick={createTask} className="px-4 py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9]">
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTasksPage;

