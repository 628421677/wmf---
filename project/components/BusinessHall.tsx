import React, { useState } from 'react';
import {
  Building2,
  Key,
  Receipt,
  Store,
  Wrench,
  ClipboardCheck,
  ArrowRight,
  FileBarChart,
  X
} from 'lucide-react';
import { View } from '../App';
import { UserRole } from '../types';
import CommercialHousing from './CommercialHousing';

interface BusinessHallProps {
  onNavigate: (view: View) => void;
  userRole: UserRole;
}

const allModules = [
  {
    id: 'assets' as View,
    title: '资产建设与转固',
    desc: '基建工程录入、竣工验收、资产暂估与转固办理。',
    icon: Building2,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
    roles: [UserRole.AssetAdmin]
  },
  {
    id: 'allocation' as View,
    title: '公用房归口调配',
    desc: '公用房申请、分级审批、可视化选房及调配单生成。',
    icon: Key,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
    roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin]
  },
  {
    id: 'fees' as View,
    title: '公用房使用收费',
    desc: '年度核算、超额阶梯收费计算、账单生成与缴费管理。',
    icon: Receipt,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
    roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin]
  },
  {
    id: 'commercial' as View,
    title: '经营与周转房',
    desc: '商业房招租、合同管理、教师公寓入住与退宿结算。',
    icon: Store,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
    roles: [UserRole.AssetAdmin, UserRole.Teacher]
  },
  {
    id: 'maintenance' as View,
    title: '维修与物业',
    desc: '移动报修、LBS定位、智能派单及维修评价归档。',
    icon: Wrench,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
    roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin, UserRole.Teacher]
  },
  {
    id: 'inventory' as View,
    title: '房产盘点核查',
    desc: '年度盘点任务发布、移动端扫码核查、差异分析处理。',
    icon: ClipboardCheck,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
    roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin]
  },
  {
    id: 'reports' as View,
    title: '统计报表中心',
    desc: '高基表自动生成、自定义拖拽式报表设计与多格式导出。',
    icon: FileBarChart,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
    roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin]
  }
];

const BusinessHall: React.FC<BusinessHallProps> = ({ onNavigate, userRole }) => {
  const [showCommercial, setShowCommercial] = useState(false);
  const visibleModules = allModules.filter((m) => m.roles.includes(userRole));

  const handleModuleClick = (id: View) => {
    if (id === 'commercial') {
      setShowCommercial(true);
      return;
    }
    onNavigate(id);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1f2329]">业务办理大厅</h1>
        <p className="text-[#646a73]">集中式业务处理中心，请选择您需要办理的业务模块。</p>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleModules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => handleModuleClick(mod.id)}
            className="group relative bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3] hover:shadow-md hover:border-[#3370ff] transition-all text-left"
          >
            <div
              className={`w-12 h-12 ${mod.bg} rounded-lg flex items-center justify-center mb-4 transition-transform`}
            >
              <mod.icon className={mod.color.replace('bg-', 'text-')} size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1f2329] mb-2 group-hover:text-[#3370ff] transition-colors">
              {mod.title}
            </h3>
            <p className="text-sm text-[#8f959e] leading-relaxed mb-6">{mod.desc}</p>
            <div className="absolute bottom-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              <ArrowRight className="text-[#3370ff]" size={20} />
            </div>
          </button>
        ))}
      </div>

      {/* Footer banner */}
      <div className="bg-gradient-to-r from-[#2955d9] to-[#3370ff] rounded-lg p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <h3 className="text-xl font-bold mb-2">需要帮助？</h3>
          <p className="text-white/80 text-sm max-w-md">如果您在业务办理过程中遇到问题，可以查看操作手册或联系技术支持中心。</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-md font-medium transition-colors border border-white/20">
            下载操作手册
          </button>
          <button className="px-6 py-2.5 bg-white text-[#3370ff] rounded-md font-bold hover:bg-[#f5f6f7] transition-colors">
            联系支持
          </button>
        </div>
      </div>

      {/* Commercial overlay */}
      {showCommercial && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={() => setShowCommercial(false)}>
          <div
            className="w-full max-w-3xl bg-white h-full overflow-y-auto p-6 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#1f2329]">经营与周转房</h2>
              <button onClick={() => setShowCommercial(false)} className="text-[#646a73] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <CommercialHousing userRole={userRole} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessHall;

