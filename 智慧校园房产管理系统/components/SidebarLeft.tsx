import React from 'react';
import { TechPanel } from './TechPanel';
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend, Cell } from 'recharts';
import { CAMPUS_COMPOSITION, CAMPUS_COMPOSITION_STANDARD, COLLEGE_SPACE_DATA } from '../constants';
import { TrendingUp, Building2, ShieldCheck, Timer } from 'lucide-react';

export const SidebarLeft: React.FC = () => {
  return (
    <div className="absolute left-4 top-20 bottom-4 w-80 flex flex-col gap-4 pointer-events-none">
      
      {/* 1. Statistics Cards - Strategic KPIs (Keep Top) */}
      <TechPanel title="核心运行指标" className="pointer-events-auto shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 p-2 rounded flex flex-col items-center border border-white/5 group hover:border-tech-cyan/50 transition-colors cursor-pointer">
            <Building2 className="text-tech-cyan w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-gray-400">房产保有量</span>
            <span className="font-mono text-tech-cyan font-bold text-lg">42.8<span className="text-xs ml-1 font-normal text-white/50">万㎡</span></span>
          </div>
           <div className="bg-white/5 p-2 rounded flex flex-col items-center border border-white/5 group hover:border-tech-dorm/50 transition-colors cursor-pointer">
            <TrendingUp className="text-tech-dorm w-5 h-5 mb-1 group-hover:scale-100 transition-transform" />
            <span className="text-[10px] text-gray-400">资源利用率</span>
            <span className="font-mono text-tech-dorm font-bold text-lg">91.4<span className="text-xs ml-1 font-normal text-white/50">%</span></span>
          </div>
           <div className="bg-white/5 p-2 rounded flex flex-col items-center border border-white/5 group hover:border-tech-facility/50 transition-colors cursor-pointer">
            <ShieldCheck className="text-tech-facility w-5 h-5 mb-1 group-hover:scale-100 transition-transform" />
            <span className="text-[10px] text-gray-400">资产健康度</span>
            <span className="font-mono text-tech-facility font-bold text-lg">98.5</span>
          </div>
           <div className="bg-white/5 p-2 rounded flex flex-col items-center border border-white/5 group hover:border-tech-blue/50 transition-colors cursor-pointer">
            <Timer className="text-tech-blue w-5 h-5 mb-1" />
            <span className="text-[10px] text-gray-400">维保响应率</span>
            <span className="font-mono text-tech-blue font-bold text-lg">100<span className="text-xs ml-1 font-normal text-white/50">%</span></span>
          </div>
        </div>
      </TechPanel>

      {/* 2. Middle Section: Campus Composition (Moved from Right) */}
      <TechPanel title="房产资源分类占比" className="flex-1 min-h-[200px] flex flex-col pointer-events-auto">
        <div className="w-full h-full min-h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={CAMPUS_COMPOSITION.map((d) => {
              const standard = CAMPUS_COMPOSITION_STANDARD.find((s) => s.name === d.name)?.value ?? 0;
              return {
                name: d.name,
                actual: d.value,
                standard,
                color: d.color,
              };
            })}
            margin={{ top: 16, right: 12, bottom: 8, left: 0 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#000B1A', borderColor: '#3B82F6', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: any, name: any) => [`${value}%`, name === 'actual' ? '实际占比' : '标准占比']}
              labelFormatter={(label: any) => `分类：${label}`}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, color: '#9ca3af' }}
              formatter={(value: any) => (value === 'actual' ? '实际占比' : '标准占比')}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#00F2FF"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="standard"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
          </ResponsiveContainer>
        </div>
      </TechPanel>

      {/* 3. Bottom Section: College Space Usage (New Request) */}
      <TechPanel title="各学院用房资源占比" className="flex-1 min-h-[220px] pointer-events-auto">
        <div className="h-full w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={COLLEGE_SPACE_DATA.slice(0, 5)} barCategoryGap="15%" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={60} tick={{fill: '#9ca3af', fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ backgroundColor: '#000B1A', borderColor: '#3B82F6', color: '#fff' }}
                />
                <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                   {COLLEGE_SPACE_DATA.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </div>
      </TechPanel>

    </div>
  );
};