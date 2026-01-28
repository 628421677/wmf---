import React from 'react';
import { BarChart3, ClipboardCheck, FileDiff, ArrowRight } from 'lucide-react';

const StatCard = ({ title, value, hint }: { title: string; value: string | number; hint?: string }) => {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-sm text-[#646a73]">{title}</p>
      <p className="text-2xl font-bold text-[#1f2329]">{value}</p>
      {hint ? <p className="text-xs text-[#8f959e] mt-1">{hint}</p> : null}
    </div>
  );
};

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
      className="text-left bg-white border rounded-lg p-4 hover:border-[#3370ff] hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3370ff]/10 flex items-center justify-center">
            <Icon size={18} className="text-[#3370ff]" />
          </div>
          <div>
            <p className="font-semibold text-[#1f2329]">{title}</p>
            <p className="text-sm text-[#646a73] mt-1">{description}</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-[#8f959e] mt-1" />
      </div>
    </button>
  );
};

const InventoryHomePage: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329]">房产盘点核查</h2>
        <p className="text-[#646a73]">总览盘点进度与差异闭环情况，并快速进入任务/差异/统计模块。</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="进行中任务" value={2} hint="本期处于执行阶段" />
        <StatCard title="待处理差异" value={3} hint="建议优先处理逾期" />
        <StatCard title="已闭环" value={6} hint="累计完成闭环" />
        <StatCard title="总体完成率" value="75%" hint="按已盘/应盘估算" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ShortcutCard
          title="盘点任务"
          description="发布任务、执行盘点、查看进度"
          icon={ClipboardCheck}
          onClick={() => onNavigate('inventory-tasks')}
        />
        <ShortcutCard
          title="差异处理"
          description="问题下发、整改跟踪、复核闭环"
          icon={FileDiff}
          onClick={() => onNavigate('inventory-discrepancies')}
        />
        <ShortcutCard
          title="统计分析"
          description="进度统计、类型分布、趋势分析"
          icon={BarChart3}
          onClick={() => onNavigate('inventory-analytics')}
        />
      </div>
    </div>
  );
};

export default InventoryHomePage;

