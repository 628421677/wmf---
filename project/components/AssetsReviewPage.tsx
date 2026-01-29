import React, { useMemo, useState } from 'react';
import { Check, Download, FileCheck, Search, X, XCircle } from 'lucide-react';
import { useAssetData } from '../hooks/useAssetData';
import { AssetStatus, Project, UserRole } from '../types';
import { getAssetStatusColor, getAssetStatusLabel } from '../utils/assetStatus';
import { computeAttachmentCompletion, getStageAttachmentRequirements } from '../utils/assetAttachmentRequirements';

type AttachmentReviewStatus = 'Pending' | 'Approved' | 'Rejected';

type ProjectAttachment = {
  id: string;
  name: string;
  type: string;
  uploadDate?: string;
  uploadedByDept?: string;
  reviewStatus?: AttachmentReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
};

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const AssetsReviewPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const { projects, setProjects, logAudit } = useAssetData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return projects
      .filter((p) => p.status === AssetStatus.PendingReview)
      .filter((p) => {
        if (!q) return true;
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.contractor.toLowerCase().includes(q);
      });
  }, [projects, searchTerm]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const pendingAttachments = useMemo(() => {
    const attachments = ((selectedProject as any)?.attachments || []) as ProjectAttachment[];
    return attachments.filter((a) => (a.reviewStatus || 'Pending') === 'Pending');
  }, [selectedProject]);

    const updateProjectAttachments = (
    project: Project,
    updater: (attachments: ProjectAttachment[]) => ProjectAttachment[]
  ) => {
    const oldAttachments = (((project as any).attachments || []) as ProjectAttachment[]).map((a) => ({
      ...a,
      reviewStatus: (a.reviewStatus || 'Pending') as AttachmentReviewStatus,
    }));

    const newAttachments = updater(oldAttachments);

    // Check if all required attachments are approved to auto-advance the status
    const completionStats = computeAttachmentCompletion(AssetStatus.PendingReview, newAttachments);
    let nextStatus = project.status;

    if (
      project.status === AssetStatus.PendingReview &&
      completionStats.requiredTotal > 0 &&
      completionStats.requiredApproved === completionStats.requiredTotal
    ) {
      nextStatus = AssetStatus.PendingArchive;
      logAudit('status_change', 'project', project.id, project.name, userRole, {
        status: { old: project.status, new: nextStatus },
        reason: { old: '', new: 'All required attachments have been approved.' },
      });
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id
          ? ({ ...(p as any), attachments: newAttachments, status: nextStatus } as Project)
          : p
      )
    );

    // If status changes, the project will disappear from the list, so close the modal.
    if (nextStatus !== project.status) {
      setSelectedProjectId(null);
    } else {
      // Keep modal data fresh immediately (so single approve/reject reflects right away)
      setSelectedProjectId(project.id);
    }
  };

  const approveAllPending = (project: Project) => {
    const attachments = (((project as any).attachments || []) as ProjectAttachment[]).map((a) => ({
      ...a,
      reviewStatus: (a.reviewStatus || 'Pending') as AttachmentReviewStatus,
    }));

    const pending = attachments.filter((a) => a.reviewStatus === 'Pending');
    if (pending.length === 0) {
      alert('暂无待审核附件');
      return;
    }

    const ids = pending.map((p) => p.id);

    updateProjectAttachments(project, (atts) =>
      atts.map((a) =>
        ids.includes(a.id)
          ? {
              ...a,
              reviewStatus: 'Approved',
              reviewedBy: '资产管理员',
              reviewedAt: new Date().toISOString(),
              reviewNote: a.reviewNote || '批量通过',
            }
          : a
      )
    );

    logAudit('update', 'attachment', project.id, project.name, userRole, {
      attachmentsBatchApprove: { old: `${ids.length} pending`, new: `${ids.length} approved` },
    });
  };

  const reviewOne = (project: Project, attachmentId: string, status: 'Approved' | 'Rejected') => {
    updateProjectAttachments(project, (atts) =>
      atts.map((a) =>
        a.id === attachmentId
          ? {
              ...a,
              reviewStatus: status,
              reviewedBy: '资产管理员',
              reviewedAt: new Date().toISOString(),
              reviewNote: status === 'Approved' ? '审核通过' : '审核驳回',
            }
          : a
      )
    );

    logAudit('update', 'attachment', attachmentId, project.name, userRole, {
      attachmentId: { old: attachmentId, new: attachmentId },
      attachmentReviewStatus: { old: 'Pending', new: status },
    });
  };

  const handleDownload = (project: Project, attachment: ProjectAttachment) => {
    const safeName = (attachment.name || 'attachment').replace(/[\\/:*?"<>|]/g, '_');
    const filename = safeName.endsWith('.txt') ? safeName : `${safeName}.txt`;
    const content = [
      '【附件下载（模拟）】',
      `项目：${project.name} (${project.id})`,
      `附件：${attachment.name}`,
      `类型：${attachment.type}`,
      `上传部门：${attachment.uploadedByDept || '-'}`,
      `审核状态：${attachment.reviewStatus || 'Pending'}`,
      `下载时间：${new Date().toLocaleString('zh-CN')}`,
    ].join('\n');

    downloadTextFile(filename, content);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329]">转固审核</h2>
        <p className="text-[#646a73]">仅展示“待审核”项目。本模块审核对象为项目附件：支持批量通过，以及对单个附件进行审核通过/驳回。</p>
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
              <th className="px-4 py-3 text-left">待审核附件</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => {
              const attachments = ((p as any).attachments || []) as ProjectAttachment[];
              const pendingCount = attachments.filter((a) => (a.reviewStatus || 'Pending') === 'Pending').length;

              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-[#646a73]">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-[#1f2329]">{p.name}</td>
                  <td className="px-4 py-3 text-[#646a73]">{p.contractor}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getAssetStatusColor(p.status)}`}>{getAssetStatusLabel(p.status)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${pendingCount > 0 ? 'text-red-600 font-medium' : 'text-[#646a73]'}`}>{pendingCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-[#3370ff] hover:underline text-xs flex items-center gap-1"
                      onClick={() => setSelectedProjectId(p.id)}
                    >
                      <FileCheck size={14} /> 附件审核
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#8f959e]" colSpan={6}>
                  暂无待审核的项目。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedProjectId(null)}>
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1f2329]">附件审核：{selectedProject.name}</h3>
                <p className="text-xs text-[#646a73]">项目编号：{selectedProject.id}</p>
              </div>
              <button className="text-[#646a73]" onClick={() => setSelectedProjectId(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#646a73]">
                  待审核附件：<span className="font-medium text-red-600">{pendingAttachments.length}</span>
                </div>
                <button
                  onClick={() => approveAllPending(selectedProject)}
                  className="text-xs px-3 py-2 bg-green-500 text-white rounded flex items-center gap-1 hover:bg-green-600"
                >
                  <Check size={14} /> 批量通过
                </button>
              </div>

              <div className="border border-[#dee0e3] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f6f7] text-[#646a73]">
                    <tr>
                      <th className="px-4 py-2 text-left">附件名称</th>
                      <th className="px-4 py-2 text-left">类型</th>
                      <th className="px-4 py-2 text-left">上传部门</th>
                      <th className="px-4 py-2 text-left">状态</th>
                      <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dee0e3]">
                    {(((selectedProject as any).attachments || []) as ProjectAttachment[]).map((a) => {
                      const status = (a.reviewStatus || 'Pending') as AttachmentReviewStatus;
                      return (
                        <tr key={a.id} className="hover:bg-[#f9f9f9]">
                          <td className="px-4 py-3 font-medium text-[#1f2329]">{a.name}</td>
                          <td className="px-4 py-3 text-[#646a73]">{a.type}</td>
                          <td className="px-4 py-3 text-[#646a73]">{a.uploadedByDept || '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                status === 'Approved'
                                  ? 'bg-green-100 text-green-700'
                                  : status === 'Rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {status === 'Approved' ? '已通过' : status === 'Rejected' ? '已驳回' : '待审核'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownload(selectedProject, a)}
                                className="p-1.5 text-[#646a73] hover:text-[#3370ff] hover:bg-[#f0f5ff] rounded"
                                title="下载附件（模拟）"
                              >
                                <Download size={16} />
                              </button>

                              <button
                                disabled={status !== 'Pending'}
                                onClick={() => reviewOne(selectedProject, a.id, 'Approved')}
                                className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                通过
                              </button>
                              <button
                                disabled={status !== 'Pending'}
                                onClick={() => reviewOne(selectedProject, a.id, 'Rejected')}
                                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                驳回
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {(((selectedProject as any).attachments || []) as ProjectAttachment[]).length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-sm text-[#8f959e]" colSpan={5}>
                          该项目暂无附件。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-xs text-[#646a73] flex items-start gap-2">
                  <XCircle size={14} className="mt-0.5" />
                  <span>说明：所有必备附件审核通过后，可将项目推进至“待归档”阶段。</span>
                </div>
                <button 
                  onClick={() => {
                    if (!selectedProject) return;
                    const updatedProject = { ...selectedProject, status: AssetStatus.PendingArchive };
                    setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
                    logAudit('status_change', 'project', selectedProject.id, selectedProject.name, userRole, {
                      status: { old: selectedProject.status, new: AssetStatus.PendingArchive },
                      reason: { old: '', new: 'Manual advancement after attachment review.' },
                    });
                    setSelectedProjectId(null);
                  }}
                  disabled={computeAttachmentCompletion(AssetStatus.PendingReview, (selectedProject as any).attachments || []).requiredApproved !== computeAttachmentCompletion(AssetStatus.PendingReview, (selectedProject as any).attachments || []).requiredTotal || computeAttachmentCompletion(AssetStatus.PendingReview, (selectedProject as any).attachments || []).requiredTotal === 0}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  进入待归档
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
