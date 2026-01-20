import { Project, RoomAsset } from '../types';

export const ROOMS_STORAGE_KEY = 'uniassets-rooms-v1';

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
      functionSub: p.subCategory,
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



