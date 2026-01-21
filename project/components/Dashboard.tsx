import React, { useRef, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  AlertCircle, 
  Activity,
  UserCheck,
  ClipboardList,
  Map as MapIcon,
  Layers,
  ZoomIn,
  ArrowLeft,
  Maximize,
  Users,
  ShieldAlert,
  Wallet,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { UserRole } from '../types';
import { MOCK_ALERTS } from '../constants';
import Campus3DView, { Campus3DViewHandle } from './Campus3DView';

interface DashboardProps {
  userRole: UserRole;
  onEnterBigScreen?: () => void;
}

// Mock Data for Visualizations
const ASSET_TREND_DATA = [
  { month: '5月', value: 12.5, construction: 4.2 },
  { month: '6月', value: 12.8, construction: 3.8 },
  { month: '7月', value: 13.2, construction: 5.1 },
  { month: '8月', value: 14.5, construction: 4.5 },
  { month: '9月', value: 15.1, construction: 3.2 },
  { month: '10月', value: 15.8, construction: 2.1 },
];

const ASSET_TYPE_DATA = [
  { name: '教学科研', value: 45, color: '#3370ff' },
  { name: '行政办公', value: 15, color: '#4e83fd' },
  { name: '学生宿舍', value: 25, color: '#85aaff' },
  { name: '后勤服务', value: 10, color: '#adc8ff' },
  { name: '经营性用房', value: 5, color: '#dbeafe' },
];

const DEPARTMENT_EFFICIENCY_DATA = [
  { name: '机械学院', quota: 12000, actual: 11500 },
  { name: '土木工程', quota: 9800, actual: 10200 },
  { name: '信息学院', quota: 8500, actual: 8100 },
  { name: '建筑学院', quota: 7200, actual: 7200 },
  { name: '经管学院', quota: 5000, actual: 5800 },
];

// Mock Buildings for GIS
const GIS_BUILDINGS = [
    { id: 'B1', name: '行政楼', x: 20, y: 30, w: 15, h: 15, height: 40, type: 'Admin', vacancy: 0.05, density: 'Low', excess: 0 },
    { id: 'B2', name: '理科实验楼', x: 45, y: 20, w: 25, h: 20, height: 60, type: 'Teaching', vacancy: 0.02, density: 'High', excess: 1 },
    { id: 'B3', name: '图书馆', x: 40, y: 55, w: 20, h: 20, height: 30, type: 'Teaching', vacancy: 0.1, density: 'Medium', excess: 0 },
    { id: 'B4', name: '机械学院楼', x: 15, y: 60, w: 18, h: 25, height: 50, type: 'Teaching', vacancy: 0.0, density: 'High', excess: 2 },
    { id: 'B5', name: '学生公寓A', x: 75, y: 30, w: 15, h: 40, height: 55, type: 'Student', vacancy: 0.15, density: 'High', excess: 0 },
    { id: 'B6', name: '创新创业中心', x: 75, y: 80, w: 15, h: 15, height: 25, type: 'Commercial', vacancy: 0.3, density: 'Low', excess: 0 },
];
const AlertLogModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
        <div className="bg-white w-full max-w-4xl h-[80vh] rounded-lg shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <h3 className="font-bold text-lg text-[#1f2329]">全部预警日志</h3>
            <button onClick={onClose} className="text-[#646a73] hover:text-[#1f2329]">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {MOCK_ALERTS.map(alert => {
                const alertType = alert.type.includes('合同') ? 'contract' : alert.type.includes('安全') ? 'safety' : alert.type.includes('欠费') ? 'fee' : 'quota';
                let url = '';
                if (alert.type.includes('安全隐患')) {
                    url = '/business-hall/maintenance-and-property';
                }

                return (
                    <AlertItem 
                        key={alert.id}
                        type={alertType}
                        title={alert.type}
                        desc={alert.details}
                        time={alert.timestamp}
                        level={alert.priority.toLowerCase() as 'high' | 'medium' | 'low'}
                        url={url}
                    />
                );
            })}
          </div>
        </div>
      </div>
    );
  }

