import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { computeAttachmentCompletion, getStageAttachmentRequirements } from '../utils/assetAttachmentRequirements';
import { getAssetStatusColor, getAssetStatusLabel } from '../utils/assetStatus';
import {
  FileText,
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
  Paperclip,
  Calendar,
  MapPin,
  TrendingDown,
  Eye,
  Edit,
  Download,
  Layers,
  FileCheck,
  AlertCircle,
  Trash2,
  Archive,
  List,
  Check,
  XCircle,
  RefreshCw,
} from 'lucide-react';
// uuid dependency removed
import { MOCK_PROJECTS } from '../constants';
import {
  Project,
  AssetStatus,
  UserRole,
  FundSource,
  ProjectMilestone,
  AssetCategory,
  AssetSplitItem,
  MilestoneRecord,
  GaojibiaoMapping,
  AuditLog,
} from '../types';
import { normalizeAssetStatus } from '../utils/legacyAssetStatus';
import RoomFunctionPlanTab from './RoomFunctionPlanTab';
import { upsertBuildingFromProject } from '../utils/assetDigitalSync';
import { upsertRoomsFromProject } from '../utils/assetRoomSync';

interface AssetTransferProps {
  userRole: UserRole;
  initialDetailTab?: 'form' | 'split' | 'gaojibiao' | 'rooms' | 'audit';
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

const AssetTransfer: React.FC<AssetTransferProps> = ({ userRole, initialDetailTab = 'form' }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>('uniassets-projects-v2', MOCK_PROJECTS);
  const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>('uniassets-audit-logs', []);
    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailTab, setDetailTab] = useState<'form' | 'split' | 'gaojibiao' | 'rooms' | 'audit'>(initialDetailTab);
  const [confirmAction, setConfirmAction] = useState<{ project: Project; action: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'archive';
    project: Project | null;
  }>({ isOpen: false, type: 'delete', project: null });

  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all');
  const [fundSourceFilter, setFundSourceFilter] = useState<FundSource | 'all'>('all');

  // 筛选后的项目列表
  const filteredProjects = useMemo(() => {
    return projects
      .map(p => ({
        ...p,
        status: normalizeAssetStatus((p as any).status),
      }))
      .filter(p => {
        const q = searchTerm.toLowerCase();
        const statusLabel = getAssetStatusLabel(p.status).toLowerCase();
        const matchSearch = p.name.toLowerCase().includes(q) ||
                           p.id.toLowerCase().includes(q) ||
                           p.contractor.toLowerCase().includes(q) ||
                           statusLabel.includes(q);
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchFund = fundSourceFilter === 'all' || p.fundSource === fundSourceFilter;
        return matchSearch && matchStatus && matchFund;
      });
  }, [projects, searchTerm, statusFilter, fundSourceFilter]);

  // 统计数据
  const stats = useMemo(() => {
    const archivedCount = projects
      .map(p => ({ ...p, status: normalizeAssetStatus((p as any).status) }))
      .filter(p => p.status === AssetStatus.Archived)
      .length;

    return {
      pending: projects
        .map(p => ({ ...p, status: normalizeAssetStatus((p as any).status) }))
        .filter(p => p.status === AssetStatus.PendingReview)
        .length,
    constructionAmount: projects
        .map(p => ({ ...p, status: normalizeAssetStatus((p as any).status) }))
      .filter(p => p.status !== AssetStatus.Archived)
      .reduce((acc, p) => acc + p.contractAmount, 0),
      completed: archivedCount,
    overdue: projects.filter(p => p.isOverdue).length,
    };
  }, [projects]);

