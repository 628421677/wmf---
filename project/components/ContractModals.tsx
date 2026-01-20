import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { ContractItem, SpaceItem } from './CommercialHousing';

// ==================== 合同新增/编辑弹窗 ====================

interface ContractUpsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingContract: ContractItem | null;
  spaces: SpaceItem[];
  genContractNo: () => string;
}

export const ContractUpsertModal: React.FC<ContractUpsertModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingContract, 
  spaces, 
  genContractNo 
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingContract) {
        setFormData({
          ...editingContract,
        });
      } else {
        setFormData({
          contractNo: genContractNo(),
          spaceId: '',
          tenant: '',
          tenantContact: '',
          tenantLicense: '',
          rentPerMonth: 0,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          status: 'Active',
          performanceRating: 5,
        });
      }
      setErrors({});
    }
  }, [isOpen, editingContract, genContractNo]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.contractNo) newErrors.contractNo = '合同编号不能为空';
    if (!formData.spaceId) newErrors.spaceId = '必须选择一个房源';
    if (!formData.tenant) newErrors.tenant = '承租方名称不能为空';
    if (!formData.tenantContact) newErrors.tenantContact = '承租方联系方式不能为空';
    if (formData.rentPerMonth <= 0) newErrors.rentPerMonth = '月租金必须大于0';
    if (!formData.startDate) newErrors.startDate = '合同开始日期不能为空';
    if (!formData.endDate) newErrors.endDate = '合同结束日期不能为空';
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = '结束日期必须在开始日期之后';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  const availableSpaces = spaces.filter(s => s.status === '公开招租' || s.id === editingContract?.spaceId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center pb-4 border-b border-[#dee0e3]">
          <h2 className="text-xl font-bold text-[#1f2329]">{editingContract ? '编辑合同' : '新增合同'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Form Fields */}
            {Object.entries({
              contractNo: '合同编号',
              spaceId: '关联房源',
              tenant: '承租方名称',
              tenantContact: '联系方式',
              tenantLicense: '营业执照号 (可选)',
              rentPerMonth: '月租金 (元)',
              startDate: '开始日期',
              endDate: '结束日期',
              status: '合同状态',
              performanceRating: '履约评分 (1-5)',
            }).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-[#646a73]">{label}</label>
                {key === 'spaceId' ? (
                  <select
                    name={key}
                    value={formData[key] || ''}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    className={`mt-1 block w-full rounded-md border text-sm px-3 py-2 ${errors[key] ? 'border-red-500' : 'border-[#dee0e3]'}`}
                  >
                    <option value="">请选择房源</option>
                    {availableSpaces.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.area}m²)</option>
                    ))}
                  </select>
                ) : key === 'status' ? (
                  <select 
                    name={key} 
                    value={formData[key]} 
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    className={`mt-1 block w-full rounded-md border text-sm px-3 py-2 ${errors[key] ? 'border-red-500' : 'border-[#dee0e3]'}`}
                  >
                    <option value="Active">履约中</option>
                    <option value="Expiring">即将到期</option>
                    <option value="Expired">已到期</option>
                    <option value="Terminated">已终止</option>
                  </select>
                ) : (
                  <input
                    type={key.includes('Date') ? 'date' : key.includes('rent') || key.includes('Rating') ? 'number' : 'text'}
                    name={key}
                    value={formData[key] || ''}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    className={`mt-1 block w-full rounded-md border text-sm px-3 py-2 ${errors[key] ? 'border-red-500' : 'border-[#dee0e3]'}`}
                    min={key.includes('rent') || key.includes('Rating') ? 1 : undefined}
                    max={key.includes('Rating') ? 5 : undefined}
                  />
                )}
                {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-[#dee0e3]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white border border-[#dee0e3] rounded-md hover:bg-gray-50">取消</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#3370ff] rounded-md hover:bg-[#285cc9]">保存合同</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== 删除确认弹窗 ====================

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contract: ContractItem | null;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, contract }) => {
  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-bold text-gray-900">删除合同</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                您确定要删除合同 <span className="font-semibold">{contract.contractNo}</span> 吗？
                此操作将永久删除该合同及其关联数据，且无法撤销。
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            确认删除
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

