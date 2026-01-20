import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

export interface CommercialOverviewOccupancyDonutProps {
  total: number;
  occupied: number;
  vacant: number;
}

const COLORS = {
  occupied: '#3370ff',
  vacant: '#94a3b8',
};

const CommercialOverviewOccupancyDonut: React.FC<CommercialOverviewOccupancyDonutProps> = ({ total, occupied, vacant }) => {
  const data = [
    { name: '已出租', value: occupied, color: COLORS.occupied },
    { name: '空闲', value: vacant, color: COLORS.vacant },
  ];

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28">
        <PieChart width={112} height={112}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={34}
            outerRadius={48}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs text-[#8f959e]">总数</div>
          <div className="text-lg font-bold text-[#1f2329]">{total}</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded" style={{ background: COLORS.occupied }} />
          <span className="text-[#1f2329]">已出租</span>
          <span className="text-[#646a73]">{occupied} 间</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded" style={{ background: COLORS.vacant }} />
          <span className="text-[#1f2329]">空闲</span>
          <span className="text-[#646a73]">{vacant} 间</span>
        </div>
      </div>
    </div>
  );
};

export default CommercialOverviewOccupancyDonut;




