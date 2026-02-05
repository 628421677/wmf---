import React, { useState, useEffect, useRef } from 'react';
import { BUILDINGS } from '../constants';
import { Building } from '../types';

interface MapViewProps {
  onSelect: (item: Building | null) => void;
  selectedId: string | null;
  viewport: { x: number; y: number; scale: number };
  setViewport: React.Dispatch<React.SetStateAction<{ x: number; y: number; scale: number }>>;
  layers: {
    teaching: boolean;
    dorm: boolean;
    admin: boolean;
    facility: boolean;
  };
  weatherMode: boolean;
}

export const MapView: React.FC<MapViewProps> = ({ 
  onSelect, 
  selectedId, 
  viewport, 
  setViewport,
  layers,
  weatherMode
}) => {
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Sync prop changes to local state
  useEffect(() => {
    setLocalSelectedId(selectedId);
  }, [selectedId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !lastMousePos.current) return;
    
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setViewport(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy
    }));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    lastMousePos.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(viewport.scale + scaleAmount, 0.5), 4);
    
    // Simple center zoom
    setViewport(prev => ({
      ...prev,
      scale: newScale
    }));
  };

  const handleClick = (e: React.MouseEvent, item: Building | null) => {
    e.stopPropagation();
    setLocalSelectedId(item?.id || null);
    onSelect(item);
  };

  const getBuildingColor = (type: string) => {
    switch (type) {
      case 'teaching': return '#3B82F6'; // Blue
      case 'dorm': return '#F59E0B';     // Amber
      case 'admin': return '#8B5CF6';    // Violet
      case 'facility': return '#10B981'; // Emerald
      default: return '#FFFFFF';
    }
  };

  const isDimmed = (itemId: string) => {
    if (!localSelectedId) return false;
    return itemId !== localSelectedId;
  };

  return (
    <div 
      className="absolute inset-0 z-0 overflow-hidden bg-grid cursor-move" 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={(e) => handleClick(e, null)}
    >
      {/* Background Image / Map Base */}
      <div 
        className={`absolute inset-0 opacity-30 bg-cover bg-center grayscale contrast-125 transition-all duration-1000 ${weatherMode ? 'brightness-50' : 'brightness-75'}`}
        style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=3870&auto=format&fit=crop")', // Abstract University Map
            transform: `translate(${viewport.x * 0.1}px, ${viewport.y * 0.1}px) scale(${1 + (viewport.scale - 1) * 0.05})` // Parallax
        }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-tech-bg via-transparent to-tech-bg opacity-95 pointer-events-none" />
      <div className="absolute inset-0 bg-tech-bg/80 pointer-events-none" /> 

      {/* Rain Effect Overlay */}
      {weatherMode && (
          <div className="absolute inset-0 pointer-events-none z-10 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/82/Rain_drops_on_window_02.jpg')] bg-cover mix-blend-overlay animate-pulse" />
      )}
      {weatherMode && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
             {[...Array(20)].map((_, i) => (
                 <div 
                    key={i}
                    className="absolute top-[-20%] bg-gradient-to-b from-transparent to-blue-400 opacity-40 w-[1px] h-[100px] animate-[scan_0.5s_linear_infinite]"
                    style={{ 
                        left: `${Math.random() * 100}%`, 
                        animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                        animationDelay: `${Math.random()}s`
                    }}
                 />
             ))}
        </div>
      )}

      <svg 
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.scale})`}>
            
            {/* Buildings */}
            {BUILDINGS.map((b) => {
                if (!layers[b.type as keyof typeof layers]) return null;

                const isSelected = localSelectedId === b.id;
                const dimmed = localSelectedId ? isDimmed(b.id) : false;
                const color = getBuildingColor(b.type);
                
                // Varied height based on floor count simulation
                const height = b.floorCount * 8; 
                const width = Math.sqrt(b.totalArea) / 2; // Rough scale
                
                return (
                    <g 
                        key={b.id} 
                        onClick={(e) => handleClick(e, b)} 
                        className={`cursor-pointer pointer-events-auto transition-all duration-500 ${dimmed ? 'opacity-20 grayscale' : 'opacity-100'}`}
                    >
                        {/* Selected Indicator Ring */}
                        {isSelected && (
                             <ellipse 
                                cx={b.coordinates.x + width/2} 
                                cy={b.coordinates.y + width/2} 
                                rx={width} ry={width/2}
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                                className="animate-ping opacity-50"
                             />
                        )}

                        {/* Fake 3D Extrusion */}
                        <path 
                            d={`M${b.coordinates.x},${b.coordinates.y} v-${height} h${width} v${height} h-${width}`} 
                            fill={color}
                            fillOpacity={b.status === 'maintenance' ? "0.1" : "0.2"}
                            stroke="none"
                        />
                         <path 
                            d={`M${b.coordinates.x},${b.coordinates.y - height} l10,-10 h${width} l-10,10`} 
                            fill={color}
                            fillOpacity="0.4"
                            stroke="none"
                        />
                         <path 
                            d={`M${b.coordinates.x + width},${b.coordinates.y - height} l10,-10 v${height} l-10,10`} 
                            fill={color}
                            fillOpacity="0.3"
                            stroke="none"
                        />

                        {/* Roof (Top Face) */}
                        <rect 
                            x={b.coordinates.x} 
                            y={b.coordinates.y - height} 
                            width={width} 
                            height={width} 
                            fill={color}
                            fillOpacity={b.status === 'maintenance' ? '0.2' : '0.5'}
                            stroke={color}
                            strokeWidth={isSelected ? 2 : 1}
                            className="transition-all duration-300 hover:fill-opacity-80"
                        />
                        
                        {/* Base Footprint */}
                        <rect 
                            x={b.coordinates.x} 
                            y={b.coordinates.y} 
                            width={width} 
                            height={width} 
                            fill="none"
                            stroke={color}
                            strokeWidth="1"
                            strokeDasharray={b.status === 'maintenance' ? "4 4" : "0"}
                            strokeOpacity="0.5"
                        />

                        {/* Building Label */}
                        {!dimmed && (viewport.scale > 0.6) && (
                            <g transform={`translate(${b.coordinates.x + width/2}, ${b.coordinates.y - height - 15})`}>
                                <text 
                                    fill="white" 
                                    fontSize="12" 
                                    textAnchor="middle"
                                    className="font-mono pointer-events-none drop-shadow-md select-none font-bold tracking-wider"
                                >
                                    {b.name}
                                </text>
                                {/* Occupancy Bar */}
                                <rect x="-15" y="4" width="30" height="3" fill="#333" />
                                <rect x="-15" y="4" width={30 * (b.occupancyRate / 100)} height="3" fill={b.occupancyRate > 90 ? '#FF4D4F' : '#10B981'} />
                            </g>
                        )}
                        
                        {/* Maintenance Icon */}
                        {b.status === 'maintenance' && (
                             <text x={b.coordinates.x + width/2} y={b.coordinates.y - height/2} textAnchor="middle" fontSize="20">🛠️</text>
                        )}
                    </g>
                )
            })}
        </g>
      </svg>
    </div>
  );
};