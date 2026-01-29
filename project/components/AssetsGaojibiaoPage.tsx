import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, Search, X } from 'lucide-react';
import { useAssetData } from '../hooks/useAssetData';
import { AssetStatus, Project, UserRole, GaojibiaoMapping } from '../types';

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm text-[#646a73]">{label}</p>
    <p className="font-medium text-[#1f2329]">{value}</p>
  </div>
);

const AssetsGaojibiaoPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
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

  const [gaojibiaoForm, setGaojibiaoForm] = useState<GaojibiaoMapping>({});

  React.useEffect(() => {
    if (selectedProject) {
      setGaojibiaoForm((selectedProject as any).gaojibiaoData || {});
    }
  }, [selectedProject]);

  const handleSaveGaojibiao = () => {
    if (!selectedProject) return;

    const updatedProject = { ...(selectedProject as any), gaojibiaoData: gaojibiaoForm } as Project;

    setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? updatedProject : p)));

    logAudit('update', 'project', selectedProject.id, selectedProject.name, userRole, {
      gaojibiaoData: { old: '...', new: 'updated' },
    });

    alert('高基表映射数据已保存！');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329]">高基表映射</h2>
        <p className="text-[#646a73]">对“待归档”的项目进行高基表字段映射，确保数据准确上报。</p>
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
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-[#646a73]">{p.id}</td>
                <td className="px-4 py-3 font-medium text-[#1f2329]">{p.name}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-[#3370ff] hover:underline text-xs flex items-center gap-1"
                    onClick={() => setSelectedProject(p)}
                  >
                    <FileSpreadsheet size={14} /> 映射
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#8f959e]" colSpan={3}>
                  暂无“待归档”的项目需要进行高基表映射。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <div className="bg-white rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#dee0e3] flex justify-between items-start flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-[#1f2329]">高基表映射：{selectedProject.name}</h3>
                <p className="text-sm text-[#646a73] mt-1">{selectedProject.id}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-[#646a73] hover:text-[#1f2329]"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <InfoItem label="511-学校产权校舍建筑面积" value={`${gaojibiaoForm.area || '-'}`} />
                <InfoItem label="512-固定资产总额" value={`¥${gaojibiaoForm.totalValue || '-'}`} />
                <InfoItem label="513-教学科研仪器设备值" value={`¥${gaojibiaoForm.equipmentValue || '-'}`} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">校舍建筑面积 (m²)</label>
                  <input type="number" value={gaojibiaoForm.area || ''} onChange={e => setGaojibiaoForm(p => ({ ...p, area: Number(e.target.value) }))} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">固定资产总额 (元)</label>
                  <input type="number" value={gaojibiaoForm.totalValue || ''} onChange={e => setGaojibiaoForm(p => ({ ...p, totalValue: Number(e.target.value) }))} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">仪器设备值 (元)</label>
                  <input type="number" value={gaojibiaoForm.equipmentValue || ''} onChange={e => setGaojibiaoForm(p => ({ ...p, equipmentValue: Number(e.target.value) }))} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSaveGaojibiao} className="px-4 py-2 bg-[#3370ff] text-white rounded text-sm hover:bg-[#285cc9]">
                  保存映射
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsGaojibiaoPage;