const Dashboard: React.FC<DashboardProps> = ({ userRole, onEnterBigScreen }) => {
  // GIS State
  const [mapView, setMapView] = useState<'campus' | 'building'>('campus');
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [mapOverlay, setMapOverlay] = useState<'none' | 'vacancy' | 'density' | 'excess'>('none');
    const [showAllAlerts, setShowAllAlerts] = useState(false);
  const campus3DViewRef = useRef<Campus3DViewHandle>(null);


  // 1. Asset Admin View (Global)
  if (userRole === UserRole.AssetAdmin) {
    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1f2329]">领导驾驶舱 & 决策中心</h1>
            <p className="text-[#8f959e] text-sm mt-1">数据截止时间: 2023-11-15 12:00:00 (实时)</p>
          </div>
          <div className="flex gap-3">
              <button className="bg-white text-[#1f2329] border border-[#dee0e3] px-4 py-2 rounded text-sm font-medium hover:bg-[#f2f3f5] transition-colors">
                  导出报表
              </button>
              <button onClick={onEnterBigScreen} className="bg-[#3370ff] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#285cc9] transition-colors shadow-sm">
                  进入大屏模式
              </button>
          </div>
        </div>

        {/* --- Leadership Cockpit KPIs --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
              title="固定资产总值" 
              value="¥ 15.8 亿" 
              trend="+4.6%" 
              isPositive={true} 
              icon={DollarSign}
              subtext="较上月增长 7,000 万"
          />
          <KpiCard 
              title="生均教学行政用房" 
              value="18.5 m²/生" 
              trend="-0.2%" 
              isPositive={false} 
              icon={Users}
              subtext="教育部合格标准: 14 m²"
          />
          <KpiCard 
              title="有偿使用费回收" 
              value="82.4%" 
              trend="+12%" 
              isPositive={true} 
              icon={Wallet}
              subtext="本年度目标: ¥500万"
          />
          <KpiCard 
              title="安全隐患整改率" 
              value="96%" 
              trend="High" 
              isPositive={true} 
              icon={ShieldAlert}
              subtext="剩余 4 项待销号"
              alertMode
          />
        </div>

        {/* --- GIS One-Map & Alerts Container --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
            
            {/* GIS Map Section */}
            <div className="lg:col-span-2 bg-[#1e1e1e] rounded-lg shadow-lg border border-[#333] relative overflow-hidden flex flex-col group">
                {/* Map Controls */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <div className="bg-black/50 backdrop-blur-md rounded-lg p-1 border border-white/10 flex">
                         <button 
                            onClick={() => setMapView('campus')}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${mapView === 'campus' ? 'bg-[#3370ff] text-white' : 'text-white/70 hover:text-white'}`}
                         >
                             3D 校区视图
                         </button>
                         <button 
                            onClick={() => setMapView('building')}
                            disabled={!selectedBuilding}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${mapView === 'building' ? 'bg-[#3370ff] text-white' : 'text-white/30 cursor-not-allowed'}`}
                         >
                             楼宇剖面
                         </button>
                    </div>
                </div>

                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                     <div className="bg-black/50 backdrop-blur-md rounded-lg p-2 border border-white/10">
                        <span className="text-[10px] text-white/50 uppercase font-bold mb-2 block tracking-wider">热力图图层</span>
                        <div className="flex flex-col gap-1">
                            <button 
                                onClick={() => setMapOverlay('none')} 
                                className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${mapOverlay === 'none' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}
                            >
                                <Layers size={12}/> 无叠加
                            </button>
                            <button 
                                onClick={() => setMapOverlay('vacancy')} 
                                className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${mapOverlay === 'vacancy' ? 'bg-red-500/30 text-red-200 border border-red-500/50' : 'text-white/60 hover:bg-white/10'}`}
                            >
                                <Activity size={12}/> 空置率分布
                            </button>
                            <button 
                                onClick={() => setMapOverlay('density')} 
                                className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${mapOverlay === 'density' ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50' : 'text-white/60 hover:bg-white/10'}`}
                            >
                                <Users size={12}/> 科研密度
                            </button>
                            <button 
                                onClick={() => setMapOverlay('excess')} 
                                className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${mapOverlay === 'excess' ? 'bg-orange-500/30 text-orange-200 border border-orange-500/50' : 'text-white/60 hover:bg-white/10'}`}
                            >
                                <AlertCircle size={12}/> 定额超标
                            </button>
                        </div>
                     </div>
                </div>

                {/* Map Visual Area */}
                <div className="flex-1 relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] perspective-1000 overflow-hidden cursor-move">
                    {/* Simulated Grid */}
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2, transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) scale(2)' }}></div>
                    
                    {mapView === 'campus' && (
                        <div className="absolute inset-0">
                            <Campus3DView
                                ref={campus3DViewRef}
                                onBuildingSelect={(b: any) => setSelectedBuilding(b)}
                                selectedBuildingId={selectedBuilding?.id}
                                mapOverlay={mapOverlay}
                            />
                        </div>
                    )}

                    {mapView === 'building' && selectedBuilding && (
                        <div className="absolute inset-0 flex items-center justify-center p-12 bg-[#1a1a1a]">
                            <div className="w-full h-full border border-white/20 bg-[#222] relative p-6 rounded shadow-2xl animate-in zoom-in-95 duration-300">
                                <button 
                                    onClick={() => setMapView('campus')}
                                    className="absolute top-4 left-4 z-30 flex items-center gap-2 text-white/70 hover:text-white bg-black/30 px-3 py-1 rounded"
                                >
                                    <ArrowLeft size={16} /> 返回校区
                                </button>
                                
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-white">{selectedBuilding.name} - 楼层剖面</h3>
                                    <p className="text-white/50 text-sm">点击楼层查看具体房间详情</p>
                                </div>

                                {/* Stacked Floors */}
                                <div className="flex flex-col-reverse items-center gap-2 h-[80%] overflow-y-auto custom-scrollbar">
                                    {[1,2,3,4,5,6].map(floor => (
                                        <div key={floor} className="w-[60%] h-16 bg-[#333] border border-white/10 rounded flex items-center justify-between px-6 hover:bg-[#3370ff]/20 hover:border-[#3370ff] cursor-pointer transition-colors group">
                                            <span className="text-white font-bold font-mono">F{floor}</span>
                                            <div className="flex gap-4">
                                                <span className="text-xs text-white/50 group-hover:text-white">房间数: 12</span>
                                                <span className="text-xs text-white/50 group-hover:text-white">面积: 1200m²</span>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reset View Button */}
                    {mapView === 'campus' && (
                        <button
                            onClick={() => campus3DViewRef.current?.resetView()}
                            className="absolute bottom-4 left-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 text-white/80 hover:text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-black/70 transition-colors"
                        >
                            重置视角
                        </button>
                    )}

                    {/* Footer Info Overlay */}
                    {selectedBuilding && mapView === 'campus' && (
                         <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-lg flex justify-between items-center z-30 animate-in slide-in-from-bottom-5">
                             <div>
                                 <h4 className="text-white font-bold text-lg">{selectedBuilding.name}</h4>
                                 <p className="text-white/60 text-xs">类型: {selectedBuilding.type === 'Admin' ? '行政办公' : '教学科研'} | 建筑高度: {selectedBuilding.height}m</p>
                             </div>
                             <div className="flex gap-6 text-sm">
                                 <div className="text-center">
                                     <div className="text-white/50 text-xs">空置率</div>
                                     <div className={`font-bold ${selectedBuilding.vacancy > 0.1 ? 'text-red-400' : 'text-green-400'}`}>{(selectedBuilding.vacancy * 100).toFixed(0)}%</div>
                                 </div>
                                 <div className="text-center">
                                     <div className="text-white/50 text-xs">定额状态</div>
                                     <div className={`font-bold ${selectedBuilding.excess > 0 ? 'text-orange-400' : 'text-blue-400'}`}>
                                         {selectedBuilding.excess > 0 ? '超标' : '正常'}
                                     </div>
                                 </div>
                                 <button onClick={() => setMapView('building')} className="bg-[#3370ff] hover:bg-[#285cc9] text-white px-4 py-1.5 rounded text-xs font-medium">
                                     进入楼宇
                                 </button>
                             </div>
                         </div>
                    )}
                </div>
            </div>

            {/* Alert Dashboard Section */}
            <div className="bg-white rounded-lg shadow-sm border border-[#dee0e3] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd] flex justify-between items-center">
                    <h3 className="font-bold text-[#1f2329] flex items-center gap-2">
                        <AlertCircle className="text-[#f54a45]" size={18} />
                        实时预警看板
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-[#fef2f2] text-[#f54a45] rounded-full border border-[#fecaca] animate-pulse">
                        3 项紧急
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {MOCK_ALERTS.slice(0, 5).map(alert => {
                        const alertType = alert.type.includes('合同') ? 'contract' : alert.type.includes('安全') ? 'safety' : alert.type.includes('欠费') ? 'fee' : 'quota';
                        let url = '';


                        return (
                            <AlertItem 
                                key={alert.id}
                                type={alertType}
                                title={alert.type}
                                desc={alert.details}
                                time={alert.timestamp}
                                level={alert.priority.toLowerCase() as 'high' | 'medium' | 'low'}
                                url={url}
                            />
                        );
                    })}
                        </div>
                <div className="p-4 border-t border-[#dee0e3] bg-[#f9fafb]">
                     <button 
                     onClick={() => setShowAllAlerts(true)}
                     className="w-full py-2 bg-white border border-[#dee0e3] text-[#646a73] rounded-md font-medium text-sm hover:bg-[#f2f3f5] hover:text-[#3370ff] transition-colors shadow-sm">
                        查看全部预警日志
                    </button>
                </div>
            </div>
        </div>

        {/* --- Charts Row --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[400px]">
          {/* Asset Trend Chart (Left Large) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="text-lg font-bold text-[#1f2329]">资产价值增长趋势</h3>
                      <p className="text-xs text-[#8f959e]">含在建工程转固预测</p>
                  </div>
                  <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-[#3370ff]"></span> 固定资产
                      </div>
                      <div className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-[#cbd5e1]"></span> 在建工程
                      </div>
                  </div>
              </div>
              <div className="flex-1 w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ASSET_TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3370ff" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#3370ff" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#8f959e" tickLine={false} axisLine={false} />
                          <YAxis stroke="#8f959e" tickLine={false} axisLine={false} tickFormatter={(value) => `¥${value}亿`} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f3f5" />
                          <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee0e3', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#3370ff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                          <Area type="monotone" dataKey="construction" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Department Efficiency */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#1f2329]">重点学院定额执行</h3>
                    <button className="text-[#3370ff] text-xs font-medium hover:underline">详情</button>
                </div>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DEPARTMENT_EFFICIENCY_DATA} layout="vertical" barSize={16} margin={{left: 10}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f2f3f5" />
                            <XAxis type="number" stroke="#8f959e" hide />
                            <YAxis dataKey="name" type="category" stroke="#646a73" tick={{fontSize: 12}} width={70} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#f2f3f5'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}} />
                            <Legend wrapperStyle={{fontSize: '12px'}} />
                            <Bar dataKey="quota" name="核定" stackId="a" fill="#e4e6eb" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="actual" name="实占" stackId="b" fill="#3370ff" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // 2. College Admin View (Department Specific)
  if (userRole === UserRole.CollegeAdmin) {
    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1f2329]">机械工程学院 - 资产概览</h1>
                    <p className="text-[#8f959e] text-sm mt-1">定额执行率: 98% | 资产自查进度: 100%</p>
                </div>
                 <div className="flex gap-3">
                    <button className="bg-[#3370ff] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#285cc9] shadow-sm">
                        发起用房申请
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard 
                    title="学院公房面积" 
                    value="11,500 m²" 
                    trend="正常" 
                    isPositive={true} 
                    icon={Building2}
                    subtext="核定定额 12,000 m²"
                />
                <KpiCard 
                    title="本年度需缴费" 
                    value="¥ 0" 
                    trend="优秀" 
                    isPositive={true} 
                    icon={DollarSign}
                    subtext="未超额，无待缴费用"
                />
                 <KpiCard 
                    title="待处理维修" 
                    value="2" 
                    trend="待办" 
                    isPositive={false} 
                    icon={Activity}
                    subtext="302实验室空调故障"
                    alertMode
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3]">
                <h3 className="text-lg font-bold text-[#1f2329] mb-4">定额使用分析</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={[DEPARTMENT_EFFICIENCY_DATA[0]]} layout="vertical" barSize={40} margin={{left: 20}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f2f3f5" />
                            <XAxis type="number" stroke="#8f959e" />
                            <YAxis dataKey="name" type="category" stroke="#646a73" tick={{fontSize: 14}} width={80} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#f2f3f5'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}} />
                            <Legend />
                            <Bar dataKey="quota" name="核定面积" fill="#e4e6eb" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="actual" name="实际占用" fill="#3370ff" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        </div>
    );
  }

  // 3. Teacher View (Personal)
  return (
    <div className="space-y-6 animate-fade-in pb-10">
         <div className="bg-white p-8 rounded-lg border border-[#dee0e3] shadow-sm flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-[#e1eaff] rounded-full flex items-center justify-center text-[#3370ff] mb-4">
                 <UserCheck size={32} />
             </div>
             <h1 className="text-2xl font-bold text-[#1f2329]">欢迎回来，张老师</h1>
             <p className="text-[#646a73] mt-2 max-w-lg">
                 您可以在这里快捷发起报修、查看您的周转房申请状态或浏览学校公房政策。
             </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-lg border border-[#dee0e3] shadow-sm hover:border-[#3370ff] transition-colors cursor-pointer group">
                 <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
                         <Activity size={24} />
                     </div>
                     <h3 className="text-lg font-bold text-[#1f2329]">我的报修</h3>
                 </div>
                 <div className="space-y-3">
                     <div className="flex justify-between text-sm p-3 bg-[#f5f6f7] rounded">
                         <span className="text-[#1f2329]">图书馆 304 空调漏水</span>
                         <span className="text-amber-600 font-medium">处理中</span>
                     </div>
                     <button className="w-full py-2 text-[#3370ff] text-sm font-medium hover:bg-[#f2f3f5] rounded transition-colors">
                         + 发起新报修
                     </button>
                 </div>
             </div>

             <div className="bg-white p-6 rounded-lg border border-[#dee0e3] shadow-sm hover:border-[#3370ff] transition-colors cursor-pointer group">
                 <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                         <ClipboardList size={24} />
                     </div>
                     <h3 className="text-lg font-bold text-[#1f2329]">周转房申请</h3>
                 </div>
                 <div className="space-y-3">
                     <div className="flex justify-between text-sm p-3 bg-[#f5f6f7] rounded">
                         <span className="text-[#1f2329]">教师公寓 A栋</span>
                         <span className="text-[#8f959e]">未申请</span>
                     </div>
                     <button className="w-full py-2 text-[#3370ff] text-sm font-medium hover:bg-[#f2f3f5] rounded transition-colors">
                         立即申请
                     </button>
                 </div>
             </div>
         </div>
    </div>
  );
};

// --- Sub Components ---

const KpiCard: React.FC<{
    title: string;
    value: string;
    trend: string;
    isPositive: boolean;
    icon: any;
    subtext: string;
    alertMode?: boolean;
}> = ({ title, value, trend, isPositive, icon: Icon, subtext, alertMode }) => {
    return (
        <div className={`p-6 rounded-lg shadow-sm border transition-all hover:shadow-md bg-white border-[#dee0e3]`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${alertMode ? 'bg-[#fef2f2] text-[#f54a45]' : 'bg-[#e1eaff] text-[#3370ff]'}`}>
                    <Icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    alertMode ? 'bg-[#fef2f2] text-[#f54a45]' : 
                    isPositive ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fff7ed] text-[#d97706]'
                }`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {trend}
                </div>
            </div>
            <h3 className="text-3xl font-bold text-[#1f2329] mb-1 tracking-tight">{value}</h3>
            <p className="text-sm font-medium text-[#646a73] mb-2">{title}</p>
            <p className={`text-xs ${alertMode ? 'text-[#f54a45]' : 'text-[#8f959e]'}`}>{subtext}</p>
        </div>
    );
};

const AlertItem: React.FC<{
    type: 'quota' | 'contract' | 'safety' | 'fee';
    title: string;
    desc: string;
    time: string;
    level: 'high' | 'medium' | 'low';
    url?: string;
}> = ({ type, title, desc, time, level, url }) => {
    

    const handleNavigate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (url) {
            window.location.href = url;
        }
    };

    const getIcon = () => {
        switch(type) {
            case 'quota': return <Activity size={16} />;
            case 'contract': return <ClipboardList size={16} />;
            case 'safety': return <ShieldAlert size={16} />;
            case 'fee': return <DollarSign size={16} />;
        }
    };

    const getColor = () => {
        switch(level) {
            case 'high': return 'bg-red-50 text-red-600 border-red-100';
            case 'medium': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'low': return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    return (
        <div 
            className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${getColor()} ${url ? 'cursor-pointer hover:shadow-md hover:border-blue-200' : ''}`}
            onClick={handleNavigate}
        >
            <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">{title}</span>
                    <span className="text-[10px] opacity-70">{time}</span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">{desc}</p>
            </div>
            {url && (
                <a onClick={handleNavigate} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex-shrink-0 ml-4">
                    去处理 »
                </a>
            )}
        </div>
    );
};

export default Dashboard;