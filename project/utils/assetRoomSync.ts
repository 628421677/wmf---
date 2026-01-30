import { Project, RoomAsset } from '../types';

export const ROOMS_STORAGE_KEY = 'uniassets-rooms-v1';

export function seedDemoRoomsIfEmpty() {
  if (typeof window === 'undefined') return;

  const existing = getStoredRooms();
  if (existing.length > 0) return;

  const demo: RoomAsset[] = [
    // 示例楼A
    { id: 'RM-DEMO-A-101', roomNo: '101', buildingName: '示范楼A', area: 45, type: 'Admin', status: 'Empty', department: '', floor: 1 } as any,
    { id: 'RM-DEMO-A-102', roomNo: '102', buildingName: '示范楼A', area: 52, type: 'Admin', status: 'Empty', department: '', floor: 1 } as any,
    { id: 'RM-DEMO-A-201', roomNo: '201', buildingName: '示范楼A', area: 48, type: 'Teaching', status: 'Empty', department: '', floor: 2 } as any,
    { id: 'RM-DEMO-A-202', roomNo: '202', buildingName: '示范楼A', area: 60, type: 'Teaching', status: 'Empty', department: '', floor: 2 } as any,
    { id: 'RM-DEMO-A-301', roomNo: '301', buildingName: '示范楼A', area: 50, type: 'Teaching', status: 'Empty', department: '', floor: 3 } as any,
    { id: 'RM-DEMO-A-302', roomNo: '302', buildingName: '示范楼A', area: 68, type: 'Lab', status: 'Empty', department: '', floor: 3 } as any,

    // 示例楼B
    { id: 'RM-DEMO-B-101', roomNo: '101', buildingName: '示范楼B', area: 40, type: 'Admin', status: 'Empty', department: '', floor: 1 } as any,
    { id: 'RM-DEMO-B-103', roomNo: '103', buildingName: '示范楼B', area: 55, type: 'Admin', status: 'Empty', department: '', floor: 1 } as any,
    { id: 'RM-DEMO-B-201', roomNo: '201', buildingName: '示范楼B', area: 46, type: 'Teaching', status: 'Empty', department: '', floor: 2 } as any,
    { id: 'RM-DEMO-B-203', roomNo: '203', buildingName: '示范楼B', area: 62, type: 'Teaching', status: 'Empty', department: '', floor: 2 } as any,
    { id: 'RM-DEMO-B-401', roomNo: '401', buildingName: '示范楼B', area: 72, type: 'Lab', status: 'Empty', department: '', floor: 4 } as any,
    { id: 'RM-DEMO-B-402', roomNo: '402', buildingName: '示范楼B', area: 78, type: 'Lab', status: 'Empty', department: '', floor: 4 } as any,
  ];

  setStoredRooms(demo);
}

export function getStoredRooms(): RoomAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ROOMS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RoomAsset[]) : [];
  } catch {
    return [];
  }
}

export function setStoredRooms(rooms: RoomAsset[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  // 触发同标签页内的 useLocalStorage 监听刷新
  window.dispatchEvent(new StorageEvent('storage', { key: ROOMS_STORAGE_KEY }));
}

function mapMainCategoryToRoomType(mainCategory: string): RoomAsset['type'] {
  switch (mainCategory) {
    case 'Teaching':
      return 'Teaching';
    case 'Research':
      // 当前 RoomAsset.type 没有 Research，先映射为 Teaching（后续可扩展类型枚举）
      return 'Teaching';
    case 'Admin':
      return 'Admin';
    case 'LifeService':
      return 'Student';
    case 'Commercial':
      return 'Commercial';
    case 'Auxiliary':
      return 'Logistics';
    default:
      return 'Admin';
  }
}

export function upsertRoomsFromProject(project: Project) {
  const plan = project.roomFunctionPlan || [];
  if (plan.length === 0) return;

  const existing = getStoredRooms();
  const sourceProjectId = project.id;

  const projectBuildingName = project.name;


  const nextRooms: RoomAsset[] = plan.map(p => {
    return {
      id: `RM-${sourceProjectId}-${p.roomNo}`,
      roomNo: p.roomNo,
      buildingName: p.buildingName || projectBuildingName,
      area: p.area || 0,
      type: mapMainCategoryToRoomType(p.mainCategory),
      status: 'Empty',
      department: '',
      floor: Number(String(p.roomNo).slice(0, 1)) || 1,
      sourceProjectId,
      functionMain: p.mainCategory,
      functionSub: (() => {
        const raw = String(p.subCategory || '').trim();
        const lower = raw.toLowerCase();
        // 兼容历史英文枚举 / 新中文标签
        const norm = lower;
        if (norm === 'studentdormitory' || norm === 'studentdorm' || raw === '学生宿舍') return 'studentdorm';
        if (norm === 'teacherapartment' || norm === 'staffturnover' || raw === '教职工周转房') return 'staffturnover';
        return norm || raw;
      })(),
    } as any;
  });

  // 去重策略：以 sourceProjectId + roomNo 作为唯一键
  const key = (r: any) => `${r.sourceProjectId || ''}::${r.roomNo}`;
  const existingMap = new Map(existing.map(r => [key(r), r]));

  nextRooms.forEach(r => {
    const k = key(r);
    const prev = existingMap.get(k);
    existingMap.set(k, prev ? { ...prev, ...r } : r);
  });

  setStoredRooms(Array.from(existingMap.values()));
}