  // 审计日志辅助函数
  const logAudit = (action: AuditLog['action'], entityType: AuditLog['entityType'], entityId: string, entityName: string, changedFields?: Record<string, { old: any; new: any }>) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      action,
      entityType,
      entityId,
      entityName,
      changedFields,
      operator: '当前用户', // 实际项目中应从认证信息获取
      operatorRole: userRole,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 1000)); // 限制日志数量为1000条
  };



  const getNextAction = (status: AssetStatus): { text: string; nextStatus: AssetStatus } | null => {
    const actions: Partial<Record<AssetStatus, { text: string; nextStatus: AssetStatus }>> = {
      [AssetStatus.DisposalPending]: { text: '发起转固申请', nextStatus: AssetStatus.PendingReview },
    };
    return actions[status] || null;
  };

  // 处理项目流程推进（带审计日志）
  const handleProcess = (project: Project) => {
    const action = getNextAction(project.status);
    if (!action) return;

    // 记录状态变更日志
    logAudit(
      'status_change',
      'project',
      project.id,
      project.name,
      {
        status: {
          old: project.status,
          new: action.nextStatus
        }
      }
    );

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
      [AssetStatus.DisposalPending]: ProjectMilestone.Construction,
      [AssetStatus.PendingReview]: ProjectMilestone.Transfer,
      [AssetStatus.PendingArchive]: ProjectMilestone.Transfer,
      [AssetStatus.Archived]: ProjectMilestone.Transfer,
    };
    return map[status] || ProjectMilestone.Transfer;
  };

  // 删除项目（带审计日志）
  const handleDeleteProject = (project: Project) => {
    setConfirmDialog({ isOpen: true, type: 'delete', project });
  };

  const confirmDeleteProject = () => {
    if (!confirmDialog.project) return;
    const { id, name } = confirmDialog.project;
    
    setProjects(prev => prev.filter(p => p.id !== id));
    logAudit('delete', 'project', id, name);
    
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
  };

  // 归档项目（带审计日志）
  const handleArchiveProject = (project: Project) => {
    setConfirmDialog({ isOpen: true, type: 'archive', project });
  };

  const confirmArchiveProject = () => {
    if (!confirmDialog.project) return;

    // 归档前强校验：必须完成“房间管理”确认（工程类）
    if (!confirmDialog.project.roomFunctionPlanConfirmed) {
      alert('归档前请先完成并确认“房间功能划分”。');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      if (selectedProject?.id === confirmDialog.project.id) {
        setDetailTab('rooms');
      }
      return;
    }

    const updatedProject = {
      ...confirmDialog.project,
      status: AssetStatus.Archived,
      isArchived: true
    };

    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    logAudit('archive', 'project', updatedProject.id, updatedProject.name);

    // 归档后同步到“资产数字化-楼宇台账”（localStorage）
    try {
      upsertBuildingFromProject(updatedProject);
      upsertRoomsFromProject(updatedProject);
    } catch {
      // ignore sync error
    }
    
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* 编辑项目模态框 */}
      {isProjectFormOpen && editingProject && (
        <NewProjectModal
          mode="edit"
          initialProject={editingProject}
          onClose={() => {
            setIsProjectFormOpen(false);
            setEditingProject(null);
          }}
          onAddProject={() => {
            // no-op (edit mode only)
          }}
          onUpdateProject={(updatedProject) => {
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
            setSelectedProject(prev => (prev?.id === updatedProject.id ? updatedProject : prev));
            setIsProjectFormOpen(false);
            setEditingProject(null);
          }}
          existingProjectCount={projects.length}
        />
      )}

      {/* 项目详情模态框 */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          activeTab={detailTab}
          onTabChange={setDetailTab}
          onClose={() => setSelectedProject(null)}
          onEditProject={(p) => {
            setEditingProject(p);
            setIsProjectFormOpen(true);
          }}
          onUpdate={(updated) => {
            // Check for automatic status advancement
            let finalProject = { ...updated };
            if (finalProject.status === AssetStatus.PendingReview) {
              const completionStats = computeAttachmentCompletion(finalProject.status, finalProject.attachments || []);
              if (completionStats.requiredTotal > 0 && completionStats.requiredApproved === completionStats.requiredTotal) {
                finalProject.status = AssetStatus.PendingArchive;
                logAudit('status_change', 'project', finalProject.id, finalProject.name, {
                  status: {
                    old: AssetStatus.PendingReview,
                    new: AssetStatus.PendingArchive,
                  },
                });
              }
            }

            // 记录更新日志
            const changedFields = Object.entries(updated).reduce((acc, [key, value]) => {
              if (JSON.stringify(selectedProject![key as keyof Project]) !== JSON.stringify(value)) {
                acc[key] = {
                  old: selectedProject![key as keyof Project],
                  new: value
                };
              }
              return acc;
            }, {} as Record<string, { old: any; new: any }>);

            if (Object.keys(changedFields).length > 0) {
              logAudit(
                'update',
                'project',
                updated.id,
                updated.name,
                changedFields
              );
            }

            setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
            setSelectedProject(updated);
          }}
          userRole={userRole}
          auditLogs={auditLogs}
          onDelete={() => handleDeleteProject(selectedProject)}
          onArchive={() => handleArchiveProject(selectedProject)}
        />
      )}

      {/* 流程推进确认模态框 */}
      {confirmAction && (
        <ConfirmModal
          title="确认操作"
          message={`确定要对项目「${confirmAction.project.name}」执行「${confirmAction.action}」操作吗？`}
          onConfirm={confirmProcess}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* 通用确认对话框（删除/归档） */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'delete' ? '确认删除' : '确认归档'}
        message={confirmDialog.type === 'delete' 
          ? `确定要删除项目「${confirmDialog.project?.name}」吗？此操作不可恢复。`
          : `确定要归档项目「${confirmDialog.project?.name}」吗？归档后将不能修改。`}
        confirmText={confirmDialog.type === 'delete' ? '删除' : '归档'}
        cancelText="取消"
        onConfirm={confirmDialog.type === 'delete' ? confirmDeleteProject : confirmArchiveProject}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        variant={confirmDialog.type === 'delete' ? 'danger' : 'default'}
      />

      {/* 顶部标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329]">资产转固与管理</h2>
          <p className="text-[#646a73]">系统流程：待处置 → 待审核 → 待归档 → 已归档</p>
        </div>
        {userRole === UserRole.AssetAdmin && (
          <div className="flex gap-3">
            <Link
              to="/hall/assets/project-new"
              className="bg-white border border-[#3370ff] text-[#3370ff] px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-[#e1eaff] transition"
            >
              <Plus size={18} /> 新建工程项目
            </Link>
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
            <option value={AssetStatus.DisposalPending}>待处置</option>
            <option value={AssetStatus.PendingReview}>待审核</option>
            <option value={AssetStatus.PendingArchive}>待归档</option>
            <option value={AssetStatus.Archived}>已归档</option>
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
                <th className="px-4 py-3">楼层</th>
                <th className="px-4 py-3">房间数</th>
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
                      {project.isArchived && (
                        <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">
                          已归档
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
                  <td className="px-4 py-4">{project.floorCount ?? '-'}</td>
                  <td className="px-4 py-4">{project.roomCount ?? '-'}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getAssetStatusColor(project.status)}`}>
                      {getAssetStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ProjectActionsCell
                      project={project}
                      onView={() => {
                        setSelectedProject(project);
                        setDetailTab('form');
                      }}
                      onEnterArchiveFlow={() => {
                        const stat = computeAttachmentCompletion(AssetStatus.PendingReview, project.attachments || []);
                        const readyToEnterArchiveFlow = stat.requiredTotal > 0 && stat.requiredApproved === stat.requiredTotal;
                        if (!readyToEnterArchiveFlow) {
                          alert('必要附件未全部审核通过，无法进入归档流程。');
                          return;
                        }

                        logAudit('status_change', 'project', project.id, project.name, {
                          status: {
                            old: AssetStatus.PendingReview,
                            new: AssetStatus.PendingArchive,
                          },
                        });

                        setProjects(prev =>
                          prev.map(p =>
                            p.id === project.id
                              ? {
                                  ...p,
                                  status: AssetStatus.PendingArchive,
                                }
                              : p
                          )
                        );
                      }}
                      onArchive={() => handleArchiveProject(project)}
                      userRole={userRole}
                      onProcess={() => handleProcess(project)}
                      nextAction={getNextAction(project.status)}
                      canProceed={(() => {
                        const stat = computeAttachmentCompletion(project.status, project.attachments || []);
                        const hasThisStageFile = stat.missingRequired === 0;
                        return hasThisStageFile;
                      })()}
                    />
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

// 通用确认对话框组件
const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}> = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  if (!isOpen) return null;

  const buttonClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${buttonClass} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// 项目列表操作列组件
const ProjectActionsCell: React.FC<{
  project: Project;
  onView: () => void;
  onArchive: () => void;
  onEnterArchiveFlow: () => void;
  userRole: UserRole;
  onProcess: () => void;
  nextAction: { text: string; nextStatus: AssetStatus } | null;
  canProceed: boolean;
}> = ({ project, onView, onArchive, onEnterArchiveFlow, userRole, onProcess, nextAction, canProceed }) => {
  return (
    <div className="flex items-center gap-2">
      {/* 查看按钮 */}
      <button
        onClick={onView}
        className="text-blue-600 hover:text-blue-800 p-1"
        title="查看详情"
      >
        <Eye size={16} />
      </button>

      {/* 进入归档流程：仅“待审核”且必要附件全部审核通过 */}
      {userRole === UserRole.AssetAdmin && !project.isArchived && project.status === AssetStatus.PendingReview && (() => {
        const stat = computeAttachmentCompletion(AssetStatus.PendingReview, project.attachments || []);
        const readyToEnterArchiveFlow = stat.requiredTotal > 0 && stat.requiredApproved === stat.requiredTotal;
        if (!readyToEnterArchiveFlow) return null;
        return (
          <button
            onClick={onEnterArchiveFlow}
            className="text-xs border border-purple-600 text-purple-600 px-2 py-1 rounded hover:bg-purple-50 flex items-center gap-1"
            title="进入归档流程"
          >
            进入归档流程 <ArrowRight size={12} />
          </button>
        );
      })()}

      {/* 归档按钮：仅“待归档”状态下，资产处可归档 */}
      {userRole === UserRole.AssetAdmin && !project.isArchived && project.status === AssetStatus.PendingArchive && (
        <button
          onClick={onArchive}
          className="text-purple-600 hover:text-purple-800 p-1"
          title="归档"
        >
          <Archive size={16} />
        </button>
      )}

      {/* 流程推进按钮 */}
      {userRole === UserRole.AssetAdmin && !project.isArchived && nextAction && canProceed && (
        <button
          onClick={onProcess}
          className="text-xs border border-[#3370ff] text-[#3370ff] px-2 py-1 rounded hover:bg-[#e1eaff] flex items-center gap-1"
        >
          {nextAction.text} <ArrowRight size={12} />
        </button>
      )}

      {/* 已归档项目标识 */}
      {project.isArchived && (
        <span className="text-green-600 text-xs flex items-center gap-1">
          <CheckCircle size={12} /> 已归档
        </span>
      )}
    </div>
  );
};

// 字段标签组件
const InfoItem: React.FC<{
  label: string;
  value: string | number;
}> = ({ label, value }) => (
  <div>
    <p className="text-sm text-[#646a73] mb-1">{label}</p>
    <p className="font-medium text-[#1f2329]">{value}</p>
  </div>
);

