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
  if (typeof window !== 'undefined') {
    console.log('[rooms-sync] upsertRoomsFromProject', {
      projectId: project.id,
      projectName: project.name,
      planCount: plan.length,
      samplePlan: plan.slice(0, 3),
    });
  }
  if (plan.length === 0) return;

  const existing = getStoredRooms();
  const sourceProjectId = project.id;

  const projectBuildingName = project.name;


  const nextRooms: RoomAsset[] = plan.map(p => {
    // 解析房间类型：教师宿舍、公寓等一律标记为 Student，便于教师分配页筛选
    const isTeacherHousing = (() => {
      const lowerProj = (project.name || '').toLowerCase();
      const lowerMain = (p.mainCategory || '').toLowerCase();
      const lowerSub = (p.subCategory || '').toLowerCase();
      return lowerProj.includes('教师公寓') || lowerProj.includes('周转房') ||
             lowerMain === 'lifeservice' ||
             ['studentdormitory','studentdorm','学生宿舍','teacherapartment','staffturnover','教职工周转房'].some(k => lowerSub === k.toLowerCase());
    })();
    const roomType: RoomAsset['type'] = isTeacherHousing ? 'Student' : mapMainCategoryToRoomType(p.mainCategory);

    // 提取楼层：取 roomNo 开头连续数字，如 301A -> 3
    const floorMatch = String(p.roomNo).match(/^(\d+)/);
    const floorNum = floorMatch ? Number(floorMatch[1]) : 1;

    return {
      id: `RM-${sourceProjectId}-${p.roomNo}`,
      roomNo: p.roomNo,
      buildingName: p.buildingName || projectBuildingName,
      area: p.area || 0,
      type: roomType,
      status: 'Empty',
      department: '',
      floor: floorNum,
      sourceProjectId,
      functionMain: p.mainCategory,
      functionSub: (() => {
        const raw = String(p.subCategory || '').trim();
        const norm = raw.toLowerCase();

        // 统一归一化：教师公寓/周转房 => teacherapartment；学生宿舍 => studentdorm
        // 兼容：驼峰、历史英文枚举、新中文标签
        if (
          norm === 'studentdormitory' ||
          norm === 'studentdorm' ||
          raw === '学生宿舍' ||
          raw === '学生公寓' ||
          norm === 'studentdorm' ||
          norm === 'studentdormitory'
        ) {
          return 'studentdorm';
        }

        if (
          norm === 'teacherapartment' ||
          norm === 'staffturnover' ||
          raw === '教职工周转房' ||
          raw === '教师公寓' ||
          raw === '教师周转房' ||
          raw === '周转房'
        ) {
          return 'teacherapartment';
        }

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



