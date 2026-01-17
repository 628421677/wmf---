import React, { useState, useMemo } from 'react';
import {
  FileText,
  Upload,
  CheckCircle,
  Plus,
  ArrowRight,
  Wallet,
  Building,
  X,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Paperclip,
  Calendar,
  Users,
  MapPin,
  TrendingDown,
  Package,
  Eye,
  Edit,
  Download,
  Layers,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { MOCK_PROJECTS } from '../constants';
import { 
  Project, 
  AssetStatus, 
  UserRole, 
  FundSource, 
  ProjectMilestone, 
  AssetCategory,
  ProjectAttachment,
  AssetSplitItem,
  MilestoneRecord,
  GaojibiaoMapping,
} from '../types';

interface AssetTransferProps {
  userRole: UserRole;
}

// localStorage hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
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

const AssetTransfer: React.FC<AssetTransferProps> = ({ userRole }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>('uniassets-projects-v2', MOCK_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'milestone' | 'attachment' | 'split' | 'gaojibiao'>('info');
  const [confirmAction, setConfirmAction] = useState<{ project: Project; action: string } | null>(null);
  
  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all');
  const [fundSourceFilter, setFundSourceFilter] = useState<FundSource | 'all'>('all');

  // 筛选后的项目列表
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.contractor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchFund = fundSourceFilter === 'all' || p.fundSource === fundSourceFilter;
      return matchSearch && matchStatus && matchFund;
    });
  }, [projects, searchTerm, statusFilter, fundSourceFilter]);

  // 统计数据
  const stats = useMemo(() => ({
    pending: projects.filter(p => [AssetStatus.PreAcceptance, AssetStatus.AuditReview, AssetStatus.FinancialReview].includes(p.status)).length,
    constructionAmount: projects.filter(p => p.status === AssetStatus.Construction).reduce((acc, p) => acc + p.contractAmount, 0),
    completed: projects.filter(p => p.status === AssetStatus.Active).length,
    overdue: projects.filter(p => p.isOverdue).length,
  }), [projects]);

  const getStatusLabel = (status: AssetStatus) => {
    const labels: Record<AssetStatus, string> = {
      [AssetStatus.Construction]: '在建中',
      [AssetStatus.PreAcceptance]: '预验收',
      [AssetStatus.AuditReview]: '审计决算中',
      [AssetStatus.FinancialReview]: '财务核算中',
      [AssetStatus.Active]: '已转固',
      [AssetStatus.Disposal]: '处置中',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: AssetStatus) => {
    const colors: Record<AssetStatus, string> = {
      [AssetStatus.Construction]: 'bg-blue-50 text-blue-600 border-blue-200',
      [AssetStatus.PreAcceptance]: 'bg-orange-50 text-orange-600 border-orange-200',
      [AssetStatus.AuditReview]: 'bg-purple-50 text-purple-600 border-purple-200',
      [AssetStatus.FinancialReview]: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      [AssetStatus.Active]: 'bg-green-50 text-green-600 border-green-200',
      [AssetStatus.Disposal]: 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return colors[status] || '';
  };

  const getNextAction = (status: AssetStatus): { text: string; nextStatus: AssetStatus } | null => {
    const actions: Partial<Record<AssetStatus, { text: string; nextStatus: AssetStatus }>> = {
      [AssetStatus.Construction]: { text: '发起竣工验收', nextStatus: AssetStatus.PreAcceptance },
      [AssetStatus.PreAcceptance]: { text: '提交审计决算', nextStatus: AssetStatus.AuditReview },
      [AssetStatus.AuditReview]: { text: '完成审计，提交财务', nextStatus: AssetStatus.FinancialReview },
      [AssetStatus.FinancialReview]: { text: '财务核算入账', nextStatus: AssetStatus.Active },
    };
    return actions[status] || null;
  };

  const handleProcess = (project: Project) => {
    const action = getNextAction(project.status);
    if (!action) return;
    setConfirmAction({ project, action: action.text });
  };

  const confirmProcess = () => {
    if (!confirmAction) return;
    const { project } = confirmAction;
    const action = getNextAction(project.status);
    if (!action) return;

    setProjects(prev => prev.map(p => {
      if (p.id !== project.id) return p;
      
      const newMilestone: MilestoneRecord = {
        milestone: statusToMilestone(action.nextStatus),
        date: new Date().toISOString().split('T')[0],
        operator: '当前用户',
        notes: action.text,
      };

      return {
        ...p,
        status: action.nextStatus,
        milestones: [...(p.milestones || []), newMilestone],
      };
    }));
    setConfirmAction(null);
  };

  const statusToMilestone = (status: AssetStatus): ProjectMilestone => {
    const map: Partial<Record<AssetStatus, ProjectMilestone>> = {
      [AssetStatus.PreAcceptance]: ProjectMilestone.Completion,
      [AssetStatus.AuditReview]: ProjectMilestone.Audit,
      [AssetStatus.Active]: ProjectMilestone.Transfer,
    };
    return map[status] || ProjectMilestone.Construction;
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* 新建项目模态框 */}
      {isModalOpen && (
        <NewProjectModal
          existingProjectCount={projects.length}
          onAddProject={project => {
            setProjects(prev => [project, ...prev]);
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* 项目详情模态框 */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          activeTab={detailTab}
          onTabChange={setDetailTab}
          onClose={() => setSelectedProject(null)}
          onUpdate={(updated) => {
            setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
            setSelectedProject(updated);
          }}
          userRole={userRole}
        />
      )}

      {/* 确认操作模态框 */}
      {confirmAction && (
        <ConfirmModal
          title="确认操作"
          message={`确定要对项目「${confirmAction.project.name}」执行「${confirmAction.action}」操作吗？`}
          onConfirm={confirmProcess}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* 顶部标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329]">资产建设与转固管理</h2>
          <p className="text-[#646a73]">全流程管理：立项 → 建设 → 竣工验收 → 审计决算 → 财务核算 → 转固入账</p>
        </div>
        {userRole === UserRole.AssetAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white border border-[#3370ff] text-[#3370ff] px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-[#e1eaff] transition"
            >
              <Plus size={18} /> 新建工程项目
            </button>
            <button className="bg-[#3370ff] hover:bg-[#285cc9] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition">
              <Download size={18} /> 批量导入
            </button>
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<FileText />} iconBg="bg-blue-50" iconColor="text-blue-600" title="待转固项目" value={stats.pending} subtitle="等待审计/财务核算" />
        <StatCard icon={<Wallet />} iconBg="bg-amber-50" iconColor="text-amber-600" title="在建工程总额" value={`¥${(stats.constructionAmount / 10000).toFixed(0)}万`} subtitle="已交付未决算" />
        <StatCard icon={<Building />} iconBg="bg-green-50" iconColor="text-green-600" title="已入账资产" value={stats.completed} subtitle="正式转固完成" />
        <StatCard icon={<AlertTriangle />} iconBg="bg-red-50" iconColor="text-red-600" title="超期预警" value={stats.overdue} subtitle="需及时处理" />
      </div>

      {/* 筛选栏 */}
      <div className="bg-white p-4 rounded-lg border border-[#dee0e3] flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
          <input
            type="text"
            placeholder="搜索项目名称、编号、承建单位..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm focus:border-[#3370ff] outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#646a73]" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as AssetStatus | 'all')}
            className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
          >
            <option value="all">全部状态</option>
            <option value={AssetStatus.Construction}>在建中</option>
            <option value={AssetStatus.PreAcceptance}>预验收</option>
            <option value={AssetStatus.AuditReview}>审计决算中</option>
            <option value={AssetStatus.FinancialReview}>财务核算中</option>
            <option value={AssetStatus.Active}>已转固</option>
          </select>
          <select
            value={fundSourceFilter}
            onChange={e => setFundSourceFilter(e.target.value as FundSource | 'all')}
            className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
          >
            <option value="all">全部来源</option>
            <option value={FundSource.Fiscal}>财政拨款</option>
            <option value={FundSource.SelfRaised}>自筹资金</option>
            <option value={FundSource.Mixed}>混合来源</option>
          </select>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-[#dee0e3] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#dee0e3] flex justify-between items-center bg-[#fcfcfd]">
          <h3 className="font-semibold text-[#1f2329]">基建工程项目列表</h3>
          <span className="text-xs font-medium px-2 py-1 bg-[#f2f3f5] text-[#646a73] rounded">
            共 {filteredProjects.length} 个项目
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f5f6f7] text-[#646a73] font-medium border-b border-[#dee0e3]">
              <tr>
                <th className="px-4 py-3">项目编号</th>
                <th className="px-4 py-3">项目名称</th>
                <th className="px-4 py-3">资金来源</th>
                <th className="px-4 py-3">合同金额</th>
                <th className="px-4 py-3">审计金额</th>
                <th className="px-4 py-3">审减率</th>
                <th className="px-4 py-3">进度</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee0e3]">
              {filteredProjects.map(project => (
                <tr key={project.id} className="hover:bg-[#f9f9f9] transition-colors">
                  <td className="px-4 py-4 font-medium text-[#1f2329]">{project.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1f2329]">{project.name}</span>
                      {project.isOverdue && (
                        <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded flex items-center gap-1">
                          <Clock size={10} /> 超期{project.overduedays}天
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <FundSourceTag source={project.fundSource} />
                  </td>
                  <td className="px-4 py-4">¥{project.contractAmount.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    {project.auditAmount ? `¥${project.auditAmount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-4">
                    {project.auditReductionRate !== undefined ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <TrendingDown size={12} /> {project.auditReductionRate}%
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <MilestoneProgress milestones={project.milestones} />
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedProject(project); setDetailTab('info'); }}
                        className="text-[#3370ff] hover:text-[#285cc9] p-1"
                        title="查看详情"
                      >
                        <Eye size={16} />
                      </button>
                      {userRole === UserRole.AssetAdmin && getNextAction(project.status) && (
                        <button
                          onClick={() => handleProcess(project)}
                          className="text-xs border border-[#3370ff] text-[#3370ff] px-2 py-1 rounded hover:bg-[#e1eaff] flex items-center gap-1"
                        >
                          {getNextAction(project.status)?.text} <ArrowRight size={12} />
                        </button>
                      )}
                      {project.status === AssetStatus.Active && (
                        <span className="text-green-600 text-xs flex items-center gap-1">
                          <CheckCircle size={12} /> 已归档
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ========== 子组件 ========== */

const StatCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string | number;
  subtitle: string;
}> = ({ icon, iconBg, iconColor, title, value, subtitle }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-[#dee0e3] flex items-start gap-4">
    <div className={`p-3 ${iconBg} ${iconColor} rounded-md`}>{icon}</div>
    <div>
      <h3 className="font-medium text-[#646a73] text-sm">{title}</h3>
      <p className="text-2xl font-bold text-[#1f2329] mt-1">{value}</p>
      <p className="text-xs text-[#8f959e] mt-1">{subtitle}</p>
    </div>
  </div>
);

const FundSourceTag: React.FC<{ source: FundSource }> = ({ source }) => {
  const config: Record<FundSource, { label: string; color: string }> = {
    [FundSource.Fiscal]: { label: '财政拨款', color: 'bg-blue-50 text-blue-600' },
    [FundSource.SelfRaised]: { label: '自筹资金', color: 'bg-amber-50 text-amber-600' },
    [FundSource.Mixed]: { label: '混合来源', color: 'bg-purple-50 text-purple-600' },
  };
  const { label, color } = config[source] || { label: source, color: '' };
  return <span className={`text-xs px-2 py-1 rounded ${color}`}>{label}</span>;
};

const MilestoneProgress: React.FC<{ milestones?: MilestoneRecord[] }> = ({ milestones }) => {
  const allMilestones = [
    ProjectMilestone.Approval,
    ProjectMilestone.Bidding,
    ProjectMilestone.Construction,
    ProjectMilestone.MainComplete,
    ProjectMilestone.Completion,
    ProjectMilestone.Audit,
    ProjectMilestone.Transfer,
  ];
  const completed = milestones?.map(m => m.milestone) || [];
  const progress = (completed.length / allMilestones.length) * 100;

  return (
    <div className="w-24">
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#3370ff] rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-[#8f959e]">{completed.length}/{allMilestones.length}</span>
    </div>
  );
};

const ConfirmModal: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onCancel}>
    <div className="bg-white rounded-lg w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
      <div className="p-6 border-b border-[#dee0e3]">
        <h3 className="text-lg font-bold text-[#1f2329]">{title}</h3>
      </div>
      <div className="p-6">
        <p className="text-[#646a73]">{message}</p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4 text-sm text-amber-700">
          <AlertCircle size={16} className="inline mr-2" />
          此操作将推进项目流程状态，请确认已准备好相关材料。
        </div>
      </div>
      <div className="px-6 py-4 bg-[#f9fafb] border-t border-[#dee0e3] flex justify-end gap-3 rounded-b-lg">
        <button onClick={onCancel} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-[#f2f3f5]">取消</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9]">确认执行</button>
      </div>
    </div>
  </div>
);

export default AssetTransfer;


/* ========== 新建项目模态框 ========== */
interface NewProjectModalProps {
  onClose: () => void;
  onAddProject: (project: Project) => void;
  existingProjectCount: number;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onAddProject, existingProjectCount }) => {
  const [formData, setFormData] = useState({
    name: '',
    contractor: '',
    contractAmount: '',
    fundSource: FundSource.Fiscal,
    location: '',
    plannedArea: '',
    plannedStartDate: '',
    plannedEndDate: '',
    projectManager: '',
    supervisor: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contractAmount) return;

    const newProject: Project = {
      id: `PRJ-${new Date().getFullYear()}-${String(existingProjectCount + 1).padStart(3, '0')}`,
      name: formData.name,
      contractor: formData.contractor || '未指定',
      contractAmount: Number(formData.contractAmount),
      status: AssetStatus.Construction,
      completionDate: formData.plannedEndDate || new Date().toISOString().split('T')[0],
      hasCadData: false,
      fundSource: formData.fundSource,
      location: formData.location,
      plannedArea: formData.plannedArea ? Number(formData.plannedArea) : undefined,
      plannedStartDate: formData.plannedStartDate,
      plannedEndDate: formData.plannedEndDate,
      projectManager: formData.projectManager,
      supervisor: formData.supervisor,
      milestones: [
        {
          milestone: ProjectMilestone.Approval,
          date: new Date().toISOString().split('T')[0],
          operator: '当前用户',
          notes: '项目立项',
        },
      ],
      attachments: [],
      isOverdue: false,
    };

    onAddProject(newProject);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#dee0e3] flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-bold text-[#1f2329]">录入新基建工程</h3>
          <button onClick={onClose} className="text-[#646a73] hover:text-[#1f2329]"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* 基本信息 */}
            <div>
              <h4 className="font-medium text-[#1f2329] mb-4 flex items-center gap-2">
                <FileText size={16} /> 基本信息
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#646a73] mb-1">工程名称 *</label>
                  <input
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如：综合体育馆建设工程"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">承建单位</label>
                  <input
                    value={formData.contractor}
                    onChange={e => updateField('contractor', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如：福建建工集团"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">监理单位</label>
                  <input
                    value={formData.supervisor}
                    onChange={e => updateField('supervisor', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如：福建建设监理公司"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">合同金额 (元) *</label>
                  <input
                    type="number"
                    value={formData.contractAmount}
                    onChange={e => updateField('contractAmount', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如: 10000000"
                    required
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">资金来源</label>
                  <select
                    value={formData.fundSource}
                    onChange={e => updateField('fundSource', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                  >
                    <option value={FundSource.Fiscal}>财政拨款</option>
                    <option value={FundSource.SelfRaised}>自筹资金</option>
                    <option value={FundSource.Mixed}>混合来源</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 建设信息 */}
            <div>
              <h4 className="font-medium text-[#1f2329] mb-4 flex items-center gap-2">
                <MapPin size={16} /> 建设信息
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#646a73] mb-1">建设地点</label>
                  <input
                    value={formData.location}
                    onChange={e => updateField('location', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如：旗山校区东侧"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">规划建筑面积 (m²)</label>
                  <input
                    type="number"
                    value={formData.plannedArea}
                    onChange={e => updateField('plannedArea', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如: 8500"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">项目负责人</label>
                  <input
                    value={formData.projectManager}
                    onChange={e => updateField('projectManager', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如：张工"
                  />
                </div>
              </div>
            </div>

            {/* 工期信息 */}
            <div>
              <h4 className="font-medium text-[#1f2329] mb-4 flex items-center gap-2">
                <Calendar size={16} /> 工期信息
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">计划开工日期</label>
                  <input
                    type="date"
                    value={formData.plannedStartDate}
                    onChange={e => updateField('plannedStartDate', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">计划竣工日期</label>
                  <input
                    type="date"
                    value={formData.plannedEndDate}
                    onChange={e => updateField('plannedEndDate', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#f9fafb] border-t border-[#dee0e3] flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-[#f2f3f5]">取消</button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] disabled:bg-gray-400"
              disabled={!formData.name || !formData.contractAmount}
            >
              确认录入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


/* ========== 项目详情模态框 ========== */
interface ProjectDetailModalProps {
  project: Project;
  activeTab: 'info' | 'milestone' | 'attachment' | 'split' | 'gaojibiao';
  onTabChange: (tab: 'info' | 'milestone' | 'attachment' | 'split' | 'gaojibiao') => void;
  onClose: () => void;
  onUpdate: (project: Project) => void;
  userRole: UserRole;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  activeTab,
  onTabChange,
  onClose,
  onUpdate,
  userRole,
}) => {
  const tabs = [
    { id: 'info', label: '基本信息', icon: <FileText size={14} /> },
    { id: 'milestone', label: '进度节点', icon: <Clock size={14} /> },
    { id: 'attachment', label: '附件管理', icon: <Paperclip size={14} /> },
    { id: 'split', label: '资产拆分', icon: <Layers size={14} /> },
    { id: 'gaojibiao', label: '高基表映射', icon: <FileCheck size={14} /> },
  ] as const;

  const getMilestoneLabel = (m: ProjectMilestone) => {
    const labels: Record<ProjectMilestone, string> = {
      [ProjectMilestone.Approval]: '立项批复',
      [ProjectMilestone.Bidding]: '招标完成',
      [ProjectMilestone.Construction]: '开工建设',
      [ProjectMilestone.MainComplete]: '主体完工',
      [ProjectMilestone.Completion]: '竣工验收',
      [ProjectMilestone.Audit]: '审计决算',
      [ProjectMilestone.Transfer]: '转固入账',
    };
    return labels[m] || m;
  };

  const getAttachmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      approval: '立项批复',
      bidding: '招标文件',
      contract: '施工合同',
      change: '变更签证',
      drawing: '竣工图纸',
      acceptance: '验收报告',
      audit: '审计报告',
      other: '其他',
    };
    return labels[type] || type;
  };

  const getCategoryLabel = (cat: AssetCategory) => {
    const labels: Record<AssetCategory, string> = {
      [AssetCategory.Building]: '房屋建筑物',
      [AssetCategory.Land]: '土地',
      [AssetCategory.Structure]: '构筑物',
      [AssetCategory.Equipment]: '设备',
      [AssetCategory.Greening]: '绿化',
      [AssetCategory.Other]: '其他',
    };
    return labels[cat] || cat;
  };

  // 添加资产拆分项
  const [newSplitItem, setNewSplitItem] = useState<Partial<AssetSplitItem>>({
    category: AssetCategory.Building,
    depreciationMethod: 'StraightLine',
    depreciationYears: 50,
  });

  const handleAddSplitItem = () => {
    if (!newSplitItem.name || !newSplitItem.amount) return;
    const item: AssetSplitItem = {
      id: `SPLIT-${Date.now()}`,
      category: newSplitItem.category || AssetCategory.Building,
      name: newSplitItem.name,
      amount: Number(newSplitItem.amount),
      area: newSplitItem.area ? Number(newSplitItem.area) : undefined,
      quantity: newSplitItem.quantity ? Number(newSplitItem.quantity) : undefined,
      depreciationYears: newSplitItem.depreciationYears || 50,
      depreciationMethod: newSplitItem.depreciationMethod || 'StraightLine',
    };
    onUpdate({
      ...project,
      splitItems: [...(project.splitItems || []), item],
    });
    setNewSplitItem({
      category: AssetCategory.Building,
      depreciationMethod: 'StraightLine',
      depreciationYears: 50,
    });
  };

  // 更新高基表数据
  const [gaojibiaoForm, setGaojibiaoForm] = useState<GaojibiaoMapping>(project.gaojibiaoData || {});

  const handleSaveGaojibiao = () => {
    onUpdate({
      ...project,
      gaojibiaoData: gaojibiaoForm,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-[#dee0e3] flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#1f2329]">{project.name}</h3>
            <p className="text-sm text-[#646a73] mt-1">{project.id} | {project.contractor}</p>
          </div>
          <button onClick={onClose} className="text-[#646a73] hover:text-[#1f2329]"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#dee0e3] px-6 flex gap-1 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#3370ff] text-[#3370ff]'
                  : 'border-transparent text-[#646a73] hover:text-[#1f2329]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 基本信息 */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <InfoItem label="资金来源" value={project.fundSource === FundSource.Fiscal ? '财政拨款' : project.fundSource === FundSource.SelfRaised ? '自筹资金' : '混合来源'} />
                <InfoItem label="建设地点" value={project.location || '-'} />
                <InfoItem label="合同金额" value={`¥${project.contractAmount.toLocaleString()}`} />
                <InfoItem label="审计金额" value={project.auditAmount ? `¥${project.auditAmount.toLocaleString()}` : '-'} />
                <InfoItem label="审减率" value={project.auditReductionRate !== undefined ? `${project.auditReductionRate}%` : '-'} />
                <InfoItem label="规划面积" value={project.plannedArea ? `${project.plannedArea} m²` : '-'} />
                <InfoItem label="项目负责人" value={project.projectManager || '-'} />
                <InfoItem label="监理单位" value={project.supervisor || '-'} />
                <InfoItem label="计划开工" value={project.plannedStartDate || '-'} />
                <InfoItem label="计划竣工" value={project.plannedEndDate || '-'} />
                <InfoItem label="实际开工" value={project.actualStartDate || '-'} />
                <InfoItem label="实际竣工" value={project.actualEndDate || '-'} />
              </div>
            </div>
          )}

          {/* 进度节点 */}
          {activeTab === 'milestone' && (
            <div className="space-y-4">
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#dee0e3]" />
                {project.milestones?.map((m, idx) => (
                  <div key={idx} className="relative pl-10 pb-6">
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-[#3370ff] border-2 border-white shadow" />
                    <div className="bg-[#f9fafb] rounded-lg p-4 border border-[#dee0e3]">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-[#1f2329]">{getMilestoneLabel(m.milestone)}</span>
                          <p className="text-sm text-[#646a73] mt-1">{m.notes}</p>
                        </div>
                        <div className="text-right text-sm text-[#8f959e]">
                          <div>{m.date}</div>
                          <div>{m.operator}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!project.milestones || project.milestones.length === 0) && (
                  <div className="text-center text-[#8f959e] py-8">暂无进度记录</div>
                )}
              </div>
            </div>
          )}

          {/* 附件管理 */}
          {activeTab === 'attachment' && (
            <div className="space-y-4">
              {userRole === UserRole.AssetAdmin && (
                <div className="flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 border border-[#3370ff] text-[#3370ff] rounded-md text-sm hover:bg-[#e1eaff]">
                    <Upload size={16} /> 上传附件
                  </button>
                </div>
              )}
              <div className="grid gap-3">
                {project.attachments?.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-4 bg-[#f9fafb] rounded-lg border border-[#dee0e3]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center text-blue-600">
                        <Paperclip size={18} />
                      </div>
                      <div>
                        <div className="font-medium text-[#1f2329]">{att.name}</div>
                        <div className="text-xs text-[#8f959e]">{getAttachmentTypeLabel(att.type)} | {att.uploadDate}</div>
                      </div>
                    </div>
                    <button className="text-[#3370ff] hover:text-[#285cc9]">
                      <Download size={18} />
                    </button>
                  </div>
                ))}
                {(!project.attachments || project.attachments.length === 0) && (
                  <div className="text-center text-[#8f959e] py-8">暂无附件</div>
                )}
              </div>
            </div>
          )}

          {/* 资产拆分 */}
          {activeTab === 'split' && (
            <div className="space-y-6">
              {/* 已拆分项 */}
              <div>
                <h4 className="font-medium text-[#1f2329] mb-3">已拆分资产项</h4>
                {project.splitItems && project.splitItems.length > 0 ? (
                  <div className="overflow-hidden border border-[#dee0e3] rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f5f6f7] text-[#646a73]">
                        <tr>
                          <th className="px-4 py-2 text-left">资产类别</th>
                          <th className="px-4 py-2 text-left">名称</th>
                          <th className="px-4 py-2 text-right">金额</th>
                          <th className="px-4 py-2 text-right">面积/数量</th>
                          <th className="px-4 py-2 text-center">折旧年限</th>
                          <th className="px-4 py-2 text-left">卡片号</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dee0e3]">
                        {project.splitItems.map(item => (
                          <tr key={item.id} className="hover:bg-[#f9f9f9]">
                            <td className="px-4 py-3">{getCategoryLabel(item.category)}</td>
                            <td className="px-4 py-3 font-medium">{item.name}</td>
                            <td className="px-4 py-3 text-right">¥{item.amount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">
                              {item.area ? `${item.area} m²` : item.quantity ? `${item.quantity} 台/套` : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">{item.depreciationYears} 年</td>
                            <td className="px-4 py-3 text-[#3370ff]">{item.assetCardNo || '待生成'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-[#f9fafb] font-medium">
                        <tr>
                          <td colSpan={2} className="px-4 py-3">合计</td>
                          <td className="px-4 py-3 text-right">¥{project.splitItems.reduce((acc, i) => acc + i.amount, 0).toLocaleString()}</td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-[#8f959e] py-4 bg-[#f9fafb] rounded-lg">暂未拆分</div>
                )}
              </div>

              {/* 新增拆分项 */}
              {userRole === UserRole.AssetAdmin && (
                <div className="border border-[#dee0e3] rounded-lg p-4">
                  <h4 className="font-medium text-[#1f2329] mb-4">新增拆分项</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[#646a73] mb-1">资产类别</label>
                      <select
                        value={newSplitItem.category}
                        onChange={e => setNewSplitItem(prev => ({ ...prev, category: e.target.value as AssetCategory }))}
                        className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                      >
                        {Object.values(AssetCategory).map(cat => (
                          <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-[#646a73] mb-1">资产名称</label>
                      <input
                        value={newSplitItem.name || ''}
                        onChange={e => setNewSplitItem(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                        placeholder="例如：主体建筑"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#646a73] mb-1">金额 (元)</label>
                      <input
                        type="number"
                        value={newSplitItem.amount || ''}
                        onChange={e => setNewSplitItem(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#646a73] mb-1">面积 (m²) / 数量</label>
                      <input
                        type="number"
                        value={newSplitItem.area || newSplitItem.quantity || ''}
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (newSplitItem.category === AssetCategory.Equipment) {
                            setNewSplitItem(prev => ({ ...prev, quantity: val, area: undefined }));
                          } else {
                            setNewSplitItem(prev => ({ ...prev, area: val, quantity: undefined }));
                          }
                        }}
                        className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#646a73] mb-1">折旧年限</label>
                      <input
                        type="number"
                        value={newSplitItem.depreciationYears || ''}
                        onChange={e => setNewSplitItem(prev => ({ ...prev, depreciationYears: Number(e.target.value) }))}
                        className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                        placeholder="50"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleAddSplitItem}
                      disabled={!newSplitItem.name || !newSplitItem.amount}
                      className="px-4 py-2 bg-[#3370ff] text-white rounded text-sm hover:bg-[#285cc9] disabled:bg-gray-400 flex items-center gap-2"
                    >
                      <Plus size={16} /> 添加拆分项
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 高基表映射 */}
          {activeTab === 'gaojibiao' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                <AlertCircle size={16} className="inline mr-2" />
                高基表数据将用于教育部统计报表填报，请确保数据准确。
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">建筑面积 (m²)</label>
                  <input
                    type="number"
                    value={gaojibiaoForm.buildingArea || ''}
                    onChange={e => setGaojibiaoForm(prev => ({ ...prev, buildingArea: Number(e.target.value) }))}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                    disabled={userRole !== UserRole.AssetAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">结构类型</label>
                  <select
                    value={gaojibiaoForm.structureType || ''}
                    onChange={e => setGaojibiaoForm(prev => ({ ...prev, structureType: e.target.value }))}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                    disabled={userRole !== UserRole.AssetAdmin}
                  >
                    <option value="">请选择</option>
                    <option value="框架结构">框架结构</option>
                    <option value="砖混结构">砖混结构</option>
                    <option value="钢结构">钢结构</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">层数</label>
                  <input
                    type="number"
                    value={gaojibiaoForm.floorCount || ''}
                    onChange={e => setGaojibiaoForm(prev => ({ ...prev, floorCount: Number(e.target.value) }))}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                    disabled={userRole !== UserRole.AssetAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">使用年限</label>
                  <input
                    type="number"
                    value={gaojibiaoForm.useYears || ''}
                    onChange={e => setGaojibiaoForm(prev => ({ ...prev, useYears: Number(e.target.value) }))}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                    disabled={userRole !== UserRole.AssetAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">占地面积 (m²)</label>
                  <input
                    type="number"
                    value={gaojibiaoForm.landArea || ''}
                    onChange={e => setGaojibiaoForm(prev => ({ ...prev, landArea: Number(e.target.value) }))}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                    disabled={userRole !== UserRole.AssetAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">绿化面积 (m²)</label>
                  <input
                    type="number"
                    value={gaojibiaoForm.greenArea || ''}
                    onChange={e => setGaojibiaoForm(prev => ({ ...prev, greenArea: Number(e.target.value) }))}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                    disabled={userRole !== UserRole.AssetAdmin}
                  />
                </div>
              </div>
              {userRole === UserRole.AssetAdmin && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveGaojibiao}
                    className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9]"
                  >
                    保存高基表数据
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-xs text-[#8f959e] mb-1">{label}</div>
    <div className="text-sm text-[#1f2329] font-medium">{value}</div>
  </div>
);
