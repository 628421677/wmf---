import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Search, User, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AuditLog, PersonRoomRelation, RoomAsset, UserRole } from '../types';
import { ROOMS_STORAGE_KEY, getStoredRooms, setStoredRooms } from '../utils/assetRoomSync';

const RELATIONS_KEY = 'uniassets-teacher-room-allocations-v1';

type Teacher = {
  id: string;
  name: string;
  department: string;
  title: string;
};

const MOCK_TEACHERS: Teacher[] = [
  { id: 'T-001', name: '张教授', department: '机械工程学院', title: '教授' },
  { id: 'T-002', name: '李副教授', department: '计算机科学与技术学院', title: '副教授' },
  { id: 'T-003', name: '王讲师', department: '土木工程学院', title: '讲师' },
  { id: 'T-004', name: '陈老师', department: '化学化工学院', title: '讲师' },
  { id: 'T-005', name: '刘老师', department: '人文艺术学院', title: '讲师' },
];

function logAudit(userRole: UserRole, setAuditLogs: (fn: (prev: AuditLog[]) => AuditLog[]) => void, action: AuditLog['action'], entityId: string, entityName: string, changedFields?: Record<string, { old: any; new: any }>) {
  const newLog: AuditLog = {
    id: `LOG-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    action,
    entityType: 'project',
    entityId,
    entityName,
    changedFields,
    operator: '当前用户',
    operatorRole: userRole,
    timestamp: new Date().toISOString(),
  };
  setAuditLogs(prev => [newLog, ...prev].slice(0, 1000));
}

const ApartmentRoomAllocationPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [, setAuditLogs] = useLocalStorage<AuditLog[]>('uniassets-audit-logs', []);
  const [relations, setRelations] = useLocalStorage<PersonRoomRelation[]>(RELATIONS_KEY, []);
  const [roomsVersion, setRoomsVersion] = useState(0);

  const [teacherQuery, setTeacherQuery] = useState('');
  const [roomQuery, setRoomQuery] = useState('');

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ROOMS_STORAGE_KEY) {
        setRoomsVersion(v => v + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const rooms = useMemo(() => {
    // From “资产转固与管理” sync: uniassets-rooms-v1
    const list = getStoredRooms();
    return list;
  }, [roomsVersion]);

  const teacherList = useMemo(() => {
    const q = teacherQuery.trim().toLowerCase();
    return MOCK_TEACHERS.filter(t => {
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      );
    });
  }, [teacherQuery]);

  const selectedTeacher = useMemo(() => MOCK_TEACHERS.find(t => t.id === selectedTeacherId) || null, [selectedTeacherId]);

  const roomAssignmentsByRoomId = useMemo(() => {
    const map = new Map<string, PersonRoomRelation>();
    relations.forEach(r => {
      map.set(r.roomId, r);
    });
    return map;
  }, [relations]);

  const roomAssignmentsByTeacherId = useMemo(() => {
    const map = new Map<string, PersonRoomRelation[]>();
    relations.forEach(r => {
      const arr = map.get(r.personId) || [];
      arr.push(r);
      map.set(r.personId, arr);
    });
    return map;
  }, [relations]);

  const availableRooms = useMemo(() => {
    const q = roomQuery.trim().toLowerCase();

    // For now: treat rooms with type === 'Student' as dorm/apartment rooms; you can expand later.
    const candidates = rooms.filter(r => String((r as any).type || '').toLowerCase() === 'student');

    return candidates
      .filter(r => {
        if (!q) return true;
        return (
          String(r.buildingName || '').toLowerCase().includes(q) ||
          String(r.roomNo || '').toLowerCase().includes(q)
        );
      })
      .map(r => {
        const assigned = roomAssignmentsByRoomId.get(r.id);
        return { room: r, assigned };
      });
  }, [rooms, roomQuery, roomAssignmentsByRoomId]);

  const selectedRoom = useMemo(() => rooms.find(r => r.id === selectedRoomId) || null, [rooms, selectedRoomId]);

  const assign = () => {
    if (!selectedTeacher || !selectedRoom) {
      alert('请先选择教师与房间');
      return;
    }

    const existingOnRoom = roomAssignmentsByRoomId.get(selectedRoom.id);
    if (existingOnRoom) {
      alert(`该房间已分配给：${existingOnRoom.personName}（${existingOnRoom.department}）`);
      return;
    }

    const relation: PersonRoomRelation = {
      id: `REL-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      personId: selectedTeacher.id,
      personName: selectedTeacher.name,
      department: selectedTeacher.department,
      title: selectedTeacher.title,
      roomId: selectedRoom.id,
      roomNo: selectedRoom.roomNo,
      buildingName: selectedRoom.buildingName,
      area: Number((selectedRoom as any).area || 0),
      useType: 'Office',
    };

    // Persist relation
    setRelations(prev => [relation, ...prev]);

    // Sync room occupancy (best-effort)
    try {
      const existingRooms = getStoredRooms();
      const nextRooms = existingRooms.map(r =>
        r.id === selectedRoom.id
          ? ({
              ...r,
              status: 'Occupied' as any,
              department: `${selectedTeacher.department}-${selectedTeacher.name}`,
            } as any)
          : r
      );
      setStoredRooms(nextRooms as RoomAsset[]);
    } catch {
      // ignore
    }

    logAudit(userRole, setAuditLogs, 'update', selectedRoom.id, `教师分配房间：${selectedTeacher.name}`, {
      room: { old: null, new: `${selectedRoom.buildingName}-${selectedRoom.roomNo}` },
      teacher: { old: null, new: `${selectedTeacher.name}(${selectedTeacher.id})` },
    });

    alert('分配成功');
  };

  const unassign = (rel: PersonRoomRelation) => {
    if (!confirm(`确定解除 ${rel.personName} 的房间：${rel.buildingName}-${rel.roomNo} 吗？`)) return;

    setRelations(prev => prev.filter(x => x.id !== rel.id));

    // Restore room occupancy (best-effort)
    try {
      const existingRooms = getStoredRooms();
      const nextRooms = existingRooms.map(r =>
        r.id === rel.roomId
          ? ({
              ...r,
              status: 'Empty' as any,
              department: '',
            } as any)
          : r
      );
      setStoredRooms(nextRooms as RoomAsset[]);
    } catch {
      // ignore
    }

    logAudit(userRole, setAuditLogs, 'update', rel.roomId, `教师解除房间：${rel.personName}`, {
      room: { old: `${rel.buildingName}-${rel.roomNo}`, new: null },
      teacher: { old: `${rel.personName}(${rel.personId})`, new: null },
    });
  };

  const selectedTeacherAssignments = useMemo(() => {
    if (!selectedTeacher) return [];
    return roomAssignmentsByTeacherId.get(selectedTeacher.id) || [];
  }, [selectedTeacher, roomAssignmentsByTeacherId]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329]">房间分配（教师）</h2>
        <p className="text-[#646a73]">房间数据来源：资产转固同步的房间台账（{ROOMS_STORAGE_KEY}）。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Teachers */}
        <div className="bg-white border border-[#dee0e3] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#dee0e3] font-medium">教师列表</div>
          <div className="p-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
              <input
                value={teacherQuery}
                onChange={e => setTeacherQuery(e.target.value)}
                placeholder="搜索教师/工号/学院..."
                className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm"
              />
            </div>
          </div>
          <div className="max-h-[520px] overflow-auto">
            {teacherList.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTeacherId(t.id);
                  setSelectedRoomId('');
                }}
                className={`w-full text-left px-4 py-3 border-b border-[#f2f3f5] hover:bg-[#f9fafb] ${selectedTeacherId === t.id ? 'bg-[#e1eaff]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-[#1f2329]">{t.name}</div>
                  <div className="text-xs text-[#8f959e]">{t.id}</div>
                </div>
                <div className="text-xs text-[#646a73] mt-1">{t.department} · {t.title}</div>
              </button>
            ))}
            {teacherList.length === 0 && <div className="p-6 text-sm text-[#8f959e] text-center">暂无教师</div>}
          </div>
        </div>

        {/* Rooms */}
        <div className="bg-white border border-[#dee0e3] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#dee0e3] font-medium">可分配房间（宿舍/公寓）</div>
          <div className="p-3 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
              <input
                value={roomQuery}
                onChange={e => setRoomQuery(e.target.value)}
                placeholder="搜索楼栋/房间号..."
                className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm"
              />
            </div>
            <div className="text-xs text-[#8f959e]">当前仅显示 type=Student 的房间作为宿舍/公寓房源</div>
          </div>
          <div className="max-h-[520px] overflow-auto">
            {availableRooms.map(({ room, assigned }) => {
              const isSelected = selectedRoomId === room.id;
              const disabled = !!assigned;
              return (
                <button
                  key={room.id}
                  onClick={() => {
                    if (disabled) return;
                    setSelectedRoomId(room.id);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-[#f2f3f5] hover:bg-[#f9fafb] ${isSelected ? 'bg-[#e1eaff]' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={assigned ? `已分配给：${assigned.personName}` : '可分配'}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-[#1f2329]">{room.buildingName}-{room.roomNo}</div>
                    {assigned ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">已分配</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">可分配</span>
                    )}
                  </div>
                  <div className="text-xs text-[#646a73] mt-1">面积：{(room as any).area || 0}㎡ · 楼层：{(room as any).floor ?? '-'} · 状态：{(room as any).status || '-'}</div>
                  {assigned && <div className="text-xs text-[#8f959e] mt-1">分配给：{assigned.personName}（{assigned.department}）</div>}
                </button>
              );
            })}
            {availableRooms.length === 0 && <div className="p-6 text-sm text-[#8f959e] text-center">暂无可分配房间（请先在资产转固同步房间）</div>}
          </div>
        </div>

        {/* Action */}
        <div className="bg-white border border-[#dee0e3] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#dee0e3] font-medium">分配操作</div>
          <div className="p-4 space-y-4">
            <div className="text-sm">
              <div className="text-[#646a73]">已选教师</div>
              <div className="font-medium text-[#1f2329] mt-1">{selectedTeacher ? `${selectedTeacher.name}（${selectedTeacher.department}）` : '未选择'}</div>
            </div>
            <div className="text-sm">
              <div className="text-[#646a73]">已选房间</div>
              <div className="font-medium text-[#1f2329] mt-1">{selectedRoom ? `${selectedRoom.buildingName}-${selectedRoom.roomNo}` : '未选择'}</div>
            </div>

            <button
              type="button"
              onClick={assign}
              disabled={!selectedTeacher || !selectedRoom}
              className="w-full px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} /> 确认分配
            </button>

            <div className="border-t border-[#dee0e3] pt-4">
              <div className="text-sm font-medium text-[#1f2329] flex items-center gap-2">
                <User size={16} /> 当前教师已分配房间
              </div>
              {selectedTeacherAssignments.length === 0 ? (
                <div className="text-sm text-[#8f959e] mt-2">暂无分配记录</div>
              ) : (
                <div className="mt-2 space-y-2">
                  {selectedTeacherAssignments.map(rel => (
                    <div key={rel.id} className="flex items-center justify-between border border-[#dee0e3] rounded-md p-2">
                      <div className="text-sm">
                        <div className="font-medium text-[#1f2329]">{rel.buildingName}-{rel.roomNo}</div>
                        <div className="text-xs text-[#8f959e]">面积：{rel.area}㎡</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => unassign(rel)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="解除"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-xs text-[#8f959e] border-t border-[#dee0e3] pt-3">
              说明：分配关系存储在 {RELATIONS_KEY}；房间来源于 {ROOMS_STORAGE_KEY}。
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-[#8f959e]">
        若列表为空：请先在“资产转固与管理”中归档工程并同步房间，或在“存量房产导入”导入房间台账。
      </div>
    </div>
  );
};

export default ApartmentRoomAllocationPage;