// 项目操作按钮组件
const ProjectActions: React.FC<{
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  userRole: UserRole;
  asInfrastructureDept: boolean;
}> = ({ project, onEdit, onDelete, onArchive, userRole, asInfrastructureDept }) => {
  const canEditDeleteForm = asInfrastructureDept && !project.isArchived && project.status !== AssetStatus.Archived;
  const canArchive = userRole === UserRole.AssetAdmin && project.status === AssetStatus.PendingArchive && !project.isArchived;

  return (
    <div className="flex flex-wrap gap-2 mt-4 border-t border-gray-200 pt-4">
      {canEditDeleteForm && (
        <>
          <button
            onClick={onEdit}
            disabled={project.isArchived}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit size={14} /> 编辑
          </button>
          <button
            onClick={onDelete}
            disabled={project.isArchived}
            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} /> 删除
          </button>
        </>
      )}

      {canArchive && (
        <button
          onClick={onArchive}
          className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md text-sm hover:bg-purple-100 flex items-center gap-1"
        >
          <Archive size={14} /> 归档
        </button>
      )}
    </div>
  );
};

// 项目详情内的“编辑”目前未实现（原先误引用外层 setIsProjectFormOpen，导致 TS/JSX 解析混乱）
// removed noop: edit is now wired to open the project edit modal from the parent component

