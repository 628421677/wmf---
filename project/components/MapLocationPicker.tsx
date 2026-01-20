import React, { useMemo, useState } from 'react';

export interface LatLng {
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  value?: LatLng;
  onChange: (value: LatLng) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  value,
  onChange,
  disabled,
  placeholder = '点击下方区域在地图上选点（占位）',
}) => {
  const [hover, setHover] = useState<LatLng | null>(null);

  const display = useMemo(() => {
    const p = hover || value;
    if (!p) return '-';
    return `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`;
  }, [hover, value]);

  return (
    <div className="space-y-2">
      <div className="text-xs text-[#8f959e]">{placeholder}</div>
      <div
        className={`h-32 rounded border border-[#dee0e3] bg-[#f5f6f7] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'} relative overflow-hidden`}
        onMouseMove={e => {
          if (disabled) return;
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          // 使用一个可复现的“模拟坐标系”（后续替换为真实地图 SDK 即可）
          const lat = 26.000000 + (0.020000 * (1 - y));
          const lng = 119.000000 + (0.020000 * x);
          setHover({ lat, lng });
        }}
        onMouseLeave={() => setHover(null)}
        onClick={e => {
          if (disabled) return;
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          const lat = 26.000000 + (0.020000 * (1 - y));
          const lng = 119.000000 + (0.020000 * x);
          onChange({ lat, lng });
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }} />
        <div className="absolute bottom-2 right-2 text-[11px] text-[#646a73] bg-white/80 px-2 py-1 rounded">
          {display}
        </div>
      </div>

      {value && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-[#646a73] mb-1">纬度 (lat)</label>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={value.lat}
              disabled
            />
          </div>
          <div>
            <label className="block text-xs text-[#646a73] mb-1">经度 (lng)</label>
            <input
              className="w-full border border-[#dee0e3] rounded px-3 py-2 text-sm"
              value={value.lng}
              disabled
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLocationPicker;



