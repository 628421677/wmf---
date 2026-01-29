import React, { useMemo, useState } from 'react';
import { Layers, Search, X } from 'lucide-react';
import { useAssetData } from '../hooks/useAssetData';
import { AssetStatus, Project, UserRole } from '../types';
import RoomFunctionPlanTab from './RoomFunctionPlanTab'; // Re-using the existing component

const AssetsRoomFunctionsPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const { projects, setProjects, logAudit } = useAssetData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return projects
      .filter((p) => p.status === AssetStatus.PendingArchive) // Only show PendingArchive
      .filter((p) => {
        if (!q) return true;
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      });
  }, [projects, searchTerm]);

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    logAudit('update', 'project', updatedProject.id, updatedProject.name, userRole, {
      roomFunctionPlan: { old: '...', new: 'updated' },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329]">房间功能划分</h2>
        <p className="text-[#646a73]">对“待归档”的项目进行房间功能划分，为高基表映射做准备。</p>
      </div>

      <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索项目名称/编号..."
            className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm"
          />
        </div>
        <div className="text-sm text-[#646a73]">共 {filtered.length} 项待处理</div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[#646a73]">
            <tr>
              <th className="px-4 py-3 text-left">项目编号</th>
              <th className="px-4 py-3 text-left">项目名称</th>
              <th className="px-4 py-3 text-left">房间数</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-[#646a73]">{p.id}</td>
                <td className="px-4 py-3 font-medium text-[#1f2329]">{p.name}</td>
                <td className="px-4 py-3 text-[#646a73]">{p.roomCount || '-'}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-[#3370ff] hover:underline text-xs flex items-center gap-1"
                    onClick={() => setSelectedProject(p)}
                  >
                    <Layers size={14} /> 功能划分
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#8f959e]" colSpan={4}>
                  暂无“待归档”的项目需要进行房间功能划分。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <div className="bg-white rounded-lg w-full max-w-6xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#dee0e3] flex justify-between items-start flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-[#1f2329]">房间功能划分：{selectedProject.name}</h3>
                <p className="text-sm text-[#646a73] mt-1">{selectedProject.id}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-[#646a73] hover:text-[#1f2329]"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <RoomFunctionPlanTab project={selectedProject} onUpdate={handleUpdateProject} userRole={userRole} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsRoomFunctionsPage;

