import React, { useMemo, useState } from 'react';
import { Home, Search, Building, BedDouble, User, Square, ArrowRight } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { RoomAsset } from '../types';

interface ApartmentManagementRoomsPageProps {
  initialTab?: 'teacher' | 'student';
}

const ApartmentManagementRoomsPage: React.FC<ApartmentManagementRoomsPageProps> = ({ initialTab = 'teacher' }) => {
  const [rooms] = useLocalStorage<RoomAsset[]>('uniassets-rooms-v1', []);
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = useMemo(() => {
    const allRooms = rooms || [];
    const q = searchTerm.trim().toLowerCase();

    const functionSub = (r: any) => String((r as any).functionSub || '').trim().toLowerCase();

    const isTeacher = (r: any) => {
      const sub = functionSub(r);
      return sub === 'staffturnover' || sub === 'teacherapartment' || sub === '教职工周转房'.toLowerCase();
    };

    const isStudent = (r: any) => {
      const sub = functionSub(r);
      return sub === 'studentdorm' || sub === 'studentdormitory' || sub === '学生宿舍'.toLowerCase();
    };

    return allRooms
      .filter(r => (activeTab === 'teacher' ? isTeacher(r) : isStudent(r)))
      .filter(r => {
        if (!q) return true;
        return (
          String(r.buildingName || '').toLowerCase().includes(q) ||
          String(r.roomNo || '').toLowerCase().includes(q) ||
          String((r as any).remark || '').toLowerCase().includes(q) // Search by room type (e.g., '四人间')
        );
      });
  }, [rooms, activeTab, searchTerm]);

  const renderRoomRow = (room: RoomAsset) => {
    return (
      <tr key={room.id} className="hover:bg-slate-50">
        <td className="px-4 py-3 font-medium text-[#1f2329]">{room.buildingName}</td>
        <td className="px-4 py-3 text-[#646a73]">{room.roomNo}</td>
        <td className="px-4 py-3 text-[#646a73]">{(room as any).floor || '-'}</td>
        <td className="px-4 py-3 text-[#646a73]">{(room as any).area ? `${(room as any).area}㎡` : '-'}</td>
        <td className="px-4 py-3 text-[#646a73]">{(room as any).remark || '-'}</td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded text-xs ${
              (room as any).status === 'Occupied' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {(room as any).status === 'Occupied' ? '已占用' : '空闲'}
          </span>
        </td>
        <td className="px-4 py-3 text-[#646a73]">{(room as any).department || '-'}</td>
        <td className="px-4 py-3">
          <button className="text-[#3370ff] hover:underline text-xs flex items-center gap-1">
            <ArrowRight size={14} /> 查看详情
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329]">房间管理</h2>
        <p className="text-[#646a73]">管理教师公寓与学生宿舍的房间台账信息。</p>
      </div>

      <div className="flex items-center border-b">
        <button
          onClick={() => setActiveTab('teacher')}
          className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'teacher' ? 'border-[#3370ff] text-[#3370ff] font-medium' : 'border-transparent text-[#646a73]'
          }`}
        >
          <User size={16} /> 教师公寓
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'student' ? 'border-[#3370ff] text-[#3370ff] font-medium' : 'border-transparent text-[#646a73]'
          }`}
        >
          <BedDouble size={16} /> 学生宿舍
        </button>
      </div>

      <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`搜索${activeTab === 'teacher' ? '教师公寓' : '学生宿舍'}楼栋、房间号、户型...`}
            className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm"
          />
        </div>
        <div className="text-sm text-[#646a73]">共 {filteredRooms.length} 间</div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[#646a73]">
            <tr>
              <th className="px-4 py-3 text-left">楼栋名称</th>
              <th className="px-4 py-3 text-left">房间号</th>
              <th className="px-4 py-3 text-left">楼层</th>
              <th className="px-4 py-3 text-left">面积</th>
              <th className="px-4 py-3 text-left">户型</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">占用信息</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRooms.map(renderRoomRow)}
            {filteredRooms.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#8f959e]" colSpan={8}>
                  暂无房间数据。请先在“资产转固与管理”模块归档包含房间功能划分的项目。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApartmentManagementRoomsPage;
