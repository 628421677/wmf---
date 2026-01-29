import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Building,
  X,
  Paperclip,
  Calendar,
  MapPin,
  Layers,
  Trash2,
} from 'lucide-react';
import {
  Project,
  FundSource,
  AssetStatus,
  ProjectMilestone,
  AssetCategory,
  AssetSplitItem,
} from '../types';

export interface ProjectFormProps {
  mode?: 'create' | 'edit';
  initialProject?: Project | null;
  onCancel: () => void;
  onSubmit: (project: Project) => void;
  existingProjectCount: number;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  mode = 'create',
  initialProject,
  onCancel,
  onSubmit,
  existingProjectCount,
}) => {
  const [newAttachments, setNewAttachments] = useState<any[]>(initialProject?.attachments || []);
  const [newSplitItems, setNewSplitItems] = useState<AssetSplitItem[]>(initialProject?.splitItems || []);
  const [buildingName, setBuildingName] = useState<string>(() => {
    const first = (initialProject?.roomFunctionPlan || [])[0];
    return first?.buildingName || '';
  });
  const [newRoomPlans, setNewRoomPlans] = useState<any[]>(initialProject?.roomFunctionPlan || []);
  const [roomForm, setRoomForm] = useState<{ floor: string; roomNo: string; area: string }>({
    floor: '',
    roomNo: '',
    area: '',
  });

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

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contractAmount) return;

    const contractAmount = Number(formData.contractAmount);
    const auditAmount = (formData as any).auditAmount ? Number((formData as any).auditAmount) : undefined;
    const auditReductionRate = auditAmount !== undefined && contractAmount > 0
      ? Number((((contractAmount - auditAmount) / contractAmount) * 100).toFixed(2))
      : undefined;

    if (mode === 'edit' && initialProject) {
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
      onSubmit(updatedProject);
      return;
    }

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
      isArchived: false,
    };

    onSubmit(newProject);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-[#1f2329]">{mode === 'edit' ? '编辑工程项目' : '录入新基建工程'}</h3>
        </div>

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
                    <option key={f} value={String(f)}>
                      {f}F
                    </option>
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
                    <div
                      key={r.id}
                      className="flex items-center justify-between text-sm p-2 rounded-md bg-[#f9fafb] border border-[#dee0e3]"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-[#1f2329] truncate">
                          {r.buildingName} | {r.roomNo}
                        </div>
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
                value={splitForm.name || ''}
                onChange={e => setSplitForm(prev => ({ ...prev, name: e.target.value }))}
                className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none sm:col-span-2"
                placeholder="资产名称"
              />
              <input
                type="number"
                value={splitForm.amount ?? ''}
                onChange={e => setSplitForm(prev => ({
                  ...prev,
                  amount: e.target.value === '' ? undefined : Number(e.target.value),
                }))}
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
                onChange={e => setSplitForm(prev => ({
                  ...prev,
                  depreciationYears: e.target.value === '' ? undefined : Number(e.target.value),
                }))}
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
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm p-2 rounded-md bg-[#f9fafb] border border-[#dee0e3]"
                    >
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
                    <div
                      key={att.id}
                      className="flex items-center justify-between text-sm p-2 rounded-md bg-[#f9fafb] border border-[#dee0e3]"
                    >
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

      <div className="px-6 py-4 bg-[#f9fafb] border-t border-[#dee0e3] flex justify-end gap-3 rounded-b-lg">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-[#f2f3f5]"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] disabled:bg-gray-400"
          disabled={!formData.name || !formData.contractAmount}
        >
          确认录入
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;


