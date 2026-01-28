import React from 'react';
import { ArrowRight, BarChart3, ClipboardCheck, FileDiff } from 'lucide-react';

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

const InventoryHomePage: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1f2329]">房产盘点核查</h1>
        <p className="text-[#646a73]">请选择您需要办理的子模块。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ShortcutCard
          title="盘点任务"
          description="发布任务、执行盘点、查看进度。"
          icon={ClipboardCheck}
          onClick={() => onNavigate('inventory-tasks')}
        />
        <ShortcutCard
          title="差异处理"
          description="问题下发、整改跟踪、复核闭环。"
          icon={FileDiff}
          onClick={() => onNavigate('inventory-discrepancies')}
        />
        <ShortcutCard
          title="统计分析"
          description="进度统计、类型分布、状态统计。"
          icon={BarChart3}
          onClick={() => onNavigate('inventory-analytics')}
        />
      </div>
    </div>
  );
};

export default InventoryHomePage;
