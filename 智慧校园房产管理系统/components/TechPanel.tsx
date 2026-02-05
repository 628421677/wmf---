import React from 'react';

interface TechPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  variant?: 'default' | 'alert';
}

export const TechPanel: React.FC<TechPanelProps> = ({ 
  children, 
  className = '', 
  title,
  variant = 'default' 
}) => {
  const borderColor = variant === 'alert' ? 'border-tech-red' : 'border-tech-blue';
  const cornerColor = variant === 'alert' ? 'border-tech-red' : 'border-tech-cyan';
  const glow = variant === 'alert' ? 'shadow-[0_0_20px_rgba(255,77,79,0.2)]' : 'shadow-[0_0_15px_rgba(30,144,255,0.15)]';

  return (
    <div className={`relative group bg-[#000B1A]/80 backdrop-blur-xl border ${borderColor}/30 p-1 ${glow} ${className}`}>
      {/* Corner Brackets */}
      {/* Top Left */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${cornerColor} z-10 transition-all duration-300 group-hover:w-6 group-hover:h-6`} />
      {/* Top Right */}
      <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${cornerColor} z-10 transition-all duration-300 group-hover:w-6 group-hover:h-6`} />
      {/* Bottom Left */}
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${cornerColor} z-10 transition-all duration-300 group-hover:w-6 group-hover:h-6`} />
      {/* Bottom Right */}
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${cornerColor} z-10 transition-all duration-300 group-hover:w-6 group-hover:h-6`} />

      {/* Decorative Lines */}
      <div className={`absolute top-1/2 left-0 w-1 h-8 -translate-y-1/2 bg-${variant === 'alert' ? 'tech-red' : 'tech-cyan'}/20`} />
      <div className={`absolute top-1/2 right-0 w-1 h-8 -translate-y-1/2 bg-${variant === 'alert' ? 'tech-red' : 'tech-cyan'}/20`} />

      {/* Content Container */}
      <div className="w-full h-full bg-gradient-to-b from-white/5 to-transparent p-3 2xl:p-4 overflow-hidden relative">
        {title && (
          <div className="flex items-center mb-4 border-b border-white/10 pb-2">
            <span className="w-2 h-2 bg-tech-cyan mr-2 animate-pulse" />
            <h3 className="font-mono text-sm tracking-widest text-tech-cyan uppercase shadow-black drop-shadow-md">
              {title}
            </h3>
            <div className="flex-grow ml-4 h-px bg-gradient-to-r from-tech-cyan/50 to-transparent" />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
