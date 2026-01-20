import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  QrCode,
  Camera,
  AlertOctagon,
  FileDiff,
  CheckCircle2,
  X,
  ChevronRight,
} from 'lucide-react';

// --- MOCK DATA & TYPES ---
type TaskStatus = '进行中' | '已完成' | '待发布';
type DiscrepancyStatus = '待处理' | '信息更正中' | '资产处置中' | '已闭环';

interface InventoryTask {
  id: string;
  name: string;
  type: '年度全面盘点' | '部门自查' | '科研用房专项';
  status: TaskStatus;
  progress: number; // 0-100
}

interface DiscrepancyReport {
  id: string;
  location: string;
  issue: string;
  reporter: string;
  imageUrl?: string;
  status: DiscrepancyStatus;
}

const initTasks: InventoryTask[] = [
  { id: 'TSK-001', name: '2024年度全面盘点', type: '年度全面盘点', status: '进行中', progress: 75 },
  { id: 'TSK-002', name: '科研用房专项核查', type: '科研用房专项', status: '已完成', progress: 100 },
  { id: 'TSK-003', name: '2025年第一季度部门自查', type: '部门自查', status: '待发布', progress: 0 },
];

const initReports: DiscrepancyReport[] = [
  { id: 'REP-001', location: '理科实验楼 A座 301', issue: '私自隔断，面积与图纸不符', reporter: '张三', status: '信息更正中' },
  { id: 'REP-002', location: '学生宿舍三期 101', issue: '转租给校外人员使用', reporter: '李四', status: '资产处置中' },
];

// --- COMPONENT ---
const InventoryCheck: React.FC = () => {
  const [tasks, setTasks] = useState<InventoryTask[]>(initTasks);
  const [reports, setReports] = useState<DiscrepancyReport[]>(initReports);
  const [isScanModalOpen, setScanModalOpen] = useState(false);

  const getStatusBadge = (status: TaskStatus | DiscrepancyStatus) => {
    switch (status) {
      case '进行中': return 'bg-blue-100 text-blue-700';
      case '已完成':
      case '已闭环': return 'bg-green-100 text-green-700';
      case '待发布': return 'bg-gray-100 text-gray-600';
      case '待处理': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329] flex items-center gap-2">
            <ClipboardCheck size={24} className="text-[#3370ff]" />
            房产盘点核查
          </h2>
          <p className="text-[#646a73]">解决账实不符问题，支持常态化盘点与专项核查。</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium bg-[#3370ff] hover:bg-[#285cc9] text-white px-4 py-2 rounded">
          <Plus size={18} /> 发布盘点任务
        </button>
      </div>

      {/* Tasks Section */}
      <div className="bg-white border border-[#dee0e3] rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-[#1f2329] p-4 border-b">盘点任务列表</h3>
        <div className="space-y-2 p-4">
          {tasks.map(task => (
            <div key={task.id} className="border rounded-md p-3 flex items-center justify-between hover:border-[#3370ff]">
              <div>
                <p className="font-semibold">{task.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>{task.status}</span>
                  <span>类型: {task.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-40">
                  <div className="h-2 bg-slate-200 rounded-full"><div className="h-2 bg-[#3370ff] rounded-full" style={{ width: `${task.progress}%` }}></div></div>
                  <p className="text-xs text-right mt-1">{task.progress}%</p>
                </div>
                <button onClick={() => setScanModalOpen(true)} className="text-sm font-medium text-[#3370ff] hover:underline flex items-center gap-1">
                  执行盘点 <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discrepancy Reports Section */}
      <div className="bg-white border border-[#dee0e3] rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-[#1f2329] p-4 border-b flex items-center gap-2"><FileDiff size={20} /> 差异分析报告</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">位置</th>
                <th className="px-4 py-2 text-left">异常问题</th>
                <th className="px-4 py-2 text-left">上报人</th>
                <th className="px-4 py-2 text-left">状态</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{report.location}</td>
                  <td className="px-4 py-2">{report.issue}</td>
                  <td className="px-4 py-2 text-slate-500">{report.reporter}</td>
                  <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>{report.status}</span></td>
                  <td className="px-4 py-2"><button className="text-xs font-medium text-[#3370ff] hover:underline">处理</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scan Modal - Mobile Simulation */}
      {isScanModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setScanModalOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-lg shadow-lg p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold">移动盘点</h4>
              <button onClick={() => setScanModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="aspect-square bg-slate-800 rounded flex flex-col items-center justify-center text-white">
              <QrCode size={64} />
              <p className="mt-2 text-sm">请扫描门牌二维码</p>
            </div>
            <div className="mt-4 p-3 border rounded bg-slate-50">
              <p className="font-semibold">理科实验楼 A座 301</p>
              <p className="text-xs mt-1">账面信息: 科研-计算机学院-王老师</p>
            </div>
            <div className="mt-3 space-y-3">
              <button className="w-full flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                <CheckCircle2 size={16} /> 账实相符
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                <AlertOctagon size={16} /> 异常上报 <Camera size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryCheck;



