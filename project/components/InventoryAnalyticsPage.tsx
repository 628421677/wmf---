import React, { useMemo } from 'react';
import { BarChart3, Bell, PieChart, RefreshCw, TrendingUp } from 'lucide-react';

type DiscrepancyType = '面积不符' | '用途变更' | '私自转租' | '空置闲置' | '私自隔断' | '其他';

type DiscrepancyStatus = '待处理' | '已下发整改通知' | '整改中' | '待复核' | '已闭环' | '已逾期';

interface DeptProgress {
  deptId: string;
  deptName: string;
  total: number;
  checked: number;
  matched: number;
  discrepancy: number;
  progress: number;
}

interface DiscrepancyReport {
  id: string;
  discrepancyType: DiscrepancyType;
  status: DiscrepancyStatus;
}

const deptProgressData: DeptProgress[] = [
  { deptId: 'D001', deptName: '计算机学院', total: 180, checked: 165, matched: 158, discrepancy: 7, progress: 92 },
  { deptId: 'D002', deptName: '机械学院', total: 220, checked: 180, matched: 172, discrepancy: 8, progress: 82 },
  { deptId: 'D003', deptName: '土木学院', total: 200, checked: 150, matched: 145, discrepancy: 5, progress: 75 },
  { deptId: 'D004', deptName: '电气学院', total: 160, checked: 140, matched: 136, discrepancy: 4, progress: 88 },
  { deptId: 'D005', deptName: '后勤处', total: 320, checked: 200, matched: 185, discrepancy: 15, progress: 63 },
  { deptId: 'D006', deptName: '图书馆', total: 200, checked: 125, matched: 122, discrepancy: 3, progress: 63 },
];

const reports: DiscrepancyReport[] = [
  { id: 'REP-001', discrepancyType: '私自隔断', status: '整改中' },
  { id: 'REP-002', discrepancyType: '私自转租', status: '已下发整改通知' },
  { id: 'REP-003', discrepancyType: '空置闲置', status: '待处理' },
  { id: 'REP-004', discrepancyType: '用途变更', status: '待复核' },
];

const InventoryAnalyticsPage: React.FC = () => {
  const stats = useMemo(() => {
    const discrepancyByType: Record<DiscrepancyType, number> = {
      面积不符: 0,
      用途变更: 0,
      私自转租: 0,
      空置闲置: 0,
      私自隔断: 0,
      其他: 0,
    };
    for (const r of reports) discrepancyByType[r.discrepancyType]++;

    return {
      pendingReports: reports.filter((r) => r.status === '待处理').length,
      closedReports: reports.filter((r) => r.status === '已闭环').length,
      inProgressReports: reports.filter((r) => r.status === '整改中').length,
      reviewReports: reports.filter((r) => r.status === '待复核').length,
      discrepancyByType,
      totalReports: reports.length,
    };
  }, []);

  const sendReminder = (deptName: string) => {
    alert(`已向 ${deptName} 发送催办通知！`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">部门总数</p>
          <p className="text-2xl font-bold text-[#1f2329]">{deptProgressData.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">平均完成率</p>
          <p className="text-2xl font-bold text-[#3370ff]">{Math.round(deptProgressData.reduce((a, b) => a + b.progress, 0) / deptProgressData.length)}%</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">差异总数</p>
          <p className="text-2xl font-bold text-[#1f2329]">{stats.totalReports}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">待处理差异</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329] flex items-center gap-2">
            <BarChart3 size={24} className="text-[#3370ff]" />
            统计分析
          </h2>
          <p className="text-[#646a73]">盘点进度、差异类型分布与处理状态统计。</p>
        </div>
        <button className="text-sm text-[#3370ff] hover:underline flex items-center gap-1">
          <RefreshCw size={14} /> 刷新数据
        </button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-[#1f2329] flex items-center gap-2">
            <TrendingUp size={18} /> 各部门盘点进度
          </h3>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[#646a73]">
              <tr>
                <th className="px-4 py-2 text-left">部门</th>
                <th className="px-4 py-2 text-center">应盘数</th>
                <th className="px-4 py-2 text-center">已盘数</th>
                <th className="px-4 py-2 text-center">账实相符</th>
                <th className="px-4 py-2 text-center">存在差异</th>
                <th className="px-4 py-2 text-left">完成进度</th>
                <th className="px-4 py-2 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deptProgressData.map((dept) => (
                <tr key={dept.deptId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{dept.deptName}</td>
                  <td className="px-4 py-3 text-center">{dept.total}</td>
                  <td className="px-4 py-3 text-center">{dept.checked}</td>
                  <td className="px-4 py-3 text-center text-green-600">{dept.matched}</td>
                  <td className="px-4 py-3 text-center text-red-600">{dept.discrepancy}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${dept.progress < 70 ? 'bg-red-500' : dept.progress < 90 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${dept.progress}%` }}
                        />
                      </div>
                      <span className="text-xs w-10">{dept.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {dept.progress < 80 && (
                      <button
                        onClick={() => sendReminder(dept.deptName)}
                        className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 flex items-center gap-1 mx-auto"
                      >
                        <Bell size={12} /> 催办
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-bold text-[#1f2329] flex items-center gap-2 mb-4">
            <PieChart size={18} /> 差异类型分布
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.discrepancyByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-200 rounded-full">
                    <div
                      className="h-2 bg-[#3370ff] rounded-full"
                      style={{ width: stats.totalReports ? `${(count / stats.totalReports) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-bold text-[#1f2329] flex items-center gap-2 mb-4">
            <BarChart3 size={18} /> 处理状态统计
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
              <p className="text-xs text-[#646a73]">待处理</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.inProgressReports}</p>
              <p className="text-xs text-[#646a73]">整改中</p>
            </div>
            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <p className="text-2xl font-bold text-cyan-600">{stats.reviewReports}</p>
              <p className="text-xs text-[#646a73]">待复核</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.closedReports}</p>
              <p className="text-xs text-[#646a73]">已闭环</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalyticsPage;

