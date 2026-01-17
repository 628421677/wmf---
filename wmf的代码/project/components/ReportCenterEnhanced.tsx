import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, FileText, Download, BarChart, Plus, Settings, CheckCircle2, RefreshCw,
  Table, PieChart, Filter, ArrowDownToLine, X, Search, Calendar, Building2, AlertTriangle,
  TrendingUp, TrendingDown, Eye, FileDown, Bell, History, ChevronDown, CheckSquare,
  Square, Clock, MapPin, Layers, FileWarning, ArrowRight, Info, BarChart3, LineChart
} from 'lucide-react';
import { UserRole } from '../types';

interface ReportCenterEnhancedProps {
  userRole: UserRole;
}

// 扩展的高基表数据
const HIGH_BASE_REPORTS = [
  { id: 'HB-511', name: '高基 511 - 占地面积及校舍建筑面积', status: 'Ready', lastUpdated: '2025-01-15', source: '土地/楼宇台账', category: '土地房屋' },
  { id: 'HB-512', name: '高基 512 - 固定资产情况', status: 'Ready', lastUpdated: '2025-01-15', source: '资产台账', category: '固定资产' },
  { id: 'HB-513', name: '高基 513 - 教学、科研仪器设备资产情况', status: 'Ready', lastUpdated: '2025-01-14', source: '设备资产库', category: '仪器设备' },
  { id: 'HB-521', name: '高基 521 - 教学行政用房情况', status: 'Generating', lastUpdated: '---', source: '公用房台账', category: '土地房屋' },
  { id: 'HB-522', name: '高基 522 - 学生宿舍情况', status: 'Ready', lastUpdated: '2025-01-15', source: '宿舍台账', category: '土地房屋' },
  { id: 'EDU-5374', name: '教基 5374 - 实验室及仪器设备', status: 'Error', lastUpdated: '2025-01-01', source: '设备资产库', category: '仪器设备', errorDetail: '3台设备缺少分类编码' },
  { id: 'EDU-5377', name: '教基 5377 - 在建工程情况', status: 'Ready', lastUpdated: '2025-01-15', source: '基建项目库', category: '基建工程' },
  { id: 'EDU-5378', name: '教基 5378 - 图书馆情况', status: 'Ready', lastUpdated: '2025-01-12', source: '图书馆系统', category: '图书资料' },
];

// 历史数据（用于对比）
const HISTORICAL_DATA: Record<string, { year: number; value: number }[]> = {
  'HB-511': [
    { year: 2021, value: 285000 },
    { year: 2022, value: 298000 },
    { year: 2023, value: 312000 },
    { year: 2024, value: 325000 },
    { year: 2025, value: 338500 },
  ],
  'HB-512': [
    { year: 2021, value: 45000 },
    { year: 2022, value: 52000 },
    { year: 2023, value: 58000 },
    { year: 2024, value: 63000 },
    { year: 2025, value: 68000 },
  ],
};

// 自定义报表
const CUSTOM_REPORTS = [
  { id: 'CUST-001', name: '各学院人均办公面积统计表', type: 'Excel', author: '张管理员', date: '2025-01-10', shared: true },
  { id: 'CUST-002', name: '全校科研用房利用率分析报告', type: 'PDF', author: '李主任', date: '2025-01-12', shared: false },
  { id: 'CUST-003', name: '2024年度资产增减变动汇总', type: 'Excel', author: '王科长', date: '2025-01-08', shared: true },
  { id: 'CUST-004', name: '实验室设备使用效率分析', type: 'PDF', author: '张管理员', date: '2025-01-05', shared: false },
];

// 报表模板库
const REPORT_TEMPLATES = [
  { id: 'TPL-001', name: '资产分类汇总模板', description: '按资产类别统计数量和金额', fields: ['资产类别', '数量', '原值', '净值'] },
  { id: 'TPL-002', name: '部门资产对比模板', description: '各部门资产配置对比分析', fields: ['部门', '设备数', '房屋面积', '人均面积'] },
  { id: 'TPL-003', name: '年度变动分析模板', description: '资产增减变动趋势分析', fields: ['月份', '新增', '报废', '调拨', '净增'] },
];

