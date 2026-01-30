import React, { useMemo } from 'react';
import {
  ArrowRight,
  ClipboardCheck,
  FileSpreadsheet,
  History,
  Layers,
  LayoutGrid,
  ShieldCheck,
  Upload,
  FileText,
  Wallet,
  Building,
  AlertTriangle,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_PROJECTS } from '../constants';
import { AssetStatus, Project } from '../types';
import { normalizeAssetStatus } from '../utils/legacyAssetStatus';

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

const StatCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string | number;
  subtitle: string;
}> = ({ icon, iconBg, iconColor, title, value, subtitle }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-[#dee0e3] flex items-start gap-4">
    <div className={`p-3 ${iconBg} ${iconColor} rounded-md`}>{icon}</div>
    <div>
      <h3 className="font-medium text-[#646a73] text-sm">{title}</h3>
      <p className="text-2xl font-bold text-[#1f2329] mt-1">{value}</p>
      <p className="text-xs text-[#8f959e] mt-1">{subtitle}</p>
    </div>
  </div>
);

const AssetsHomePage: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const [projects] = useLocalStorage<Project[]>('uniassets-projects-v2', MOCK_PROJECTS);

  const stats = useMemo(() => {
    const normalized = projects.map(p => ({ ...p, status: normalizeAssetStatus((p as any).status) }));
    const archivedCount = normalized.filter(p => p.status === AssetStatus.Archived).length;

    return {
      pending: normalized.filter(p => p.status === AssetStatus.PendingReview).length,
      constructionAmount: normalized
        .filter(p => p.status !== AssetStatus.Archived)
        .reduce((acc, p) => acc + (p.contractAmount || 0), 0),
      completed: archivedCount,
      overdue: normalized.filter(p => p.isOverdue).length,
    };
  }, [projects]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1f2329]">资产转固与管理</h1>
        <p className="text-[#646a73]">请选择您需要进入的功能模块。</p>
      </div>

      {/* 统计卡片（与列表页口径一致） */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          title="待转固项目"
          value={stats.pending}
          subtitle="等待审计/财务核算"
        />
        <StatCard
          icon={<Wallet />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          title="在建工程总额"
          value={`¥${(stats.constructionAmount / 10000).toFixed(0)}万`}
          subtitle="已交付未决算"
        />
        <StatCard
          icon={<Building />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          title="已入账资产"
          value={stats.completed}
          subtitle="正式转固完成"
        />
        <StatCard
          icon={<AlertTriangle />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          title="超期预警"
          value={stats.overdue}
          subtitle="需及时处理"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ShortcutCard
          title="新建工程项目"
          description="录入基建/修缮项目，完善合同与里程碑信息。"
          icon={ClipboardCheck}
          onClick={() => onNavigate('assets-project-new')}
        />
        <ShortcutCard
          title="存量房产导入"
          description="批量导入存量房产数据（Excel），支持预览与校验。"
          icon={Upload}
          onClick={() => onNavigate('assets-stock-import')}
        />
        <ShortcutCard
          title="转固申请"
          description="发起转固流程申请，提交附件并推进节点。"
          icon={LayoutGrid}
          onClick={() => onNavigate('assets-apply')}
        />
        <ShortcutCard
          title="转固审核"
          description="审核转固申请，核验资料并完成归档。"
          icon={ShieldCheck}
          onClick={() => onNavigate('assets-review')}
        />
        <ShortcutCard
          title="高基表映射"
          description="维护资产字段与高基表口径映射关系。"
          icon={FileSpreadsheet}
          onClick={() => onNavigate('assets-gaojibiao')}
        />
        <ShortcutCard
          title="房间功能划分"
          description="对楼宇房间进行功能规划与用途划分。"
          icon={Layers}
          onClick={() => onNavigate('assets-room-functions')}
        />
        <ShortcutCard
          title="操作记录"
          description="查看关键操作与流程变更的审计日志。"
          icon={History}
          onClick={() => onNavigate('assets-audit-log')}
        />
      </div>
    </div>
  );
};

export default AssetsHomePage;
