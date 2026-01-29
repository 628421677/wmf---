import React, { useMemo, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { useAssetData } from '../hooks/useAssetData';
import { AssetStatus, Project, UserRole } from '../types';
import { getAssetStatusLabel, getAssetStatusColor } from '../utils/assetStatus';

const AssetsApplyPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const { projects } = useAssetData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return projects
      .filter((p) => p.status === AssetStatus.DisposalPending)
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.contractor.toLowerCase().includes(q)
        );
      });
  }, [projects, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329]">转固申请</h2>
        <p className="text-[#646a73]">默认仅展示“可发起申请/待申请（待处置）”项目。可查看全流程状态，但本界面不提供审核操作。</p>
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
        <div className="text-sm text-[#646a73]">共 {filtered.length} 项</div>
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
                    <Eye size={14} /> 查看流程
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#8f959e]" colSpan={5}>
                  暂无符合条件的项目（待处置）。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedProject(null)}>
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1f2329]">{selectedProject.name}</h3>
                <p className="text-xs text-[#646a73]">项目编号：{selectedProject.id}</p>
              </div>
              <button className="text-[#646a73]" onClick={() => setSelectedProject(null)}>
                关闭
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[AssetStatus.DisposalPending, AssetStatus.PendingReview, AssetStatus.PendingArchive, AssetStatus.Archived].map((st) => (
                  <div key={st} className="border rounded-lg p-3">
                    <p className="text-xs text-[#646a73]">{getAssetStatusLabel(st)}</p>
                    <p className={`text-sm font-bold mt-1 ${st === selectedProject.status ? 'text-[#3370ff]' : 'text-[#1f2329]'}`}>
                      {st === selectedProject.status ? '当前' : '—'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-sm text-[#646a73]">
                本页面仅用于“转固申请”环节的项目查看与发起（后续会把“发起转固申请”的操作从 AssetTransfer 中拆出到此页）。审核动作请进入“转固审核”。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsApplyPage;


