import React, { useState } from 'react';
import { TechPanel } from './TechPanel';
import { PipeNode, Building } from '../types';
import { WORK_ORDERS, COLLEGE_REVENUE, EXTERNAL_REVENUE, MOCK_ALERTS } from '../constants';
import { Settings, Activity, ClipboardList, Power, AlertCircle, FileText, Hammer, Wallet, TrendingUp, Landmark, Bell } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis, LabelList } from 'recharts';

interface RightSidebarProps {
  data: PipeNode | Building | null;
  onClose: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'monitor' | 'ops'>('ledger');

  // --------------------------------------------------------------------------
  // EXECUTIVE GLOBAL DASHBOARD (When nothing is selected)
  // --------------------------------------------------------------------------
  if (!data) {
    return (
      <div className="absolute right-4 top-20 bottom-4 w-80 flex flex-col gap-4 pointer-events-none z-30">
        <div className="h-full flex flex-col gap-4 pointer-events-none">
          
          {/* 1. College Revenue */}
          <TechPanel title="校内各学院经营收入 (年度)" className="shrink-0 flex flex-col">
            <div className="flex items-center justify-between text-[10px] 2xl:text-[12px] text-gray-500 mb-2 2xl:mb-3 font-mono">
                <span>学院名称</span>
                <div className="flex gap-4">
                    <span>实际收入 (万元)</span>
                    <span>目标达成</span>
                </div>
            </div>
            <div className="space-y-3">
                {COLLEGE_REVENUE.slice(0, 3).map((item, idx) => {
                    const percent = Math.min((item.value / item.target) * 100, 100);
                    return (
                        <div key={idx} className="group">
                             <div className="flex justify-between items-end mb-1">
                                 <div className="flex items-center gap-2">
                                     <span className={`w-4 h-4 flex items-center justify-center rounded text-[10px] font-mono ${idx < 3 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-500'}`}>{idx + 1}</span>
                                     <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{item.name}</span>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-tech-cyan font-mono font-bold">{item.value}</span>
                                    <span className="text-[10px] text-gray-500 ml-1">/ {item.target}</span>
                                 </div>
                             </div>
                             <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-gradient-to-r from-tech-blue to-tech-cyan" 
                                    style={{ width: `${percent}%` }} 
                                 />
                             </div>
                        </div>
                    );
                })}
            </div>
          </TechPanel>

          {/* 2. External Revenue */}
          <TechPanel title="校外收入来源分布" className="flex-1 min-h-[200px] flex flex-col">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={EXTERNAL_REVENUE}
                  margin={{ top: 10, right: 16, bottom: 20, left: 0 }}
                  barSize={30}
                  barGap={4}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    width={30}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, (dataMax:number)=> Math.ceil(dataMax/1000)*1000]}
                  />
                  <ReTooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#000B1A', borderColor: '#3B82F6', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any, _key: any, item: any) => {
                      const total = EXTERNAL_REVENUE.reduce((s, it) => s + it.value, 0);
                      const v = Number(value);
                      const pct = total > 0 ? (v / total) * 100 : 0;
                      return [`${v} 万元 (${pct.toFixed(1)}%)`, item?.payload?.name ?? ''];
                    }}
                  />
                  <Bar dataKey="value" isAnimationActive={false} radius={[4,4,0,0]}>
                    {EXTERNAL_REVENUE.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(v: any) => (Number(v) >= 900 ? `${v}` : '')}
                      fill="#ffffff"
                      fontSize={10}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TechPanel>

          {/* 3. Notifications */}
          <TechPanel title="信息通知" className="flex-1 min-h-[220px] flex flex-col">
            <div className="space-y-0.5">
              {MOCK_ALERTS.slice(0, 3).map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded p-1.5">
                  <div className="flex items-start gap-2">
                    <Bell size={14} className={item.level === 'critical' ? 'text-tech-red' : item.level === 'warning' ? 'text-yellow-500' : 'text-tech-cyan'} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-300 leading-4 line-clamp-2">{item.message}</div>
                      <div className="mt-1 text-[10px] text-gray-500 font-mono">{item.timestamp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TechPanel>

        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // DETAIL VIEW (When a building/pipe is selected)
  // --------------------------------------------------------------------------
  const isPipe = (item: any): item is PipeNode => item.coordinates && Array.isArray(item.coordinates);
  const title = isPipe(data) ? `管网资产: ${data.id}` : `建筑详情: ${data.name}`;

  // Filter relevant work orders
  const relatedOrders = WORK_ORDERS.filter(wo => wo.targetId === data.id);

  return (
    <div className="absolute right-0 top-16 bottom-0 w-96 z-30 transition-transform duration-300 transform translate-x-0 pointer-events-none">
       <div className="h-full pointer-events-auto p-4 flex flex-col">
            <TechPanel title={title} className="h-full flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
                
                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-4">
                    <button 
                        onClick={() => setActiveTab('ledger')}
                        className={`flex-1 p-2 text-xs font-mono flex items-center justify-center gap-1 ${activeTab === 'ledger' ? 'text-tech-cyan bg-white/5 border-b-2 border-tech-cyan' : 'text-gray-500 hover:text-white'}`}
                    >
                        <FileText size={14} /> 基础台账
                    </button>
                    <button 
                        onClick={() => setActiveTab('monitor')}
                        className={`flex-1 p-2 text-xs font-mono flex items-center justify-center gap-1 ${activeTab === 'monitor' ? 'text-tech-cyan bg-white/5 border-b-2 border-tech-cyan' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Activity size={14} /> 实时监测
                    </button>
                    <button 
                        onClick={() => setActiveTab('ops')}
                        className={`flex-1 p-2 text-xs font-mono flex items-center justify-center gap-1 ${activeTab === 'ops' ? 'text-tech-cyan bg-white/5 border-b-2 border-tech-cyan' : 'text-gray-500 hover:text-white'}`}
                    >
                        <ClipboardList size={14} /> 运维工单
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto scrollbar-thin pr-2">
                    
                    {/* 1. LEDGER TAB */}
                    {activeTab === 'ledger' && (
                        <div className="space-y-4 text-sm">
                            <div className="bg-white/5 p-3 border border-white/10 rounded">
                                <h4 className="text-tech-blue font-bold mb-2 text-xs uppercase">技术参数</h4>
                                {isPipe(data) ? (
                                    <div className="space-y-2 text-gray-300 font-mono">
                                        <div className="flex justify-between"><span className="text-gray-500">材质:</span> {data.material}</div>
                                        <div className="flex justify-between"><span className="text-gray-500">管径:</span> {data.diameter}</div>
                                        <div className="flex justify-between"><span className="text-gray-500">埋深:</span> {data.depth} m</div>
                                        <div className="flex justify-between"><span className="text-gray-500">安装日期:</span> {data.installDate}</div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-gray-300 font-mono">
                                        <div className="flex justify-between"><span className="text-gray-500">类型:</span> {data.type.toUpperCase()}</div>
                                        <div className="flex justify-between"><span className="text-gray-500">建筑面积:</span> {data.totalArea} ㎡</div>
                                        <div className="flex justify-between"><span className="text-gray-500">楼层数:</span> {data.floorCount}</div>
                                        <div className="flex justify-between"><span className="text-gray-500">建成年代:</span> {data.buildYear}</div>
                                        <div className="flex justify-between"><span className="text-gray-500">负责人:</span> {data.manager}</div>
                                    </div>
                                )}
                            </div>

                             <div className="bg-white/5 p-3 border border-white/10 rounded">
                                <h4 className="text-tech-blue font-bold mb-2 text-xs uppercase">拓扑关系</h4>
                                <div className="text-xs text-gray-400">
                                    {isPipe(data) 
                                        ? `该管段向下游供水至 ${data.connectedBuildingIds.join(', ')}，当前链路畅通。`
                                        : `该建筑接入 ${data.connectedPipeId || '市政-Main-03'} 号主管道，位于第 3 加压供水分区。`
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. MONITOR TAB */}
                    {activeTab === 'monitor' && (
                        <div className="space-y-4">
                            {/* Real-time metrics */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/40 p-3 text-center border border-white/10">
                                    <div className="text-gray-500 text-[10px] mb-1">实时状态</div>
                                    <div className={`${(data.status === 'normal' || data.status === 'active') ? 'text-tech-water' : 'text-tech-red animate-pulse'} font-bold font-mono`}>
                                        {data.status.toUpperCase()}
                                    </div>
                                </div>
                                <div className="bg-black/40 p-3 text-center border border-white/10">
                                    <div className="text-gray-500 text-[10px] mb-1">{isPipe(data) ? '当前流速' : '今日能耗'}</div>
                                    <div className="text-tech-cyan font-bold font-mono">
                                        {isPipe(data) ? `${data.flowRate} m³/h` : `${(data as Building).energyUsage} kWh`}
                                    </div>
                                </div>
                            </div>

                            {/* Equipment Control (Simulated IoT) */}
                            {!isPipe(data) && (data as Building).keyEquipment && (data as Building).keyEquipment!.length > 0 && (
                                <div className="border-t border-white/10 pt-4">
                                    <h4 className="text-tech-blue font-bold mb-3 text-xs flex items-center gap-2">
                                        <Settings size={14}/> 设备远程控制
                                    </h4>
                                    <div className="space-y-2">
                                        {(data as Building).keyEquipment!.map((eq, i) => (
                                            <div key={i} className="flex items-center justify-between bg-white/5 p-2 px-3 rounded">
                                                <span className="text-xs text-gray-300">{eq}</span>
                                                <button className="flex items-center gap-1 bg-tech-water/20 hover:bg-tech-water/40 text-tech-water px-2 py-1 rounded text-[10px] transition-colors">
                                                    <Power size={10} /> 启动
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {/* Pipe Pressure Chart Placeholder */}
                             {isPipe(data) && (
                                 <div className="h-32 bg-white/5 flex items-center justify-center text-xs text-gray-500 border border-dashed border-white/20">
                                     [实时压力曲线 - IoT数据流]
                                 </div>
                             )}
                        </div>
                    )}

                    {/* 3. OPS TAB */}
                    {activeTab === 'ops' && (
                        <div className="space-y-3">
                             {/* New Order Button */}
                             <button className="w-full py-2 bg-tech-blue/20 border border-tech-blue/50 text-tech-blue text-xs font-bold hover:bg-tech-blue/30 transition-colors mb-2">
                                + 发起维保工单
                             </button>

                             {relatedOrders.length === 0 ? (
                                 <div className="text-center text-gray-500 py-8 text-xs">暂无历史工单</div>
                             ) : (
                                 relatedOrders.map(order => (
                                     <div key={order.id} className="bg-white/5 border-l-2 border-white/20 p-3 hover:bg-white/10 transition-colors">
                                         <div className="flex justify-between items-start mb-1">
                                             <span className={`text-[10px] px-1 rounded ${
                                                 order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500' :
                                                 order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'
                                             }`}>
                                                 {order.status === 'processing' ? '处理中' : order.status === 'completed' ? '已完成' : '待处理'}
                                             </span>
                                             <span className="text-[10px] text-gray-500">{order.date}</span>
                                         </div>
                                         <div className="text-xs text-white mb-1 font-bold">{order.type === 'repair' ? '维修' : '巡检'} - {order.id}</div>
                                         <p className="text-[10px] text-gray-400">{order.description}</p>
                                     </div>
                                 ))
                             )}
                             
                             {/* Lifecycle Info */}
                             {isPipe(data) && (
                                 <div className="mt-4 p-2 bg-tech-cyan/5 border border-tech-cyan/20 rounded text-[10px] text-tech-cyan flex items-start gap-2">
                                     <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                     <div>
                                         <div className="font-bold">全生命周期提醒</div>
                                         上次维保: {data.lastMaintain}<br/>
                                         建议下次维保: 2024-05-01 (剩余 142 天)
                                     </div>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
            </TechPanel>
       </div>
    </div>
  );
};