import React from 'react';
import { ArrowRight, Wrench, Building, BarChart3 } from 'lucide-react';
import { View } from '../App';
import { UserRole } from '../types';

interface MaintenanceHomeProps {
  onNavigate: (view: View) => void;
  userRole: UserRole;
}

const MaintenanceHome: React.FC<MaintenanceHomeProps> = ({ onNavigate }) => {
  const modules = [
    {
      id: 'maintenance-repair' as View,
      title: '维修工单',
      desc: '报修受理、智能派单、处理进度与评价闭环。',
      icon: Wrench,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
    {
      id: 'maintenance-property' as View,
      title: '物业服务',
      desc: '保洁、绿化、安保、搬迁等服务申请与跟踪。',
      icon: Building,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
    {
      id: 'maintenance-stats' as View,
      title: '数据统计',
      desc: '工单与服务统计分析、满意度与效率指标。',
      icon: BarChart3,
      color: 'bg-[#3370ff]',
      bg: 'bg-[#e1eaff]',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1f2329]">维修与物业服务</h1>
        <p className="text-[#646a73]">请选择您需要办理的维修与物业服务功能。</p>
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

export default MaintenanceHome;

