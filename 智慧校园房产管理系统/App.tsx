import React, { useState } from 'react';
import { SidebarLeft } from './components/SidebarLeft';
import { RightSidebar } from './components/RightSidebar';
import { TopNav } from './components/TopNav';
import { CesiumView } from './components/CesiumView';
import { Building } from './types';

function App() {
  const [selectedItem, setSelectedItem] = useState<Building | null>(null);
  

  const handleSelection = (item: Building | null) => {
      setSelectedItem(item);
  };

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const resetView = () => {
    setViewport({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="relative w-screen h-screen bg-tech-bg text-white overflow-hidden font-sans select-none">
      {/* 1. Background / 3D Map Layer */}
      <CesiumView className="absolute inset-0" />

      {/* 2. UI Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Header */}
        <TopNav />

        {/* Left Panel: Strategic KPIs & Alerts */}
        <SidebarLeft />
        
        {/* Right Panel: Executive Dashboard (Global) OR Detailed View (Selection) */}
        {/* We always render RightSidebar, passing null if nothing is selected to trigger Dashboard mode */}
        <RightSidebar 
            data={selectedItem} 
            onClose={() => setSelectedItem(null)} 
        />
        
        {/* Map Controls (Bottom Center) */}
      </div>

      {/* 3. Vignette Overlay for cinematic feel */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,11,26,0.6)_100%)] z-20" />
      
      {/* 4. Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-30 bg-[length:100%_2px,3px_100%] opacity-20" />
    </div>
  );
}

export default App;