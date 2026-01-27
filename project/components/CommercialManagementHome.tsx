import React from 'react';
import { ArrowRight, BarChart3, Home, FileText, DollarSign } from 'lucide-react';
import { View } from '../App';
import { UserRole } from '../types';

interface CommercialManagementHomeProps {
  onNavigate: (view: View) => void;
  userRole: UserRole;
}

const CommercialManagementHome: React.FC<CommercialManagementHomeProps> = ({ onNavigate }) => {
  const modules = [
    {
      id: 'commercial-overview' as View,
      title: '经营概览',
      desc: '经营性用房总体概览、空置与出租情况、关键指标。',
      icon: BarChart3,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
    {
      id: 'commercial-spaces' as View,
      title: '房源管理',
      desc: '商铺/产业用房房源维护、状态管理、招租信息。',
      icon: Home,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
    {
      id: 'commercial-contracts' as View,
      title: '合同管理',
      desc: '合同签订、续签/到期、租户信息维护。',
      icon: FileText,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
    {
      id: 'commercial-rent' as View,
      title: '租金管理',
      desc: '租金账单、缴费登记、欠费与催缴跟踪。',
      icon: DollarSign,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1f2329]">经营性用房管理</h1>
        <p className="text-[#646a73]">请选择您需要办理的经营性用房业务功能。</p>
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

export default CommercialManagementHome;