// 操作日志
const OPERATION_LOGS = [
  { id: 1, action: '导出报表', target: 'HB-511', user: '张管理员', time: '2025-01-15 14:30', ip: '192.168.1.100' },
  { id: 2, action: '生成报表', target: 'HB-512', user: '系统自动', time: '2025-01-15 08:00', ip: '系统' },
  { id: 3, action: '预览报表', target: 'EDU-5377', user: '李主任', time: '2025-01-14 16:45', ip: '192.168.1.105' },
  { id: 4, action: '数据刷新', target: '全部数据源', user: '张管理员', time: '2025-01-14 09:00', ip: '192.168.1.100' },
];

// 校区列表
const CAMPUSES = ['全部校区', '旗山校区', '鳝溪校区', '浦东校区'];
const YEARS = ['2025', '2024', '2023', '2022', '2021'];
const CATEGORIES = ['全部类别', '土地房屋', '固定资产', '仪器设备', '基建工程', '图书资料'];

const ReportCenterEnhanced: React.FC<ReportCenterEnhancedProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'custom' | 'logs'>('standard');
  const [previewingReport, setPreviewingReport] = useState<typeof HIGH_BASE_REPORTS[0] | null>(null);
  const [showTrendModal, setShowTrendModal] = useState<string | null>(null);
  const [showErrorDetail, setShowErrorDetail] = useState<typeof HIGH_BASE_REPORTS[0] | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // 筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedCampus, setSelectedCampus] = useState('全部校区');
  const [selectedCategory, setSelectedCategory] = useState('全部类别');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  
  // 导出格式选择
  const [showExportMenu, setShowExportMenu] = useState<string | null>(null);

  // 筛选后的报表
  const filteredReports = useMemo(() => {
    return HIGH_BASE_REPORTS.filter(report => {
      const matchKeyword = searchKeyword === '' || 
        report.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        report.id.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchCategory = selectedCategory === '全部类别' || report.category === selectedCategory;
      return matchKeyword && matchCategory;
    });
  }, [searchKeyword, selectedCategory]);

  // 统计信息
  const stats = useMemo(() => {
    const total = HIGH_BASE_REPORTS.length;
    const ready = HIGH_BASE_REPORTS.filter(r => r.status === 'Ready').length;
    const generating = HIGH_BASE_REPORTS.filter(r => r.status === 'Generating').length;
    const error = HIGH_BASE_REPORTS.filter(r => r.status === 'Error').length;
    return { total, ready, generating, error };
  }, []);

  const toggleSelectReport = (id: string) => {
    setSelectedReports(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(r => r.id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col relative">
      {/* 头部 */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329]">统计报表中心</h2>
          <p className="text-[#646a73]">教育部高基表自动生成与自定义数据挖掘分析</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#dee0e3] rounded text-sm text-[#646a73] hover:bg-[#f2f3f5] transition-colors">
            <Bell size={16} /> 订阅提醒
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#dee0e3] rounded text-sm text-[#646a73] hover:bg-[#f2f3f5] transition-colors">
            <RefreshCw size={16} /> 刷新数据源
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#646a73]">报表总数</p>
              <p className="text-2xl font-bold text-[#1f2329] mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-[#f0f5ff] rounded-lg">
              <FileSpreadsheet size={24} className="text-[#3370ff]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#646a73]">已生成</p>
              <p className="text-2xl font-bold text-[#059669] mt-1">{stats.ready}</p>
            </div>
            <div className="p-3 bg-[#ecfdf5] rounded-lg">
              <CheckCircle2 size={24} className="text-[#059669]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#646a73]">生成中</p>
              <p className="text-2xl font-bold text-[#3370ff] mt-1">{stats.generating}</p>
            </div>
            <div className="p-3 bg-[#eff6ff] rounded-lg">
              <Clock size={24} className="text-[#3370ff]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#646a73]">数据异常</p>
              <p className="text-2xl font-bold text-[#f54a45] mt-1">{stats.error}</p>
            </div>
            <div className="p-3 bg-[#fef2f2] rounded-lg">
              <AlertTriangle size={24} className="text-[#f54a45]" />
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-[#dee0e3]">
        <button 
          onClick={() => setActiveTab('standard')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'standard' ? 'border-[#3370ff] text-[#3370ff]' : 'border-transparent text-[#646a73] hover:text-[#1f2329]'}`}
        >
          <FileSpreadsheet size={18} /> 教育部高基表
        </button>
        <button 
          onClick={() => setActiveTab('custom')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'custom' ? 'border-[#3370ff] text-[#3370ff]' : 'border-transparent text-[#646a73] hover:text-[#1f2329]'}`}
        >
          <BarChart size={18} /> 自定义报表
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-[#3370ff] text-[#3370ff]' : 'border-transparent text-[#646a73] hover:text-[#1f2329]'}`}
        >
          <History size={18} /> 操作日志
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 bg-white rounded-lg border border-[#dee0e3] shadow-sm overflow-hidden flex flex-col min-h-0">
        
        {/* 标准报表 */}
        {activeTab === 'standard' && (
          <div className="flex flex-col h-full">
            {/* 筛选栏 */}
            <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
              <div className="flex items-center gap-4 flex-wrap">
                {/* 搜索框 */}
                <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
                  <input
                    type="text"
                    placeholder="搜索报表名称或代码..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#dee0e3] rounded-md text-sm focus:outline-none focus:border-[#3370ff]"
                  />
                </div>
                
                {/* 年度选择 */}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#646a73]" />
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 border border-[#dee0e3] rounded-md text-sm focus:outline-none focus:border-[#3370ff]"
                  >
                    {YEARS.map(year => <option key={year} value={year}>{year}年度</option>)}
                  </select>
                </div>

                {/* 校区选择 */}
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#646a73]" />
                  <select 
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    className="px-3 py-2 border border-[#dee0e3] rounded-md text-sm focus:outline-none focus:border-[#3370ff]"
                  >
                    {CAMPUSES.map(campus => <option key={campus} value={campus}>{campus}</option>)}
                  </select>
                </div>

                {/* 类别选择 */}
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-[#646a73]" />
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-[#dee0e3] rounded-md text-sm focus:outline-none focus:border-[#3370ff]"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* 批量操作 */}
                {selectedReports.length > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-[#646a73]">已选 {selectedReports.length} 项</span>
                    <button className="px-3 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] flex items-center gap-1">
                      <Download size={14} /> 批量导出
                    </button>
                    <button className="px-3 py-2 border border-[#dee0e3] rounded-md text-sm text-[#646a73] hover:bg-[#f2f3f5]">
                      批量生成
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 数据校验状态 */}
            <div className="mx-4 mt-4">
              <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-4 flex items-start gap-3">
                <div className="p-1 bg-[#10b981] rounded-full text-white mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#065f46] font-bold text-sm">数据源自检通过</h4>
                    <span className="text-xs text-[#047857]">上次检查: 2025-01-15 08:00</span>
                  </div>
                  <p className="text-[#047857] text-xs mt-1">
                    系统已自动校验土地、房屋、设备及人事数据库，数据完整性 99.8%。
                    <button className="text-[#059669] underline ml-2">查看详细报告</button>
                  </p>
                </div>
              </div>
            </div>

            {/* 报表列表 */}
            <div className="flex-1 overflow-auto p-4">
              <div className="overflow-hidden border border-[#dee0e3] rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f5f6f7] text-[#646a73] font-medium border-b border-[#dee0e3]">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <button onClick={toggleSelectAll} className="text-[#646a73] hover:text-[#3370ff]">
                          {selectedReports.length === filteredReports.length && filteredReports.length > 0 ? 
                            <CheckSquare size={18} className="text-[#3370ff]" /> : <Square size={18} />}
                        </button>
                      </th>
                      <th className="px-4 py-3">报表代码</th>
                      <th className="px-4 py-3">报表名称</th>
                      <th className="px-4 py-3">类别</th>
                      <th className="px-4 py-3">数据来源</th>
                      <th className="px-4 py-3">更新日期</th>
                      <th className="px-4 py-3">状态</th>
                      <th className="px-4 py-3">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dee0e3]">
                    {filteredReports.map(report => (
                      <tr key={report.id} className="hover:bg-[#f9f9f9] transition-colors">
                        <td className="px-4 py-4">
                          <button onClick={() => toggleSelectReport(report.id)} className="text-[#646a73] hover:text-[#3370ff]">
                            {selectedReports.includes(report.id) ? 
                              <CheckSquare size={18} className="text-[#3370ff]" /> : <Square size={18} />}
                          </button>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs font-medium text-[#646a73]">{report.id}</td>
                        <td className="px-4 py-4 font-medium text-[#1f2329]">{report.name}</td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 bg-[#f0f5ff] text-[#3370ff] text-xs rounded">{report.category}</span>
                        </td>
                        <td className="px-4 py-4 text-[#646a73]">{report.source}</td>
                        <td className="px-4 py-4 text-[#646a73]">{report.lastUpdated}</td>
                        <td className="px-4 py-4">
                          {report.status === 'Ready' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ecfdf5] text-[#059669]">已生成</span>
                          )}
                          {report.status === 'Generating' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#eff6ff] text-[#3370ff] animate-pulse">计算中...</span>
                          )}
                          {report.status === 'Error' && (
                            <button 
                              onClick={() => setShowErrorDetail(report)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#fef2f2] text-[#f54a45] hover:bg-[#fee2e2]"
                            >
                              <AlertTriangle size={12} /> 数据异常
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setPreviewingReport(report)} 
                              disabled={report.status !== 'Ready'} 
                              className="p-1.5 text-[#646a73] hover:text-[#3370ff] hover:bg-[#f0f5ff] rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="预览"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => setShowTrendModal(report.id)}
                              className="p-1.5 text-[#646a73] hover:text-[#3370ff] hover:bg-[#f0f5ff] rounded"
                              title="历史趋势"
                            >
                              <TrendingUp size={16} />
                            </button>
                            <div className="relative">
                              <button 
                                onClick={() => setShowExportMenu(showExportMenu === report.id ? null : report.id)}
                                disabled={report.status !== 'Ready'} 
                                className="p-1.5 text-[#646a73] hover:text-[#3370ff] hover:bg-[#f0f5ff] rounded disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                                title="导出"
                              >
                                <Download size={16} />
                                <ChevronDown size={12} />
                              </button>
                              {showExportMenu === report.id && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-[#dee0e3] rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-[#f2f3f5] flex items-center gap-2">
                                    <FileSpreadsheet size={14} className="text-[#059669]" /> Excel
                                  </button>
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-[#f2f3f5] flex items-center gap-2">
                                    <FileText size={14} className="text-[#f54a45]" /> PDF
                                  </button>
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-[#f2f3f5] flex items-center gap-2">
                                    <FileText size={14} className="text-[#3370ff]" /> Word
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 自定义报表 */}
        {activeTab === 'custom' && (
          <div className="flex h-full">
            {/* 侧边栏 */}
            <div className="w-72 border-r border-[#dee0e3] flex flex-col bg-[#fcfcfd]">
              <div className="p-4 border-b border-[#dee0e3] space-y-2">
                <button className="w-full bg-[#3370ff] hover:bg-[#285cc9] text-white py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors">
                  <Plus size={16} /> 新建报表
                </button>
                <button 
                  onClick={() => setShowTemplates(true)}
                  className="w-full border border-[#dee0e3] hover:bg-[#f2f3f5] text-[#646a73] py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Layers size={16} /> 从模板创建
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <div className="px-3 py-2 text-xs font-bold text-[#8f959e] flex items-center justify-between">
                  <span>我的报表</span>
                  <span className="bg-[#e1eaff] text-[#3370ff] px-1.5 py-0.5 rounded text-xs">{CUSTOM_REPORTS.length}</span>
                </div>
                {CUSTOM_REPORTS.map(rep => (
                  <div key={rep.id} className="p-3 rounded-md hover:bg-[#e1eaff] cursor-pointer group transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {rep.type === 'Excel' ? <FileSpreadsheet size={16} className="text-[#059669]"/> : <FileText size={16} className="text-[#f54a45]"/>}
                        <span className="text-sm font-medium text-[#1f2329] truncate w-40">{rep.name}</span>
                      </div>
                      {rep.shared && <span className="text-xs text-[#3370ff]">已共享</span>}
                    </div>
                    <div className="text-xs text-[#8f959e] pl-6 flex justify-between">
                      <span>{rep.author} · {rep.date}</span>
                      <ArrowDownToLine size={14} className="opacity-0 group-hover:opacity-100 text-[#3370ff]"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 设计器区域 */}
            <div className="flex-1 bg-[#f5f6f7] p-6 flex flex-col">
              <div className="bg-white rounded-lg shadow-lg border border-[#dee0e3] flex-1 flex flex-col">
                {/* 工具栏 */}
                <div className="flex items-center gap-2 border-b border-[#dee0e3] p-4">
                  <div className="flex items-center gap-1 border-r border-[#dee0e3] pr-4 mr-2">
                    <button className="p-2 hover:bg-[#f2f3f5] rounded" title="表格"><Table size={18} className="text-[#646a73]"/></button>
                    <button className="p-2 hover:bg-[#f2f3f5] rounded" title="饼图"><PieChart size={18} className="text-[#646a73]"/></button>
                    <button className="p-2 hover:bg-[#f2f3f5] rounded" title="柱状图"><BarChart3 size={18} className="text-[#646a73]"/></button>
                    <button className="p-2 hover:bg-[#f2f3f5] rounded" title="折线图"><LineChart size={18} className="text-[#646a73]"/></button>
                  </div>
                  <div className="flex items-center gap-1 border-r border-[#dee0e3] pr-4 mr-2">
                    <button className="p-2 hover:bg-[#f2f3f5] rounded" title="筛选"><Filter size={18} className="text-[#646a73]"/></button>
                    <button className="p-2 hover:bg-[#f2f3f5] rounded" title="设置"><Settings size={18} className="text-[#646a73]"/></button>
                  </div>
                  <div className="flex-1"></div>
                  <button className="px-3 py-1.5 text-sm text-[#646a73] hover:bg-[#f5f6f7] rounded">预览</button>
                  <button className="px-3 py-1.5 text-sm bg-[#3370ff] text-white hover:bg-[#285cc9] rounded">保存</button>
                </div>

                {/* 画布 */}
                <div className="flex-1 p-6 flex">
                  {/* 字段面板 */}
                  <div className="w-48 border-r border-[#dee0e3] pr-4 mr-4">
                    <h4 className="text-sm font-medium text-[#1f2329] mb-3">可用字段</h4>
                    <div className="space-y-2">
                      {['部门名称', '资产类别', '定额面积', '实占面积', '超欠面积', '使用率', '资产原值', '资产净值'].map(field => (
                        <div key={field} className="px-3 py-2 bg-[#f5f6f7] rounded text-sm text-[#646a73] cursor-move hover:bg-[#e1eaff] hover:text-[#3370ff] transition-colors">
                          {field}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 设计区 */}
                  <div className="flex-1 border-2 border-dashed border-[#dee0e3] rounded-lg bg-[#fcfcfd] flex flex-col items-center justify-center text-[#8f959e] gap-3">
                    <div className="p-4 bg-white rounded-full shadow-sm">
                      <BarChart size={32} className="text-[#3370ff] opacity-50" />
                    </div>
                    <p>拖拽左侧字段到此处生成图表</p>
                    <p className="text-xs">支持表格、柱状图、饼图、折线图等多种展示形式</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 操作日志 */}
        {activeTab === 'logs' && (
          <div className="p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-[#1f2329]">操作记录</h3>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 border border-[#dee0e3] rounded-md text-sm">
                  <option>全部操作</option>
                  <option>导出报表</option>
                  <option>生成报表</option>
                  <option>预览报表</option>
                  <option>数据刷新</option>
                </select>
                <input type="date" className="px-3 py-2 border border-[#dee0e3] rounded-md text-sm" />
              </div>
            </div>
            
            <div className="border border-[#dee0e3] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#f5f6f7] text-[#646a73]">
                  <tr>
                    <th className="px-4 py-3 text-left">操作类型</th>
                    <th className="px-4 py-3 text-left">操作对象</th>
                    <th className="px-4 py-3 text-left">操作人</th>
                    <th className="px-4 py-3 text-left">操作时间</th>
                    <th className="px-4 py-3 text-left">IP地址</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dee0e3]">
                  {OPERATION_LOGS.map(log => (
                    <tr key={log.id} className="hover:bg-[#f9f9f9]">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.action === '导出报表' ? 'bg-[#ecfdf5] text-[#059669]' :
                          log.action === '生成报表' ? 'bg-[#eff6ff] text-[#3370ff]' :
                          log.action === '预览报表' ? 'bg-[#fef3c7] text-[#d97706]' :
                          'bg-[#f3f4f6] text-[#6b7280]'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#1f2329]">{log.target}</td>
                      <td className="px-4 py-3 text-[#646a73]">{log.user}</td>
                      <td className="px-4 py-3 text-[#646a73]">{log.time}</td>
                      <td className="px-4 py-3 text-[#8f959e] font-mono text-xs">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-[#646a73]">
              <span>共 {OPERATION_LOGS.length} 条记录</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-[#dee0e3] rounded hover:bg-[#f2f3f5]">上一页</button>
                <span className="px-3 py-1">1 / 1</span>
                <button className="px-3 py-1 border border-[#dee0e3] rounded hover:bg-[#f2f3f5]">下一页</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 报表预览弹窗 */}
      {previewingReport && (
        <ReportPreviewModal report={previewingReport} onClose={() => setPreviewingReport(null)} />
      )}

      {/* 历史趋势弹窗 */}
      {showTrendModal && (
        <TrendModal reportId={showTrendModal} onClose={() => setShowTrendModal(null)} />
      )}

      {/* 数据异常详情弹窗 */}
      {showErrorDetail && (
        <ErrorDetailModal report={showErrorDetail} onClose={() => setShowErrorDetail(null)} />
      )}

      {/* 模板选择弹窗 */}
      {showTemplates && (
        <TemplateModal onClose={() => setShowTemplates(false)} />
      )}
    </div>
  );
};

// 报表预览弹窗组件
const ReportPreviewModal: React.FC<{report: typeof HIGH_BASE_REPORTS[0], onClose: () => void}> = ({ report, onClose }) => {
  const tdClass = "border border-black p-1";
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-lg shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg text-[#1f2329]">预览: {report.name}</h3>
            <p className="text-sm text-[#646a73]">数据更新时间: {report.lastUpdated}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-[#dee0e3] rounded text-sm hover:bg-[#f2f3f5] flex items-center gap-1">
              <Download size={14} /> 导出
            </button>
            <button onClick={onClose} className="text-[#646a73] hover:text-[#1f2329] p-1">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6 flex-1 overflow-auto custom-scrollbar">
          <table className="w-full border-collapse text-center text-xs" style={{border: '1px solid #000'}}>
            <thead>
              <tr className="font-semibold">
                <td rowSpan={3} className={tdClass}>编号</td>
                <td colSpan={4} className={tdClass}>学校产权校舍建筑面积</td>
                <td rowSpan={3} className={tdClass + " align-middle"}>正在施工<br/>校舍建筑面积</td>
                <td colSpan={3} className={tdClass}>非学校产权校舍建筑面积</td>
              </tr>
              <tr className="font-semibold">
                <td rowSpan={2} className={tdClass + " align-middle"}>计</td>
                <td colSpan={3} className={tdClass}>其中</td>
                <td rowSpan={2} className={tdClass + " align-middle"}>合计</td>
                <td rowSpan={2} className={tdClass + " align-middle"}>独立使用</td>
                <td rowSpan={2} className={tdClass + " align-middle"}>共同使用</td>
              </tr>
              <tr className="font-semibold">
                <td className={tdClass}>危房</td>
                <td className={tdClass}>当年新增校舍</td>
                <td className={tdClass}>被外单位借用</td>
              </tr>
            </thead>
            <tbody>
              <tr><td className={tdClass + " text-left font-semibold"}>总 计</td><td className={tdClass}>338500</td><td className={tdClass}></td><td className={tdClass}>13500</td><td className={tdClass}></td><td className={tdClass}>15000</td><td className={tdClass}>8500</td><td className={tdClass}>5000</td><td className={tdClass}>3500</td></tr>
              <tr><td className={tdClass + " text-left font-semibold"}>一、教学科研及辅助用房</td><td className={tdClass}>125000</td><td className={tdClass}></td><td className={tdClass}>5000</td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td></tr>
              <tr><td className={tdClass + " text-left pl-4"}>教室</td><td className={tdClass}>68162</td><td className={tdClass}></td><td className={tdClass}>2000</td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td></tr>
              <tr><td className={tdClass + " text-left pl-4"}>图书馆</td><td className={tdClass}>15000</td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td></tr>
              <tr><td className={tdClass + " text-left pl-4"}>实验室、实习场所</td><td className={tdClass}>28000</td><td className={tdClass}></td><td className={tdClass}>3000</td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td></tr>
              <tr><td className={tdClass + " text-left pl-4"}>体育馆</td><td className={tdClass}>3836</td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td></tr>
              <tr><td className={tdClass + " text-left font-semibold"}>二、行政办公用房</td><td className={tdClass}>13299</td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td></tr>
              <tr><td className={tdClass + " text-left font-semibold"}>三、生活用房</td><td className={tdClass}>132446</td><td className={tdClass}></td><td className={tdClass}>8500</td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td></tr>
              <tr><td className={tdClass + " text-left pl-4"}>学生宿舍(公寓)</td><td className={tdClass}>110576</td><td className={tdClass}></td><td className={tdClass}>8500</td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td></tr>
              <tr><td className={tdClass + " text-left pl-4"}>学生食堂</td><td className={tdClass}>16700</td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td></tr>
              <tr><td className={tdClass + " text-left font-semibold"}>四、教工住宅</td><td className={tdClass}>81785</td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td><td className={tdClass}></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 历史趋势弹窗组件
const TrendModal: React.FC<{reportId: string, onClose: () => void}> = ({ reportId, onClose }) => {
  const data = HISTORICAL_DATA[reportId] || [
    { year: 2021, value: 100000 },
    { year: 2022, value: 110000 },
    { year: 2023, value: 120000 },
    { year: 2024, value: 130000 },
    { year: 2025, value: 140000 },
  ];
  
  const maxValue = Math.max(...data.map(d => d.value));
  const latestChange = data.length >= 2 ? 
    ((data[data.length - 1].value - data[data.length - 2].value) / data[data.length - 2].value * 100).toFixed(1) : 0;
  const isPositive = Number(latestChange) >= 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-[#1f2329]">历史数据趋势</h3>
            <p className="text-sm text-[#646a73]">报表代码: {reportId}</p>
          </div>
          <button onClick={onClose} className="text-[#646a73] hover:text-[#1f2329]">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {/* 同比变化 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 bg-[#f5f6f7] rounded-lg p-4">
              <p className="text-sm text-[#646a73]">最新数据</p>
              <p className="text-2xl font-bold text-[#1f2329]">{data[data.length - 1].value.toLocaleString()}</p>
            </div>
            <div className={`flex-1 rounded-lg p-4 ${isPositive ? 'bg-[#ecfdf5]' : 'bg-[#fef2f2]'}`}>
              <p className="text-sm text-[#646a73]">同比变化</p>
              <p className={`text-2xl font-bold flex items-center gap-1 ${isPositive ? 'text-[#059669]' : 'text-[#f54a45]'}`}>
                {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {isPositive ? '+' : ''}{latestChange}%
              </p>
            </div>
          </div>

          {/* 简易柱状图 */}
          <div className="border border-[#dee0e3] rounded-lg p-4">
            <h4 className="text-sm font-medium text-[#1f2329] mb-4">近5年数据变化</h4>
            <div className="flex items-end justify-between gap-4 h-40">
              {data.map((item, index) => (
                <div key={item.year} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-[#3370ff] rounded-t transition-all hover:bg-[#285cc9]"
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                  ></div>
                  <p className="text-xs text-[#646a73] mt-2">{item.year}</p>
                  <p className="text-xs font-medium text-[#1f2329]">{(item.value / 10000).toFixed(1)}万</p>
                </div>
              ))}
            </div>
          </div>

          {/* 数据表格 */}
          <div className="mt-4 border border-[#dee0e3] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f6f7]">
                <tr>
                  <th className="px-4 py-2 text-left text-[#646a73]">年度</th>
                  <th className="px-4 py-2 text-right text-[#646a73]">数值</th>
                  <th className="px-4 py-2 text-right text-[#646a73]">同比变化</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee0e3]">
                {data.map((item, index) => {
                  const prevValue = index > 0 ? data[index - 1].value : item.value;
                  const change = ((item.value - prevValue) / prevValue * 100).toFixed(1);
                  return (
                    <tr key={item.year}>
                      <td className="px-4 py-2 text-[#1f2329]">{item.year}年</td>
                      <td className="px-4 py-2 text-right text-[#1f2329]">{item.value.toLocaleString()}</td>
                      <td className={`px-4 py-2 text-right ${Number(change) >= 0 ? 'text-[#059669]' : 'text-[#f54a45]'}`}>
                        {index === 0 ? '-' : `${Number(change) >= 0 ? '+' : ''}${change}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// 数据异常详情弹窗
const ErrorDetailModal: React.FC<{report: typeof HIGH_BASE_REPORTS[0], onClose: () => void}> = ({ report, onClose }) => {
  const errorItems = [
    { id: 'ERR-001', field: '设备分类编码', asset: '激光共聚焦显微镜', assetId: 'SB-2024-0156', issue: '分类编码为空', suggestion: '补充设备分类编码' },
    { id: 'ERR-002', field: '设备分类编码', asset: '高效液相色谱仪', assetId: 'SB-2024-0203', issue: '分类编码为空', suggestion: '补充设备分类编码' },
    { id: 'ERR-003', field: '设备分类编码', asset: '原子吸收光谱仪', assetId: 'SB-2024-0218', issue: '分类编码为空', suggestion: '补充设备分类编码' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#fef2f2] rounded-lg">
              <FileWarning size={20} className="text-[#f54a45]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#1f2329]">数据异常详情</h3>
              <p className="text-sm text-[#646a73]">{report.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#646a73] hover:text-[#1f2329]">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {/* 异常摘要 */}
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-[#f54a45] mt-0.5" />
              <div>
                <p className="font-medium text-[#991b1b]">发现 {errorItems.length} 条数据异常</p>
                <p className="text-sm text-[#b91c1c] mt-1">{report.errorDetail || '部分数据缺失或格式不正确，请修正后重新生成报表'}</p>
              </div>
            </div>
          </div>

          {/* 异常列表 */}
          <div className="border border-[#dee0e3] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f6f7]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#646a73]">资产名称</th>
                  <th className="px-4 py-3 text-left text-[#646a73]">资产编号</th>
                  <th className="px-4 py-3 text-left text-[#646a73]">异常字段</th>
                  <th className="px-4 py-3 text-left text-[#646a73]">问题描述</th>
                  <th className="px-4 py-3 text-left text-[#646a73]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee0e3]">
                {errorItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#f9f9f9]">
                    <td className="px-4 py-3 text-[#1f2329]">{item.asset}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#646a73]">{item.assetId}</td>
                    <td className="px-4 py-3 text-[#646a73]">{item.field}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-[#fef2f2] text-[#f54a45] text-xs rounded">{item.issue}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-[#3370ff] hover:text-[#285cc9] text-sm flex items-center gap-1">
                        去修正 <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 操作按钮 */}
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-[#646a73]">
              <Info size={16} />
              <span>修正数据后，点击"重新生成"更新报表</span>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-[#dee0e3] rounded text-sm text-[#646a73] hover:bg-[#f2f3f5]">
                导出异常清单
              </button>
              <button className="px-4 py-2 bg-[#3370ff] text-white rounded text-sm hover:bg-[#285cc9]">
                重新生成报表
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 模板选择弹窗
const TemplateModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-[#1f2329]">选择报表模板</h3>
            <p className="text-sm text-[#646a73]">从预设模板快速创建自定义报表</p>
          </div>
          <button onClick={onClose} className="text-[#646a73] hover:text-[#1f2329]">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {REPORT_TEMPLATES.map(template => (
              <div 
                key={template.id} 
                className="border border-[#dee0e3] rounded-lg p-4 hover:border-[#3370ff] hover:bg-[#f0f5ff] cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#f0f5ff] rounded-lg group-hover:bg-white">
                      <FileSpreadsheet size={20} className="text-[#3370ff]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1f2329]">{template.name}</h4>
                      <p className="text-sm text-[#646a73] mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {template.fields.map(field => (
                          <span key={field} className="px-2 py-0.5 bg-[#f5f6f7] text-[#646a73] text-xs rounded">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-[#3370ff] text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    使用
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCenterEnhanced;
