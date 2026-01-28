import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileDiff,
  Filter,
  Image,
  Search,
  Send,
  X,
} from 'lucide-react';

type DiscrepancyType = '面积不符' | '用途变更' | '私自转租' | '空置闲置' | '私自隔断' | '其他';

type DiscrepancyStatus = '待处理' | '已下发整改通知' | '整改中' | '待复核' | '已闭环' | '已逾期';

type ProcessStep = '发现问题' | '下发通知' | '整改执行' | '复核验收' | '闭环归档';

interface ProcessRecord {
  step: ProcessStep;
  operator: string;
  time: string;
  remark: string;
  attachments?: string[];
}

interface DiscrepancyReport {
  id: string;
  taskId: string;
  location: string;
  building: string;
  room: string;
  discrepancyType: DiscrepancyType;
  issue: string;
  reporter: string;
  reporterDept: string;
  reportTime: string;
  images: string[];
  status: DiscrepancyStatus;
  responsibleDept: string;
  responsiblePerson: string;
  deadline?: string;
  currentStep: ProcessStep;
  processHistory: ProcessRecord[];
  accountInfo: string;
  actualInfo: string;
}

const initReports: DiscrepancyReport[] = [
  {
    id: 'REP-001',
    taskId: 'TSK-001',
    location: '理科实验楼 A座 301',
    building: '理科实验楼A座',
    room: '301',
    discrepancyType: '私自隔断',
    issue: '私自隔断，面积与图纸不符，原80㎡被隔成两间',
    reporter: '张三',
    reporterDept: '资产处',
    reportTime: '2024-03-15 14:30',
    images: ['/placeholder1.jpg', '/placeholder2.jpg'],
    status: '整改中',
    responsibleDept: '计算机学院',
    responsiblePerson: '王老师',
    deadline: '2024-04-15',
    currentStep: '整改执行',
    accountInfo: '科研用房-计算机学院-80㎡',
    actualInfo: '被隔断为两间，各约40㎡',
    processHistory: [
      { step: '发现问题', operator: '张三', time: '2024-03-15 14:30', remark: '现场盘点发现私自隔断' },
      { step: '下发通知', operator: '林科长', time: '2024-03-16 09:00', remark: '已下发整改通知书，要求15日内恢复原状' },
    ],
  },
  {
    id: 'REP-002',
    taskId: 'TSK-001',
    location: '学生宿舍三期 101',
    building: '学生宿舍三期',
    room: '101',
    discrepancyType: '私自转租',
    issue: '转租给校外人员使用，用于经营快递代收点',
    reporter: '李四',
    reporterDept: '后勤处',
    reportTime: '2024-03-18 10:15',
    images: ['/placeholder3.jpg'],
    status: '已下发整改通知',
    responsibleDept: '后勤处',
    responsiblePerson: '刘主管',
    deadline: '2024-04-01',
    currentStep: '下发通知',
    accountInfo: '学生宿舍-后勤处管理',
    actualInfo: '被转租用于快递代收',
    processHistory: [
      { step: '发现问题', operator: '李四', time: '2024-03-18 10:15', remark: '巡查发现违规转租' },
      { step: '下发通知', operator: '林科长', time: '2024-03-19 08:30', remark: '已下发整改通知，要求立即清退' },
    ],
  },
  {
    id: 'REP-003',
    taskId: 'TSK-001',
    location: '行政楼 502',
    building: '行政楼',
    room: '502',
    discrepancyType: '空置闲置',
    issue: '房间长期空置，无人使用超过6个月',
    reporter: '王五',
    reporterDept: '资产处',
    reportTime: '2024-03-20 16:00',
    images: [],
    status: '待处理',
    responsibleDept: '校办',
    responsiblePerson: '待确认',
    deadline: undefined,
    currentStep: '发现问题',
    accountInfo: '办公用房-校办-45㎡',
    actualInfo: '空置闲置',
    processHistory: [{ step: '发现问题', operator: '王五', time: '2024-03-20 16:00', remark: '盘点发现长期空置' }],
  },
  {
    id: 'REP-004',
    taskId: 'TSK-001',
    location: '实训中心 B栋 201',
    building: '实训中心B栋',
    room: '201',
    discrepancyType: '用途变更',
    issue: '原实训室改为仓库使用，未经审批',
    reporter: '赵六',
    reporterDept: '机械学院',
    reportTime: '2024-03-22 11:30',
    images: ['/placeholder4.jpg', '/placeholder5.jpg'],
    status: '待复核',
    responsibleDept: '机械学院',
    responsiblePerson: '李老师',
    deadline: '2024-04-10',
    currentStep: '复核验收',
    accountInfo: '实训用房-机械学院-120㎡',
    actualInfo: '改为仓库存放设备',
    processHistory: [
      { step: '发现问题', operator: '赵六', time: '2024-03-22 11:30', remark: '自查发现用途变更' },
      { step: '下发通知', operator: '林科长', time: '2024-03-23 09:00', remark: '要求恢复原用途或补办变更手续' },
      { step: '整改执行', operator: '李老师', time: '2024-04-05 15:00', remark: '已清理仓储物品，恢复实训功能' },
    ],
  },
];

