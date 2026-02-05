import React from 'react';
import { ZoomIn, ZoomOut, RefreshCw, Layers, CloudRain, GraduationCap, BedDouble, Briefcase, Dumbbell } from 'lucide-react';
import { TechPanel } from './TechPanel';

interface MapControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  layers: {
    teaching: boolean;
    dorm: boolean;
    admin: boolean;
    facility: boolean;
  };
  onToggleLayer: (layer: keyof MapControlsProps['layers']) => void;
  weatherMode: boolean;
  onToggleWeather: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  layers,
  onToggleLayer,
  weatherMode,
  onToggleWeather
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto transition-all duration-300">
      
      {/* Main Command Deck Container */}
      <TechPanel className="!p-0 flex items-stretch h-14 bg-[#000B1A]/90 shadow-2xl shadow-tech-blue/10 border-tech-blue/30 backdrop-blur-xl">
        
        {/* Section 1: View Control */}
        <div className="flex items-center gap-1 px-3 border-r border-white/10">
          <button 
            onClick={onZoomOut} 
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-tech-cyan transition-colors active:scale-95" 
            title="缩小视图"
          >
            <ZoomOut size={18} />
          </button>
          
          <div className="flex flex-col items-center justify-center w-12 mx-1">
            <span className="font-mono text-xs font-bold text-white tracking-wider">{(scale * 100).toFixed(0)}%</span>
            <div className="w-full h-0.5 bg-gray-700 mt-1 rounded-full overflow-hidden">
               <div className="h-full bg-tech-cyan transition-all duration-300" style={{ width: `${Math.min(scale * 25, 100)}%` }} />
            </div>
          </div>

          <button 
            onClick={onZoomIn} 
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-tech-cyan transition-colors active:scale-95" 
            title="放大视图"
          >
            <ZoomIn size={18} />
          </button>
          
          <button 
            onClick={onReset} 
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-1 active:rotate-180 duration-500" 
            title="重置视角"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Section 2: Property Layers */}
        <div className="flex items-center gap-3 px-4 border-r border-white/10 relative overflow-hidden">
           {/* Background Decor */}
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
           
           <div className="flex items-center gap-2 mr-2">
              <Layers size={14} className="text-gray-500" />
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest hidden sm:block">Assets</span>
           </div>

           <div className="flex gap-2">
              <LayerToggle 
                label="教学" 
                active={layers.teaching} 
                color="bg-tech-teaching" 
                textColor="text-tech-teaching"
                icon={GraduationCap}
                onClick={() => onToggleLayer('teaching')} 
              />
              <LayerToggle 
                label="宿舍" 
                active={layers.dorm} 
                color="bg-tech-dorm" 
                textColor="text-tech-dorm"
                icon={BedDouble}
                onClick={() => onToggleLayer('dorm')} 
              />
              <LayerToggle 
                label="行政" 
                active={layers.admin} 
                color="bg-tech-admin" 
                textColor="text-tech-admin"
                icon={Briefcase}
                onClick={() => onToggleLayer('admin')} 
              />
              <LayerToggle 
                label="配套" 
                active={layers.facility} 
                color="bg-tech-facility" 
                textColor="text-tech-facility"
                icon={Dumbbell}
                onClick={() => onToggleLayer('facility')} 
              />
           </div>
        </div>

        {/* Section 3: Environment */}
        <div className="flex items-center px-3 bg-gradient-to-r from-transparent to-white/5">
          <button 
              onClick={onToggleWeather}
              className={`
                relative group flex items-center justify-center w-10 h-10 rounded transition-all duration-300
                ${weatherMode 
                  ? 'text-white bg-tech-blue/20 shadow-[0_0_15px_rgba(30,144,255,0.4)] border border-tech-blue/50' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
              title="模拟恶劣天气 (检查房屋漏水/排水)"
          >
              <CloudRain size={20} className={weatherMode ? 'animate-bounce' : ''} />
          </button>
        </div>
      </TechPanel>
      
      {/* Decorative Elements under the bar */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-tech-cyan/30 to-transparent blur-[1px]" />
    </div>
  );
};

const LayerToggle = ({ 
  label, 
  active, 
  color, 
  textColor,
  onClick,
  icon: Icon
}: { 
  label: string, 
  active: boolean, 
  color: string, 
  textColor: string,
  onClick: () => void,
  icon: React.ElementType
}) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 border
      ${active 
        ? `bg-opacity-10 ${color.replace('bg-', 'bg-')} border-opacity-50 ${textColor} border-${color.split('-')[1] === 'white' ? 'white' : color.replace('bg-', 'border-')}`
        : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-400'
      }
      ${active ? 'shadow-[0_0_8px_rgba(0,0,0,0.5)]' : ''}
    `}
  >
    <Icon size={12} />
    <span>{label}</span>
  </button>
);