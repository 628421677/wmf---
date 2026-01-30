import React from 'react';
import { ArrowRight, BarChart3, Users, Receipt, CreditCard, Bell } from 'lucide-react';
import { View } from '../App';
import { UserRole } from '../types';

interface FeeManagementHomeProps {
  onNavigate: (view: View) => void;
  userRole: UserRole;
}

const FeeManagementHome: React.FC<FeeManagementHomeProps> = ({ onNavigate, userRole }) => {
  const isAssetAdmin = userRole === UserRole.AssetAdmin;

  const modules = [
    {
      id: 'fees-overview' as View,
      title: '费用总览',
      desc: '年度收费核算概览、部门费用清单、统计图表与导出。',
      icon: BarChart3,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
      visible: true,
    },
    {
      id: 'fees-persons' as View,
      title: '个人缴费',
      desc: '个人用房计费、个人账单生成与缴费管理。',
      icon: Users,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
      visible: true,
    },
    {
      id: 'fees-bills' as View,
      title: '账单管理',
      desc: '账单生成、确认流转、争议处理与财务扣款。',
      icon: Receipt,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
      visible: true,
    },
    {
      id: 'fees-payments' as View,
      title: '缴费记录',
      desc: '缴费流水查询、导出与对账。',
      icon: CreditCard,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
      visible: true,
    },
    {
      id: 'fees-reminders' as View,
      title: '催缴管理',
      desc: '催缴通知发送、跟踪与历史记录。',
      icon: Bell,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
      visible: isAssetAdmin,
    },
  ].filter(m => m.visible);

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1f2329]">校内公用房使用收费管理</h1>
        <p className="text-[#646a73]">请选择您需要办理的收费管理功能。</p>
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

export default FeeManagementHome;









