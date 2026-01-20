import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar, Tooltip, AreaChart, Area, Legend, CartesianGrid } from 'recharts';
import { Target, Building, TrendingUp, Users, Sliders, ShieldCheck, Home, Power, Settings, ShieldAlert } from 'lucide-react';

// --- Mock Data ---
const barData = [
  { name: '0', value: 600 }, { name: '20', value: 900 }, { name: '50', value: 700 },
  { name: '70', value: 1000 }, { name: '100', value: 800 }, { name: '150', value: 1200 },
  { name: '190', value: 950 }, { name: '200', value: 1100 },
];

const assetTrendData = [
  { name: '5月', '固定资产': 12.5, '在建工程': 4.2 },
  { name: '6月', '固定资产': 12.8, '在建工程': 3.8 },
  { name: '7月', '固定资产': 13.5, '在建工程': 4.5 },
  { name: '8月', '固定资产': 14.2, '在建工程': 4.0 },
  { name: '9月', '固定资产': 15.1, '在建工程': 3.2 },
  { name: '10月', '固定资产': 15.8, '在建工程': 2.5 },
];

const quotaData = [
  { name: '计算机学院', value: 95 },
  { name: '机械学院', value: 88 },
  { name: '建筑学院', value: 75 },
  { name: '经管学院', value: 92 },
];

// --- Styled Components ---
const Panel = ({ children, title, icon: Icon, subtitle, noPadding }: { children: React.ReactNode, title: string, icon: React.ElementType, subtitle?: string, noPadding?: boolean }) => (
  <div className={`bg-black/30 border-2 border-[#00f6ff]/50 rounded-lg backdrop-blur-sm relative animate-fade-in-fast ${noPadding ? '' : 'p-4'}`}>
    <div className="absolute -top-3 left-4 bg-gray-900 px-2 text-[#00f6ff] text-sm font-bold flex items-center gap-2">
      <Icon size={14} /> 
      <div>
        {title}
        {subtitle && <div className="text-xs text-white/60 font-normal -mt-1">{subtitle}</div>}
      </div>
    </div>
    <div className={noPadding ? 'h-full' : 'mt-4 h-full'}>{children}</div>
  </div>
);

const IconButton = ({ icon: Icon, label }: { icon: React.ElementType, label: string }) => (
  <div className="flex flex-col items-center gap-2 text-center">
    <button className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00f6ff]/50 to-[#00f6ff]/20 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,246,255,0.5)] hover:scale-110 transition-transform">
      <Icon size={32} />
    </button>
    <span className="text-xs text-white/80 font-bold">{label}</span>
  </div>
);

const SmallButton = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
  <div className="bg-black/30 border-2 border-[#00f6ff]/50 rounded-lg backdrop-blur-sm relative animate-fade-in-fast p-4 h-24 w-full flex items-center justify-center">
    <div className="absolute -top-3 left-4 bg-gray-900 px-2 text-[#00f6ff] text-sm font-bold flex items-center gap-2">
      <Icon size={14} />
      <span>{title}</span>
    </div>
    <span className="text-lg">{children}</span>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 p-3 rounded-lg shadow-lg text-gray-800">
        <p className="font-bold text-lg">{label}</p>
        <p className="text-sm text-gray-600">construction: {payload[1].value}</p>
        <p className="text-sm text-blue-500 font-bold">value: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// --- Main Component ---