const getStatusBadge = (status: DiscrepancyStatus) => {
  const styles: Record<string, string> = {
    待处理: 'bg-yellow-100 text-yellow-700',
    已下发整改通知: 'bg-orange-100 text-orange-700',
    整改中: 'bg-purple-100 text-purple-700',
    待复核: 'bg-cyan-100 text-cyan-700',
    已闭环: 'bg-green-100 text-green-700',
    已逾期: 'bg-red-100 text-red-700',
  };
  return styles[status] || 'bg-gray-100 text-gray-600';
};

const getDiscrepancyTypeBadge = (type: DiscrepancyType) => {
  const styles: Record<DiscrepancyType, string> = {
    面积不符: 'bg-blue-50 text-blue-600 border-blue-200',
    用途变更: 'bg-amber-50 text-amber-600 border-amber-200',
    私自转租: 'bg-red-50 text-red-600 border-red-200',
    空置闲置: 'bg-gray-50 text-gray-600 border-gray-200',
    私自隔断: 'bg-purple-50 text-purple-600 border-purple-200',
    其他: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return styles[type];
};

const InventoryDiscrepanciesPage: React.FC = () => {
  const [reports, setReports] = useState<DiscrepancyReport[]>(initReports);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [selectedReport, setSelectedReport] = useState<DiscrepancyReport | null>(null);
  const [isReportDetailOpen, setReportDetailOpen] = useState(false);
  const [isProcessModalOpen, setProcessModalOpen] = useState(false);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (filterStatus !== 'all' && report.status !== filterStatus) return false;
      if (filterType !== 'all' && report.discrepancyType !== filterType) return false;
      if (searchKeyword && !report.location.includes(searchKeyword) && !report.issue.includes(searchKeyword)) return false;
      return true;
    });
  }, [reports, filterStatus, filterType, searchKeyword]);

  const advanceProcess = (reportId: string, nextStep: ProcessStep, remark: string) => {
    const statusMap: Record<ProcessStep, DiscrepancyStatus> = {
      发现问题: '待处理',
      下发通知: '已下发整改通知',
      整改执行: '整改中',
      复核验收: '待复核',
      闭环归档: '已闭环',
    };

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        return {
          ...r,
          currentStep: nextStep,
          status: statusMap[nextStep],
          processHistory: [
            ...r.processHistory,
            {
              step: nextStep,
              operator: '当前用户',
              time: new Date().toLocaleString('zh-CN'),
              remark,
            },
          ],
        };
      })
    );

    setProcessModalOpen(false);
  };

  const total = reports.length;
  const pending = reports.filter((r) => r.status === '待处理').length;
  const inProgress = reports.filter((r) => r.status === '整改中').length;
  const review = reports.filter((r) => r.status === '待复核').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">差异总数</p>
          <p className="text-2xl font-bold text-[#1f2329]">{total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">待处理</p>
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">整改中</p>
          <p className="text-2xl font-bold text-purple-600">{inProgress}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-[#646a73]">待复核</p>
          <p className="text-2xl font-bold text-cyan-600">{review}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#1f2329] flex items-center gap-2">
          <FileDiff size={24} className="text-[#3370ff]" />
          差异处理
        </h2>
        <p className="text-[#646a73]">对盘点发现的账实差异进行整改下发、跟踪、复核与闭环。</p>
      </div>

      <div className="flex gap-4 items-center bg-white border rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#646a73]" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
            <option value="all">全部状态</option>
            <option value="待处理">待处理</option>
            <option value="已下发整改通知">已下发整改通知</option>
            <option value="整改中">整改中</option>
            <option value="待复核">待复核</option>
            <option value="已闭环">已闭环</option>
            <option value="已逾期">已逾期</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
            <option value="all">全部类型</option>
            <option value="面积不符">面积不符</option>
            <option value="用途变更">用途变更</option>
            <option value="私自转租">私自转租</option>
            <option value="空置闲置">空置闲置</option>
            <option value="私自隔断">私自隔断</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646a73]" />
          <input
            type="text"
            placeholder="搜索位置或问题描述..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border rounded text-sm"
          />
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[#646a73]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">位置</th>
              <th className="px-4 py-3 text-left font-medium">问题类型</th>
              <th className="px-4 py-3 text-left font-medium">问题描述</th>
              <th className="px-4 py-3 text-left font-medium">责任单位</th>
              <th className="px-4 py-3 text-left font-medium">整改期限</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-[#1f2329]">{report.location}</div>
                  <div className="text-xs text-[#646a73]">{report.reportTime}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${getDiscrepancyTypeBadge(report.discrepancyType)}`}>{report.discrepancyType}</span>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="truncate" title={report.issue}>
                    {report.issue}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div>{report.responsibleDept}</div>
                  <div className="text-xs text-[#646a73]">{report.responsiblePerson}</div>
                </td>
                <td className="px-4 py-3">{report.deadline ? report.deadline : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>{report.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setReportDetailOpen(true);
                      }}
                      className="text-xs text-[#3370ff] hover:underline"
                    >
                      详情
                    </button>
                    {report.status !== '已闭环' && (
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setProcessModalOpen(true);
                        }}
                        className="text-xs text-[#3370ff] hover:underline"
                      >
                        处理
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isReportDetailOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setReportDetailOpen(false)}>
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold">差异详情 - {selectedReport.id}</h4>
              <button onClick={() => setReportDetailOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-[#646a73]">位置</p>
                  <p className="font-medium">{selectedReport.location}</p>
                </div>
                <div>
                  <p className="text-sm text-[#646a73]">问题类型</p>
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${getDiscrepancyTypeBadge(selectedReport.discrepancyType)}`}>{selectedReport.discrepancyType}</span>
                </div>
                <div>
                  <p className="text-sm text-[#646a73]">账面信息</p>
                  <p>{selectedReport.accountInfo}</p>
                </div>
                <div>
                  <p className="text-sm text-[#646a73]">实际情况</p>
                  <p className="text-red-600">{selectedReport.actualInfo}</p>
                </div>
                <div>
                  <p className="text-sm text-[#646a73]">责任单位</p>
                  <p>
                    {selectedReport.responsibleDept} - {selectedReport.responsiblePerson}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#646a73]">整改期限</p>
                  <p>{selectedReport.deadline || '未设置'}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-[#646a73] mb-1">问题描述</p>
                <p className="p-3 bg-slate-50 rounded">{selectedReport.issue}</p>
              </div>

              {selectedReport.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-[#646a73] mb-2">现场照片</p>
                  <div className="flex gap-2">
                    {selectedReport.images.map((_, idx) => (
                      <div key={idx} className="w-24 h-24 bg-slate-200 rounded flex items-center justify-center">
                        <Image size={32} className="text-[#646a73]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-[#646a73] mb-2">处理流程</p>
                <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-4">
                  {selectedReport.processHistory.map((record, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] w-3 h-3 bg-[#3370ff] rounded-full border-2 border-white" />
                      <div className="bg-slate-50 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{record.step}</span>
                          <span className="text-xs text-[#646a73]">{record.time}</span>
                        </div>
                        <p className="text-sm">{record.remark}</p>
                        <p className="text-xs text-[#646a73] mt-1">操作人: {record.operator}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setProcessModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold">处理差异 - {selectedReport.location}</h4>
              <button onClick={() => setProcessModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-[#646a73]">当前状态</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedReport.status)}`}>{selectedReport.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => advanceProcess(selectedReport.id, '下发通知', '已下发整改通知书')}
                  className="py-2 bg-[#3370ff] text-white rounded hover:bg-[#285cc9] flex items-center justify-center gap-2"
                >
                  <Send size={16} /> 下发通知
                </button>
                <button
                  onClick={() => advanceProcess(selectedReport.id, '闭环归档', '复核通过，问题已解决')}
                  className="py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> 闭环
                </button>
              </div>

              <div className="text-xs text-[#646a73] flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5" />
                这里为演示版处理动作：点击后会推进流程并记录一条处理记录。
              </div>

              <div>
                <p className="text-sm font-medium mb-2">整改后照片（示例）</p>
                <div className="flex gap-2">
                  <div className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-[#646a73] cursor-pointer">
                    <Camera size={24} />
                    <span className="text-xs mt-1">上传</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDiscrepanciesPage;
