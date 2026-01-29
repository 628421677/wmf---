import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Search, X } from 'lucide-react';
import { useAssetData } from '../hooks/useAssetData';
import { AssetStatus, GaojibiaoMapping, Project, UserRole } from '../types';

const AssetsGaojibiaoPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const { projects, setProjects, logAudit } = useAssetData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [asInfrastructureDept, setAsInfrastructureDept] = useState(false);
  
  // 计算是否只读
  const isReadOnly = useMemo(() => 
    selectedProject && (selectedProject.isArchived || selectedProject.status === AssetStatus.Archived)
  , [selectedProject]);
  
  // 计算是否允许在归档后编辑
  const canEditAfterArchived = useMemo(() => 
    userRole === UserRole.AssetAdmin && !asInfrastructureDept
  , [userRole, asInfrastructureDept]);
  
  // 是否可以编辑
  const isEditable = useMemo(() => 
    !isReadOnly || (isReadOnly && canEditAfterArchived)
  , [isReadOnly, canEditAfterArchived]);

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
    if (isReadOnly && !canEditAfterArchived) return;

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
                    <CheckCircle size={14} /> 映射
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
              <div className="bg-[#f9fafb] border border-[#dee0e3] rounded-lg p-4">
                <h4 className="font-medium text-[#1f2329] mb-4">高基表字段映射</h4>
                                {!isEditable && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800 rounded-r-lg mb-4">
                    <p><span className="font-bold">只读模式</span>：此项目已归档，您只能查看信息。如需修改，请联系资产管理员。</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-[#646a73] mb-1">资产编号</label>
                    <input
                      value={gaojibiaoForm.assetCode || ''}
                      onChange={(e) => isEditable && setGaojibiaoForm((prev) => ({ ...prev, assetCode: e.target.value }))}
                      className={`w-full border ${isEditable ? 'border-[#dee0e3]' : 'border-gray-200 bg-gray-50'} rounded px-3 py-2 text-sm`}
                      placeholder="高基表资产编号"
                      readOnly={!isEditable}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#646a73] mb-1">资产名称</label>
                    <input
                      value={gaojibiaoForm.assetName || ''}
                      onChange={(e) => isEditable && setGaojibiaoForm((prev) => ({ ...prev, assetName: e.target.value }))}
                      className={`w-full border ${isEditable ? 'border-[#dee0e3]' : 'border-gray-200 bg-gray-50'} rounded px-3 py-2 text-sm`}
                      placeholder="高基表资产名称"
                      readOnly={!isEditable}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#646a73] mb-1">使用部门</label>
                    <input
                      value={gaojibiaoForm.department || ''}
                      onChange={(e) => isEditable && setGaojibiaoForm((prev) => ({ ...prev, department: e.target.value }))}
                      className={`w-full border ${isEditable ? 'border-[#dee0e3]' : 'border-gray-200 bg-gray-50'} rounded px-3 py-2 text-sm`}
                      placeholder="资产使用部门"
                      readOnly={!isEditable}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#646a73] mb-1">使用年限</label>
                    <input
                      type="number"
                      value={gaojibiaoForm.serviceLife || ''}
                      onChange={(e) => isEditable && setGaojibiaoForm((prev) => ({ ...prev, serviceLife: Number(e.target.value) }))}
                      className={`w-full border ${isEditable ? 'border-[#dee0e3]' : 'border-gray-200 bg-gray-50'} rounded px-3 py-2 text-sm`}
                      placeholder="资产使用年限"
                      readOnly={!isEditable}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#646a73] mb-1">原值</label>
                    <input
                      type="number"
                      value={gaojibiaoForm.originalValue || ''}
                      onChange={(e) => isEditable && setGaojibiaoForm((prev) => ({ ...prev, originalValue: Number(e.target.value) }))}
                      className={`w-full border ${isEditable ? 'border-[#dee0e3]' : 'border-gray-200 bg-gray-50'} rounded px-3 py-2 text-sm`}
                      placeholder="资产原值"
                      readOnly={!isEditable}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#646a73] mb-1">残值率</label>
                    <input
                      type="number"
                      step={0.01}
                      value={gaojibiaoForm.residualRate || ''}
                      onChange={(e) => isEditable && setGaojibiaoForm((prev) => ({ ...prev, residualRate: Number(e.target.value) }))}
                      className={`w-full border ${isEditable ? 'border-[#dee0e3]' : 'border-gray-200 bg-gray-50'} rounded px-3 py-2 text-sm`}
                      placeholder="0.05"
                      readOnly={!isEditable}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveGaojibiao}
                    className={`px-3 py-1.5 ${isEditable ? 'bg-[#3370ff] hover:bg-[#285cc9]' : 'bg-gray-300 cursor-not-allowed'} text-white rounded-md text-sm flex items-center gap-1`}
                    disabled={!isEditable}
                  >
                    <CheckCircle size={14} /> 保存映射信息
                  </button>
                </div>
              </div>

              <div className="text-xs text-[#8f959e]">
                <AlertCircle size={14} className="inline mr-1" />
                高基表映射信息将用于资产年报上报，请确保信息准确无误
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsGaojibiaoPage;

