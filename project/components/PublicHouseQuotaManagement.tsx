import React from 'react';
import { AlertCircle } from 'lucide-react';
import { DepartmentQuota } from '../types';

const ProgressBar: React.FC<{ value: number; max: number; color?: string }> = ({ value, max, color = 'bg-blue-500' }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOver = value > max;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all ${isOver ? 'bg-red-500' : color}`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

export interface PublicHouseQuotaManagementProps {
  quotas: DepartmentQuota[];
}

const PublicHouseQuotaManagement: React.FC<PublicHouseQuotaManagementProps> = ({ quotas }) => {
  return (
    <div className="bg-white rounded-lg border border-[#dee0e3] overflow-hidden">
      <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-[#1f2329]">各单位定额使用情况</h3>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">定额内</span>
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">超定额</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#dee0e3]">
        {quotas.map(q => {
          const usagePercent = q.adjustedQuota > 0 ? (q.currentUsage / q.adjustedQuota) * 100 : 0;
          const isOver = q.remainingQuota < 0;
          return (
            <div key={q.id} className="p-4 hover:bg-[#f9fafb]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1f2329]">{q.departmentName}</span>
                    {isOver && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded flex items-center gap-1">
                        <AlertCircle size={10} /> 超额 {Math.abs(q.remainingQuota)}m²
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#8f959e]">
                    <span>编制人数: {q.personnelCount}</span>
                    <span>学生数: {q.studentCount}</span>
                    <span>学科系数: {q.disciplineCoefficient}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    <span className={isOver ? 'text-red-600 font-medium' : 'text-[#1f2329]'}>{q.currentUsage}</span>
                    <span className="text-[#8f959e]"> / {q.adjustedQuota} m²</span>
                  </p>
                  <p className="text-xs text-[#8f959e] mt-1">
                    剩余: <span className={isOver ? 'text-red-600' : 'text-green-600'}>{q.remainingQuota} m²</span>
                  </p>
                </div>
              </div>
              <ProgressBar value={q.currentUsage} max={q.adjustedQuota} color="bg-blue-500" />
              <div className="flex justify-between mt-2 text-xs text-[#8f959e]">
                <span>
                  基础定额: {q.baseQuota}m² × {q.disciplineCoefficient} = {q.adjustedQuota}m²
                </span>
                <span>使用率: {usagePercent.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PublicHouseQuotaManagement;