const BigScreen: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [safetyData, setSafetyData] = useState({ rate: 0, remaining: 0 });

  useEffect(() => {
    // 模拟API调用
    const fetchSafetyData = () => {
      const totalIssues = 100;
      const closedIssues = 96;
      const rate = Math.round((closedIssues / totalIssues) * 100);
      const remaining = totalIssues - closedIssues;
      setSafetyData({ rate, remaining });
    };

    fetchSafetyData();
  }, []);

    const safetyRadialData = [
    { name: 'background', value: 100, fill: '#1a3a5a' }, // Background ring
    { name: 'rate', value: safetyData.rate, fill: '#00f6ff' },
  ];

  return (
    <div className="w-screen h-screen bg-gray-900 text-white font-sans p-4 overflow-hidden bg-[url('/star.jpg')] bg-cover bg-center">
      {/* Header */}
            <header className="relative flex justify-center items-center animate-fade-in-fast">
        <h1 className="text-3xl font-bold text-shadow-glow">福建理工大学智能地产管理系统</h1>
        <div className="absolute right-0 flex items-center gap-4">
          <button onClick={onExit} className="p-2 rounded-full bg-white/10 hover:bg-red-500/50 transition-colors"><Power size={20} /></button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-4 grid-rows-3 gap-4 h-[calc(100%-50px)] mt-4">
        {/* Left Panels */}
        <div className="col-span-1 row-span-3 grid grid-rows-3 gap-4">
          <Panel title="安全隐患整改率" icon={ShieldAlert} noPadding={true}>
                        <div className="absolute top-2 right-2 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
              <TrendingUp size={12} /> High
            </div>
            <div className="w-full h-full flex items-center justify-center pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={safetyRadialData} startAngle={90} endAngle={-270} barSize={12}>
                  <RadialBar dataKey='value' cornerRadius={10} />
                  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-4xl font-bold">{safetyData.rate}%</text>
                  <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="fill-red-400 text-sm">剩余 {safetyData.remaining} 项待销号</text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="校园风光" icon={Building} noPadding={true}><div className="w-full h-full rounded-lg bg-cover bg-center bg-[url('/fjut.jpg')]"/></Panel>
          <Panel title="玻璃操作" icon={Sliders}>
            <div className="flex justify-around items-center h-full">
              <IconButton icon={Home} label="3200 日光" />
              <IconButton icon={Power} label="4700 光控" />
              <IconButton icon={Settings} label="5000X 温控" />
            </div>
          </Panel>
        </div>

        {/* Center Panels */}
        <div className="col-span-2 row-span-3 grid grid-rows-3 gap-4">
          <div className="row-span-1 grid grid-cols-6 gap-4">
            <SmallButton title="城市" icon={Home}>业务大厅</SmallButton>
            <SmallButton title="模拟" icon={Sliders}>模拟器</SmallButton>
            <SmallButton title="漫游" icon={Building}>沉浸</SmallButton>
            <SmallButton title="报警" icon={ShieldCheck}>设备</SmallButton>
            <div className="bg-black/30 border-2 border-[#00f6ff]/50 rounded-lg backdrop-blur-sm h-24"></div>
            <div className="bg-black/30 border-2 border-[#00f6ff]/50 rounded-lg backdrop-blur-sm h-24"></div>
          </div>
             <div className="row-span-2 bg-black/30 border-2 border-[#00f6ff]/50 rounded-lg backdrop-blur-sm relative animate-fade-in-fast overflow-hidden">
             <div className="absolute -top-3 left-4 bg-gray-900 px-2 text-[#00f6ff] text-sm font-bold flex items-center gap-2 z-10"><Building size={14} /> 玻璃形象</div>
             <div className="w-full h-full rounded-lg bg-cover bg-center bg-[url('https://picsum.photos/800/600?building,modern')]"/>
          </div>
        </div>

        {/* Right Panels */}
        <div className="col-span-1 row-span-3 grid grid-rows-3 gap-4">
          <Panel title="客户展示" icon={Users}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #00f6ff' }} />
                <Bar dataKey="value" fill="#00f6ff" barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
          <Panel title="重点学院定额执行" icon={TrendingUp}>
            <div className="flex flex-col justify-around h-full text-sm text-white/90 gap-2 pt-2">
              {quotaData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-20 truncate text-xs">{item.name}</span>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#00f6ff] to-[#00a2ff] h-2 rounded-full" style={{ width: `${item.value}%` }}></div>
                  </div>
                  <span className="w-10 text-right text-xs">{item.value}%</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="资产价值增长趋势" icon={TrendingUp} subtitle="含在建工程转固预测">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assetTrendData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} unit="亿" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                    <Line type="monotone" dataKey="固定资产" stroke="#00f6ff" strokeWidth={2} />
                    <Line type="monotone" dataKey="在建工程" stroke="#888" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </main>
      <style>{`
        .text-shadow-glow {
          text-shadow: 0 0 8px rgba(0, 246, 255, 0.7); 
        }
        @keyframes fadeInFast { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-fast { animation: fadeInFast 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default BigScreen;
