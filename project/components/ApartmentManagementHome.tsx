import React from 'react';
import { ArrowRight, BarChart3, ClipboardList, Home, Droplet, CreditCard } from 'lucide-react';
import { View } from '../App';
import { UserRole } from '../types';

interface ApartmentManagementHomeProps {
  onNavigate: (view: View) => void;
  userRole: UserRole;
}

const ApartmentManagementHome: React.FC<ApartmentManagementHomeProps> = ({ onNavigate }) => {
  const modules = [
    {
      id: 'apartment-overview' as View,
      title: '居住概览',
      desc: '周转房/宿舍总体概览、入住率与关键指标。',
      icon: BarChart3,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
    {
      id: 'apartment-applications' as View,
      title: '入住申请',
      desc: '入住申请受理、审批流转、分配与退宿。',
      icon: ClipboardList,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
    {
      id: 'apartment-rooms' as View,
      title: '房间管理',
      desc: '房间台账、入住/预留/维修状态与分配管理。',
      icon: Home,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
    {
      id: 'apartment-utilities' as View,
      title: '水电管理',
      desc: '水电抄表、账单生成、结算与查询。',
      icon: Droplet,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
    {
      id: 'apartment-deposits' as View,
      title: '押金管理',
      desc: '押金收取、扣除项、退还与对账。',
      icon: CreditCard,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1f2329]">公寓与宿舍管理</h1>
        <p className="text-[#646a73]">统一管理教师周转房与后续可扩展的学生宿舍业务。</p>
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
            <h3 className="text-lg font-bold text-[#1f2329] mb-2 group-hover:text-[#3370ff] transition-colors">{mod.title}</h3>
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

export default ApartmentManagementHome;









