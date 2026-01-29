import React, { useMemo, useState } from 'react';
import { List, Search, Filter } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_PROJECTS } from '../constants';
import { AuditLog, Project, UserRole } from '../types';

// Helper functions (originally from AssetTransfer.tsx)
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    archive: '归档',
    status_change: '状态变更',
  };
  return labels[action] || action;
};

const getFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    status: '项目状态',
    name: '项目名称',
    contractor: '承建单位',
    contractAmount: '合同金额',
    fundSource: '资金来源',
    location: '建设地点',
    plannedArea: '规划面积',
    projectManager: '项目负责人',
    supervisor: '监理单位',
    plannedStartDate: '计划开工日期',
    plannedEndDate: '计划竣工日期',
    actualStartDate: '实际开工日期',
    actualEndDate: '实际竣工日期',
    auditAmount: '审计金额',
    auditReductionRate: '审减率',
  };
  return labels[field] || field;
};

const AssetsAuditLogPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [projects] = useLocalStorage<Project[]>('uniassets-projects-v2', MOCK_PROJECTS);
  const [auditLogs] = useLocalStorage<AuditLog[]>('uniassets-audit-logs', []);

  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const projectOptions = useMemo(() => {
    const fromProjects = projects.map(p => ({ id: p.id, name: p.name }));
    const fromLogs = auditLogs
      .filter(l => l.entityType === 'project')
      .map(l => ({ id: l.entityId, name: l.entityName }))
      .filter(x => x.id && x.name);

    const map = new Map<string, string>();
    for (const p of [...fromProjects, ...fromLogs]) {
      if (!map.has(p.id)) map.set(p.id, p.name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [projects, auditLogs]);

  const filteredLogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const startMs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : undefined;
    const endMs = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : undefined;

    return [...auditLogs]
      .filter(log => {
        if (projectFilter !== 'all') {
          if (log.entityType !== 'project') return false;
          if (log.entityId !== projectFilter) return false;
        }

        if (startMs !== undefined || endMs !== undefined) {
          const t = new Date(log.timestamp).getTime();
          if (Number.isFinite(startMs) && startMs !== undefined && t < startMs) return false;
          if (Number.isFinite(endMs) && endMs !== undefined && t > endMs) return false;
        }

        if (!q) return true;

        return (
          log.entityName.toLowerCase().includes(q) ||
          log.entityId.toLowerCase().includes(q) ||
          log.operator.toLowerCase().includes(q) ||
          getActionLabel(log.action).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs, searchTerm, projectFilter, startDate, endDate]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329] flex items-center gap-2">
          <List size={24} /> 操作记录 (审计日志)
        </h2>
        <p className="text-[#646a73]">查看系统内所有关键操作与流程变更的审计日志。</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-[#dee0e3] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
              <input
                type="text"
                placeholder="搜索项目名称、ID、操作人..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm focus:border-[#3370ff] outline-none"
              />
            </div>

            <div className="relative">
              <select
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-[#dee0e3] rounded-md text-sm focus:border-[#3370ff] outline-none appearance-none bg-white"
              >
                <option value="all">全部项目</option>
                {projectOptions.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f959e] pointer-events-none" />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                max={endDate || new Date().toISOString().split('T')[0]}
                className="flex-1 px-3 py-2 border border-[#dee0e3] rounded-md text-sm focus:border-[#3370ff] outline-none"
                placeholder="开始日期"
              />
              <span className="text-gray-400">至</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
                className="flex-1 px-3 py-2 border border-[#dee0e3] rounded-md text-sm focus:border-[#3370ff] outline-none"
                placeholder="结束日期"
              />
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setProjectFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm text-[#646a73] hover:bg-[#f2f3f5] transition-colors whitespace-nowrap"
            >
              清空筛选
            </button>
          </div>
          
          <div className="text-xs text-[#8f959e] flex items-center gap-2">
            <span>共 {filteredLogs.length} 条记录</span>
            {(projectFilter !== 'all' || startDate || endDate || searchTerm) && (
              <span className="flex-1 text-right">
                {projectFilter !== 'all' && `项目: ${projectOptions.find(p => p.id === projectFilter)?.name || projectFilter} · `}
                {startDate && `从 ${startDate} `}
                {endDate && `到 ${endDate}`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#dee0e3] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#dee0e3]">
          <h3 className="font-semibold text-[#1f2329]">日志列表</h3>
        </div>
        <div className="p-6 space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">暂无操作记录</div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map(log => (
                <div key={log.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{log.entityName}</div>
                      <div className="text-sm text-gray-500">
                        {getActionLabel(log.action)} · {formatDate(log.timestamp)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.operator} ({log.operatorRole})
                    </div>
                  </div>
                  {log.changedFields && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                      {Object.entries(log.changedFields).map(([field, { old: oldValue, new: newValue }]) => (
                        <div key={field} className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500">{getFieldLabel(field)}:</span>
                          <span className="line-through text-red-500">{String(oldValue)}</span>
                          <span className="text-green-600">{String(newValue)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetsAuditLogPage;

