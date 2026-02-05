import React from 'react';
import { ArrowLeftCircle } from 'lucide-react';
import { Radio, Wifi } from 'lucide-react';

export const TopNav: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#000B1A] to-transparent z-40 px-6 flex items-center justify-between pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-4">
        {/* Exit Button */}
        <button
          onClick={() => (window.location.href = 'http://localhost:8000')}
          className="mr-4 text-tech-cyan hover:text-white transition-colors"
        >
          <ArrowLeftCircle size={24} />
        </button>
        <div className="w-10 h-10 border border-tech-cyan flex items-center justify-center bg-tech-cyan/10">
          <Radio className="text-tech-cyan animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-[0.2em] text-white">智慧福工 <span className="text-tech-cyan text-sm tracking-normal opacity-70">v2.0</span></h1>
          <p className="text-[10px] text-gray-400 font-mono">校园房产全生命周期数字孪生平台</p>
        </div>
      </div>

      <div className="flex gap-8 items-center font-mono text-xs">
         <div className="flex items-center gap-2 text-tech-cyan">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tech-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tech-cyan"></span>
            </span>
            系统在线
         </div>
         <div className="flex items-center gap-2 text-gray-400">
           <Wifi size={14} />
           延迟: 12ms
         </div>
         <div className="text-gray-500">
           {new Date().toLocaleDateString('zh-CN')}
         </div>
      </div>
    </div>
  );
};