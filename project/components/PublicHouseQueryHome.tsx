import React from 'react';
import { ArrowRight, Users, Home, Building2, ClipboardList, Layers, Store } from 'lucide-react';
import { View } from '../App';

interface PublicHouseQueryHomeProps {
  onNavigate: (view: View) => void;
}

const PublicHouseQueryHome: React.FC<PublicHouseQueryHomeProps> = ({ onNavigate }) => {
  const modules = [
    {
      id: 'public-house-one-person-multi-room' as View,
      title: '一人多房',
      desc: '按人员维度查询名下使用的公用房信息。',
      icon: Users,
    },
    {
      id: 'public-house-one-room-multi-person' as View,
      title: '一房多人',
      desc: '按房间维度查询使用人员与分摊关系。',
      icon: Home,
    },
    {
      id: 'public-house-dept-overview' as View,
      title: '部门概况',
      desc: '按部门统计用房规模、结构与使用情况。',
      icon: Building2,
    },
    {
      id: 'public-house-quota' as View,
      title: '定额查询',
      desc: '部门定额与超额情况查询（可对接核算）。',
      icon: ClipboardList,
    },
    {
      id: 'public-house-room-usage' as View,
      title: '公用房查询',
      desc: '按房源/用途等维度综合检索公用房。',
      icon: Layers,
    },
    {
      id: 'public-house-commercial' as View,
      title: '商用房查询',
      desc: '经营性/商用房使用情况与明细查询。',
      icon: Store,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1f2329]">公房综合查询</h1>
        <p className="text-[#646a73]">请选择您需要查询的功能入口。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => onNavigate(mod.id)}
            className="group relative bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3] hover:shadow-md hover:border-[#3370ff] transition-all text-left"
          >
            <div className="w-12 h-12 bg-[#e1eaff] rounded-lg flex items-center justify-center mb-4">
              <mod.icon className="text-[#3370ff]" size={24} />
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

export default PublicHouseQueryHome;












