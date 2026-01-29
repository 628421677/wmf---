import React, { useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle, Clock, Download, Eye, Layers, Paperclip, Plus, RefreshCw, Search, Trash2, Edit as EditIcon, XCircle } from 'lucide-react';
import { useAssetData } from '../hooks/useAssetData';
import { AssetCategory, AssetSplitItem, AssetStatus, Project, ProjectAttachment, UserRole } from '../types';
import { getAssetStatusLabel, getAssetStatusColor } from '../utils/assetStatus';
import { computeAttachmentCompletion, getAttachmentTypeLabel, getStageAttachmentRequirements } from '../utils/assetAttachmentRequirements';

const AssetsApplyPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const isEditable = (p: Project | null) => !!p && p.status === AssetStatus.DisposalPending;
  const { projects, setProjects } = useAssetData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailTab, setDetailTab] = useState<'flow' | 'split' | 'attachments'>('flow');

  const [splitForm, setSplitForm] = useState<Partial<AssetSplitItem>>({
    category: AssetCategory.Building,
    depreciationMethod: 'StraightLine',
    depreciationYears: 50,
  });

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return projects
      .filter((p) => ![AssetStatus.PendingArchive, AssetStatus.Archived].includes(p.status))
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
        <div className="text-sm text-[#646a73]">共 {filtered.length} 项（不含待归档/已归档）</div>
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
                  <div className="flex items-center gap-3">
                    <button
                      className="text-[#3370ff] hover:underline text-xs flex items-center gap-1"
                      onClick={() => setSelectedProject(p)}
                    >
                      <Eye size={14} /> 查看详情
                    </button>

                    <button
                      className="text-xs px-3 py-1.5 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9] disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={
                        p.status !== AssetStatus.DisposalPending ||
                        computeAttachmentCompletion(AssetStatus.PendingReview, p.attachments || []).missingRequired > 0
                      }
                      onClick={() => {
                        const stat = computeAttachmentCompletion(AssetStatus.PendingReview, p.attachments || []);
                        if (stat.missingRequired > 0) {
                          const req = getStageAttachmentRequirements(AssetStatus.PendingReview);
                          const missing = req.requiredAttachments
                            .filter((r) => r.required)
                            .filter((r) => (p.attachments || []).filter((a) => a.type === r.type).length === 0)
                            .map((r) => r.label)
                            .join('、');
                          alert(`必备附件未齐全，无法发起转固申请。缺少：${missing || '必备附件'}`);
                          return;
                        }
                        setProjects((prev) => prev.map((x) => (x.id === p.id ? ({ ...x, status: AssetStatus.PendingReview } as Project) : x)));
                      }}
                      title={p.status !== AssetStatus.DisposalPending ? '仅待处置项目可发起' : undefined}
                    >
                      发起转固申请 <ArrowRight size={14} />
                    </button>
                  </div>
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
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-[#1f2329]">{selectedProject.name}</h3>
                <p className="text-xs text-[#646a73]">项目编号：{selectedProject.id}</p>
              </div>
              <button className="text-[#646a73]" onClick={() => setSelectedProject(null)}>
                关闭
              </button>
            </div>
            <div className="px-4 pt-4">
              <div className="flex items-center gap-2 border-b">
                <button
                  className={`px-3 py-2 text-sm border-b-2 -mb-px ${detailTab === 'flow' ? 'border-[#3370ff] text-[#3370ff] font-medium' : 'border-transparent text-[#646a73]'}`}
                  onClick={() => setDetailTab('flow')}
                >
                  <Eye size={14} />
                  <span className="ml-1">详情</span>
                </button>
                <button
                  className={`px-3 py-2 text-sm border-b-2 -mb-px ${detailTab === 'split' ? 'border-[#3370ff] text-[#3370ff] font-medium' : 'border-transparent text-[#646a73]'}`}
                  onClick={() => setDetailTab('split')}
                >
                  <Layers size={14} />
                  <span className="ml-1">资产拆分</span>
                </button>
                <button
                  className={`px-3 py-2 text-sm border-b-2 -mb-px ${detailTab === 'attachments' ? 'border-[#3370ff] text-[#3370ff] font-medium' : 'border-transparent text-[#646a73]'}`}
                  onClick={() => setDetailTab('attachments')}
                >
                  <Paperclip size={14} />
                  <span className="ml-1">附件</span>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {detailTab === 'flow' && (
                <>
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
                </>
              )}

              {detailTab === 'split' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-[#1f2329] mb-3 flex items-center gap-2">
                      <Layers size={16} /> 已拆分资产项
                    </h4>

                    {(selectedProject.splitItems || []).length > 0 ? (
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
                              <th className="px-4 py-2 text-center">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#dee0e3]">
                            {(selectedProject.splitItems || []).map((item) => (
                              <tr key={item.id} className="hover:bg-[#f9f9f9]">
                                <td className="px-4 py-3">
                                  {item.category === AssetCategory.Building
                                    ? '房屋建筑物'
                                    : item.category === AssetCategory.Land
                                      ? '土地'
                                      : item.category === AssetCategory.Structure
                                        ? '构筑物'
                                        : item.category === AssetCategory.Equipment
                                          ? '设备'
                                          : item.category === AssetCategory.Greening
                                            ? '绿化'
                                            : '其他'}
                                </td>
                                <td className="px-4 py-3 font-medium">{item.name}</td>
                                <td className="px-4 py-3 text-right">¥{Number(item.amount || 0).toLocaleString('zh-CN')}</td>
                                <td className="px-4 py-3 text-right">
                                  {item.area ? `${item.area} m²` : item.quantity ? `${item.quantity} 台/套` : '-'}
                                </td>
                                <td className="px-4 py-3 text-center">{item.depreciationYears} 年</td>
                                <td className="px-4 py-3 text-[#3370ff]">{item.assetCardNo || '待生成'}</td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    type="button"
                                    disabled={!isEditable(selectedProject)}
                                    onClick={() => {
                                      if (!isEditable(selectedProject)) return;
                                      setProjects((prev) =>
                                        prev.map((p) =>
                                          p.id === selectedProject.id
                                            ? ({
                                                ...p,
                                                splitItems: (p.splitItems || []).filter((x) => x.id !== item.id),
                                              } as Project)
                                            : p
                                        )
                                      );
                                      setSelectedProject((prev) =>
                                        prev
                                          ? ({
                                              ...prev,
                                              splitItems: (prev.splitItems || []).filter((x) => x.id !== item.id),
                                            } as Project)
                                          : prev
                                      );
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="删除"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-[#f9fafb] font-medium">
                            <tr>
                              <td colSpan={2} className="px-4 py-3">合计</td>
                              <td className="px-4 py-3 text-right">¥{(selectedProject.splitItems || []).reduce((acc, i) => acc + (i.amount || 0), 0).toLocaleString('zh-CN')}</td>
                              <td colSpan={4}></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-[#8f959e] py-4 bg-[#f9fafb] rounded-lg">暂未拆分</div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-[#1f2329] mb-3 flex items-center gap-2">新增拆分项</h4>
                    <div className="border border-[#dee0e3] rounded-lg p-4 bg-white space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                        <select
                          disabled={!isEditable(selectedProject)}
                          value={(splitForm.category as any) || AssetCategory.Building}
                          onChange={(e) => setSplitForm((prev) => ({ ...prev, category: e.target.value as AssetCategory }))}
                          className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none sm:col-span-2 disabled:opacity-50"
                        >
                          {Object.values(AssetCategory).map((cat) => (
                            <option key={cat} value={cat}>
                              {cat === AssetCategory.Building
                                ? '房屋建筑物'
                                : cat === AssetCategory.Land
                                  ? '土地'
                                  : cat === AssetCategory.Structure
                                    ? '构筑物'
                                    : cat === AssetCategory.Equipment
                                      ? '设备'
                                      : cat === AssetCategory.Greening
                                        ? '绿化'
                                        : '其他'}
                            </option>
                          ))}
                        </select>
                        <input
                          disabled={!isEditable(selectedProject)}
                          value={String(splitForm.name || '')}
                          onChange={(e) => setSplitForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none sm:col-span-2 disabled:opacity-50"
                          placeholder="资产名称"
                        />
                        <input
                          disabled={!isEditable(selectedProject)}
                          type="number"
                          value={(splitForm.amount as any) ?? ''}
                          onChange={(e) =>
                            setSplitForm((prev) => ({
                              ...prev,
                              amount: e.target.value === '' ? undefined : Number(e.target.value),
                            }))
                          }
                          className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none disabled:opacity-50"
                          placeholder="金额(元)"
                          min={0}
                        />
                        <input
                          disabled={!isEditable(selectedProject)}
                          type="number"
                          value={(splitForm.category === AssetCategory.Equipment ? (splitForm.quantity ?? '') : (splitForm.area ?? '')) as any}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                            if (splitForm.category === AssetCategory.Equipment) {
                              setSplitForm((prev) => ({ ...prev, quantity: val, area: undefined }));
                            } else {
                              setSplitForm((prev) => ({ ...prev, area: val, quantity: undefined }));
                            }
                          }}
                          className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none disabled:opacity-50"
                          placeholder={splitForm.category === AssetCategory.Equipment ? '数量' : '面积(m²)'}
                          min={0}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          disabled={!isEditable(selectedProject)}
                          type="number"
                          value={(splitForm.depreciationYears as any) ?? ''}
                          onChange={(e) =>
                            setSplitForm((prev) => ({
                              ...prev,
                              depreciationYears: e.target.value === '' ? undefined : Number(e.target.value),
                            }))
                          }
                          className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none disabled:opacity-50"
                          placeholder="折旧年限"
                          min={0}
                        />
                        <select
                          disabled={!isEditable(selectedProject)}
                          value={(splitForm.depreciationMethod as any) || 'StraightLine'}
                          onChange={(e) => setSplitForm((prev) => ({ ...prev, depreciationMethod: e.target.value as any }))}
                          className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none disabled:opacity-50"
                        >
                          <option value="StraightLine">年限平均法</option>
                          <option value="Accelerated">加速折旧</option>
                        </select>
                        <button
                          type="button"
                          disabled={!isEditable(selectedProject)}
                          onClick={() => {
                            if (!isEditable(selectedProject)) return;
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

                            setProjects((prev) =>
                              prev.map((p) =>
                                p.id === selectedProject.id
                                  ? ({ ...p, splitItems: [...(p.splitItems || []), item] } as Project)
                                  : p
                              )
                            );
                            setSelectedProject((prev) =>
                              prev ? ({ ...prev, splitItems: [...(prev.splitItems || []), item] } as Project) : prev
                            );

                            setSplitForm({
                              category: AssetCategory.Building,
                              depreciationMethod: 'StraightLine',
                              depreciationYears: 50,
                            });
                          }}
                          className="text-xs px-3 py-2 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} /> 添加拆分项
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'attachments' && (
                <div className="space-y-4">
                  {(() => {
                    const currentStageReq = getStageAttachmentRequirements(AssetStatus.PendingReview);
                    const currentStageStat = computeAttachmentCompletion(AssetStatus.PendingReview, selectedProject.attachments || []);

                    const required = currentStageReq.requiredAttachments.filter((a) => a.required);
                    const optional = currentStageReq.requiredAttachments.filter((a) => !a.required);

                    const renderChecklist = (list: typeof currentStageReq.requiredAttachments) => (
                      <div className="space-y-2">
                        {list.map((req) => {
                          const found = (selectedProject.attachments || []).filter((a) => a.type === req.type);
                          const status: 'Approved' | 'Pending' | 'Rejected' | 'Missing' = found.length > 0
                            ? (found.some((f) => f.reviewStatus === 'Approved')
                                ? 'Approved'
                                : found.some((f) => f.reviewStatus === 'Rejected')
                                  ? 'Rejected'
                                  : 'Pending')
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
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded ${
                                  status === 'Approved'
                                    ? 'bg-green-100 text-green-700'
                                    : status === 'Pending'
                                      ? 'bg-amber-100 text-amber-700'
                                      : status === 'Rejected'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {status === 'Approved' ? '已通过' : status === 'Pending' ? '待审核' : status === 'Rejected' ? '已驳回' : '缺失'}
                              </span>
                            </div>
                          );
                        })}

                        {list.length === 0 && (
                          <div className="text-sm text-[#8f959e]">暂无</div>
                        )}
                      </div>
                    );

                    return (
                      <>
                        <div className="border border-[#dee0e3] rounded-lg p-4 bg-white space-y-3">
                          {(() => {
                            const req = getStageAttachmentRequirements(AssetStatus.PendingReview);
                            const requiredList = req.requiredAttachments.filter((r) => r.required);
                            const optionalList = req.requiredAttachments.filter((r) => !r.required);
                            const missingLabels = requiredList
                              .filter((r) => (selectedProject.attachments || []).filter((a) => a.type === r.type).length === 0)
                              .map((r) => r.label);

                            return (
                              <div className="text-xs text-[#8f959e] space-y-1">
                                <div className="font-medium text-[#646a73]">提示：</div>
                                <div>必备附件：{requiredList.map((r) => r.label).join('、') || '无'}</div>
                                <div>可选附件：{optionalList.map((r) => r.label).join('、') || '无'}</div>
                                {missingLabels.length > 0 && (
                                  <div className="text-red-600">当前缺少必备附件：{missingLabels.join('、')}</div>
                                )}
                              </div>
                            );
                          })()}
                          <div className="flex flex-wrap gap-2 items-center text-xs text-[#646a73]">
                            <span className="px-2 py-0.5 rounded bg-[#f2f3f5]">当前阶段：{getAssetStatusLabel(selectedProject.status)}</span>
                            <span
                              className={`px-2 py-0.5 rounded ${
                                currentStageStat.missingRequired > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}
                            >
                              必备附件：{currentStageStat.requiredApproved}/{currentStageStat.requiredTotal}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-[#1f2329] mb-2">必备附件</div>
                              {renderChecklist(required)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#1f2329] mb-2">可选附件</div>
                              {renderChecklist(optional)}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-[#1f2329] mb-3 flex items-center gap-2">
                            <Paperclip size={16} /> 上传附件（模拟）
                          </h4>
                          <div className="border border-[#dee0e3] rounded-lg p-4 bg-white space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <select
                                id="apply-upload-type"
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
                                id="apply-upload-name"
                                className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none sm:col-span-2"
                                placeholder="请输入附件名称，例如：施工合同.pdf"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const typeEl = document.getElementById('apply-upload-type') as HTMLSelectElement | null;
                                  const nameEl = document.getElementById('apply-upload-name') as HTMLInputElement | null;
                                  const type = (typeEl?.value || 'other') as any;
                                  const name = (nameEl?.value || '').trim();
                                  if (!name) {
                                    alert('请输入附件名称');
                                    return;
                                  }
                                  const newAtt: ProjectAttachment = {
                                    id: `ATT-${Date.now()}`,
                                    name,
                                    type,
                                    uploadDate: new Date().toISOString().split('T')[0],
                                    uploadedByDept: '二级学院',
                                    reviewStatus: 'Pending',
                                  };

                                  setProjects((prev) =>
                                    prev.map((p) =>
                                      p.id === selectedProject.id
                                        ? ({ ...p, attachments: [...(p.attachments || []), newAtt] } as Project)
                                        : p
                                    )
                                  );
                                  setSelectedProject((prev) =>
                                    prev ? ({ ...prev, attachments: [...(prev.attachments || []), newAtt] } as Project) : prev
                                  );
                                  if (nameEl) nameEl.value = '';
                                }}
                                className="text-xs px-3 py-2 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9]"
                              >
                                <Plus size={14} /> 上传（模拟）
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-[#1f2329] mb-2">附件列表</div>
                          <div className="grid gap-3">
                            {(selectedProject.attachments || []).map((att) => {
                              const status = att.reviewStatus || 'Pending';
                              const borderCls = status === 'Rejected'
                                ? 'border-red-300 bg-red-50'
                                : status === 'Approved'
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-[#dee0e3] bg-[#f9fafb]';

                              return (
                                <div key={att.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border ${borderCls}`}>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded flex items-center justify-center ${
                                        status === 'Rejected'
                                          ? 'bg-red-100 text-red-600'
                                          : status === 'Approved'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-blue-50 text-blue-600'
                                      }`}
                                    >
                                      <Paperclip size={18} />
                                    </div>
                                    <div>
                                      <div className="font-medium text-[#1f2329] flex items-center gap-2">
                                        <span>{att.name}</span>
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded ${
                                            status === 'Pending'
                                              ? 'bg-amber-100 text-amber-700'
                                              : status === 'Approved'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                          }`}
                                        >
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
                                    <button
                                      className="p-1.5 text-[#646a73] hover:text-[#3370ff] hover:bg-[#f0f5ff] rounded"
                                      title="下载（模拟）"
                                      onClick={() => {
                                        const safeName = (att.name || 'attachment').replace(/[\\/:*?"<>|]/g, '_');
                                        const filename = safeName.endsWith('.txt') ? safeName : `${safeName}.txt`;
                                        const content = [
                                          '【附件下载（模拟）】',
                                          `项目：${selectedProject.name} (${selectedProject.id})`,
                                          `附件：${att.name}`,
                                          `类型：${att.type}`,
                                          `上传部门：${att.uploadedByDept || '-'}`,
                                          `审核状态：${att.reviewStatus || 'Pending'}`,
                                          `下载时间：${new Date().toLocaleString('zh-CN')}`,
                                        ].join('\n');
                                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = filename;
                                        document.body.appendChild(a);
                                        a.click();
                                        a.remove();
                                        URL.revokeObjectURL(url);
                                      }}
                                    >
                                      <Download size={16} />
                                    </button>

                                    {status === 'Rejected' && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setProjects((prev) =>
                                              prev.map((p) =>
                                                p.id === selectedProject.id
                                                  ? ({
                                                      ...p,
                                                      attachments: (p.attachments || []).map((a) =>
                                                        a.id === att.id
                                                          ? {
                                                              ...a,
                                                              reviewStatus: 'Pending',
                                                              reviewedBy: undefined,
                                                              reviewedAt: undefined,
                                                            }
                                                          : a
                                                      ),
                                                    } as Project)
                                                  : p
                                              )
                                            );
                                            setSelectedProject((prev) =>
                                              prev
                                                ? ({
                                                    ...prev,
                                                    attachments: (prev.attachments || []).map((a) =>
                                                      a.id === att.id
                                                        ? {
                                                            ...a,
                                                            reviewStatus: 'Pending',
                                                            reviewedBy: undefined,
                                                            reviewedAt: undefined,
                                                          }
                                                        : a
                                                    ),
                                                  } as Project)
                                                : prev
                                            );
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
                                            const nextType = prompt(
                                              '请输入新的附件类型（例如：contract / acceptance / audit / other）',
                                              String(att.type)
                                            );
                                            if (nextType === null) return;
                                            const next = (nextType.trim() || String(att.type)) as any;
                                            const type = (
                                              ['approval', 'bidding', 'contract', 'change', 'drawing', 'acceptance', 'audit', 'other'].includes(next)
                                                ? next
                                                : att.type
                                            ) as any;

                                            setProjects((prev) =>
                                              prev.map((p) =>
                                                p.id === selectedProject.id
                                                  ? ({
                                                      ...p,
                                                      attachments: (p.attachments || []).map((a) =>
                                                        a.id === att.id
                                                          ? {
                                                              ...a,
                                                              name,
                                                              type,
                                                              reviewStatus: 'Pending',
                                                              reviewedBy: undefined,
                                                              reviewedAt: undefined,
                                                            }
                                                          : a
                                                      ),
                                                    } as Project)
                                                  : p
                                              )
                                            );
                                            setSelectedProject((prev) =>
                                              prev
                                                ? ({
                                                    ...prev,
                                                    attachments: (prev.attachments || []).map((a) =>
                                                      a.id === att.id
                                                        ? {
                                                            ...a,
                                                            name,
                                                            type,
                                                            reviewStatus: 'Pending',
                                                            reviewedBy: undefined,
                                                            reviewedAt: undefined,
                                                          }
                                                        : a
                                                    ),
                                                  } as Project)
                                                : prev
                                            );
                                          }}
                                          className="text-xs px-3 py-1.5 border border-[#dee0e3] text-[#1f2329] rounded hover:bg-gray-50 flex items-center gap-1"
                                        >
                                          <EditIcon size={14} /> 编辑
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!confirm('确定要删除该附件吗？')) return;
                                            setProjects((prev) =>
                                              prev.map((p) =>
                                                p.id === selectedProject.id
                                                  ? ({
                                                      ...p,
                                                      attachments: (p.attachments || []).filter((a) => a.id !== att.id),
                                                    } as Project)
                                                  : p
                                              )
                                            );
                                            setSelectedProject((prev) =>
                                              prev
                                                ? ({
                                                    ...prev,
                                                    attachments: (prev.attachments || []).filter((a) => a.id !== att.id),
                                                  } as Project)
                                                : prev
                                            );
                                          }}
                                          className="text-xs px-3 py-1.5 border border-red-500 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                                        >
                                          <Trash2 size={14} /> 删除
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {(selectedProject.attachments || []).length === 0 && (
                              <div className="text-center text-[#8f959e] py-8">暂无附件</div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsApplyPage;


