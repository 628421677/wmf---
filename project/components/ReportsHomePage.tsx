import React from 'react';
import { ArrowRight, BarChart3, FileSpreadsheet, History } from 'lucide-react';

const ShortcutCard = ({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3] hover:shadow-md hover:border-[#3370ff] transition-all text-left"
    >
      <div className="w-12 h-12 bg-[#e1eaff] rounded-lg flex items-center justify-center mb-4 transition-transform">
        <Icon className="text-[#3370ff]" size={24} />
      </div>
      <h3 className="text-lg font-bold text-[#1f2329] mb-2 group-hover:text-[#3370ff] transition-colors">{title}</h3>
      <p className="text-sm text-[#8f959e] leading-relaxed mb-6">{description}</p>
      <div className="absolute bottom-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
        <ArrowRight className="text-[#3370ff]" size={20} />
      </div>
    </button>
  );
};

const ReportsHomePage: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1f2329]">统计报表中心</h1>
        <p className="text-[#646a73]">请选择您需要进入的报表功能模块。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ShortcutCard
          title="教育部高基表"
          description="高基/教基报表生成、预览与导出。"
          icon={FileSpreadsheet}
          onClick={() => onNavigate('reports-standard')}
        />
        <ShortcutCard
          title="自定义报表"
          description="拖拽式设计，自定义分析与导出。"
          icon={BarChart3}
          onClick={() => onNavigate('reports-custom')}
        />
        <ShortcutCard
          title="操作日志"
          description="查看导出、生成、刷新等操作记录。"
          icon={History}
          onClick={() => onNavigate('reports-logs')}
        />
      </div>
    </div>
  );
};

export default ReportsHomePage;
