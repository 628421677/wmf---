import React, { useMemo, useState } from 'react';
import { Building2, Search, Users, Home, Layers, ClipboardList } from 'lucide-react';
import PublicHouseOneRoomMultiPerson from './PublicHouseOneRoomMultiPerson';
import PublicHouseOnePersonMultiRoom from './PublicHouseOnePersonMultiRoom';
import PublicHouseDeptOverview from './PublicHouseDeptOverview';
import PublicHouseQuotaManagement from './PublicHouseQuotaManagement';
import PublicHouseRoomUsageQuery from './PublicHouseRoomUsageQuery';
import PublicHouseCommercialQuery from './PublicHouseCommercialQuery';
import { MOCK_DEPARTMENT_QUOTAS } from '../constants';

type FeatureKey = 'onePersonMultiRoom' | 'oneRoomMultiPerson' | 'deptOverview' | 'quotaQuery' | 'roomUsageQuery' | 'commercialQuery';

type TabDef = {
  key: FeatureKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

interface PublicHouseComprehensiveQueryProps {
  initialTab?: FeatureKey;
  hideTabNav?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
}

const tabs: TabDef[] = [
  { key: 'onePersonMultiRoom', label: '一人多房', icon: Users },
  { key: 'oneRoomMultiPerson', label: '一房多人', icon: Home },
  { key: 'deptOverview', label: '部门概况', icon: Building2 },
  { key: 'quotaQuery', label: '定额查询', icon: ClipboardList },
  { key: 'roomUsageQuery', label: '公用房查询', icon: Layers },
  { key: 'commercialQuery', label: '商用房查询', icon: Building2 },
];

const PublicHouseComprehensiveQuery: React.FC<PublicHouseComprehensiveQueryProps> = ({
  initialTab = 'onePersonMultiRoom',
  hideTabNav = false,
  pageTitle,
  pageSubtitle,
}) => {
  const [activeTab, setActiveTab] = useState<FeatureKey>(initialTab);
  const [keyword, setKeyword] = useState('');

  const activeTabLabel = useMemo(() => tabs.find(t => t.key === activeTab)?.label ?? '', [activeTab]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329] flex items-center gap-2">
            <Building2 size={24} className="text-[#3370ff]" />
            {pageTitle || '公房综合查询'}
          </h2>
          <p className="text-[#646a73]">{pageSubtitle || '面向公用房多维度查询与统计分析（结构已搭建，可逐步接入接口与查询条件）。'}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-white text-[#3370ff] shadow-sm' : 'text-[#646a73] hover:text-[#1f2329]'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a73]" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder={
                activeTab === 'onePersonMultiRoom'
                  ? '按人员编号/教师姓名/所属部门搜索...'
                  : activeTab === 'oneRoomMultiPerson'
                    ? '按序号/公用房编号/位置搜索...'
                    : activeTab === 'deptOverview'
                      ? '按部门编号/部门名称/部门类型搜索...'
                      : `在“${activeTabLabel}”中搜索（占位）...`
              }
              className="w-full pl-9 pr-3 py-2 border rounded text-sm"
            />
          </div>
          <button className="px-4 py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9] text-sm font-medium">查询</button>
          <button onClick={() => setKeyword('')} className="px-4 py-2 border rounded hover:bg-slate-50 text-sm font-medium text-[#1f2329]">
            重置
          </button>
        </div>
      </div>

      {activeTab === 'onePersonMultiRoom' ? (
        <PublicHouseOnePersonMultiRoom keyword={keyword} />
      ) : activeTab === 'oneRoomMultiPerson' ? (
        <PublicHouseOneRoomMultiPerson keyword={keyword} />
      ) : activeTab === 'deptOverview' ? (
        <PublicHouseDeptOverview keyword={keyword} />
      ) : activeTab === 'quotaQuery' ? (
        <PublicHouseQuotaManagement quotas={MOCK_DEPARTMENT_QUOTAS} />
      ) : activeTab === 'roomUsageQuery' ? (
        <PublicHouseRoomUsageQuery keyword={keyword} />
      ) : activeTab === 'commercialQuery' ? (
        <PublicHouseCommercialQuery keyword={keyword} />
      ) : (
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-bold text-[#1f2329]">{activeTabLabel}</h3>
            <p className="text-sm text-[#646a73] mt-1">该功能页面已创建：后续可在此处补充筛选条件、列表、详情与导出等能力。</p>
          </div>
          <div className="p-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-[#646a73]">当前为占位内容：{activeTabLabel}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicHouseComprehensiveQuery;
