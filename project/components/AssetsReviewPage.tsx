import React, { useMemo, useState } from 'react';
import { Eye, Search, Check, X, ShieldCheck } from 'lucide-react';
import { useAssetData } from '../hooks/useAssetData';
import { AssetStatus, Project, UserRole } from '../types';
import { getAssetStatusLabel, getAssetStatusColor } from '../utils/assetStatus';

const AssetsReviewPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const { projects, setProjects, logAudit } = useAssetData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return projects
      .filter((p) => p.status === AssetStatus.PendingReview)
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.contractor.toLowerCase().includes(q)
        );
      });
  }, [projects, searchTerm]);

  const handleReview = (project: Project, isApproved: boolean) => {
    const nextStatus = isApproved ? AssetStatus.PendingArchive : AssetStatus.DisposalPending; // Rejected goes back to pending
    
    logAudit(
      isApproved ? 'approve' : 'reject',
      'project',
      project.id,
      project.name,
      userRole,
      {
        status: { old: project.status, new: nextStatus },
        reviewComment: { old: '', new: isApproved ? '审核通过' : '审核驳回，请补充材料' }
      }
    );

    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: nextStatus } : p));
    setSelectedProject(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329]">转固审核</h2>
        <p className="text-[#646a73]">默认仅展示“待审核”项目。请核验资料并执行审核操作。</p>
      </div>

      <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索项目名称/编号/承建单位..."
            className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm"
          />
        </div>
        <div className="text-sm text-[#646a73]">共 {filtered.length} 项待审核</div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[#646a73]">
            <tr>
              <th className="px-4 py-3 text-left">项目编号</th>
              <th className="px-4 py-3 text-left">项目名称</th>
              <th className="px-4 py-3 text-left">承建单位</th>
              <th className="px-4 py-3 text-left">当前状态</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-[#646a73]">{p.id}</td>
                <td className="px-4 py-3 font-medium text-[#1f2329]">{p.name}</td>
                <td className="px-4 py-3 text-[#646a73]">{p.contractor}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getAssetStatusColor(p.status)}`}>{getAssetStatusLabel(p.status)}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="text-[#3370ff] hover:underline text-xs flex items-center gap-1"
                    onClick={() => setSelectedProject(p)}
                  >
                    <ShieldCheck size={14} /> 审核
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#8f959e]" colSpan={5}>
                  暂无待审核的项目。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedProject(null)}>
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1f2329]">审核：{selectedProject.name}</h3>
                <p className="text-xs text-[#646a73]">项目编号：{selectedProject.id}</p>
              </div>
              <button className="text-[#646a73]" onClick={() => setSelectedProject(null)}>
                关闭
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-[#646a73]">请确认附件材料是否齐全、合规，并给出审核意见。</p>
              <textarea className="w-full border rounded p-2 text-sm" placeholder="审核意见（可选）..." rows={3}></textarea>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => handleReview(selectedProject, false)}
                  className="px-4 py-2 border rounded text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <X size={16} /> 驳回
                </button>
                <button 
                  onClick={() => handleReview(selectedProject, true)}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-2"
                >
                  <Check size={16} /> 通过
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsReviewPage;

