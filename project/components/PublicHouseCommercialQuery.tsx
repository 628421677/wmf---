import React, { useMemo, useState } from 'react';
import type { SpaceItem } from './CommercialHousing';

type CommercialSpaceRow = Pick<SpaceItem, 'id' | 'name' | 'area' | 'status' | 'monthlyRent'>;

export const getCommercialSpacesForQuery = (): CommercialSpaceRow[] => [
  { id: 'SP-001', name: '一层 101 商铺', area: 120, status: '公开招租', monthlyRent: 9600 },
  { id: 'SP-002', name: '一层 102 商铺', area: 85, status: '已出租', monthlyRent: 8500 },
  { id: 'SP-003', name: '一层 103 商铺', area: 150, status: '维修中', monthlyRent: 12000 },
  { id: 'SP-004', name: '二层 201 办公室', area: 200, status: '已出租', monthlyRent: 18000 },
  { id: 'SP-005', name: '二层 202 办公室', area: 180, status: '公开招租', monthlyRent: 16000 },
];

// Status badge styles
const getStatusBadgeClass = (status: SpaceItem['status']) => {
  switch (status) {
    case '公开招租':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case '已出租':
      return 'bg-green-50 text-green-700 border-green-200';
    case '招租结束':
      return 'bg-slate-50 text-slate-700 border-slate-200';
    case '维修中':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const formatArea = (n: number) => `${n.toFixed(2)}㎡`;
const formatRent = (n?: number) => (n ? `¥${n.toLocaleString()}/月` : 'N/A');

const PublicHouseCommercialQuery: React.FC<{ keyword: string }> = ({ keyword }) => {
  const [rows] = useState<CommercialSpaceRow[]>(getCommercialSpacesForQuery());

  const filteredRows = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter(r =>
      r.id.toLowerCase().includes(k) ||
      r.name.toLowerCase().includes(k) ||
      r.status.toLowerCase().includes(k)
    );
  }, [keyword, rows]);

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-bold text-[#1f2329]">商用房查询</h3>
        <p className="text-sm text-[#646a73] mt-1">查询校内所有商用房（经营性用房）的状态与基本信息。</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[#646a73]">
            <tr>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">序号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">资产编号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">房屋名称</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">面积</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">月租金参考</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-[#1f2329]">
                  {row.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{row.name}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">{formatArea(row.area)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatRent(row.monthlyRent)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${getStatusBadgeClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicHouseCommercialQuery;