// 审计日志标签页组件
const AuditLogTab: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: '创建',
      update: '更新',
      delete: '删除',
      archive: '归档',
      status_change: '状态变更'
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">暂无操作记录</div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{log.entityName}</div>
                  <div className="text-sm text-gray-500">
                    {getActionLabel(log.action)} · {formatDate(log.timestamp)}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {log.operator} ({log.operatorRole})
                </div>
              </div>
              {log.changedFields && (
                <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                  {Object.entries(log.changedFields).map(([field, { old: oldValue, new: newValue }]) => (
                    <div key={field} className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500">{getFieldLabel(field)}:</span>
                      <span className="line-through text-red-500">{String(oldValue)}</span>
                      <span className="text-green-600">{String(newValue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 字段名称格式化辅助函数
const getFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    status: '项目状态',
    name: '项目名称',
    contractor: '承建单位',
    contractAmount: '合同金额',
    fundSource: '资金来源',
    location: '建设地点',
    plannedArea: '规划面积',
    projectManager: '项目负责人',
    supervisor: '监理单位',
    plannedStartDate: '计划开工日期',
    plannedEndDate: '计划竣工日期',
    actualStartDate: '实际开工日期',
    actualEndDate: '实际竣工日期',
    auditAmount: '审计金额',
    auditReductionRate: '审减率',
  };
  return labels[field] || field;
};

/* ========== 新建项目模态框 ========== */
interface NewProjectModalProps {
  mode?: 'create' | 'edit';
  initialProject?: Project | null;
  onClose: () => void;
  onAddProject: (project: Project) => void;
  onUpdateProject?: (project: Project) => void;
  existingProjectCount: number;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  mode = 'create',
  initialProject,
  onClose,
  onAddProject,
  onUpdateProject,
  existingProjectCount,
}) => {
  const [newAttachments, setNewAttachments] = useState<any[]>(initialProject?.attachments || []);
  const [newSplitItems, setNewSplitItems] = useState<AssetSplitItem[]>(initialProject?.splitItems || []);
  const [buildingName, setBuildingName] = useState<string>(() => {
    const first = (initialProject?.roomFunctionPlan || [])[0];
    return first?.buildingName || '';
  });
  const [newRoomPlans, setNewRoomPlans] = useState<any[]>(initialProject?.roomFunctionPlan || []);
  const [roomForm, setRoomForm] = useState<{ floor: string; roomNo: string; area: string }>({ floor: '', roomNo: '', area: '' });

  const [splitForm, setSplitForm] = useState<Partial<AssetSplitItem>>({
    category: AssetCategory.Building,
    depreciationMethod: 'StraightLine',
    depreciationYears: 50,
  });

  const [formData, setFormData] = useState(() => {
    if (mode === 'edit' && initialProject) {
      return {
        name: initialProject.name,
        contractor: initialProject.contractor,
        contractAmount: String(initialProject.contractAmount),
        auditAmount: initialProject.auditAmount ? String(initialProject.auditAmount) : '',
        fundSource: initialProject.fundSource,
        location: initialProject.location || '',
        plannedArea: String(initialProject.plannedArea || ''),
        plannedStartDate: initialProject.plannedStartDate || '',
        plannedEndDate: initialProject.plannedEndDate || '',
        actualStartDate: (initialProject as any).actualStartDate || '',
        actualEndDate: (initialProject as any).actualEndDate || '',
        projectManager: initialProject.projectManager || '',
        supervisor: initialProject.supervisor || '',
        floorCount: String(initialProject.floorCount || ''),
        roomCount: String(initialProject.roomCount || ''),
      };
    }

    return {
      name: '',
      contractor: '',
      contractAmount: '',
      auditAmount: '',
      fundSource: FundSource.Fiscal,
      location: '',
      plannedArea: '',
      plannedStartDate: '',
      plannedEndDate: '',
      actualStartDate: '',
      actualEndDate: '',
      projectManager: '',
      supervisor: '',
      floorCount: '',
      roomCount: '',
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contractAmount) return;

    if (mode === 'edit' && initialProject) {
      const contractAmount = Number(formData.contractAmount);
      const auditAmount = (formData as any).auditAmount ? Number((formData as any).auditAmount) : undefined;
      const auditReductionRate = (auditAmount !== undefined && contractAmount > 0)
        ? Number((((contractAmount - auditAmount) / contractAmount) * 100).toFixed(2))
        : undefined;

      const updatedProject: Project = {
        ...initialProject,
        name: formData.name,
        contractor: formData.contractor || '未指定',
        contractAmount,
        auditAmount,
        auditReductionRate,
        fundSource: formData.fundSource,
        location: formData.location,
        plannedArea: formData.plannedArea ? Number(formData.plannedArea) : undefined,
        floorCount: formData.floorCount ? Number(formData.floorCount) : undefined,
        roomCount: formData.roomCount ? Number(formData.roomCount) : undefined,
        plannedStartDate: formData.plannedStartDate,
        plannedEndDate: formData.plannedEndDate,
        actualStartDate: (formData as any).actualStartDate,
        actualEndDate: (formData as any).actualEndDate,
        projectManager: formData.projectManager,
        supervisor: formData.supervisor,
        completionDate: formData.plannedEndDate || initialProject.completionDate,
        attachments: newAttachments,
        splitItems: newSplitItems,
        roomFunctionPlan: newRoomPlans as any,
      };

      onUpdateProject?.(updatedProject);
      onClose();
      return;
    }

    const contractAmount = Number(formData.contractAmount);
    const auditAmount = (formData as any).auditAmount ? Number((formData as any).auditAmount) : undefined;
    const auditReductionRate = (auditAmount !== undefined && contractAmount > 0)
      ? Number((((contractAmount - auditAmount) / contractAmount) * 100).toFixed(2))
      : undefined;

    const newProject: Project = {
      id: `PRJ-${new Date().getFullYear()}-${String(existingProjectCount + 1).padStart(3, '0')}`,
      name: formData.name,
      contractor: formData.contractor || '未指定',
      contractAmount,
      auditAmount,
      auditReductionRate,
      status: AssetStatus.DisposalPending,
      completionDate: formData.plannedEndDate || new Date().toISOString().split('T')[0],
      hasCadData: false,
      fundSource: formData.fundSource,
      location: formData.location,
      plannedArea: formData.plannedArea ? Number(formData.plannedArea) : undefined,
      floorCount: formData.floorCount ? Number(formData.floorCount) : undefined,
      roomCount: formData.roomCount ? Number(formData.roomCount) : undefined,
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
      attachments: newAttachments,
      splitItems: newSplitItems,
      roomFunctionPlan: newRoomPlans as any,
      isOverdue: false,
      isArchived: false, // 默认未归档
    };

    onAddProject(newProject);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#dee0e3] flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-bold text-[#1f2329]">{mode === 'edit' ? '编辑工程项目' : '录入新基建工程'}</h3>
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
                  <label className="block text-sm font-medium text-[#646a73] mb-1">审计金额 (元)</label>
                  <input
                    type="number"
                    value={(formData as any).auditAmount}
                    onChange={e => updateField('auditAmount', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如: 9500000"
                    min={0}
                  />
                  <div className="text-xs text-[#8f959e] mt-1">
                    审减率：{
                      (() => {
                        const contract = Number((formData as any).contractAmount);
                        const audit = Number((formData as any).auditAmount);
                        if (!contract || !audit) return '-';
                        const rate = ((contract - audit) / contract) * 100;
                        if (!Number.isFinite(rate)) return '-';
                        return `${rate.toFixed(2)}%`;
                      })()
                    }
                  </div>
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
                  <label className="block text-sm font-medium text-[#646a73] mb-1">楼层</label>
                  <input
                    type="number"
                    value={formData.floorCount}
                    onChange={e => updateField('floorCount', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如: 6"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">房间数</label>
                  <input
                    type="number"
                    value={formData.roomCount}
                    onChange={e => updateField('roomCount', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如: 120"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">楼栋名称</label>
                  <input
                    value={buildingName}
                    onChange={e => setBuildingName(e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="例如：理科实验楼A座"
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
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">实际开工日期</label>
                  <input
                    type="date"
                    value={(formData as any).actualStartDate}
                    onChange={e => updateField('actualStartDate', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#646a73] mb-1">实际竣工日期</label>
                  <input
                    type="date"
                    value={(formData as any).actualEndDate}
                    onChange={e => updateField('actualEndDate', e.target.value)}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 房间划分（可选） */}
            <div>
              <h4 className="font-medium text-[#1f2329] mb-4 flex items-center gap-2">
                <Building size={16} /> 房间划分（可选）
              </h4>
              <div className="border border-[#dee0e3] rounded-lg p-4 bg-white space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <select
                    value={roomForm.floor}
                    onChange={e => setRoomForm(prev => ({ ...prev, floor: e.target.value }))}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    disabled={Number(formData.floorCount || 0) <= 0}
                  >
                    <option value="">选择楼层</option>
                    {(() => {
                      const n = Number(formData.floorCount || 0);
                      if (!Number.isFinite(n) || n <= 0) return null;
                      return Array.from({ length: n }, (_, i) => i + 1).map(f => (
                        <option key={f} value={String(f)}>{f}F</option>
                      ));
                    })()}
                  </select>
                  <input
                    value={roomForm.roomNo}
                    onChange={e => setRoomForm(prev => ({ ...prev, roomNo: e.target.value }))}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="房间号"
                  />
                  <input
                    type="number"
                    value={roomForm.area}
                    onChange={e => setRoomForm(prev => ({ ...prev, area: e.target.value }))}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="面积(m²)"
                    min={0}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const floor = (roomForm.floor || '').trim();
                      const roomNo = (roomForm.roomNo || '').trim();
                      const area = Number(roomForm.area);
                      if (!buildingName.trim()) {
                        alert('请先填写楼栋名称');
                        return;
                      }
                      if (!floor) {
                        alert('请选择楼层');
                        return;
                      }
                      if (!roomNo) {
                        alert('请输入房间号');
                        return;
                      }
                      if (!Number.isFinite(area) || area <= 0) {
                        alert('请输入正确的面积');
                        return;
                      }

                      const item = {
                        id: `ROOM-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        buildingName: buildingName.trim(),
                        roomNo: `${floor}-${roomNo}`,
                        area,
                        mainCategory: '',
                        subCategory: '',
                      };
                      setNewRoomPlans(prev => [...prev, item]);
                      setRoomForm(prev => ({ ...prev, roomNo: '', area: '' }));
                    }}
                    className="text-xs px-3 py-2 bg-[#3370ff] text-white rounded flex items-center justify-center gap-1 hover:bg-[#285cc9]"
                  >
                    <Plus size={14} /> 添加房间
                  </button>
                </div>

                {newRoomPlans.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs text-[#646a73] mb-2">已添加房间（{newRoomPlans.length}）</div>
                    <div className="grid gap-2">
                      {newRoomPlans.map(r => (
                        <div key={r.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-[#f9fafb] border border-[#dee0e3]">
                          <div className="min-w-0">
                            <div className="font-medium text-[#1f2329] truncate">{r.buildingName} | {r.roomNo}</div>
                            <div className="text-xs text-[#8f959e]">面积：{r.area} m²</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewRoomPlans(prev => prev.filter(x => x.id !== r.id))}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="移除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-[#8f959e]">
                  说明：楼层下拉框会根据“楼层”数量自动生成；房间将保存到“房间功能划分”中，后续可在详情页继续完善分类。
                </div>
              </div>
            </div>

            {/* 资产划分（资产拆分） */}
            <div>
              <h4 className="font-medium text-[#1f2329] mb-4 flex items-center gap-2">
                <Layers size={16} /> 资产划分（拆分）（可选）
              </h4>
              <div className="border border-[#dee0e3] rounded-lg p-4 bg-white space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                  <select
                    value={splitForm.category as any}
                    onChange={e => setSplitForm(prev => ({ ...prev, category: e.target.value as AssetCategory }))}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none sm:col-span-2"
                  >
                    {Object.values(AssetCategory).map(cat => (
                      <option key={cat} value={cat}>
                        {cat === AssetCategory.Building ? '房屋建筑物' :
                         cat === AssetCategory.Land ? '土地' :
                         cat === AssetCategory.Structure ? '构筑物' :
                         cat === AssetCategory.Equipment ? '设备' :
                         cat === AssetCategory.Greening ? '绿化' :
                         '其他'}
                      </option>
                    ))}
                  </select>
                  <input
                    value={splitForm.name || ''}
                    onChange={e => setSplitForm(prev => ({ ...prev, name: e.target.value }))}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none sm:col-span-2"
                    placeholder="资产名称"
                  />
                  <input
                    type="number"
                    value={splitForm.amount ?? ''}
                    onChange={e => setSplitForm(prev => ({ ...prev, amount: e.target.value === '' ? undefined : Number(e.target.value) }))}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="金额(元)"
                    min={0}
                  />
                  <input
                    type="number"
                    value={splitForm.category === AssetCategory.Equipment ? (splitForm.quantity ?? '') : (splitForm.area ?? '')}
                    onChange={e => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      if (splitForm.category === AssetCategory.Equipment) {
                        setSplitForm(prev => ({ ...prev, quantity: val, area: undefined }));
                      } else {
                        setSplitForm(prev => ({ ...prev, area: val, quantity: undefined }));
                      }
                    }}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder={splitForm.category === AssetCategory.Equipment ? '数量' : '面积(m²)'}
                    min={0}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="number"
                    value={splitForm.depreciationYears ?? ''}
                    onChange={e => setSplitForm(prev => ({ ...prev, depreciationYears: e.target.value === '' ? undefined : Number(e.target.value) }))}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    placeholder="折旧年限"
                    min={0}
                  />
                  <select
                    value={(splitForm.depreciationMethod as any) || 'StraightLine'}
                    onChange={e => setSplitForm(prev => ({ ...prev, depreciationMethod: e.target.value as any }))}
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                  >
                    <option value="StraightLine">年限平均法</option>
                    <option value="Accelerated">加速折旧</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (!splitForm.name || !splitForm.amount) {
                        alert('请填写资产名称与金额');
                        return;
                      }
                      const item: AssetSplitItem = {
                        id: `SPLIT-${Date.now()}`,
                        category: (splitForm.category || AssetCategory.Building) as AssetCategory,
                        name: String(splitForm.name),
                        amount: Number(splitForm.amount),
                        area: splitForm.area !== undefined ? Number(splitForm.area) : undefined,
                        quantity: splitForm.quantity !== undefined ? Number(splitForm.quantity) : undefined,
                        depreciationYears: Number(splitForm.depreciationYears || 50),
                        depreciationMethod: (splitForm.depreciationMethod || 'StraightLine') as any,
                      };
                      setNewSplitItems(prev => [...prev, item]);
                      setSplitForm({
                        category: AssetCategory.Building,
                        depreciationMethod: 'StraightLine',
                        depreciationYears: 50,
                      });
                    }}
                    className="text-xs px-3 py-2 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9]"
                  >
                    <Plus size={14} /> 添加拆分项
                  </button>
                </div>

                {newSplitItems.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs text-[#646a73] mb-2">已添加拆分项（{newSplitItems.length}）</div>
                    <div className="grid gap-2">
                      {newSplitItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-[#f9fafb] border border-[#dee0e3]">
                          <div className="min-w-0">
                            <div className="font-medium text-[#1f2329] truncate">{item.name}</div>
                            <div className="text-xs text-[#8f959e]">
                              类别：{item.category} | 金额：¥{item.amount.toLocaleString()}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewSplitItems(prev => prev.filter(x => x.id !== item.id))}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="移除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-[#8f959e]">
                  说明：此处录入的拆分项会保存到项目的“资产拆分”中，后续可在详情页继续补充。
                </div>
              </div>
            </div>

            {/* 上传附件（模拟） */}
            <div>
              <h4 className="font-medium text-[#1f2329] mb-4 flex items-center gap-2">
                <Paperclip size={16} /> 上传附件（模拟）
              </h4>
              <div className="border border-[#dee0e3] rounded-lg p-4 bg-white space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    id="new-project-upload-type"
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                    defaultValue="other"
                  >
                    <option value="approval">立项批复</option>
                    <option value="bidding">招标文件</option>
                    <option value="contract">施工合同</option>
                    <option value="change">变更签证</option>
                    <option value="drawing">竣工图纸</option>
                    <option value="acceptance">验收报告</option>
                    <option value="audit">审计报告</option>
                    <option value="other">其他</option>
                  </select>
                  <input
                    id="new-project-upload-name"
                    className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none sm:col-span-2"
                    placeholder="请输入附件名称，例如：施工合同.pdf"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const typeEl = document.getElementById('new-project-upload-type') as HTMLSelectElement | null;
                      const nameEl = document.getElementById('new-project-upload-name') as HTMLInputElement | null;
                      const type = (typeEl?.value || 'other') as any;
                      const name = (nameEl?.value || '').trim();
                      if (!name) {
                        alert('请输入附件名称');
                        return;
                      }
                      const newAtt = {
                        id: `ATT-${Date.now()}`,
                        name,
                        type,
                        uploadDate: new Date().toISOString().split('T')[0],
                        uploadedByDept: '二级学院',
                        reviewStatus: 'Pending' as const,
                      };
                      setNewAttachments(prev => [...prev, newAtt]);
                      if (nameEl) nameEl.value = '';
                    }}
                    className="text-xs px-3 py-2 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9]"
                  >
                    <Plus size={14} /> 上传（模拟）
                  </button>
                </div>

                {newAttachments.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs text-[#646a73] mb-2">已添加附件（{newAttachments.length}）</div>
                    <div className="grid gap-2">
                      {newAttachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-[#f9fafb] border border-[#dee0e3]">
                          <div className="min-w-0">
                            <div className="font-medium text-[#1f2329] truncate">{att.name}</div>
                            <div className="text-xs text-[#8f959e]">类型：{att.type} | 状态：待审核</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewAttachments(prev => prev.filter(x => x.id !== att.id))}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="移除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-[#8f959e]">
                  说明：此处为模拟上传。创建项目后，可在“表单信息”中对附件进行审核/驳回/批量通过。
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
  activeTab: 'form' | 'split' | 'gaojibiao' | 'rooms' | 'audit';
  onTabChange: (tab: 'form' | 'split' | 'gaojibiao' | 'rooms' | 'audit') => void;
  onClose: () => void;
  onUpdate: (project: Project) => void;
  onEditProject: (project: Project) => void;
  userRole: UserRole;
  auditLogs: AuditLog[];
  onDelete: () => void;
  onArchive: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  activeTab,
  onTabChange,
  onClose,
  onUpdate,
  onEditProject,
  userRole,
  auditLogs,
  onDelete,
  onArchive,
}) => {
  const [asInfrastructureDept, setAsInfrastructureDept] = useState(false);
  const [uploadAsCollege, setUploadAsCollege] = useState(false);
  const effectiveUploaderRole = uploadAsCollege ? UserRole.CollegeAdmin : userRole;
  // 获取当前项目的审计日志
  const projectLogs = useMemo(() => {
    return auditLogs.filter(log =>
      log.entityType === 'project' && log.entityId === project.id
    ).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [auditLogs, project.id]);

  const tabs = [
    { id: 'form', label: '表单信息', icon: <FileText size={14} /> },
    { id: 'split', label: '资产拆分', icon: <Layers size={14} /> },
    ...(project.status === AssetStatus.DisposalPending
      ? ([] as const)
      : ([
          { id: 'gaojibiao', label: '高基表映射', icon: <FileCheck size={14} /> },
          { id: 'rooms', label: '房间功能划分', icon: <Building size={14} /> },
        ] as const)),
    { id: 'audit', label: '操作记录', icon: <List size={14} /> },
  ] as const;


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

    // 记录资产拆分更新日志
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
  const isReadOnly = project.isArchived || project.status === AssetStatus.Archived;
  const canEditAfterArchived = userRole === UserRole.AssetAdmin && !asInfrastructureDept;

  const handleSaveGaojibiao = () => {
    if (isReadOnly) return;
    onUpdate({
      ...project,
      gaojibiaoData: gaojibiaoForm,
    });
  };

  const currentStageReq = useMemo(() => getStageAttachmentRequirements(project.status), [project.status]);
  const currentStageStat = useMemo(() => computeAttachmentCompletion(project.status, project.attachments || []), [project.status, project.attachments]);
  const pendingReviewCount = useMemo(() => (project.attachments || []).filter(a => (a.reviewStatus || 'Pending') === 'Pending').length, [project.attachments]);


  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-[#dee0e3] flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#1f2329]">{project.name}</h3>
            <p className="text-sm text-[#646a73] mt-1">{project.id} | {project.contractor}</p>
            <div className="mt-2 flex flex-wrap gap-3 items-center">
              <label className="flex items-center gap-2 text-xs text-[#646a73] select-none">
                <input
                  type="checkbox"
                  checked={asInfrastructureDept}
                  onChange={e => setAsInfrastructureDept(e.target.checked)}
                />
                以基建处身份
              </label>
            </div>
            <div className="mt-2 text-xs text-[#646a73] flex flex-wrap gap-2 items-center">
              <span className="px-2 py-0.5 rounded bg-[#f2f3f5]">
                当前阶段：{getAssetStatusLabel(project.status)}
              </span>
              <span className={`px-2 py-0.5 rounded ${currentStageStat.missingRequired > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                必备附件：{currentStageStat.requiredApproved}/{currentStageStat.requiredTotal}
              </span>
              {project.status !== AssetStatus.DisposalPending && !asInfrastructureDept && pendingReviewCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                  待审核：{pendingReviewCount}
                </span>
              )}
            </div>
            {project.isArchived && (
              <p className="text-xs mt-1 text-purple-600 flex items-center gap-1">
                <Archive size={12} /> 已归档（不可修改）
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-[#646a73] hover:text-[#1f2329]"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#dee0e3] px-6 flex gap-1 flex-shrink-0">
          {tabs.map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#3370ff] text-[#3370ff]'
                  : 'border-transparent text-[#646a73] hover:text-[#1f2329]'
              }`}
              disabled={false}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 表单信息 */}
          {activeTab === 'form' && (
            <div className="space-y-6">
              {/* 附件完成度看板 */}
              <div>
                <h4 className="font-medium text-[#1f2329] mb-3 flex items-center gap-2">
                  <FileCheck size={16} /> {currentStageReq.stageLabel} - 附件清单
                </h4>
                <div className="space-y-2">
                  {currentStageReq.requiredAttachments.map(req => {
                    const found = (project.attachments || []).filter(a => a.type === req.type);
                    const status: 'Approved' | 'Pending' | 'Rejected' | 'Missing' = found.length > 0
                      ? (found.some(f => f.reviewStatus === 'Approved') ? 'Approved' :
                        found.some(f => f.reviewStatus === 'Rejected') ? 'Rejected' : 'Pending')
                      : 'Missing';

                    return (
                      <div key={req.type} className="flex items-center justify-between text-sm p-2 rounded-md bg-gray-50 hover:bg-gray-100">
                        <div className="flex items-center gap-2">
                          {status === 'Approved' && <CheckCircle size={16} className="text-green-500" />}
                          {status === 'Pending' && <Clock size={16} className="text-amber-500" />}
                          {status === 'Rejected' && <XCircle size={16} className="text-red-500" />}
                          {status === 'Missing' && <AlertCircle size={16} className="text-gray-400" />}
                          <div>
                            <span className={!req.required ? 'text-gray-500' : ''}>{req.label}</span>
                            {!req.required && <span className="text-xs text-gray-400"> (选填)</span>}
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          status === 'Approved' ? 'bg-green-100 text-green-700' :
                          status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {status === 'Approved' ? '已通过' : status === 'Pending' ? '待审核' : status === 'Rejected' ? '已驳回' : '缺失'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                {/* 基本信息（与“新建工程项目”保持一致） */}
                <div>
                  <h4 className="font-medium text-[#1f2329] mb-3 flex items-center gap-2">
                    <FileText size={16} /> 基本信息
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <InfoItem label="工程名称" value={project.name} />
                    <InfoItem label="承建单位" value={project.contractor || '-'} />
                    <InfoItem label="监理单位" value={project.supervisor || '-'} />
                    <InfoItem label="合同金额" value={`¥${project.contractAmount.toLocaleString()}`} />
                    <InfoItem label="审计金额" value={project.auditAmount ? `¥${project.auditAmount.toLocaleString()}` : '-'} />
                    <InfoItem label="审减率" value={project.auditReductionRate !== undefined ? `${project.auditReductionRate}%` : '-'} />
                    <InfoItem label="资金来源" value={project.fundSource === FundSource.Fiscal ? '财政拨款' : project.fundSource === FundSource.SelfRaised ? '自筹资金' : '混合来源'} />
                  </div>
                </div>

                {/* 建设信息 */}
                <div>
                  <h4 className="font-medium text-[#1f2329] mb-3 flex items-center gap-2">
                    <MapPin size={16} /> 建设信息
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <InfoItem label="建设地点" value={project.location || '-'} />
                    <InfoItem label="规划建筑面积" value={project.plannedArea ? `${project.plannedArea} m²` : '-'} />
                    <InfoItem label="楼层" value={project.floorCount ?? '-'} />
                    <InfoItem label="房间数" value={project.roomCount ?? '-'} />
                    <InfoItem
                      label="楼栋名称"
                      value={project.roomFunctionPlan && project.roomFunctionPlan.length > 0 ? (project.roomFunctionPlan[0].buildingName || '-') : '-'}
                    />
                    <InfoItem label="项目负责人" value={project.projectManager || '-'} />
                  </div>

                  {/* 房间划分概览（与新建弹窗一致的数据源：roomFunctionPlan） */}
                  <div className="mt-4 border border-[#dee0e3] rounded-lg p-4 bg-white">
                    <div className="text-sm font-medium text-[#1f2329] mb-2">房间划分</div>
                    {project.roomFunctionPlan && project.roomFunctionPlan.length > 0 ? (
                      <div className="overflow-hidden border border-[#dee0e3] rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-[#f5f6f7] text-[#646a73]">
                            <tr>
                              <th className="px-4 py-2 text-left">楼栋</th>
                              <th className="px-4 py-2 text-left">房间号</th>
                              <th className="px-4 py-2 text-right">面积(㎡)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#dee0e3]">
                            {project.roomFunctionPlan.slice(0, 8).map(r => (
                              <tr key={r.id} className="hover:bg-[#f9fafb]">
                                <td className="px-4 py-2">{r.buildingName}</td>
                                <td className="px-4 py-2 font-medium">{r.roomNo}</td>
                                <td className="px-4 py-2 text-right">{r.area || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-[#8f959e]">暂无房间划分数据</div>
                    )}
                    {project.roomFunctionPlan && project.roomFunctionPlan.length > 8 && (
                      <div className="text-xs text-[#8f959e] mt-2">仅展示前 8 条，更多请到“房间功能划分”查看。</div>
                    )}
                  </div>
                </div>

                {/* 工期信息 */}
                <div>
                  <h4 className="font-medium text-[#1f2329] mb-3 flex items-center gap-2">
                    <Calendar size={16} /> 工期信息
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <InfoItem label="计划开工日期" value={project.plannedStartDate || '-'} />
                    <InfoItem label="计划竣工日期" value={project.plannedEndDate || '-'} />
                    <InfoItem label="实际开工日期" value={project.actualStartDate || '-'} />
                    <InfoItem label="实际竣工日期" value={project.actualEndDate || '-'} />
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <ProjectActions
                project={project}
                onEdit={() => {
                  if (project.isArchived) return;
                  onEditProject(project);
                }}
                onDelete={onDelete}
                onArchive={onArchive}
                userRole={userRole}
                asInfrastructureDept={asInfrastructureDept}
              />
            </div>
          )}

          {/* 进度节点 */}

          {/* 附件管理 */}
          {activeTab === 'form' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {!asInfrastructureDept && (
                  <div className="text-sm text-[#646a73]">
                    待审核附件：
                    <span className="font-medium text-red-600">{
                      (project.attachments || []).filter(a => (a.reviewStatus || 'Pending') === 'Pending').length
                    }</span>
                  </div>
                )}
                <div className="flex gap-2">
                  {asInfrastructureDept && !isReadOnly && (
                    <>
                      <select
                        id="infra-upload-type"
                        className="border border-[#dee0e3] rounded-md px-2 py-1 text-xs focus:border-[#3370ff] outline-none"
                        defaultValue={currentStageReq.requiredAttachments[0]?.type || 'other'}
                      >
                        {currentStageReq.requiredAttachments.map(req => (
                          <option key={req.type} value={req.type}>{req.label}</option>
                        ))}
                        <option value="other">其他</option>
                      </select>
                      <input
                        id="infra-upload-name"
                        className="border border-[#dee0e3] rounded-md px-2 py-1 text-xs focus:border-[#3370ff] outline-none"
                        placeholder="附件名称"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const typeEl = document.getElementById('infra-upload-type') as HTMLSelectElement | null;
                          const nameEl = document.getElementById('infra-upload-name') as HTMLInputElement | null;
                          const type = (typeEl?.value || 'other') as any;
                          const name = (nameEl?.value || '').trim();
                          if (!name) {
                            alert('请输入附件名称');
                            return;
                          }
                          const newAtt = {
                            id: `ATT-${Date.now()}`,
                            name,
                            type,
                            uploadDate: new Date().toISOString().split('T')[0],
                            uploadedByDept: '基建处',
                            reviewStatus: 'Pending' as const,
                          };
                          onUpdate({
                            ...project,
                            attachments: [...(project.attachments || []), newAtt],
                          });
                          if (nameEl) nameEl.value = '';
                        }}
                        className="text-xs px-3 py-2 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9]"
                      >
                        <Plus size={14} /> 上传（模拟）
                      </button>
                    </>
                  )}

                  {userRole === UserRole.AssetAdmin && !asInfrastructureDept && (
                    <label className="flex items-center gap-2 text-xs text-[#646a73] select-none">
                      <input
                        type="checkbox"
                        checked={uploadAsCollege}
                        onChange={e => setUploadAsCollege(e.target.checked)}
                      />
                      演示：以二级学院身份上传
                    </label>
                  )}
                  {project.status !== AssetStatus.DisposalPending && !asInfrastructureDept && userRole === UserRole.AssetAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const next = {
                            ...project,
                            attachments: (project.attachments || []).map(a => a.reviewStatus ? a : { ...a, reviewStatus: 'Pending' as const }),
                          };
                          onUpdate(next);
                        }}
                        disabled={isReadOnly && !canEditAfterArchived}
                        className="text-xs px-3 py-2 border border-[#dee0e3] rounded flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <RefreshCw size={14} /> 初始化待审核
                      </button>
                      <button
                        onClick={() => {
                          const pending = (project.attachments || []).filter(
                            a => (a.reviewStatus || 'Pending') === 'Pending'
                          );
                          if (pending.length === 0) {
                            alert('暂无待审核附件');
                            return;
                          }
                          const ids = pending.map(p => p.id);
                          const updated = {
                            ...project,
                            attachments: (project.attachments || []).map(a =>
                              ids.includes(a.id)
                                ? {
                                    ...a,
                                    reviewStatus: 'Approved' as const,
                                    reviewedBy: '资产管理员',
                                    reviewedAt: new Date().toISOString(),
                                    reviewNote: a.reviewNote || '批量通过',
                                  }
                                : a
                            ),
                          };
                          onUpdate(updated);
                        }}
                        disabled={userRole !== UserRole.AssetAdmin || isReadOnly}
                        className="text-xs px-3 py-2 bg-green-500 text-white rounded flex items-center gap-1 hover:bg-green-600 disabled:opacity-50"
                      >
                        <Check size={14} /> 批量通过
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 上传附件（仅二级学院可用；资产管理员可勾选“演示：以二级学院身份上传”） */}
              {!asInfrastructureDept && (effectiveUploaderRole === UserRole.CollegeAdmin) && !isReadOnly && (
                <div className="border border-[#dee0e3] rounded-lg p-4 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm font-medium text-[#1f2329]">上传附件</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <select
                      id="asset-upload-type"
                      className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                      defaultValue={currentStageReq.requiredAttachments[0]?.type || 'other'}
                    >
                      {currentStageReq.requiredAttachments.map(req => (
                        <option key={req.type} value={req.type}>{req.label}</option>
                      ))}
                      <option value="other">其他</option>
                    </select>
                    <input
                      id="asset-upload-name"
                      className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none sm:col-span-2"
                      placeholder="请输入附件名称，例如：竣工验收报告.pdf"
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        const typeEl = document.getElementById('asset-upload-type') as HTMLSelectElement | null;
                        const nameEl = document.getElementById('asset-upload-name') as HTMLInputElement | null;
                        const type = (typeEl?.value || 'other') as any;
                        const name = (nameEl?.value || '').trim();
                        if (!name) {
                          alert('请输入附件名称');
                          return;
                        }
                        const dept = effectiveUploaderRole === UserRole.CollegeAdmin ? '二级学院' : '资产处';
                        const newAtt = {
                          id: `ATT-${Date.now()}`,
                          name,
                          type,
                          uploadDate: new Date().toISOString().split('T')[0],
                          uploadedByDept: dept,
                          reviewStatus: 'Pending' as const,
                        };
                        const updated = {
                          ...project,
                          attachments: [...(project.attachments || []), newAtt],
                        };
                        onUpdate(updated);
                        if (nameEl) nameEl.value = '';
                      }}
                      className="text-xs px-3 py-2 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9]"
                    >
                      <Plus size={14} /> 上传（模拟）
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                {project.attachments?.map(att => {
                  const status = att.reviewStatus || 'Pending';
                  const borderCls = status === 'Rejected'
                    ? 'border-red-300 bg-red-50'
                    : status === 'Approved'
                      ? 'border-green-200 bg-green-50'
                      : 'border-[#dee0e3] bg-[#f9fafb]';

                  return (
                    <div key={att.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border ${borderCls}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${
                          status === 'Rejected' ? 'bg-red-100 text-red-600' :
                          status === 'Approved' ? 'bg-green-100 text-green-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          <Paperclip size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-[#1f2329] flex items-center gap-2">
                            <span>{att.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              status === 'Approved' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {status === 'Pending' ? '待审核' : status === 'Approved' ? '已通过' : '已驳回'}
                            </span>
                          </div>
                          <div className="text-xs text-[#8f959e] mt-0.5">
                            {getAttachmentTypeLabel(att.type)} | {att.uploadDate}
                            {att.uploadedByDept ? ` | 上传部门：${att.uploadedByDept}` : ''}
                          </div>
                          {(att.reviewedAt || att.reviewNote) && (
                            <div className="text-xs mt-1">
                              <span className="text-[#8f959e]">审核：</span>
                              <span className="text-[#646a73]">
                                {att.reviewedBy || '-'}
                                {att.reviewedAt ? ` | ${new Date(att.reviewedAt).toLocaleString()}` : ''}
                                {att.reviewNote ? ` | ${att.reviewNote}` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        <button className="text-[#3370ff] hover:text-[#285cc9]" title="下载">
                          <Download size={18} />
                        </button>

                        {asInfrastructureDept && !isReadOnly && [AssetStatus.DisposalPending, AssetStatus.PendingReview].includes(project.status) && ['Pending', 'Rejected'].includes(status) && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdate({
                                  ...project,
                                  attachments: (project.attachments || []).map(a =>
                                    a.id === att.id
                                      ? {
                                          ...a,
                                          reviewStatus: 'Pending' as const,
                                          reviewedBy: undefined,
                                          reviewedAt: undefined,
                                        }
                                      : a
                                  ),
                                });
                              }}
                              className="text-xs px-3 py-1.5 border border-[#dee0e3] text-[#1f2329] rounded hover:bg-gray-50 flex items-center gap-1"
                            >
                              <RefreshCw size={14} /> 重新上传
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const nextName = prompt('请输入新的附件名称', att.name);
                                if (nextName === null) return;
                                const name = nextName.trim();
                                if (!name) {
                                  alert('附件名称不能为空');
                                  return;
                                }
                                const nextType = prompt('请输入新的附件类型（例如：contract / acceptance / audit / other）', att.type);
                                if (nextType === null) return;
                                const next = (nextType.trim() || att.type) as any;
                                const type = (['approval','bidding','contract','change','drawing','acceptance','audit','other'].includes(next)
                                  ? next
                                  : att.type) as any;
                                onUpdate({
                                  ...project,
                                  attachments: (project.attachments || []).map(a =>
                                    a.id === att.id
                                      ? {
                                          ...a,
                                          name,
                                          type,
                                          reviewStatus: 'Pending' as const,
                                          reviewedBy: undefined,
                                          reviewedAt: undefined,
                                        }
                                      : a
                                  ),
                                });
                              }}
                              className="text-xs px-3 py-1.5 border border-[#dee0e3] text-[#1f2329] rounded hover:bg-gray-50 flex items-center gap-1"
                            >
                              <Edit size={14} /> 编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!confirm('确定要删除该附件吗？')) return;
                                onUpdate({
                                  ...project,
                                  attachments: (project.attachments || []).filter(a => a.id !== att.id),
                                });
                              }}
                              className="text-xs px-3 py-1.5 border border-red-500 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                            >
                              <Trash2 size={14} /> 删除
                            </button>
                          </>
                        )}

                        {!asInfrastructureDept && userRole === UserRole.AssetAdmin && !isReadOnly && project.status !== AssetStatus.DisposalPending && (
                          <>
                            <button
                              onClick={() => {
                                const updated = {
                                  ...project,
                                  attachments: (project.attachments || []).map(a => a.id === att.id ? {
                                    ...a,
                                    reviewStatus: 'Approved' as const,
                                    reviewedBy: '资产管理员',
                                    reviewedAt: new Date().toISOString(),
                                    reviewNote: a.reviewNote || '审核通过',
                                  } : a),
                                };
                                onUpdate(updated);
                              }}
                              className="text-xs px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                            >
                              <Check size={14} /> 审核通过
                            </button>
                            <button
                              onClick={() => {
                                const note = prompt('请输入驳回原因（将标记“已驳回”并标红显示）', att.reviewNote || '');
                                if (note === null) return;
                                const updated = {
                                  ...project,
                                  attachments: (project.attachments || []).map(a => a.id === att.id ? {
                                    ...a,
                                    reviewStatus: 'Rejected' as const,
                                    reviewedBy: '资产管理员',
                                    reviewedAt: new Date().toISOString(),
                                    reviewNote: note || '驳回',
                                  } : a),
                                };
                                onUpdate(updated);
                              }}
                              className="text-xs px-3 py-1.5 border border-red-500 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                            >
                              <XCircle size={14} /> 审核驳回
                            </button>
                          </>
                        )}


                      </div>
                    </div>
                  );
                })}

                {(!project.attachments || project.attachments.length === 0) && (
                  <div className="text-center text-[#8f959e] py-8">暂无附件</div>
                )}
              </div>

              <div className="text-xs text-[#8f959e]">
                说明：附件由相关部门上传，资产管理员负责审核。驳回后附件仍保留，但会标记为“已驳回”并标红。
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
              {asInfrastructureDept && !isReadOnly && (
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
                      disabled={!newSplitItem.name || !newSplitItem.amount || project.isArchived}
                      className="px-3 py-1.5 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] flex items-center gap-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} /> 添加拆分项
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 高基表映射 */}
              {activeTab === 'gaojibiao' && (
                <div className="space-y-6">
                  <div className="bg-[#f9fafb] border border-[#dee0e3] rounded-lg p-4">
                    <h4 className="font-medium text-[#1f2329] mb-4">高基表字段映射</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs text-[#646a73] mb-1">资产编号</label>
                        <input
                          value={gaojibiaoForm.assetCode || ''}
                          onChange={e => setGaojibiaoForm(prev => ({ ...prev, assetCode: e.target.value }))}
                          className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                          placeholder="高基表资产编号"
                          disabled={isReadOnly && !canEditAfterArchived}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#646a73] mb-1">资产名称</label>
                        <input
                          value={gaojibiaoForm.assetName || ''}
                          onChange={e => setGaojibiaoForm(prev => ({ ...prev, assetName: e.target.value }))}
                          className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                          placeholder="高基表资产名称"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#646a73] mb-1">使用部门</label>
                        <input
                          value={gaojibiaoForm.department || ''}
                          onChange={e => setGaojibiaoForm(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                          placeholder="资产使用部门"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#646a73] mb-1">使用年限</label>
                        <input
                          type="number"
                          value={gaojibiaoForm.serviceLife || ''}
                          onChange={e => setGaojibiaoForm(prev => ({ ...prev, serviceLife: Number(e.target.value) }))}
                          className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                          placeholder="资产使用年限"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#646a73] mb-1">原值</label>
                        <input
                          type="number"
                          value={gaojibiaoForm.originalValue || ''}
                          onChange={e => setGaojibiaoForm(prev => ({ ...prev, originalValue: Number(e.target.value) }))}
                          className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                          placeholder="资产原值"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#646a73] mb-1">残值率</label>
                        <input
                          type="number"
                          step={0.01}
                          value={gaojibiaoForm.residualRate || ''}
                          onChange={e => setGaojibiaoForm(prev => ({ ...prev, residualRate: Number(e.target.value) }))}
                          className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
                          placeholder="0.05"
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                    
                    {userRole === UserRole.AssetAdmin && (!project.isArchived || (project.status === AssetStatus.Archived && !asInfrastructureDept)) && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={handleSaveGaojibiao}
                          className="px-3 py-1.5 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> 保存映射信息
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-[#8f959e] mt-4">
                    <AlertCircle size={14} className="inline mr-1" />
                    高基表映射信息将用于资产年报上报，请确保信息准确无误
                  </div>
                </div>
              )}

          {/* 房间功能划分 */}
          {activeTab === 'rooms' && (
            <RoomFunctionPlanTab
              projectName={project.name}
              plan={project.roomFunctionPlan || []}
              onChange={(next) => onUpdate({ ...project, roomFunctionPlan: next })}
              confirmed={Boolean(project.roomFunctionPlanConfirmed)}
              confirmedAt={project.roomFunctionPlanConfirmedAt}
              confirmedBy={project.roomFunctionPlanConfirmedBy}
              onConfirm={() => {
                onUpdate({
                  ...project,
                  roomFunctionPlanConfirmed: true,
                  roomFunctionPlanConfirmedAt: new Date().toISOString(),
                  roomFunctionPlanConfirmedBy: '资产管理员',
                });
              }}
              disabled={isReadOnly}
              userRole={userRole}
            />
          )}

          {/* 操作记录 */}
          {activeTab === 'audit' && (
            <AuditLogTab logs={projectLogs} />
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#f9fafb] border-t border-[#dee0e3] flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-[#f2f3f5]"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

  );
};

export default AssetTransfer;