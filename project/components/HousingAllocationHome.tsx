import React from 'react';
import {
  FileText,
  Home,
  ArrowLeftRight,
  History,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { View } from '../App';
import { UserRole } from '../types';

interface HousingAllocationHomeProps {
  onNavigate: (view: View) => void;
  userRole: UserRole;
}

const modules = [
  {
    id: 'allocation-approval' as View,
    title: '用房审批',
    desc: '用房申请审核、分级流转、批量审批及配房操作。',
    icon: FileText,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
  },
  {
    id: 'allocation-resource' as View,
    title: '房源分配',
    desc: '房源库存维护、可分配房源筛选、分配与导出。',
    icon: Home,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
  },
  {
    id: 'allocation-adjust' as View,
    title: '用房调整',
    desc: '调整申请审批、换房配房、临时借用到期提醒。',
    icon: ArrowLeftRight,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
  },
  {
    id: 'allocation-records' as View,
    title: '调整记录',
    desc: '调配记录查询、筛选与导出。',
    icon: History,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
  },
  {
    id: 'allocation-analytics' as View,
    title: '数据分析',
    desc: '申请与房源状态统计分析与可视化概览。',
    icon: BarChart3,
    color: 'bg-[#3370ff]',
    bg: 'bg-[#e1eaff]',
  },
];

const HousingAllocationHome: React.FC<HousingAllocationHomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1f2329]">公用房归口调配管理</h1>
        <p className="text-[#646a73]">请选择您需要办理的业务功能。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => onNavigate(mod.id)}
            className="group relative bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3] hover:shadow-md hover:border-[#3370ff] transition-all text-left"
          >
            <div className={`w-12 h-12 ${mod.bg} rounded-lg flex items-center justify-center mb-4 transition-transform`}>
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
    </div>
  );
};

export default HousingAllocationHome;









